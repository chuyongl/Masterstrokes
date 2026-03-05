/**
 * generate-type1-assets.mjs
 * 
 * Automated pipeline to generate "Wrong" answer tiles for Type 1 Quizzes (Image Swaps).
 * 
 * Pipeline:
 * 1. Scan annotations.json for Type 1 regions (w * h < 0.6)
 * 2. Variant 1: AI Generated fake image
 * 3. Variant 2: Semantic Web Match image
 * 4. Crop & process them using Sharp
 * 5. Upload to Firebase Storage
 * 6. Write URLs to the Google Sheet 'type_1_quizzes' tab
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { google } from 'googleapis';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ------------- CONFIGURATION ------------- //
const ANNOTATIONS_PATH = path.join(ROOT, 'src', 'data', 'annotations.json');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const SERVICE_ACCOUNT_PATH = path.join(ROOT, 'serviceAccountKey.json');
const FIREBASE_BUCKET = 'masterstrokes-bde20.firebasestorage.app';

const SHEET_ID = process.env.VITE_GOOGLE_SHEET_ID || '1TGBzVoJU5vHuDTMbY_U54qjJw3uNhtS5hzESP84R6SU';
// AI Config
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const GOOGLE_SEARCH_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_CX = process.env.GOOGLE_SEARCH_CX;

// Load Firebase & Google Auth
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
        storageBucket: FIREBASE_BUCKET
    });
}
const bucket = getStorage().bucket();

const sheetsAuth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheetsApi = google.sheets({ version: 'v4', auth: sheetsAuth });

// ------------- HELPERS ------------- //

async function uploadToFirebase(localBuffer, destPath, contentType = 'image/jpeg') {
    const file = bucket.file(destPath);
    await file.save(localBuffer, {
        metadata: { contentType, cacheControl: 'public, max-age=31536000' }
    });
    await file.makePublic();
    const encoded = encodeURIComponent(destPath);
    return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${encoded}?alt=media`;
}

async function getExistingSheetRows() {
    try {
        const response = await sheetsApi.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'type_1_quizzes!A2:B', // Just get ID columns
        });
        return response.data.values || [];
    } catch (err) {
        if (err.message.includes('Unable to parse range')) {
            console.error('❌ "type_1_quizzes" tab not found in Google Sheet. Please create it first.');
            process.exit(1);
        }
        throw err;
    }
}

async function appendToSheet(artworkId, pointId, url1, url2) {
    await sheetsApi.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'type_1_quizzes!A:E',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[artworkId, pointId, url1, url2]]
        }
    });
    console.log(`📝 Appended ${pointId} to Google Sheets.`);
}

async function cropBaseImage(slug, rect) {
    const sourcePath = path.join(IMAGES_DIR, slug, '1200.webp');
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source image not found: ${sourcePath}`);
    }

    const info = await sharp(sourcePath).metadata();

    // Convert relative % to absolute pixels
    const extractRect = {
        left: Math.round(rect.x * info.width),
        top: Math.round(rect.y * info.height),
        width: Math.round(rect.w * info.width),
        height: Math.round(rect.h * info.height)
    };

    // Clamp coordinates
    if (extractRect.left + extractRect.width > info.width) extractRect.width = info.width - extractRect.left;
    if (extractRect.top + extractRect.height > info.height) extractRect.height = info.height - extractRect.top;

    const buffer = await sharp(sourcePath)
        .extract(extractRect)
        .jpeg({ quality: 90 })
        .toBuffer();

    return buffer;
}

// ------------- AI STUBS ------------- //

async function generateAIVariant(originalBuffer, rect) {
    if (!GEMINI_API_KEY) {
        console.warn('⚠️ No GEMINI_API_KEY found, skipping true AI generation, applying fallback filter.');
        // Fallback: Just return a heavily distorted/filtered version of the original
        return await sharp(originalBuffer)
            .blur(3)
            .greyscale()
            .jpeg({ quality: 80 })
            .toBuffer();
    }
    // TODO: Implement actual Imagen or DALL-E call here.
    return originalBuffer;
}

async function findSemanticVariant(originalBuffer, rect) {
    if (!GOOGLE_SEARCH_KEY || !GOOGLE_SEARCH_CX) {
        console.warn('⚠️ No Google Search API keys found. Skipping true Web Search, applying fallback mirror.');
        // Fallback: flip the image so it looks like a different piece
        return await sharp(originalBuffer).flop().jpeg().toBuffer();
    }
    // TODO: Implement Vision API labeling + Google Image Search here.
    return originalBuffer;
}

// ------------- MAIN PIPELINE ------------- //

async function main() {
    console.log('🚀 Starting Type 1 Quiz Asset Pipeline...');

    const existingRows = await getExistingSheetRows();
    const processedSet = new Set(existingRows.map(row => `${row[0]}_${row[1]}`));

    const annotations = JSON.parse(fs.readFileSync(ANNOTATIONS_PATH, 'utf-8'));

    for (const [slug, data] of Object.entries(annotations)) {
        // ID Mapping workaround used in the app
        const artworkId = slug.replace('_annotations', '').replace(/_/g, '-');

        for (const region of (data.quiz_regions || [])) {
            const area = region.w * region.h;
            if (area >= 0.6) continue; // Skip large regions, they aren't Type 1

            const pointId = region.point_id;
            const uniqueKey = `${artworkId}_${pointId}`;

            if (processedSet.has(uniqueKey)) {
                console.log(`⏭️ Skipping ${pointId} (Already in Sheet)`);
                continue;
            }

            console.log(`\n⚙️ Processing Type 1 Region: ${pointId} (${artworkId})`);

            try {
                // 1. Get the base crop out of the 1200.webp
                const baseCropBuffer = await cropBaseImage(artworkId, region);

                // 2. Generate Variant 1
                console.log(`  🤖 Generating AI Fake Variant...`);
                const variant1Buffer = await generateAIVariant(baseCropBuffer, region);

                // 3. Search Variant 2
                console.log(`  🔍 Sourcing Semantic Web Variant...`);
                const variant2Buffer = await findSemanticVariant(baseCropBuffer, region);

                // 4. Upload to Firebase
                console.log(`  ☁️ Uploading to Firebase...`);
                const dest1 = `images/quizzes/type1/${artworkId}/${pointId}_ai.jpg`;
                const dest2 = `images/quizzes/type1/${artworkId}/${pointId}_alt.jpg`;

                const url1 = await uploadToFirebase(variant1Buffer, dest1);
                const url2 = await uploadToFirebase(variant2Buffer, dest2);

                // 5. Save to Sheets
                await appendToSheet(artworkId, pointId, url1, url2);

            } catch (err) {
                console.error(`❌ Failed to process ${pointId}:`, err.message);
            }
        }
    }

    console.log('\n✅ Pipeline Complete!');
}

main().catch(console.error);
