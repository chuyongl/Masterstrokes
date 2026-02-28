import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const ANNOTATIONS_DIR = path.join(ROOT, "raw_assets", "annotations");
const OUTPUT_FILE = path.join(ROOT, "src", "data", "annotations.json");

function processAnnotations() {
    if (!fs.existsSync(ANNOTATIONS_DIR)) {
        console.log(`Annotations directory not found: ${ANNOTATIONS_DIR}`);
        return;
    }

    const files = fs.readdirSync(ANNOTATIONS_DIR).filter(file => file.endsWith('.json'));
    const combinedAnnotations = {};
    let processedFiles = 0;

    for (const file of files) {
        try {
            const filePath = path.join(ANNOTATIONS_DIR, file);
            const data = fs.readFileSync(filePath, 'utf-8');
            const annotation = JSON.parse(data);
            if (annotation.artwork_id) {
                combinedAnnotations[annotation.artwork_id] = annotation;
                processedFiles++;
            }
        } catch (err) {
            console.error(`Error processing annotation file ${file}:`, err);
        }
    }

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combinedAnnotations, null, 2), 'utf-8');
    console.log(`Successfully processed ${processedFiles} annotation files into ${OUTPUT_FILE}`);
}

processAnnotations();
