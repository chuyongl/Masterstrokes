import { useState, useRef, useEffect } from 'react';
import type { Artwork } from '../../data/mockArtwork';
import { useGameStore } from '../../store/gameStore';

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

                // console.log('Calculated Scale:', { naturalWidth, containerWidth: containerSize.width, fitScale, targetScale });
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
        if (activeTooltip) return; // Lock zoom while reading

        const img = imageRef.current;
        if (!img) return;

        // Prevent default scrolling
        // e.preventDefault(); // React synthetic events might not support direct preventDefault in all cases, better handled in CSS or standard listeners if needed, but wheel usually OK.

        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = Math.max(0.5, Math.min(scale + delta, 4)); // Clamp zoom 0.5x to 4x

        setScale(newScale);
    };

    // Pan handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        if (viewMode !== 'exploration') return;
        if (activeTooltip) return; // Lock panning while reading

        setIsDragging(true);
        setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
        setDragDistance(0);

        // Capture pointer to ensure we keep tracking even if mouse leaves div
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        if (activeTooltip) return;

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
        if (activeTooltip) return; // Lock clicking other hotspots while reading
        if (dragDistance > 5) return; // Ignore if dragging

        const imageRefRect = imageRef.current?.getBoundingClientRect();
        if (!imageRefRect) return;

        // Convert click to percentage coordinates
        const clickX = ((e.clientX - imageRefRect.left) / imageRefRect.width) * 100;
        const clickY = ((e.clientY - imageRefRect.top) / imageRefRect.height) * 100;

        console.log(`🎯 Clicked at: x=${clickX.toFixed(1)}, y=${clickY.toFixed(1)}`);

        // Check each hotspot
        for (const hotspot of artwork.learningPoints) {
            if (foundHotspots.includes(hotspot.id)) continue;

            const distance = Math.sqrt(
                Math.pow(clickX - hotspot.clickArea.x, 2) +
                Math.pow(clickY - hotspot.clickArea.y, 2)
            );

            // 1. Larger Hit Area (2x radius) for better usability
            const hitRadiusMultiplier = 2.0;

            if (distance <= hotspot.clickArea.radius * hitRadiusMultiplier) {
                markHotspotFound(hotspot.id);
                setActiveTooltip(hotspot.id);
                // Manual dismissal only - no timeout
                break;
            }
        }
    };

    // Remaining labels
    const remainingLabels = artwork.learningPoints.filter(
        (point) => !foundHotspots.includes(point.id)
    );

    // Loading State
    if (!imageLoaded && !artwork.imageUrl) {
        return <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-900 overflow-hidden select-none touch-none">
            {/* Hidden Image Preloader to get dimensions and load state */}
            <img
                src={artwork.imageUrl}
                onLoad={() => setImageLoaded(true)}
                className="hidden"
                alt="preload"
            />

            {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-slate-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-sky-500"></div>
                </div>
            )}

            {/* Overview State */}
            {viewMode === 'overview' && imageLoaded && (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 animate-fade-in">
                    <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
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
                        <img
                            ref={imageRef}
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="max-w-none select-none pointer-events-none"
                            style={{
                                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${scale})`,
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                willChange: 'transform',
                                opacity: scale > 0 ? 1 : 0 // Hide until scale is calculated
                            }}
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
                                        {/* The Highlight Circle */}
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

                                        {/* The Tooltip (Smart Positioned) */}
                                        {(() => {
                                            // Smart positioning: Ensure tooltip clears the yellow ring
                                            const visualRadius = hotspot.highlightCircle.radius * 1.1;
                                            const margin = 2; // % buffer
                                            
                                            const topCandidate = hotspot.highlightCircle.y - visualRadius - margin;
                                            const bottomCandidate = hotspot.highlightCircle.y + visualRadius + margin;

                                            // Check bounds
                                            const fitsTop = topCandidate > 10; 
                                            const fitsBottom = bottomCandidate < 85;

                                            let position = 'bottom';
                                            if (fitsTop) position = 'top';
                                            else if (fitsBottom) position = 'bottom';
                                            else position = hotspot.highlightCircle.y > 50 ? 'top' : 'bottom';

                                            const topStyle = position === 'bottom' ? bottomCandidate : topCandidate;

                                            return (
                                                <div
                                                    className="absolute z-[100] pointer-events-auto"
                                                    style={{
                                                        left: `${hotspot.highlightCircle.x}%`,
                                                        top: `${topStyle}%`,
                                                        transform: `translate(-50%, ${position === 'bottom' ? '0' : '-100%'}) scale(${1 / scale})`
                                                    }}
                                                >
                                                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl w-[260px] text-center border-2 border-slate-100 flex flex-col items-center gap-2 animate-pop-in">
                                                            {/* Label (The Prompt) */}
                                                            <h4 className="text-sky-600 font-extrabold text-sm uppercase tracking-wide">
                                                                {hotspot.label}
                                                            </h4>

                                                            <div className="w-8 h-0.5 bg-slate-200 rounded-full mb-1"></div>

                                                            {/* Description */}
                                                            <p className="text-sm text-slate-800 leading-relaxed font-medium">
                                                                {hotspot.tooltip.text}
                                                            </p>

                                                            {/* Manual Dismiss "Check" Button */}
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
                                    </div >
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

                        {/* Bottom Label Strip */}
                        {remainingLabels.length > 0 && (
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
