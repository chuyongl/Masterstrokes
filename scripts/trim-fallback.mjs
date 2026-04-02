/**
 * Trim ancientArtworks.ts to only keep the 10 active artworks.
 * Run: node scripts/trim-fallback.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcFile = path.join(__dirname, '..', 'src', 'data', 'ancientArtworks.ts');

const KEEP = new Set([
    'chauvet-panel-lions',
    'chauvet-panel-horses',
    'lascaux-hall-bulls',
    'lascaux-shaft-scene',
    'altamira-ceiling',
    'el-castillo-hands',
    'investiture-zimri-lim',
    'mari-sacrificial-procession',
    'standard-of-ur',
    'book-of-dead-hunefer',
]);

// Read and parse
const raw = fs.readFileSync(srcFile, 'utf-8');

// Extract the array content between the first [ and last ]
const arrStart = raw.indexOf('[');
const arrEnd = raw.lastIndexOf(']');
const prefix = raw.slice(0, arrStart);  // "import ... export const ... = "
const suffix = raw.slice(arrEnd + 1);    // ";\n" etc.

// Use a simple state machine to split top-level objects in the array
const arrContent = raw.slice(arrStart + 1, arrEnd);
const artworks = [];
let depth = 0;
let start = 0;

for (let i = 0; i < arrContent.length; i++) {
    const ch = arrContent[i];
    if (ch === '{') {
        if (depth === 0) start = i;
        depth++;
    } else if (ch === '}') {
        depth--;
        if (depth === 0) {
            artworks.push(arrContent.slice(start, i + 1));
        }
    }
}

console.log(`Found ${artworks.length} artworks total`);

// Filter: keep only artworks whose "id" matches
const kept = artworks.filter(block => {
    const m = block.match(/"id":\s*"([^"]+)"/);
    if (!m) return false;
    const keep = KEEP.has(m[1]);
    if (keep) console.log(`  ✓ keeping ${m[1]}`);
    return keep;
});

console.log(`Keeping ${kept.length} artworks`);

// Rebuild file
const newContent = prefix + '[\n' + kept.join(',\n') + '\n]' + suffix;
fs.writeFileSync(srcFile, newContent, 'utf-8');

const oldSize = Buffer.byteLength(raw);
const newSize = Buffer.byteLength(newContent);
console.log(`\nDone! ${(oldSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB`);
