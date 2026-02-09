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
