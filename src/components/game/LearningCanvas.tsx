import { useState, useRef, useEffect, useCallback } from 'react';
import type { Artwork, Hotspot } from '../../data/gameTypes';
import { useGameStore } from '../../store/gameStore';
import Picture from '../ui/Picture';
import { urlToSlug } from '../../utils/imageUtils';
import MarieroseCharacter from '../ui/MarieroseCharacter';
import imageManifest from '../../data/imageManifest.json';

interface LearningCanvasProps {
    artwork: Artwork;
    onComplete: () => void;
}

// ─── Spotlight SVG overlay ────────────────────────────────────────────────────
// Darkens everything except the target region(s), which glow like a spotlight
interface SpotlightProps {
    imgW: number;
    imgH: number;
    rects: { x: number; y: number; w: number; h: number }[]; // % coords
    visible: boolean;
}

function SpotlightOverlay({ imgW, imgH, rects, visible }: SpotlightProps) {
    if (!visible || imgW === 0) return null;

    // Convert % to px with padding
    const PAD = 4; // px padding around each rect
    const masks = rects.map((r, i) => {
        const rx = (r.x / 100) * imgW - PAD;
        const ry = (r.y / 100) * imgH - PAD;
        const rw = (r.w / 100) * imgW + PAD * 2;
        const rh = (r.h / 100) * imgH + PAD * 2;
        const radius = Math.min(8, rw * 0.06, rh * 0.06);
        return (
            <rect
                key={i}
                x={rx} y={ry} width={rw} height={rh}
                rx={radius} ry={radius}
                fill="black"
            />
        );
    });

    return (
        <svg
            className="absolute inset-0 pointer-events-none"
            style={{
                width: imgW,
                height: imgH,
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.4s ease',
            }}
            viewBox={`0 0 ${imgW} ${imgH}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <mask id="spotlight-mask">
                    {/* White = dark overlay visible; black = hole for spotlight */}
                    <rect x="0" y="0" width={imgW} height={imgH} fill="white" />
                    {masks}
                </mask>
                {/* Soft blur for the glow edge */}
                <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Dark overlay, masked to leave the spotlight areas clear */}
            <rect
                x="0" y="0" width={imgW} height={imgH}
                fill="rgba(0,0,0,0.72)"
                mask="url(#spotlight-mask)"
            />

            {/* Glow ring around each rect */}
            {rects.map((r, i) => {
                const rx = (r.x / 100) * imgW - PAD;
                const ry = (r.y / 100) * imgH - PAD;
                const rw = (r.w / 100) * imgW + PAD * 2;
                const rh = (r.h / 100) * imgH + PAD * 2;
                const radius = Math.min(8, rw * 0.06, rh * 0.06);
                return (
                    <rect
                        key={i}
                        x={rx} y={ry} width={rw} height={rh}
                        rx={radius} ry={radius}
                        fill="none"
                        stroke="rgba(255,220,100,0.7)"
                        strokeWidth="2"
                        filter="url(#glow-filter)"
                    />
                );
            })}
        </svg>
    );
}

// ─── Marierose General Point Dialogue ─────────────────────────────────────────
interface MarieroseDialogueProps {
    hotspot: Hotspot;
    onDismiss: () => void;
}

function MarieroseDialogue({ hotspot, onDismiss }: MarieroseDialogueProps) {
    return (
        <div className="absolute inset-0 flex items-end justify-start z-50 pointer-events-none">
            {/* Dimming overlay */}
            <div className="absolute inset-0 bg-black/30 pointer-events-auto" onClick={onDismiss} />

            {/* Dialogue card */}
            <div className="relative z-10 flex items-end gap-3 p-4 pb-20 w-full pointer-events-auto">
                {/* Marierose */}
                <div className="flex-shrink-0 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.6))' }}>
                    <MarieroseCharacter width={90} height={90} />
                </div>

                {/* Bubble */}
                <div
                    className="flex-1 rounded-2xl p-4 shadow-2xl animate-pop-in"
                    style={{
                        background: 'rgba(10, 8, 20, 0.95)',
                        border: '1px solid rgba(147,210,255,0.35)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '16px 16px 16px 4px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(147,210,255,0.15)'
                    }}
                >
                    <div className="text-[#93D2FF] text-xs font-black uppercase tracking-widest mb-1">
                        {hotspot.label}
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">
                        {hotspot.tooltip.text}
                    </p>
                    <button
                        onClick={onDismiss}
                        className="mt-3 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, #93D2FF, #5fa8e0)',
                            color: '#000',
                            boxShadow: '0 2px 12px rgba(147,210,255,0.4)'
                        }}
                    >
                        Got it ✓
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main LearningCanvas ──────────────────────────────────────────────────────
export default function LearningCanvas({ artwork, onComplete }: LearningCanvasProps) {
    const { panPosition, updatePan } = useGameStore();

    const [imageLoaded, setImageLoaded] = useState(false);
    const [visibleImageReady, setVisibleImageReady] = useState(false);
    const [scale, setScale] = useState(0);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragDistance, setDragDistance] = useState(0);

    // Pinch-to-zoom state
    const activeTouches = useRef<Map<number, { x: number; y: number }>>(new Map());
    const lastPinchDist = useRef<number | null>(null);
    const isPinching = useRef(false);

    // Learning flow state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState<'prompt' | 'revealed' | 'general'>('prompt');
    const [wrongFlash, setWrongFlash] = useState(false);
    const [hintActive, setHintActive] = useState(false);
    const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const preloaderRef = useRef<HTMLImageElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ZOOM_LEVEL = 1.15;

    const currentPoint = artwork.learningPoints[currentIndex] ?? null;
    const isSpecific = currentPoint?.pointType === 'specific';
    const progress = currentIndex / Math.max(artwork.learningPoints.length, 1);

    // ── Container resize observer
    useEffect(() => {
        if (!containerRef.current) return;
        const obs = new ResizeObserver(entries => {
            for (const e of entries) {
                setContainerSize({ width: e.contentRect.width, height: e.contentRect.height });
            }
        });
        obs.observe(containerRef.current);
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0) setContainerSize({ width: rect.width, height: rect.height });
        return () => obs.disconnect();
    }, []);

    // ── Calculate zoom scale on image load (use manifest dimensions as fallback)
    const slug = urlToSlug(artwork.imageUrl);
    const manifestEntry = (imageManifest as Record<string, any>)[slug];

    const getNaturalDimensions = useCallback(() => {
        // Prefer the visible image ref, then preloader ref, then manifest
        const visImg = imageRef.current;
        if (visImg && visImg.naturalWidth > 0) return { w: visImg.naturalWidth, h: visImg.naturalHeight };
        const preImg = preloaderRef.current;
        if (preImg && preImg.naturalWidth > 0) return { w: preImg.naturalWidth, h: preImg.naturalHeight };
        if (manifestEntry) return { w: manifestEntry.width, h: manifestEntry.height };
        return null;
    }, [manifestEntry]);

    useEffect(() => {
        if (!imageLoaded || containerSize.width === 0) return;
        const dims = getNaturalDimensions();
        if (!dims) return;
        const fitScale = Math.min(
            containerSize.width / dims.w,
            containerSize.height / dims.h
        );
        setScale(fitScale * ZOOM_LEVEL);
    }, [imageLoaded, containerSize, getNaturalDimensions]);

    // ── Reset pan on unmount / new artwork
    useEffect(() => {
        updatePan(0, 0);
        return () => { updatePan(0, 0); };
    }, [artwork.id]);

    // ── Start general phase immediately for general points
    useEffect(() => {
        if (!currentPoint) return;
        if (currentPoint.pointType === 'general') {
            setPhase('general');
        } else {
            setPhase('prompt');
            setHintActive(false);
        }
    }, [currentIndex]);

    // ── Advance to next point or finish
    const advance = useCallback(() => {
        const next = currentIndex + 1;
        if (next >= artwork.learningPoints.length) {
            setTimeout(onComplete, 600);
        } else {
            setCurrentIndex(next);
            // Reset view to original state smoothly
            const dims = getNaturalDimensions();
            if (dims && containerSize.width > 0) {
                const fitScale = Math.min(
                    containerSize.width / dims.w,
                    containerSize.height / dims.h
                );
                setScale(fitScale * ZOOM_LEVEL);
                updatePan(0, 0);
            }
        }
    }, [currentIndex, artwork.learningPoints.length, onComplete, containerSize, updatePan, getNaturalDimensions]);

    // ── Hotspot click detection (specific points in 'prompt' phase only)
    const handleImageClick = (e: React.MouseEvent) => {
        if (phase !== 'prompt' || !isSpecific || !currentPoint) return;
        if (dragDistance > 5) return;

        const rect = imageRef.current?.getBoundingClientRect();
        if (!rect) return;
        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;

        const hit = checkHit(currentPoint, clickX, clickY);
        if (hit) {
            setPhase('revealed');
            if (hintTimer.current) clearTimeout(hintTimer.current);
            
            // Zoom and pan to center
            const dims = getNaturalDimensions();
            if (dims && containerSize.width > 0) {
                const rects = getSpotlightRects(currentPoint);
                if (rects.length > 0) {
                    const r = rects[0];
                    const centerXPercent = r.x + (r.w / 2);
                    const centerYPercent = r.y + (r.h / 2);
                    
                    const fitScale = Math.min(
                        containerSize.width / dims.w,
                        containerSize.height / dims.h
                    );
                    const focusScale = fitScale * 1.4; 
                    
                    const targetPanX = -((centerXPercent / 100) - 0.5) * dims.w * focusScale;
                    // Offset Y up by 10% of screen height to avoid being hidden behind the bottom tooltip
                    const targetPanY = -((centerYPercent / 100) - 0.5) * dims.h * focusScale - (containerSize.height * 0.1);
                    
                    setScale(focusScale);
                    updatePan(targetPanX, targetPanY);
                }
            }
        } else {
            // Wrong: flash red
            setWrongFlash(true);
            setTimeout(() => setWrongFlash(false), 500);
        }
    };

    const checkHit = (hotspot: Hotspot, cx: number, cy: number): boolean => {
        const rects = hotspot.clickArea.rects;
        if (rects && rects.length > 0) {
            return rects.some(r => cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h);
        }
        if (hotspot.clickArea.rect) {
            const { x, y, w, h } = hotspot.clickArea.rect;
            return cx >= x && cx <= x + w && cy >= y && cy <= y + h;
        }
        const d = Math.sqrt(Math.pow(cx - hotspot.clickArea.x, 2) + Math.pow(cy - hotspot.clickArea.y, 2));
        return d <= hotspot.clickArea.radius * 2;
    };

    // ── Get rects for spotlight (% coords)
    const getSpotlightRects = (hotspot: Hotspot) => {
        if (hotspot.highlightCircle.rects && hotspot.highlightCircle.rects.length > 0) {
            return hotspot.highlightCircle.rects;
        }
        if (hotspot.highlightCircle.rect) {
            return [hotspot.highlightCircle.rect];
        }
        const r = hotspot.highlightCircle.radius;
        const cx = hotspot.highlightCircle.x;
        const cy = hotspot.highlightCircle.y;
        return [{ x: cx - r, y: cy - r, w: r * 2, h: r * 2 }];
    };

    // ── Hint timer: auto-show after 8s of no interaction
    useEffect(() => {
        if (phase !== 'prompt' || !isSpecific) return;
        if (hintTimer.current) clearTimeout(hintTimer.current);
        setHintActive(false);
        hintTimer.current = setTimeout(() => setHintActive(true), 8000);
        return () => { if (hintTimer.current) clearTimeout(hintTimer.current); };
    }, [currentIndex, phase]);

    // ── Pinch distance helper
    const getPinchDist = (): number | null => {
        const pts = Array.from(activeTouches.current.values());
        if (pts.length < 2) return null;
        return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    };

    // ── Pan + Pinch handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        activeTouches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);

        if (activeTouches.current.size >= 2) {
            // Start pinch
            isPinching.current = true;
            lastPinchDist.current = getPinchDist();
            setIsDragging(false);
        } else {
            // Single finger drag
            setIsDragging(true);
            setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
            setDragDistance(0);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        activeTouches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (isPinching.current && activeTouches.current.size >= 2) {
            const dist = getPinchDist();
            if (dist !== null && lastPinchDist.current !== null) {
                const delta = dist - lastPinchDist.current;
                setScale(s => Math.max(0.3, Math.min(5, s + delta * 0.002)));
                lastPinchDist.current = dist;
            }
            return;
        }

        if (!isDragging) return;
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        const d = Math.sqrt(Math.pow(e.clientX - (dragStart.x + panPosition.x), 2) + Math.pow(e.clientY - (dragStart.y + panPosition.y), 2));
        setDragDistance(d);
        if (imageRef.current && scale > 0) {
            const maxX = imageRef.current.naturalWidth * scale * 0.6;
            const maxY = imageRef.current.naturalHeight * scale * 0.6;
            updatePan(Math.max(-maxX, Math.min(maxX, newX)), Math.max(-maxY, Math.min(maxY, newY)));
        } else {
            updatePan(newX, newY);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        activeTouches.current.delete(e.pointerId);
        try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (_) {}
        if (activeTouches.current.size < 2) {
            isPinching.current = false;
            lastPinchDist.current = null;
        }
        if (activeTouches.current.size === 0) {
            setIsDragging(false);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        setScale(s => Math.max(0.3, Math.min(5, s - e.deltaY * 0.001)));
    };

    const imgDims = getNaturalDimensions();
    const imgW = imgDims?.w ?? 0;
    const imgH = imgDims?.h ?? 0;

    return (
        <div ref={containerRef} className="relative w-full h-full bg-white overflow-hidden select-none touch-none">
            {/* Hidden preloader image (uses separate ref to avoid conflicts) */}
            <Picture
                slug={slug} alt="preload"
                className="hidden" ref={preloaderRef}
                onLoad={() => setImageLoaded(true)} priority
            />

            {/* Loading spinner */}
            {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-white">
                    <div className="w-10 h-10 border-2 border-[#93D2FF]/30 border-t-[#93D2FF] rounded-full animate-spin" />
                </div>
            )}

            {imageLoaded && (
                <>
                    {/* ── Image + overlay layer ── */}
                    <div
                        className="absolute inset-0 flex items-center justify-center cursor-crosshair touch-none"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onWheel={handleWheel}
                        onClick={handleImageClick}
                    >
                        {/* Image */}
                        <div
                            className="relative"
                            style={{
                                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${scale})`,
                                transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                transformOrigin: 'center center',
                                opacity: scale > 0 ? 1 : 0,
                            }}
                        >
                            <Picture
                                ref={imageRef}
                                slug={slug}
                                alt={artwork.title}
                                imgClassName="max-w-none select-none pointer-events-none block"
                                draggable={false}
                                priority
                                onLoad={() => {
                                    setVisibleImageReady(true);
                                    // Recalculate scale now that the visible image has loaded
                                    if (imageRef.current && containerSize.width > 0) {
                                        const fitScale = Math.min(
                                            containerSize.width / imageRef.current.naturalWidth,
                                            containerSize.height / imageRef.current.naturalHeight
                                        );
                                        if (fitScale > 0) setScale(fitScale * ZOOM_LEVEL);
                                    }
                                }}
                            />

                            {/* Spotlight overlay: only shown in 'revealed' phase for specific points */}
                            {phase === 'revealed' && currentPoint && isSpecific && imgW > 0 && (
                                <SpotlightOverlay
                                    imgW={imgW}
                                    imgH={imgH}
                                    rects={getSpotlightRects(currentPoint)}
                                    visible={true}
                                />
                            )}

                            {/* Hint spotlight (dim effect when hint is active in prompt phase) */}
                            {phase === 'prompt' && hintActive && currentPoint && isSpecific && imgW > 0 && (
                                <SpotlightOverlay
                                    imgW={imgW}
                                    imgH={imgH}
                                    rects={getSpotlightRects(currentPoint)}
                                    visible={true}
                                />
                            )}
                        </div>
                    </div>

                    {/* ── Red flash on wrong tap ── */}
                    {wrongFlash && (
                        <div className="absolute inset-0 bg-red-500/20 pointer-events-none animate-pulse z-40" />
                    )}

                    {/* ── Progress bar ── */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-50">
                        <div
                            className="h-full transition-all duration-500"
                            style={{
                                width: `${progress * 100}%`,
                                background: 'linear-gradient(to right, #93D2FF, #5fa8e0)'
                            }}
                        />
                    </div>

                    {/* ── Point counter ── */}
                    <div className="absolute top-3 right-4 z-50 text-white/50 text-xs font-bold tracking-widest">
                        {currentIndex + 1} / {artwork.learningPoints.length}
                    </div>

                    {/* ── SPECIFIC POINT: Prompt at bottom ── */}
                    {phase === 'prompt' && isSpecific && currentPoint && (
                        <div
                            className="absolute bottom-0 left-0 right-0 p-4 pb-6 z-50"
                            style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 60%, transparent)',
                                pointerEvents: 'none'
                            }}
                        >
                            <div className="max-w-lg mx-auto text-center">
                                <div className="text-[#93D2FF] text-[10px] font-black uppercase tracking-[0.25em] mb-1">
                                    Find on the artwork
                                </div>
                                <div className="text-white font-bold text-base leading-snug">
                                    {currentPoint.label}
                                </div>
                                {hintActive && (
                                    <div className="mt-2 text-white/50 text-xs animate-pulse">
                                        💡 Hint revealed — tap anywhere near the glowing area
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── SPECIFIC POINT: Revealed tooltip ── */}
                    {phase === 'revealed' && isSpecific && currentPoint && (
                        <div
                            className="absolute bottom-0 left-0 right-0 p-4 pb-6 z-50"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 60%, transparent)' }}
                            onClick={() => advance()}
                        >
                            <div className="max-w-lg mx-auto">
                                <div className="text-[#93D2FF] text-[10px] font-black uppercase tracking-[0.25em] mb-1">
                                    ✓ Found
                                </div>
                                <div className="text-white font-bold text-sm mb-1">
                                    {currentPoint.label}
                                </div>
                                <p className="text-white/75 text-sm leading-relaxed">
                                    {currentPoint.tooltip.text}
                                </p>
                                <div className="mt-3 text-white/40 text-xs text-center animate-pulse">
                                    Tap anywhere to continue →
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── GENERAL POINT: Marierose dialogue ── */}
                    {phase === 'general' && currentPoint && (
                        <MarieroseDialogue hotspot={currentPoint} onDismiss={advance} />
                    )}
                </>
            )}
        </div>
    );
}
