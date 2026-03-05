import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { ERAS, ARTWORK_ERA_MAP } from '../config/eras';
import { getAllArtworks } from '../services/sheetsApi';
import { useUserStore } from '../store/userStore';
import type { Artwork } from '../data/mockArtwork';
import Picture from '../components/ui/Picture';
import { urlToSlug } from '../utils/imageUtils';

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
            <div className="flex-none h-16 border-b border-black/10 flex items-center justify-between px-4 z-50 shadow-md transition-colors" style={{ backgroundColor: wallColor }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/hub')} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-[#1A1008] hover:bg-black/20 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="font-serif text-lg md:text-xl font-bold text-[#1A1008] leading-tight flex items-center gap-2">
                            <span>{era.icon}</span> {era.name}
                        </div>
                        <div className="text-[10px] md:text-xs text-[#1A1008]/70 font-bold uppercase tracking-wider">{era.period} &middot; {completedLevels.filter(id => levelNodes.some(n => n.artwork.id === id)).length} of {levelNodes.length} recovered</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex gap-1 mr-2">
                        {levelNodes.map((n, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full ${n.status === 'completed' ? 'bg-[#1A1008]' : n.status === 'current' ? 'bg-[#1A1008] ring-2 ring-[#1A1008]/40 border border-white/50' : 'bg-[#1A1008]/15'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Wall Container */}
            <div className="flex-1 relative" style={{ backgroundColor: wallColor }}>
                {/* Wall Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                    backgroundImage: `repeating-linear-gradient(90deg, rgba(26,16,8,0.05) 0px, transparent 2px, transparent 40px, rgba(26,16,8,0.05) 42px), repeating-linear-gradient(0deg, rgba(26,16,8,0.03) 0px, transparent 2px, transparent 40px, rgba(26,16,8,0.03) 42px)`
                }} />

                {/* Floor Line */}
                <div className="absolute bottom-[44px] left-0 right-0 h-[3px] bg-[#1A1008]/10" />

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
                                    <div className={`relative p-3 md:p-4 shadow-2xl ${node.status === 'current' ? 'ring-4 ring-white/50 animate-[pulse_2s_ease-in-out_infinite]' : ''} border-2 border-[#1A1008]/10 rounded-sm bg-stone-100`}>
                                        <div className="relative border-4 border-[#1A1008] p-1 bg-white">
                                            <Picture
                                                slug={urlToSlug(node.artwork.imageUrl)}
                                                alt={node.artwork.title}
                                                variant="400"
                                                imgClassName="w-40 h-56 md:w-64 md:h-80 object-cover shadow-inner bg-slate-200"
                                                draggable={false}
                                            />
                                            {/* Status overlays */}
                                            {node.status === 'locked' && (
                                                <div className="absolute inset-0 bg-[#1A1008]/50 flex items-center justify-center">
                                                    <Lock className="text-white drop-shadow-md" size={32} />
                                                </div>
                                            )}
                                            {node.status === 'current' && (
                                                <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#C8553A] shadow-md flex items-center justify-center text-white text-lg z-10" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}>
                                                    <div className="absolute top-1 right-2">★</div>
                                                </div>
                                            )}
                                            {node.status === 'completed' && (
                                                <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-[#1A1008] border-2 border-[#F5C842] rounded-full flex items-center justify-center text-[#F5C842] z-10 font-black text-lg">✓</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-16 text-center w-64 md:w-80 whitespace-nowrap">
                                        <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1008] drop-shadow-sm line-clamp-1">{node.artwork.title}</div>
                                        <div className="text-[10px] text-[#1A1008]/60 font-bold mt-1 uppercase tracking-[0.1em]">{node.artwork.artist}</div>
                                    </div>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Grandma character (Fixed centered) */}
                {levelNodes.length > 0 && !loading && (
                    <div className="absolute bottom-[47px] left-1/2 transform -translate-x-1/2 pointer-events-none flex flex-col items-center z-40 transition-all duration-300">
                        <div className={`bg-[#1A1008] text-[#F5C842] text-[11px] font-bold px-3 py-1.5 rounded-xl mb-1 relative shadow-2xl transition-all duration-200 ease-out max-w-[150px] text-center transform ${isWalking ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
                            {levelNodes[currentFrame]?.artwork.title || "Let's explore"}
                            <div className="absolute -bottom-[5px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1A1008]" />
                        </div>
                        <div className={`text-5xl filter drop-shadow-xl transition-all ${isWalking ? 'animate-bounce' : 'animate-none'}`} style={{ animationDuration: '0.4s' }}>
                            👵
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
