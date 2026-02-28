import { useState, useRef, useEffect } from 'react';
import type { Artwork } from '../../data/mockArtwork';
import { useGameStore } from '../../store/gameStore';
import Picture from '../ui/Picture';
import { urlToSlug } from '../../utils/imageUtils';

interface LearningCanvasProps {
    artwork: Artwork;
    onComplete: () => void;
}

export default function LearningCanvas({ artwork, onComplete }: LearningCanvasProps) {
    const {
        viewMode,
        foundHotspots,
        activeTooltip,
        panPosition,
        setViewMode,
        markHotspotFound,
        setActiveTooltip,
        updatePan
    } = useGameStore();

    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragDistance, setDragDistance] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Initialize scale at 0 to avoid "flash of huge image"
    const [scale, setScale] = useState(0);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial scale factor relative to "fit screen" size
    // 1.2 = slightly zoomed in (20%), allowing good context + detail
    const ZOOM_LEVEL = 1.2;

    // Resize observer to track container size
    useEffect(() => {
        if (!containerRef.current) return;

        // Initial measurement
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            setContainerSize({ width: rect.width, height: rect.height });
        }

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Calculate dynamic scale when entering exploration mode
    useEffect(() => {
        if (viewMode === 'exploration' && imageRef.current && containerSize.width > 0) {
            const img = imageRef.current;
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;

            if (naturalWidth > 0 && naturalHeight > 0) {
                // Calculate scale to fit image within container
                const scaleX = containerSize.width / naturalWidth;
                const scaleY = containerSize.height / naturalHeight;
                // Use the smaller scale to ensure image fits entirely
                const fitScale = Math.min(scaleX, scaleY);

                // Apply zoom level relative to fit scale
                const targetScale = fitScale * ZOOM_LEVEL;

                setScale(targetScale);
            }
        }
    }, [viewMode, containerSize, imageLoaded]);

    // Cleanup pan on unmount
    useEffect(() => {
        return () => updatePan(0, 0);
    }, []);

    // Check if all hotspots found
    useEffect(() => {
        if (foundHotspots.length === artwork.learningPoints.length && foundHotspots.length > 0) {
            setTimeout(() => {
                onComplete();
            }, 1500);
        }
    }, [foundHotspots, artwork.learningPoints.length, onComplete]);

    // Handle exploration mode entry
    const handleExplore = () => {
        setViewMode('exploration');
    };

    // Zoom handler
    const handleWheel = (e: React.WheelEvent) => {

        const img = imageRef.current;
        if (!img) return;

        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = Math.max(0.5, Math.min(scale + delta, 4)); // Clamp zoom 0.5x to 4x

        setScale(newScale);
    };

    // Pan handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        if (viewMode !== 'exploration') return;

        setIsDragging(true);
        setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
        setDragDistance(0);

        // Capture pointer to ensure we keep tracking even if mouse leaves div
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        const distance = Math.sqrt(
            Math.pow(e.clientX - (dragStart.x + panPosition.x), 2) +
            Math.pow(e.clientY - (dragStart.y + panPosition.y), 2)
        );
        setDragDistance(distance);

        // Clamping logic...
        if (imageRef.current && containerSize.width > 0 && scale > 0) {
            const scaledWidth = imageRef.current.naturalWidth * scale;
            const scaledHeight = imageRef.current.naturalHeight * scale;

            // Allow free movement but keep image somewhat in view
            const maxPanX = scaledWidth * 0.75;
            const maxPanY = scaledHeight * 0.75;

            const clampedX = Math.max(Math.min(newX, maxPanX), -maxPanX);
            const clampedY = Math.max(Math.min(newY, maxPanY), -maxPanY);

            updatePan(clampedX, clampedY);
        } else {
            updatePan(newX, newY);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    // Hotspot click detection
    const handleImageClick = (e: React.MouseEvent) => {
        if (viewMode !== 'exploration') return;
        if (dragDistance > 5) return; // Ignore if dragging

        const imageRefRect = imageRef.current?.getBoundingClientRect();
        if (!imageRefRect) return;

        // Convert click to percentage coordinates
        const clickX = ((e.clientX - imageRefRect.left) / imageRefRect.width) * 100;
        const clickY = ((e.clientY - imageRefRect.top) / imageRefRect.height) * 100;

        console.log(`🎯 Clicked at: x=${clickX.toFixed(1)}, y=${clickY.toFixed(1)}`);

        let hitFound = false;

        // Check each hotspot
        for (const hotspot of artwork.learningPoints) {
            if (foundHotspots.includes(hotspot.id)) continue;

            if (hotspot.clickArea.rect) {
                // Rectangular check
                const { x, y, w, h } = hotspot.clickArea.rect;
                if (clickX >= x && clickX <= x + w && clickY >= y && clickY <= y + h) {
                    markHotspotFound(hotspot.id);
                    setActiveTooltip(hotspot.id);
                    hitFound = true;
                    break;
                }
            } else {
                // Circular check
                const distance = Math.sqrt(
                    Math.pow(clickX - hotspot.clickArea.x, 2) +
                    Math.pow(clickY - hotspot.clickArea.y, 2)
                );

                // 1. Larger Hit Area (2x radius) for better usability
                const hitRadiusMultiplier = 2.0;

                if (distance <= hotspot.clickArea.radius * hitRadiusMultiplier) {
                    markHotspotFound(hotspot.id);
                    setActiveTooltip(hotspot.id);
                    hitFound = true;
                    // Manual dismissal only - no timeout
                    break;
                }
            }
        }

        if (hitFound) {
            // Already handled above, it activates the tooltip
        } else if (activeTooltip) {
            // Clicked empty space while a tooltip was open
            setActiveTooltip(null);
        }
    };

    // Remaining labels
    const remainingLabels = artwork.learningPoints.filter(
        (point) => !foundHotspots.includes(point.id)
    );

    const slug = urlToSlug(artwork.imageUrl);

    // Loading State
    if (!imageLoaded && !artwork.imageUrl) {
        return <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-900 overflow-hidden select-none touch-none">
            {/* Hidden Image Preloader to get dimensions and load state */}
            <Picture
                slug={slug}
                alt="preload"
                className="hidden"
                ref={imageRef}
                onLoad={() => setImageLoaded(true)}
                priority
            />

            {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-slate-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-sky-500"></div>
                </div>
            )}

            {/* Overview State */}
            {viewMode === 'overview' && imageLoaded && (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 animate-fade-in">
                    <Picture
                        slug={slug}
                        alt={artwork.title}
                        imgClassName="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                        priority
                    />
                    <button
                        onClick={handleExplore}
                        className="mt-8 px-8 py-4 bg-sky-500 text-white font-bold text-lg rounded-full
                                   shadow-lg hover:bg-sky-600 active:scale-95 transition-all animate-bounce-subtle"
                    >
                        Tap to Explore
                    </button>
                    {/* Instructions */}
                    <p className="mt-4 text-slate-400 text-sm">
                        Find {artwork.learningPoints.length} hidden details
                    </p>
                </div>
            )}

            {/* Exploration State */}
            {viewMode === 'exploration' && imageLoaded && (
                <>
                    {/* Pannable Image Container */}
                    <div
                        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onWheel={handleWheel}
                        onClick={handleImageClick}
                    >
                        <Picture
                            ref={imageRef}
                            slug={slug}
                            alt={artwork.title}
                            imgClassName="max-w-none select-none pointer-events-none"
                            style={{
                                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${scale})`,
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                willChange: 'transform',
                                opacity: scale > 0 ? 1 : 0
                            }}
                            priority
                            draggable={false}
                        />
                    </div>

                    {/* Overlay Layer - Renders ON TOP of image but strictly follows its transform */}
                    <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
                        style={{ opacity: scale > 0 ? 1 : 0 }} // Hide until scale is calculated
                    >
                        <div style={{
                            width: imageRef.current?.naturalWidth || 0,
                            height: imageRef.current?.naturalHeight || 0,
                            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${scale})`,
                            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                            transformOrigin: 'center center'
                        }}>
                            {/* Yellow Highlight Circles - Graffiti Style - Only show for ACTIVE tooltip */}
                            {activeTooltip && (() => {
                                const hotspot = artwork.learningPoints.find((p) => p.id === activeTooltip);
                                if (!hotspot) return null;

                                return (
                                    <>
                                        {/* The Highlight Circle or Box */}
                                        {hotspot.highlightCircle.rect ? (
                                            <div
                                                key={hotspot.id}
                                                className="absolute border-4 border-amber-400 border-dashed animate-pulse-subtle bg-amber-400/10"
                                                style={{
                                                    left: `${hotspot.highlightCircle.rect.x}%`,
                                                    top: `${hotspot.highlightCircle.rect.y}%`,
                                                    width: `${hotspot.highlightCircle.rect.w}%`,
                                                    height: `${hotspot.highlightCircle.rect.h}%`,
                                                    filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.4))'
                                                }}
                                            />
                                        ) : (
                                            <div
                                                key={hotspot.id}
                                                className="absolute"
                                                style={{
                                                    left: `${hotspot.highlightCircle.x}%`,
                                                    top: `${hotspot.highlightCircle.y}%`,
                                                    // 3. Larger visual circle (2.5x radius)
                                                    width: `${hotspot.highlightCircle.radius * 2.5}%`,
                                                    height: `${hotspot.highlightCircle.radius * 2.5}%`,
                                                    transform: 'translate(-50%, -50%)',
                                                    filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))'
                                                }}
                                            >
                                                <svg width="100%" height="100%" viewBox="0 0 100 100" className="animate-pulse-subtle">
                                                    {/* Main thick stroke */}
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="42"
                                                        fill="none"
                                                        stroke="#FFD700"
                                                        strokeWidth="6"
                                                        strokeLinecap="round"
                                                        strokeDasharray="85 15"
                                                        transform="rotate(-15 50 50)"
                                                    />
                                                    {/* Secondary accent stroke for sloppy/spray look */}
                                                    <circle
                                                        cx="52"
                                                        cy="48"
                                                        r="42"
                                                        fill="none"
                                                        stroke="#FFA000"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeDasharray="40 200"
                                                        transform="rotate(160 50 50)"
                                                        opacity="0.7"
                                                    />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Tooltip is now rendered outside the scaling container */}
                                    </>
                                );
                            })()}
                        </div>
                    </div>


                    {/* UI Overlays (Static) */}

                    {/* Progress Bar */}
                    <div className="absolute top-4 left-4 right-4 bg-slate-700/80 rounded-full h-3 overflow-hidden pointer-events-none z-50">
                        <div
                            className="h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-500"
                            style={{
                                width: `${(foundHotspots.length / artwork.learningPoints.length) * 100}%`
                            }}
                        />
                    </div>

                    {/* Smart On-Screen HUD Tooltip */}
                    {activeTooltip && (() => {
                        const hotspot = artwork.learningPoints.find((p) => p.id === activeTooltip);
                        if (!hotspot || !imageRef.current || containerSize.width === 0) return null;

                        const imgW = imageRef.current.naturalWidth || 1;
                        const imgH = imageRef.current.naturalHeight || 1;
                        const cx = containerSize.width / 2;
                        const cy = containerSize.height / 2;

                        let hx, hy, hw, hh;
                        if (hotspot.highlightCircle.rect) {
                            hx = hotspot.highlightCircle.rect.x;
                            hy = hotspot.highlightCircle.rect.y;
                            hw = hotspot.highlightCircle.rect.w;
                            hh = hotspot.highlightCircle.rect.h;
                        } else {
                            const r = hotspot.highlightCircle.radius;
                            hx = hotspot.highlightCircle.x - r;
                            hy = hotspot.highlightCircle.y - r;
                            hw = r * 2;
                            hh = r * 2;
                        }

                        // Convert % to centered native pixels, then apply scale and pan
                        const px = (hx / 100 - 0.5) * imgW;
                        const py = (hy / 100 - 0.5) * imgH;
                        const pw = (hw / 100) * imgW;
                        const ph = (hh / 100) * imgH;

                        const screenX = cx + px * scale + panPosition.x;
                        const screenY = cy + py * scale + panPosition.y;
                        const screenW = pw * scale;
                        const screenH = ph * scale;

                        // Tooltip estimated bounds
                        const tW = 280;
                        const tH = 180;
                        const margin = 16;

                        // Start with center above the box
                        let finalX = screenX + screenW / 2 - tW / 2;
                        let finalY = screenY - tH - margin;

                        // Check if it fits safely above
                        if (finalY >= margin) {
                            // Valid
                        }
                        // See if it fits safely below
                        else if (screenY + screenH + margin + tH <= containerSize.height - margin) {
                            finalY = screenY + screenH + margin;
                        }
                        // Left
                        else if (screenX - tW - margin >= margin) {
                            finalX = screenX - tW - margin;
                            finalY = screenY + screenH / 2 - tH / 2;
                        }
                        // Right
                        else if (screenX + screenW + margin + tW <= containerSize.width - margin) {
                            finalX = screenX + screenW + margin;
                            finalY = screenY + screenH / 2 - tH / 2;
                        }
                        // Overlap inevitably
                        else {
                            finalX = containerSize.width / 2 - tW / 2;
                            finalY = containerSize.height / 2 - tH / 2;
                        }

                        // Absolute limits clamping
                        if (finalX < margin) finalX = margin;
                        if (finalX + tW > containerSize.width - margin) finalX = containerSize.width - tW - margin;
                        if (finalY < margin) finalY = margin;

                        return (
                            <div
                                className="absolute z-[100] w-[280px] pointer-events-auto"
                                style={{
                                    left: `${finalX}px`,
                                    top: `${finalY}px`,
                                    transition: isDragging ? 'none' : 'all 0.15s ease-out'
                                }}
                            >
                                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border-2 border-slate-100 flex flex-col items-center gap-2 animate-pop-in">
                                    <h4 className="text-sky-600 font-extrabold text-sm uppercase tracking-wide text-center">
                                        {hotspot.label}
                                    </h4>
                                    <div className="w-8 h-0.5 bg-slate-200 rounded-full mb-1"></div>
                                    <p className="text-sm text-slate-800 leading-relaxed font-medium text-center">
                                        {hotspot.tooltip.text}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveTooltip(null);
                                        }}
                                        className="mt-2 w-10 h-10 flex items-center justify-center bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-full shadow-lg transition-all border-2 border-white"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Bottom Label Strip (Hide when tooltip is active to avoid clutter) */}
                    {!activeTooltip && remainingLabels.length > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-slate-800/90 p-4 flex gap-3 justify-center flex-wrap z-50 pb-8">
                            {remainingLabels.map((point) => (
                                <div
                                    key={point.id}
                                    className="px-4 py-2 bg-slate-700 text-white text-xs md:text-sm font-semibold rounded-full border border-slate-600"
                                >
                                    {point.label}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
