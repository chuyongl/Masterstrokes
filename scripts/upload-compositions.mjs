/**
 * upload-compositions.mjs
 * 把 src/assets/compositions/*.svg 上传到 Firebase Storage
 * compositions/ 路径，并输出所有公开 URL
 *
 * 用法：
 *   node scripts/upload-compositions.mjs
 *   node scripts/upload-compositions.mjs --force
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SERVICE_ACCOUNT_PATH = path.join(ROOT, "serviceAccountKey.json");
const COMPOSITIONS_DIR = path.join(ROOT, "src", "assets", "compositions");
const BUCKET_NAME = "masterstrokes-bde20.firebasestorage.app";
const FORCE = process.argv.includes("--force");

// ─── Init Firebase Admin ──────────────────────────────────────────────────────

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf-8"));

initializeApp({
    credential: cert(serviceAccount),
    storageBucket: BUCKET_NAME,
});

const bucket = getStorage().bucket();

// ─── Helper ───────────────────────────────────────────────────────────────────

function getPublicUrl(filePath) {
    const encoded = encodeURIComponent(filePath);
    return `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encoded}?alt=media`;
}

async function uploadSvg(localPath, destPath) {
    if (!FORCE) {
        const file = bucket.file(destPath);
        const [exists] = await file.exists();
        if (exists) {
            console.log(`  ⏭  跳过（已存在）: ${path.basename(destPath)}`);
            return getPublicUrl(destPath);
        }
    }

    await bucket.upload(localPath, {
        destination: destPath,
        metadata: {
            contentType: "image/svg+xml",
            cacheControl: "public, max-age=31536000",
        },
    });

    await bucket.file(destPath).makePublic();
    const url = getPublicUrl(destPath);
    console.log(`  ✅  ${path.basename(destPath)}`);
    return url;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    const svgFiles = fs
        .readdirSync(COMPOSITIONS_DIR)
        .filter((f) => f.endsWith(".svg"))
        .sort();

    console.log(`\n🎨 上传 ${svgFiles.length} 个构图 SVG 到 Firebase Storage (force=${FORCE})\n`);

    const result = {};

    for (const file of svgFiles) {
        const localPath = path.join(COMPOSITIONS_DIR, file);
        const key = file.replace(".svg", "");
        const destPath = `compositions/${file}`;
        result[key] = await uploadSvg(localPath, destPath);
    }

    // 输出 JSON 映射，可直接贴进代码或存为 compositionManifest.json
    const manifestPath = path.join(ROOT, "src", "data", "compositionManifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(result, null, 2));

    console.log(`\n📄 compositionManifest.json 已保存：`);
    console.log(`   ${manifestPath}`);
    console.log(`\n✅ 完成！共 ${svgFiles.length} 个文件\n`);
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
