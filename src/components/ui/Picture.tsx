import { useState, forwardRef } from 'react';
import manifest from '../../data/imageManifest.json';

type ManifestEntry = {
    slug: string;
    width: number;
    height: number;
    aspectRatio: number;
    blurDataURL: string;
    variants: Record<
        string,
        { width: number; avif: string; webp: string }
    >;
};

type ManifestMap = Record<string, ManifestEntry>;

interface PictureProps {
    slug: string;
    alt: string;
    className?: string;
    imgClassName?: string;
    /** Responsive sizes attribute, defaults to sane breakpoint set */
    sizes?: string;
    /** Pin a single variant; omit for full responsive srcset */
    variant?: 'thumbnail' | '400' | '800' | '1200';
    /** Disable lazy loading for above-the-fold images */
    priority?: boolean;
    onLoad?: React.ReactEventHandler<HTMLImageElement>;
    style?: React.CSSProperties;
    draggable?: boolean;
}

const typedManifest = manifest as ManifestMap;

const DEFAULT_SIZES = '(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px';
const RESPONSIVE_KEYS = ['400', '800', '1200'] as const;

/**
 * Optimised <picture> component backed by imageManifest.json.
 * Serves AVIF with WebP fallback, responsive srcset and blur placeholder.
 * Falls back to a plain <img> if slug is not in the manifest.
 */
const Picture = forwardRef<HTMLImageElement, PictureProps>(function Picture(
    {
        slug,
        alt,
        className,
        imgClassName,
        sizes = DEFAULT_SIZES,
        variant,
        priority = false,
        onLoad,
        style,
        draggable,
    },
    ref
) {
    const [loaded, setLoaded] = useState(false);
    const entry = typedManifest[slug];

    // ── Fallback: slug not in manifest (e.g. full URL passed) ──────────────
    if (!entry) {
        return (
            <img
                ref={ref}
                src={slug}
                alt={alt}
                className={imgClassName ?? className}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={onLoad}
                style={style}
                draggable={draggable}
            />
        );
    }

    const { blurDataURL, variants } = entry;

    // ── Single-variant mode ─────────────────────────────────────────────────
    if (variant) {
        const v = variants[variant];
        return (
            <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
                {blurDataURL && !loaded && (
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${blurDataURL})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(8px)',
                            transform: 'scale(1.05)',
                        }}
                    />
                )}
                <picture>
                    <source type="image/avif" srcSet={v.avif} />
                    <source type="image/webp" srcSet={v.webp} />
                    <img
                        ref={ref}
                        src={v.webp}
                        alt={alt}
                        width={v.width}
                        className={imgClassName}
                        loading={priority ? 'eager' : 'lazy'}
                        decoding="async"
                        onLoad={(e) => {
                            setLoaded(true);
                            onLoad?.(e);
                        }}
                        style={{ display: 'block', width: '100%', transition: 'opacity 0.3s', opacity: loaded ? 1 : 0 }}
                        draggable={draggable}
                    />
                </picture>
            </div>
        );
    }

    // ── Responsive srcset mode ──────────────────────────────────────────────
    const avifSrcset = RESPONSIVE_KEYS
        .filter((k) => variants[k])
        .map((k) => `${variants[k].avif} ${variants[k].width}w`)
        .join(', ');

    const webpSrcset = RESPONSIVE_KEYS
        .filter((k) => variants[k])
        .map((k) => `${variants[k].webp} ${variants[k].width}w`)
        .join(', ');

    // Largest non-upscaled variant as default src
    const fallbackKey = RESPONSIVE_KEYS.filter((k) => variants[k]).at(-1) ?? '400';
    const fallback = variants[fallbackKey];

    return (
        <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
            {blurDataURL && !loaded && (
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${blurDataURL})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(8px)',
                        transform: 'scale(1.05)',
                    }}
                />
            )}
            <picture>
                <source type="image/avif" srcSet={avifSrcset} sizes={sizes} />
                <source type="image/webp" srcSet={webpSrcset} sizes={sizes} />
                <img
                    ref={ref}
                    src={fallback.webp}
                    alt={alt}
                    width={fallback.width}
                    className={imgClassName}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={(e) => {
                        setLoaded(true);
                        onLoad?.(e);
                    }}
                    style={{ display: 'block', width: '100%', transition: 'opacity 0.3s', opacity: loaded ? 1 : 0 }}
                    draggable={draggable}
                />
            </picture>
        </div>
    );
});

export default Picture;
