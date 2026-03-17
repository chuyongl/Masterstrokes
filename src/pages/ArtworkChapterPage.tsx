import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Puzzle } from 'lucide-react';
import { getAllArtworks } from '../services/sheetsApi';
import { buildChapters, type ChapterDef } from '../services/sheetsApi';
import { useUserStore } from '../store/userStore';
import type { Artwork } from '../data/mockArtwork';

// ─── Chapter image map (static; replace with Firebase URLs once uploaded) ────
const BASE = import.meta.env.BASE_URL;
const CHAPTER_IMAGES: Record<number, string> = {
    0: `${BASE}chapters/chapter1.png`,
    1: `${BASE}chapters/chapter2.png`,
    2: `${BASE}chapters/chapter3.png`,
    3: `${BASE}chapters/chapter4.png`,
    4: `${BASE}chapters/chapter5.png`,
};

// Staggered vertical offsets for each card slot (px, relative to centre row)
const ROW_OFFSETS = [-140, 60, -60, 140, -20, 100, -100];

// Quiz type badges shown on each chapter card
const CHAPTER_BADGES = [
    ['Q1', 'Q3'],
    ['Q1', 'Q3', 'Q4'],
    ['Q1', 'Q3', 'Q5'],
    ['Q3', 'Q4', 'Q5'],
    ['Q1', 'Q3'],
];

// ─── Particle system ──────────────────────────────────────────────────────────
interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    size: number; opacity: number;
    life: number; maxLife: number;
}

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement>) {
    const particles = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);

    const spawnParticle = (_w: number, h: number): Particle => {
        const life = 180 + Math.random() * 200;
        return {
            x: -10,
            y: Math.random() * h,
            vx: 0.6 + Math.random() * 1.2,
            vy: (Math.random() - 0.5) * 0.4,
            size: 1 + Math.random() * 2.5,
            opacity: 0.3 + Math.random() * 0.5,
            life,
            maxLife: life,
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

        // Seed initial particles
        for (let i = 0; i < 60; i++) {
            const p = spawnParticle(canvas.width, canvas.height);
            p.x = Math.random() * canvas.width;  // spread across initially
            particles.current.push(p);
        }

        const tick = () => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            // Spawn new particles
            if (particles.current.length < 80 && Math.random() < 0.4) {
                particles.current.push(spawnParticle(width, height));
            }

            particles.current = particles.current.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;

                const progress = p.life / p.maxLife;
                const alpha = progress < 0.2 ? p.opacity * (progress / 0.2) : p.opacity * Math.min(1, progress);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(147, 210, 255, ${alpha})`;
                ctx.fill();

                return p.life > 0 && p.x < width + 20;
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

// ─── Chapter Card ─────────────────────────────────────────────────────────────
interface ChapterCardProps {
    chapter: ChapterDef;
    artworkId: string;
    chapterIndex: number;
    status: 'locked' | 'current' | 'completed';
    onClick: () => void;
}

function ChapterCard({ chapter, chapterIndex, status, onClick }: ChapterCardProps) {

    const isJigsaw = chapter.type === 'jigsaw';
    const isLocked = status === 'locked';
    const imgSrc = CHAPTER_IMAGES[chapterIndex] ?? CHAPTER_IMAGES[0];
    const badges = isJigsaw ? ['Q7'] : (CHAPTER_BADGES[chapterIndex] ?? ['Q1', 'Q3']);

    return (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={`relative flex flex-col items-center group focus:outline-none transition-transform duration-300 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:-translate-y-2'}`}
            style={{ width: 160 }}
        >
            {/* Card frame */}
            <div
                className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
                    status === 'current'
                        ? 'ring-2 ring-[#93D2FF] shadow-[0_0_20px_rgba(147,210,255,0.5)]'
                        : status === 'completed'
                        ? 'ring-2 ring-[#C9922A] shadow-[0_0_12px_rgba(201,146,42,0.35)]'
                        : 'ring-1 ring-[#2a2a3a]'
                }`}
                style={{ width: 160, height: 100 }}
            >
                {/* Artwork image */}
                <img
                    src={imgSrc}
                    alt={`Chapter ${chapterIndex + 1}`}
                    className={`w-full h-full object-cover transition-all duration-300 ${isLocked ? 'grayscale brightness-30' : 'brightness-90 group-hover:brightness-110'}`}
                    style={{ filter: isLocked ? 'grayscale(1) brightness(0.25)' : undefined }}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                {/* Lock icon */}
                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={28} className="text-white/50" />
                    </div>
                )}

                {/* Completed tick */}
                {status === 'completed' && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#C9922A] flex items-center justify-center text-xs text-white font-black shadow">
                        ✓
                    </div>
                )}

                {/* Jigsaw icon */}
                {isJigsaw && !isLocked && (
                    <div className="absolute top-2 left-2">
                        <Puzzle size={18} className="text-[#93D2FF]" />
                    </div>
                )}

                {/* Chapter label at bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 flex items-end justify-between">
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">
                        {isJigsaw ? 'Jigsaw' : `Ch. ${chapterIndex + 1}`}
                    </span>
                    <div className="flex gap-1">
                        {!isLocked && badges.map(b => (
                            <span key={b} className="text-[8px] font-bold px-1 rounded" style={{
                                background: 'rgba(147,210,255,0.2)',
                                color: '#93D2FF',
                                border: '1px solid rgba(147,210,255,0.4)'
                            }}>{b}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chapter title below card */}
            <div className="mt-2 text-center">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLocked ? 'text-white/20' : 'text-white/70'}`}>
                    {isJigsaw ? 'Final Challenge' : `${chapter.pointIds.length} knowledge points`}
                </span>
            </div>
        </button>
    );
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
        // First chapter always unlocked; others need previous completed
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

    return (
        <div className="relative w-full h-[100dvh] bg-black overflow-hidden select-none">

            {/* Particle canvas */}
            <canvas
                ref={canvasRef as React.RefObject<HTMLCanvasElement>}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 0 }}
            />

            {/* Subtle vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.7) 100%)',
                zIndex: 1
            }} />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-16 flex items-center px-4 gap-4 z-20"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)' }}>
                <button
                    onClick={() => navigate('/hub')}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all border border-white/10"
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

            {/* Horizontal scroll area */}
            <div
                ref={scrollRef}
                className="absolute inset-0 overflow-x-auto overflow-y-hidden flex items-center"
                style={{
                    paddingLeft: '15vw',
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
                    <div className="relative flex items-center" style={{ gap: 48, paddingBottom: 80 }}>
                        {chapters.map((chapter, i) => {
                            const offset = ROW_OFFSETS[i % ROW_OFFSETS.length];
                            const status = getChapterStatus(i);

                            return (
                                <div
                                    key={i}
                                    className="relative flex-shrink-0 transition-transform duration-500"
                                    style={{ transform: `translateY(${offset}px)` }}
                                >
                                    <ChapterCard
                                        chapter={chapter}
                                        artworkId={artworkId!}
                                        chapterIndex={i}
                                        status={status}
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
                <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center z-20 px-[15vw]">
                    <div className="relative w-full flex items-center">
                        {/* Line */}
                        <div className="absolute left-0 right-0 h-px" style={{
                            background: 'linear-gradient(to right, transparent, rgba(201,146,42,0.4) 15%, rgba(201,146,42,0.7) 50%, rgba(201,146,42,0.4) 85%, transparent)'
                        }} />
                        {/* Dot markers */}
                        <div className="relative w-full flex justify-between">
                            {chapters.map((_, i) => {
                                const status = getChapterStatus(i);

                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            const el = document.getElementById(`chapter-dot-${i}`);
                                            el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                                        }}
                                        className="relative flex flex-col items-center"
                                    >
                                        <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                                            status === 'completed' ? 'bg-[#C9922A] border-[#C9922A] shadow-[0_0_8px_#C9922A]' :
                                            status === 'current' ? 'bg-[#93D2FF] border-[#93D2FF] shadow-[0_0_8px_#93D2FF]' :
                                            'bg-transparent border-white/20'
                                        }`} />
                                        <span className={`mt-1 text-[9px] font-bold uppercase tracking-wider ${
                                            status === 'locked' ? 'text-white/20' :
                                            status === 'completed' ? 'text-[#C9922A]' : 'text-[#93D2FF]'
                                        }`}>
                                            {chapters[i].type === 'jigsaw' ? '🧩' : `${i + 1}`}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
