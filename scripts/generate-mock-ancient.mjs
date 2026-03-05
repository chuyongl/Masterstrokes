import fs from 'fs';
import path from 'path';

const annotations = JSON.parse(fs.readFileSync('./src/data/annotations.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('./src/data/imageManifest.json', 'utf8'));

// Format Title from slug
function formatTitle(slug) {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Ensure unique coordinates
function generateDistractors(points, currentPointId) {
    const arr = [];
    const others = points.filter(p => p.id !== currentPointId);

    // Add up to 3 distractors from others
    for (const other of others) {
        if (arr.length < 3) {
            arr.push({ x: other.clickArea.x, y: other.clickArea.y, zoom: 300 });
        }
    }

    // Random fallback
    while (arr.length < 3) {
        arr.push({ x: Math.floor(Math.random() * 80) + 10, y: Math.floor(Math.random() * 80) + 10, zoom: 300 });
    }

    return arr;
}

const artworks = [];

for (const [key, data] of Object.entries(annotations)) {
    // Normalizing keys to match manifest (replace _ with -)
    const slug = data.image_filename ? data.image_filename.replace('.jpg', '').replace('.jpeg', '').replace('.png', '') : key.replace(/_/g, '-');

    const manifestData = manifest[slug];
    if (!manifestData) {
        console.warn(`No manifest data for slug: ${slug} / key: ${key}`);
        continue;
    }

    const title = formatTitle(slug);

    const regions = data.quiz_regions || [];

    const learningPoints = regions.map((r, i) => {
        return {
            id: r.point_id,
            label: r.label || `Detail ${i + 1}`,
            clickArea: {
                x: (r.x + r.w / 2) * 100,
                y: (r.y + r.h / 2) * 100,
                radius: 10,
                rect: { x: r.x * 100, y: r.y * 100, w: r.w * 100, h: r.h * 100 }
            },
            highlightCircle: {
                x: (r.x + r.w / 2) * 100,
                y: (r.y + r.h / 2) * 100,
                radius: 10,
                rect: { x: r.x * 100, y: r.y * 100, w: r.w * 100, h: r.h * 100 }
            },
            tooltip: {
                text: r.description || r.label || `Key detail #${i + 1}`,
                position: 'bottom'
            }
        };
    });

    const quizQuestions = regions.map((r) => {
        const x = (r.x + r.w / 2) * 100;
        const y = (r.y + r.h / 2) * 100;

        const distractors = generateDistractors(learningPoints, r.point_id);

        return {
            id: r.point_id,
            learningPointId: r.point_id,
            questionText: `Identify this detail: ${r.label}`,
            whiteCircle: {
                x: x,
                y: y,
                radius: 8
            },
            overlayPosition: {
                x: x - 4,
                y: y - 4,
                width: 8,
                height: 8
            },
            options: [
                {
                    id: 'a',
                    crop: { x: x, y: y, zoom: 300 },
                    filter: 'none',
                    isCorrect: true
                },
                {
                    id: 'b',
                    crop: { x: distractors[0].x, y: distractors[0].y, zoom: 300 },
                    filter: 'none',
                    isCorrect: false
                },
                {
                    id: 'c',
                    crop: { x: distractors[1].x, y: distractors[1].y, zoom: 300 },
                    filter: 'none',
                    isCorrect: false
                },
                {
                    id: 'd',
                    crop: { x: distractors[2].x, y: distractors[2].y, zoom: 300 },
                    filter: 'none',
                    isCorrect: false
                }
            ]
        };
    });

    const quizRegions = regions.map((r) => {
        // only if it's small enough to be a type 1 quiz
        if (r.w < 0.8 && r.h < 0.8) {
            return {
                id: r.id,
                point_id: r.point_id,
                label: r.label,
                x: r.x,
                y: r.y,
                w: r.w,
                h: r.h
            };
        }
        return null;
    }).filter(Boolean);

    const imageUrl = `/artworks/${slug}.jpg`;

    artworks.push({
        id: slug, // or key
        title: title,
        artist: 'Unknown Artist', // default for ancient art
        imageUrl: imageUrl,
        era: 'ancient-art',
        learningPoints: learningPoints,
        quizQuestions: quizQuestions,
        quizRegions: quizRegions
    });
}

const fileContent = `import type { Artwork } from './mockArtwork';

export const FALLBACK_ANCIENT_ARTWORKS: Artwork[] = ${JSON.stringify(artworks, null, 4)};
`;

fs.writeFileSync('./src/data/ancientArtworks.ts', fileContent);
console.log(`Generated src/data/ancientArtworks.ts with ${artworks.length} artworks.`);
