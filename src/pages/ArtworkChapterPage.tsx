import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { getAllArtworks } from '../services/sheetsApi';
import { buildChapters, type ChapterDef } from '../services/sheetsApi';
import { useUserStore } from '../store/userStore';
import type { Artwork } from '../data/gameTypes';

// ─── Particle system ──────────────────────────────────────────────────────────
interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    size: number; opacity: number;
    life: number; maxLife: number;
    color: string;
}

const PARTICLE_COLORS = [
    'rgba(147,210,255,', // blue
    'rgba(167,139,250,', // purple
    'rgba(251,191,36,',  // gold
];

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement>) {
    const particles = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);

    const spawnParticle = (w: number, h: number): Particle => {
        const life = 200 + Math.random() * 300;
        const colorBase = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -0.2 - Math.random() * 0.5,
            size: 1 + Math.random() * 2,
            opacity: 0.2 + Math.random() * 0.4,
            life,
            maxLife: life,
            color: colorBase,
        };
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < 40; i++) {
            particles.current.push(spawnParticle(canvas.width, canvas.height));
        }

        const tick = () => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            if (particles.current.length < 60 && Math.random() < 0.3) {
                particles.current.push(spawnParticle(width, height));
            }

            particles.current = particles.current.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;

                if (p.y < -10) return false;
                const progress = p.life / p.maxLife;
                const alpha = progress < 0.2 ? p.opacity * (progress / 0.2) : p.opacity * Math.min(1, progress);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `${p.color}${alpha})`;
                ctx.fill();

                return p.life > 0;
            });

            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', resize);
        };
    }, []);
}

// ─── Chapter Card (T2-style rounded card) ──────────────────────────────────────
interface ChapterCardProps {
    chapter: ChapterDef;
    artwork: Artwork;
    chapterIndex: number;
    status: 'locked' | 'current' | 'completed';
    chapterImage: string;
    onClick: () => void;
}

function ChapterCard({ chapter, chapterIndex, status, chapterImage, onClick }: ChapterCardProps) {
    const isJigsaw = chapter.type === 'jigsaw';
    const isLocked = status === 'locked';

    return (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={`relative group focus:outline-none transition-all duration-300 ${
                isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:z-10'
            }`}
            style={{ width: 130, height: 90 }}
        >
            {/* Card container */}
            <div
                className={`w-full h-full rounded-xl overflow-hidden transition-all duration-300 ${
                    status === 'current'
                        ? 'ring-2 ring-[#93D2FF] shadow-[0_0_24px_rgba(147,210,255,0.4)]'
                        : status === 'completed'
                            ? 'ring-2 ring-[#C9922A] shadow-[0_0_16px_rgba(201,146,42,0.3)]'
                            : 'ring-1 ring-white/8'
                }`}
            >
                {/* Image */}
                <img
                    src={chapterImage}
                    alt={isJigsaw ? 'Final Challenge' : `Chapter ${chapterIndex + 1}`}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                        isLocked
                            ? 'grayscale blur-[2px] brightness-[0.2]'
                            : 'brightness-90 group-hover:brightness-110'
                    }`}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Lock overlay for locked chapters */}
                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(4px)',
                                border: '1.5px solid rgba(255,255,255,0.15)',
                            }}
                        >
                            <Lock size={18} className="text-white/40" />
                        </div>
                    </div>
                )}

                {/* Completed checkmark */}
                {status === 'completed' && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#C9922A] flex items-center justify-center text-[10px] text-white font-black shadow">
                        ✓
                    </div>
                )}

                {/* Chapter label */}
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        isLocked ? 'text-white/25' : 'text-white/90'
                    }`}>
                        {isJigsaw ? '🧩 Jigsaw' : `Ch. ${chapterIndex + 1}`}
                    </span>
                </div>
            </div>
        </button>
    );
}

// ─── Build chapter card grid layout (pyramid-like, T2-style) ───────────────────

function buildGridLayout(count: number): { col: number; row: number }[] {
    // Creates a pyramid-like layout
    // For small counts, simple stagger. For larger, build columns with stacked cards
    const positions: { col: number; row: number }[] = [];

    if (count <= 5) {
        // Simple zig-zag for small counts
        const patterns = [
            [{ col: 0, row: 2 }],
            [{ col: 0, row: 2 }, { col: 1, row: 1 }],
            [{ col: 0, row: 2 }, { col: 1, row: 1 }, { col: 2, row: 2 }],
            [{ col: 0, row: 2 }, { col: 1, row: 1 }, { col: 2, row: 0 }, { col: 3, row: 1 }],
            [{ col: 0, row: 2 }, { col: 1, row: 1 }, { col: 2, row: 0 }, { col: 3, row: 1 }, { col: 4, row: 2 }],
        ];
        return patterns[count - 1] || [];
    }

    // For 6+ cards, build columns of varying height
    const cols = Math.ceil(count / 3);
    for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        // Stagger: odd columns shift down
        const stagger = col % 2 === 1 ? 0.5 : 0;
        positions.push({ col, row: row + stagger });
    }
    return positions;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ArtworkChapterPage() {
    const { artworkId } = useParams<{ artworkId: string }>();
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [chapters, setChapters] = useState<ChapterDef[]>([]);
    const [loading, setLoading] = useState(true);
    useParticles(canvasRef as React.RefObject<HTMLCanvasElement>);

    const { isChapterCompleted, getCompletedChapterCount } = useUserStore();

    useEffect(() => {
        if (!artworkId) return;
        setLoading(true);
        getAllArtworks().then(artworks => {
            const found = artworks.find(a => a.id === artworkId) ?? null;
            setArtwork(found);
            if (found) {
                const pointIds = found.learningPoints.map(lp => lp.id);
                setChapters(buildChapters(pointIds));
            }
            setLoading(false);
        });
    }, [artworkId]);

    const getChapterStatus = useCallback((chapterIndex: number): 'locked' | 'current' | 'completed' => {
        if (!artworkId) return 'locked';
        if (isChapterCompleted(artworkId, chapterIndex)) return 'completed';
        if (chapterIndex === 0) return 'current';
        if (isChapterCompleted(artworkId, chapterIndex - 1)) return 'current';
        return 'locked';
    }, [artworkId, isChapterCompleted]);

    const handleChapterClick = (_chapter: ChapterDef, chapterIndex: number) => {
        const status = getChapterStatus(chapterIndex);
        if (status === 'locked' || !artworkId) return;
        navigate(`/play/${artworkId}/${chapterIndex}`);
    };

    const completedCount = artworkId ? getCompletedChapterCount(artworkId) : 0;
    const totalContent = chapters.filter(c => c.type === 'learning').length;

    // Chapter images — use generated artwork or fallbacks
    const BASE = import.meta.env.BASE_URL;
    const getChapterImage = (index: number): string => {
        return `${BASE}chapters/${artworkId}/ch${index + 1}.png`;
    };

    const gridPositions = buildGridLayout(chapters.length);
    const CARD_W = 140; // card width + gap
    const CARD_H = 105; // card height + gap

    return (
        <div className="relative w-full h-[100dvh] bg-[#0f0a1a] overflow-hidden select-none">

            {/* Particle canvas */}
            <canvas
                ref={canvasRef as React.RefObject<HTMLCanvasElement>}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 0 }}
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(15,10,26,0.85) 100%)',
                zIndex: 1
            }} />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-16 flex items-center px-4 gap-4 z-20"
                style={{ background: 'linear-gradient(to bottom, rgba(15,10,26,0.95), transparent)' }}>
                <button
                    onClick={() => navigate('/hub')}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all border border-white/10 cursor-pointer"
                >
                    <ArrowLeft size={20} />
                </button>
                {artwork && (
                    <div>
                        <div className="text-white font-bold text-base leading-tight">{artwork.title}</div>
                        <div className="text-[#93D2FF] text-xs font-bold uppercase tracking-widest">
                            {completedCount} / {totalContent} chapters completed
                        </div>
                    </div>
                )}
            </div>

            {/* Horizontal scroll area with grid */}
            <div
                ref={scrollRef}
                className="absolute inset-0 overflow-x-auto overflow-y-hidden flex items-center"
                style={{
                    paddingLeft: '10vw',
                    paddingRight: '15vw',
                    zIndex: 10,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                <style>{`.chapter-scroll::-webkit-scrollbar { display: none; }`}</style>

                {loading ? (
                    <div className="flex items-center justify-center w-full">
                        <div className="w-8 h-8 border-2 border-[#93D2FF]/30 border-t-[#93D2FF] rounded-full animate-spin" />
                    </div>
                ) : (
                    <div
                        className="relative"
                        style={{
                            width: Math.max(...gridPositions.map(p => p.col)) * CARD_W + CARD_W + 40,
                            height: '100%',
                            paddingTop: 80,
                            paddingBottom: 80,
                        }}
                    >
                        {/* Cards */}
                        {chapters.map((chapter, i) => {
                            const pos = gridPositions[i];
                            if (!pos) return null;
                            const status = getChapterStatus(i);

                            // Calculate vertical center offset
                            const maxRow = Math.max(...gridPositions.map(p => p.row));
                            const baseY = 50; // center percentage

                            return (
                                <div
                                    key={i}
                                    className="absolute transition-all duration-500"
                                    style={{
                                        left: pos.col * CARD_W,
                                        top: `calc(${baseY}% + ${(pos.row - maxRow / 2) * CARD_H}px - 45px)`,
                                    }}
                                >
                                    <ChapterCard
                                        chapter={chapter}
                                        artwork={artwork!}
                                        chapterIndex={i}
                                        status={status}
                                        chapterImage={getChapterImage(i)}
                                        onClick={() => handleChapterClick(chapter, i)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom timeline */}
            {!loading && chapters.length > 0 && (
                <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center z-20 px-[10vw]">
                    <div className="relative w-full flex items-center" style={{ maxWidth: Math.max(...gridPositions.map(p => p.col)) * CARD_W + CARD_W }}>
                        {/* Gold line */}
                        <div className="absolute left-0 right-0 h-[2px]" style={{
                            background: 'linear-gradient(to right, transparent, rgba(201,146,42,0.5) 10%, rgba(201,146,42,0.8) 50%, rgba(201,146,42,0.5) 90%, transparent)'
                        }} />
                        {/* Diamond markers */}
                        <div className="relative w-full flex justify-between">
                            {chapters.map((_, i) => {
                                const status = getChapterStatus(i);
                                return (
                                    <div key={i} className="flex flex-col items-center">
                                        <div
                                            className={`w-3 h-3 rotate-45 transition-all ${
                                                status === 'completed'
                                                    ? 'bg-[#C9922A] shadow-[0_0_10px_#C9922A]'
                                                    : status === 'current'
                                                        ? 'bg-[#93D2FF] shadow-[0_0_10px_#93D2FF]'
                                                        : 'bg-white/10 border border-white/15'
                                            }`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
