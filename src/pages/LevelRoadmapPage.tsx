import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { ERAS, ARTWORK_ERA_MAP } from '../config/eras';
import { getAllArtworks } from '../services/sheetsApi';
import { useUserStore } from '../store/userStore';
import type { Artwork } from '../data/mockArtwork';
import Picture from '../components/ui/Picture';
import { urlToSlug } from '../utils/imageUtils';
import MarieroseCharacter from '../components/ui/MarieroseCharacter';

interface LevelNode {
    artwork: Artwork;
    status: 'locked' | 'current' | 'completed';
}

export default function LevelRoadmapPage() {
    const { eraId } = useParams<{ eraId: string }>();
    const navigate = useNavigate();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isWalking, setIsWalking] = useState(false);
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);

    const [isDragging, setIsDragging] = useState(false);
    const dragDistanceRef = useRef(0);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== 'mouse') return;
        setIsDragging(true);
        dragDistanceRef.current = 0;
        startXRef.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
        scrollLeftRef.current = scrollRef.current?.scrollLeft || 0;
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || e.pointerType !== 'mouse' || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 2;
        scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
        dragDistanceRef.current = Math.abs(walk);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== 'mouse') return;
        setIsDragging(false);
    };

    const completedLevels = useUserStore((state) => state.completedLevels);

    const activeEraId = eraId || 'ancient-art';
    const era = ERAS.find((e) => e.id === activeEraId);

    useEffect(() => {
        async function loadArtworks() {
            setLoading(true);
            try {
                const data = await getAllArtworks();
                const filtered = data.filter((artwork) => {
                    const artworkEra = ARTWORK_ERA_MAP[artwork.id] || artwork.era;
                    return artworkEra === activeEraId;
                });
                setArtworks(filtered);
            } catch (error) {
                console.error('Failed to load artworks:', error);
                setArtworks([]);
            } finally {
                setLoading(false);
            }
        }
        loadArtworks();
    }, [activeEraId]);

    const levelNodes: LevelNode[] = artworks.map((artwork, index) => {
        let status: 'locked' | 'current' | 'completed' = 'current'; // Unlocked for testing
        const isCompleted = completedLevels.includes(artwork.id);

        if (isCompleted) {
            status = 'completed';
        }
        return { artwork, status };
    });

    const goToFrame = (index: number) => {
        const node = document.getElementById(`frame-${index}`);
        if (node && scrollRef.current) {
            node.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            setCurrentFrame(index);
        }
    };

    const handleScroll = () => {
        setIsWalking(true);
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            setIsWalking(false);
            if (scrollRef.current && levelNodes.length > 0) {
                const containerCenter = scrollRef.current.scrollLeft + scrollRef.current.clientWidth / 2;
                let closestIdx = 0;
                let minDiff = Infinity;
                levelNodes.forEach((_, i) => {
                    const el = document.getElementById(`frame-${i}`);
                    if (el) {
                        const center = el.offsetLeft + el.offsetWidth / 2;
                        const diff = Math.abs(center - containerCenter);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestIdx = i;
                        }
                    }
                });
                setCurrentFrame(closestIdx);
            }
        }, 150);
    };

    const updateParallax = () => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        const maxScroll = container.scrollWidth - containerWidth;
        const scrollProgress = maxScroll > 0 ? scrollLeft / maxScroll : 0;

        if (bgRef.current) {
            bgRef.current.style.transform = `translateX(${scrollProgress * -15}%)`;
        }

        levelNodes.forEach((_, i) => {
            const el = document.getElementById(`frame-${i}`);
            if (el) {
                const rect = el.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const elCenter = rect.left + rect.width / 2;
                const containerCenter = containerRect.left + containerWidth / 2;

                let distance = (elCenter - containerCenter) / (containerWidth / 2);
                distance = Math.max(-1.5, Math.min(1.5, distance));

                const rotateY = distance * 35;
                const translateZ = Math.abs(distance) * -200;
                const translateX = distance * 40;

                // Active vs Inactive logic
                const isActive = Math.abs(distance) < 0.2;

                el.style.transform = `perspective(1000px) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;

                // Style differences per user spec
                if (isActive) {
                    el.style.filter = 'brightness(1)';
                    el.style.border = '3px solid #8B6914';
                    el.style.boxShadow = '0 0 40px rgba(201,146,42,0.4)';
                    el.style.transform += ' scale(1)'; // reset scale for active
                } else {
                    el.style.filter = 'brightness(0.55) blur(0.5px)';
                    el.style.border = '2px solid #3D2800';
                    el.style.boxShadow = 'none';
                    el.style.transform += ' scale(0.85)';
                }
            }
        });

        requestRef.current = requestAnimationFrame(updateParallax);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateParallax);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [levelNodes.length]);

    // Auto-scroll to current (unlocked) level on initial load
    useEffect(() => {
        if (!loading && levelNodes.length > 0 && scrollRef.current) {
            const currentIdx = levelNodes.findIndex(node => node.status === 'current');
            const targetIdx = currentIdx !== -1 ? currentIdx : levelNodes.length - 1;
            setCurrentFrame(targetIdx);

            // Allow a small delay for rendering before initial scroll
            setTimeout(() => {
                const node = document.getElementById(`frame-${targetIdx}`);
                if (node) {
                    node.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
                }
            }, 100);
        }
    }, [loading, levelNodes.length]);

    if (!era) return null;

    const wallColor = era.color || '#F5C842';

    return (
        <div className="flex flex-col h-[100dvh] text-[#FFFEF5] font-sans overflow-hidden bg-[#1A1008]">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Top Bar */}
            <div className="flex-none h-16 border-b border-[#3D2800] flex items-center justify-between px-4 z-50 shadow-md transition-colors bg-[rgba(15,7,0,0.95)]">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/hub')} className="w-10 h-10 rounded-full bg-[#1C0F00] flex items-center justify-center text-[#F5E6C8] hover:bg-[#2D1A00] transition-colors border border-[#3D2800]">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="font-serif text-lg md:text-xl font-bold text-[#F5E6C8] leading-tight flex items-center gap-2">
                            <span>{era.icon}</span> {era.name}
                        </div>
                        <div className="text-[10px] md:text-xs text-[#A89070] font-bold uppercase tracking-wider">{era.period} &middot; {completedLevels.filter(id => levelNodes.some(n => n.artwork.id === id)).length} of {levelNodes.length} recovered</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex gap-1 mr-2">
                        {levelNodes.map((n, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full ${n.status === 'completed' ? 'bg-[#C9922A]' : n.status === 'current' ? 'bg-[#FFFFFF] shadow-[0_0_8px_#FFFFFF]' : 'bg-[rgba(255,255,255,0.2)]'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Wall Container */}
            <div className="flex-1 relative overflow-hidden bg-[#1C0F00]" style={{ perspective: '1000px' }}>
                {/* 3D Pure CSS Background */}
                <div
                    ref={bgRef}
                    className="absolute inset-0 h-full pointer-events-none"
                    style={{
                        width: '130%',
                        background: `
                            radial-gradient(ellipse at 50% 30%, rgba(180,120,40,0.12) 0%, transparent 60%),
                            radial-gradient(ellipse at 15% 50%, rgba(255,140,0,0.06) 0%, transparent 40%),
                            radial-gradient(ellipse at 85% 50%, rgba(255,140,0,0.06) 0%, transparent 40%),
                            linear-gradient(180deg, #0D0700 0%, #1C0F00 40%, #150B00 100%)
                        `
                    }}
                />
                {/* Vignettes */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)' }} />
                <div className="absolute inset-x-0 top-0 h-[35%] pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />

                {/* Scroll Area */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`absolute inset-0 overflow-x-auto overflow-y-hidden flex items-center gap-16 md:gap-32 px-[50vw] hide-scrollbar select-none cursor-grab active:cursor-grabbing touch-pan-x ${isDragging ? '' : 'snap-x snap-mandatory'}`}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center w-full min-w-[200px]">
                            <div className="w-8 h-8 border-4 border-[#1A1008]/20 border-t-[#1A1008] rounded-full animate-spin mb-2" />
                        </div>
                    ) : levelNodes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center px-6 min-w-[300px] text-[#1A1008]">
                            <div className="text-6xl mb-4 animate-bounce">🎨</div>
                            <h3 className="text-xl font-bold mb-2">No levels yet</h3>
                            <p className="opacity-60">Coming soon to this era!</p>
                        </div>
                    ) : (
                        levelNodes.map((node, i) => (
                            <div key={node.artwork.id} id={`frame-${i}`} className="snap-center shrink-0 relative group">
                                <button
                                    onPointerUp={(e) => {
                                        // Ignore if we just dragged
                                        if (dragDistanceRef.current > 5) return;
                                        if (node.status !== 'locked') {
                                            navigate(`/play/${node.artwork.id}`);
                                        }
                                    }}
                                    disabled={node.status === 'locked'}
                                    className={`relative flex flex-col items-center transition-transform duration-300 hover:-translate-y-2 focus:outline-none ${node.status === 'locked' ? 'grayscale opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    {/* Frame shadow/outer */}
                                    <div className={`relative p-3 md:p-4 bg-[#2D1A00] transition-colors duration-500`}>
                                        <div className="relative p-1 bg-[#1C0F00]">
                                            {/* Torn setup for locked levels */}
                                            {node.status === 'locked' && (
                                                <div className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply" style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(192,57,43,0.25) 40%)' }} />
                                            )}
                                            <Picture
                                                slug={urlToSlug(node.artwork.imageUrl)}
                                                alt={node.artwork.title}
                                                variant="400"
                                                imgClassName={`w-40 h-56 md:w-64 md:h-80 object-cover ${node.status === 'locked' ? 'opacity-50 grayscale' : ''}`}
                                                draggable={false}
                                            />
                                            {/* Status overlays */}
                                            {node.status === 'locked' && (
                                                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                                    <Lock className="text-[#C0392B] drop-shadow-md" size={32} />
                                                </div>
                                            )}
                                            {node.status === 'current' && (
                                                <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#C0392B] shadow-lg flex items-center justify-center text-white text-lg z-20" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}>
                                                    <div className="absolute top-1 right-2 animate-pulse">!</div>
                                                </div>
                                            )}
                                            {node.status === 'completed' && (
                                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#2D1A00] border border-[#C9922A] rounded-full flex items-center justify-center text-[#C9922A] z-20 font-black text-sm shadow-md">✓</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-16 text-center w-64 md:w-80 whitespace-nowrap">
                                        <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#F5E6C8] drop-shadow-sm line-clamp-1">{node.artwork.title}</div>
                                        <div className="text-[10px] text-[#A89070] font-bold mt-1 uppercase tracking-[0.1em]">{node.artwork.artist}</div>
                                    </div>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Nav Placeholder Area (since user said bottom nav bg changed to #C9922A, we'll assume Layout.tsx handles that, but we position the dialogue bar above it) */}

            {/* Marierose Dialogue Bar (Duolingo style) */}
            {
                levelNodes.length > 0 && !loading && (
                    <div className="absolute left-6 bottom-16 z-50 flex items-end gap-2">
                        {/* Character Avatar - Larger and more interactive */}
                        <div className={`relative flex flex-col items-center justify-end drop-shadow-2xl transition-transform duration-300 ${isWalking ? 'scale-105' : 'hover:scale-105'}`}>
                            <MarieroseCharacter width={260} height={260} />
                        </div>

                        {/* Dialogue Text Bubble */}
                        <div className="relative mb-32 max-w-[280px] sm:max-w-[400px] bg-[rgba(20,10,0,0.95)] backdrop-blur-md px-5 py-4 rounded-3xl rounded-bl-sm shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-[rgba(139,105,20,0.5)]">
                            <p className="text-[#F5E6C8] text-sm md:text-base font-bold font-serif leading-relaxed">
                                {/* In a real scenario this comes from artwork.marieroseQuote, using placeholder as requested */}
                                "他拿走的不是最贵的。这才是让我睡不着的地方。"
                            </p>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
