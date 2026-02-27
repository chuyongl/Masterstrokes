/**
 * process-images.mjs
 * 图片处理管道：raw_assets → public/images/{slug}/{size}.{ext}
 * 用法: node scripts/process-images.mjs
 * 可选 --force 强制重新处理所有图片（默认跳过已存在）
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const INPUT_DIR = path.join(ROOT, "raw_assets");
const OUTPUT_DIR = path.join(ROOT, "public", "images");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "imageManifest.json");

const FORCE = process.argv.includes("--force");

// 生成变体配置
const VARIANTS = [
    { suffix: "1200", width: 1200 },
    { suffix: "800", width: 800 },
    { suffix: "400", width: 400 },
    { suffix: "thumbnail", width: 120 }, // 缩略图
];

const AVIF_OPTIONS = { quality: 65, effort: 4 };
const WEBP_OPTIONS = { quality: 78, effort: 4 };
// 模糊占位（很小的 base64 内嵌图）
const BLUR_WIDTH = 20;
const BLUR_QUALITY = 20;

const SUPPORTED_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

// ─── 工具函数 ────────────────────────────────────────────────────────────────

function slugify(filename) {
    return path.basename(filename, path.extname(filename))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function formatBytes(bytes) {
    return bytes > 1e6
        ? `${(bytes / 1e6).toFixed(1)} MB`
        : `${(bytes / 1e3).toFixed(0)} KB`;
}

async function generateBlurDataURL(inputPath) {
    const buffer = await sharp(inputPath)
        .resize(BLUR_WIDTH)
        .jpeg({ quality: BLUR_QUALITY })
        .toBuffer();
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

// ─── 处理单张图片 ────────────────────────────────────────────────────────────

async function processImage(filePath) {
    const slug = slugify(filePath);
    const outDir = path.join(OUTPUT_DIR, slug);
    const inputStat = fs.statSync(filePath);

    // 若非 force 且 lock 文件存在，跳过
    const lockFile = path.join(outDir, ".processed");
    if (!FORCE && fs.existsSync(lockFile)) {
        console.log(`  ⏭  跳过 ${slug}（已处理）`);
        return null;
    }

    fs.mkdirSync(outDir, { recursive: true });

    console.log(`  🖼  ${path.basename(filePath)} → ${slug}/  (${formatBytes(inputStat.size)})`);

    const image = sharp(filePath, { limitInputPixels: false });
    const metadata = await image.metadata();
    const { width: origW = 0, height: origH = 0 } = metadata;

    const result = {
        slug,
        originalSize: inputStat.size,
        width: origW,
        height: origH,
        aspectRatio: origW && origH ? parseFloat((origW / origH).toFixed(4)) : 1,
        blurDataURL: "",
        variants: {},
    };

    // 生成模糊占位
    result.blurDataURL = await generateBlurDataURL(filePath);

    // 生成各尺寸 AVIF + WebP
    for (const { suffix, width } of VARIANTS) {
        // 若原图宽度小于目标宽，跳过放大（保留原始宽）
        const targetWidth = origW && origW < width ? origW : width;

        const avifOut = path.join(outDir, `${suffix}.avif`);
        const webpOut = path.join(outDir, `${suffix}.webp`);

        await sharp(filePath, { limitInputPixels: false })
            .resize(targetWidth, null, { withoutEnlargement: true })
            .avif(AVIF_OPTIONS)
            .toFile(avifOut);

        await sharp(filePath, { limitInputPixels: false })
            .resize(targetWidth, null, { withoutEnlargement: true })
            .webp(WEBP_OPTIONS)
            .toFile(webpOut);

        const avifSize = fs.statSync(avifOut).size;
        const webpSize = fs.statSync(webpOut).size;

        console.log(`     ${suffix}: avif ${formatBytes(avifSize)} | webp ${formatBytes(webpSize)}`);

        result.variants[suffix] = {
            width: targetWidth,
            avif: `/images/${slug}/${suffix}.avif`,
            webp: `/images/${slug}/${suffix}.webp`,
        };
    }

    // 写 lock 文件
    fs.writeFileSync(lockFile, new Date().toISOString());
    return result;
}

// ─── 主流程 ──────────────────────────────────────────────────────────────────

async function main() {
    const files = fs
        .readdirSync(INPUT_DIR)
        .filter((f) => SUPPORTED_EXTS.includes(path.extname(f).toLowerCase()))
        .map((f) => path.join(INPUT_DIR, f));

    console.log(`\n🚀 开始处理 ${files.length} 张图片 (force=${FORCE})\n`);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // 读取已有 manifest
    let manifest = {};
    if (fs.existsSync(MANIFEST_PATH)) {
        manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    }

    let processed = 0;
    let skipped = 0;

    for (const filePath of files) {
        try {
            const result = await processImage(filePath);
            if (result) {
                manifest[result.slug] = result;
                processed++;
            } else {
                skipped++;
            }
        } catch (err) {
            console.error(`  ❌ 处理失败: ${path.basename(filePath)}`, err.message);
        }
    }

    // 确保 src/data 目录存在
    fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

    console.log(`\n✅ 完成！处理: ${processed} | 跳过: ${skipped}`);
    console.log(`📄 Manifest 已写入: src/data/imageManifest.json`);
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
