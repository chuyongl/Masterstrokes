export async function cropImage(
    sourceUrl: string,
    xPercent: number,
    yPercent: number,
    zoom: number = 300,
    outputSize: number = 200
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Essential for canvas manipulation
        img.src = sourceUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = outputSize;
            canvas.height = outputSize;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Calculate source crop area
            // x, y are percentages (0-100) of the center point
            const sourceXCenter = (xPercent / 100) * img.width;
            const sourceYCenter = (yPercent / 100) * img.height;

            // If we want square crop:
            const sWidth = img.width / (zoom / 100);
            const sHeight = sWidth; // Enforce square

            const sX = sourceXCenter - (sWidth / 2);
            const sY = sourceYCenter - (sHeight / 2);

            // Draw to canvas
            ctx.drawImage(
                img,
                sX, sY, sWidth, sHeight, // Source
                0, 0, outputSize, outputSize // Destination
            );

            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };

        img.onerror = (e) => reject(e);
    });
}

/**
 * Converts an image URL or path to an imageManifest slug.
 * Strips extension and non-alphanumeric chars, matching the slugify logic
 * used in process-images.mjs.
 *
 * Examples:
 *   "https://.../giotto-lamentation.jpg" → "giotto-lamentation"
 *   "/images/giotto-lamentation/800.avif" → "giotto-lamentation"  (won't match, skip)
 *   "bayeux-tapestry-battle" → "bayeux-tapestry-battle"
 */
export function urlToSlug(url: string): string {
    // Attempt to decode URL if it contains URL-encoded elements
    try {
        url = decodeURIComponent(url);
    } catch {
        // ignore decoding errors
    }

    // Strip query params and hash
    const clean = url.split('?')[0].split('#')[0];

    // Check if it's a Manifest / Firebase Storage structure: /images/[slug]/...
    if (clean.includes('/images/')) {
        const parts = clean.split('/');
        const imagesIndex = parts.lastIndexOf('images');
        if (imagesIndex !== -1 && imagesIndex + 1 < parts.length) {
            return parts[imagesIndex + 1];
        }
    }

    // Standard fallback: Get the last path segment
    const filename = clean.split('/').pop() ?? '';
    // Remove extension
    const noExt = filename.replace(/\.[^.]+$/, '');
    // Apply same slug rules as process-images.mjs
    return noExt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
