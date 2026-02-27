/**
 * upload-images.mjs
 * 把 public/images/{slug}/ 下所有变体上传到 Firebase Storage
 * 并把 imageManifest.json 里的路径更新为 Firebase 公开访问 URL
 *
 * 用法：
 *   node scripts/upload-images.mjs
 *   node scripts/upload-images.mjs --force   # 重新上传已存在的文件
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SERVICE_ACCOUNT_PATH = path.join(ROOT, "serviceAccountKey.json");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "imageManifest.json");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const BUCKET_NAME = "masterstrokes-bde20.firebasestorage.app";

const FORCE = process.argv.includes("--force");

// ─── Init Firebase Admin ─────────────────────────────────────────────────────

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf-8"));

initializeApp({
    credential: cert(serviceAccount),
    storageBucket: BUCKET_NAME,
});

const bucket = getStorage().bucket();

// ─── Helper: Get Firebase public download URL ────────────────────────────────

function getPublicUrl(filePath) {
    // Firebase Storage public URL format (works in test mode / public read)
    const encoded = encodeURIComponent(filePath);
    return `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encoded}?alt=media`;
}

// ─── Upload single file ───────────────────────────────────────────────────────

async function uploadFile(localPath, destPath, contentType) {
    // Check if file already exists in bucket (skip if not --force)
    if (!FORCE) {
        const file = bucket.file(destPath);
        const [exists] = await file.exists();
        if (exists) {
            return getPublicUrl(destPath);
        }
    }

    await bucket.upload(localPath, {
        destination: destPath,
        metadata: {
            contentType,
            cacheControl: 'public, max-age=31536000', // 缓存一年，大幅提升加载速度
        },
        // Make public (works in test mode, no ACL needed when bucket is public)
    });

    // Make the file publicly readable
    await bucket.file(destPath).makePublic();

    return getPublicUrl(destPath);
}

// ─── Process single slug ─────────────────────────────────────────────────────

async function uploadSlug(slug, entry) {
    const slugDir = path.join(IMAGES_DIR, slug);

    if (!fs.existsSync(slugDir)) {
        console.warn(`  ⚠  跳过 ${slug}：本地目录不存在`);
        return null;
    }

    console.log(`  📤  上传 ${slug}/`);

    const updatedVariants = { ...entry.variants };

    for (const [key, variant] of Object.entries(entry.variants)) {
        // Upload avif
        const avifLocal = path.join(IMAGES_DIR, slug, `${key}.avif`);
        const avifDest = `images/${slug}/${key}.avif`;
        const avifUrl = await uploadFile(avifLocal, avifDest, "image/avif");

        // Upload webp
        const webpLocal = path.join(IMAGES_DIR, slug, `${key}.webp`);
        const webpDest = `images/${slug}/${key}.webp`;
        const webpUrl = await uploadFile(webpLocal, webpDest, "image/webp");

        updatedVariants[key] = {
            ...variant,
            avif: avifUrl,
            webp: webpUrl,
        };

        console.log(`     ${key}: ✓`);
    }

    return { ...entry, variants: updatedVariants };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error("❌ imageManifest.json 不存在，请先运行 process-images.mjs");
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    const slugs = Object.keys(manifest);

    console.log(`\n🚀 开始上传 ${slugs.length} 个 slug 到 Firebase Storage (force=${FORCE})\n`);

    let uploaded = 0;
    let skipped = 0;

    for (const slug of slugs) {
        try {
            const result = await uploadSlug(slug, manifest[slug]);
            if (result) {
                manifest[slug] = result;
                uploaded++;
            } else {
                skipped++;
            }
        } catch (err) {
            console.error(`  ❌ 上传失败: ${slug}`, err.message);
        }
    }

    // 写回 manifest（路径已更新为 Firebase URL）
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

    console.log(`\n✅ 完成！上传: ${uploaded} | 跳过: ${skipped}`);
    console.log(`📄 imageManifest.json 已更新为 Firebase URL`);
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
