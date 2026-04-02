import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ERAS, ARTWORK_ERA_MAP } from '../config/eras';
import { getAllArtworks } from '../services/sheetsApi';
import { useUserStore } from '../store/userStore';
import type { Artwork } from '../data/gameTypes';
import Picture from '../components/ui/Picture';
import { urlToSlug } from '../utils/imageUtils';
import MarieroseCharacter from '../components/ui/MarieroseCharacter';
import imageManifest from '../data/imageManifest.json';

// ─── Chapter Switcher Sheet ─────────────────────────────────────
interface ChapterSwitcherProps {
    open: boolean;
    onClose: () => void;
    currentEraId: string;
    onSwitch: (eraId: string) => void;
    eraProgress: Record<string, { current: number; total: number }>;
}

function ChapterSwitcherSheet({ open, onClose, currentEraId, onSwitch, eraProgress }: ChapterSwitcherProps) {
    if (!open) return null;

    const historicalEras = ERAS.filter(e => !e.id.startsWith('theme-'));
    const themeEras = ERAS.filter(e => e.id.startsWith('theme-'));

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} />
            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-[70] bg-[#16152A] rounded-t-[22px] border-t border-white/[0.09] max-h-[80vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
                {/* Handle */}
                <div className="w-8 h-1 bg-white/[0.14] rounded-full mx-auto mt-[10px] mb-3" />
                {/* Header */}
                <div className="flex items-center justify-between px-4 mb-1">
                    <p className="text-[15px] font-extrabold text-white">Switch Chapter</p>
                    <button onClick={onClose} className="text-[11px] text-white/35">Done</button>
                </div>

                {/* Currently learning */}
                <p className="text-[9px] font-bold text-white/30 tracking-[0.07em] uppercase px-4 mt-3 mb-[6px]">Currently learning</p>
                {ERAS.filter(e => e.id === currentEraId).map(era => {
                    const prog = eraProgress[era.id] || { current: 0, total: 0 };
                    return (
                        <div key={era.id} className="flex items-center gap-[9px] mx-4 p-[9px_11px] rounded-[11px] border-[1.5px] border-[#7B2FF7] bg-[rgba(123,47,247,0.14)]">
                            <div className="w-[38px] h-[38px] rounded-[9px] bg-[rgba(123,47,247,0.2)] flex items-center justify-center text-[18px] flex-shrink-0">{era.icon}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-bold text-white">{era.name}</p>
                                <p className="text-[9px] text-white/40">{era.period} · {prog.total} sessions</p>
                                <div className="h-[3px] rounded-[2px] bg-white/10 mt-1">
                                    <div className="h-full rounded-[2px] bg-[#7B2FF7]" style={{ width: prog.total > 0 ? `${(prog.current / prog.total) * 100}%` : '0%' }} />
                                </div>
                                <p className="text-[9px] text-[#A78BFA] mt-[2px]">Session {prog.current} of {prog.total}</p>
                            </div>
                            <span className="text-[9px] font-bold px-[7px] py-[3px] rounded-full bg-[rgba(123,47,247,0.25)] text-[#A78BFA] flex-shrink-0">Active</span>
                        </div>
                    );
                })}

                {/* Other Categories */}
                <p className="text-[9px] font-bold text-white/30 tracking-[0.07em] uppercase px-4 mt-3 mb-[6px]">All Categories</p>
                <div className="flex flex-col gap-[5px] px-4">
                    {historicalEras.filter(e => e.id !== currentEraId).map((era, idx) => {
                        const isLocked = idx > 2; // Simple lock logic
                        const prog = eraProgress[era.id] || { current: 0, total: 0 };
                        return (
                            <button
                                key={era.id}
                                onClick={() => !isLocked && onSwitch(era.id)}
                                className={`flex items-center gap-[9px] p-[9px_11px] rounded-[11px] border-[1.5px] border-transparent text-left w-full ${isLocked ? 'opacity-40' : ''}`}
                                disabled={isLocked}
                            >
                                <div className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center text-[18px] flex-shrink-0" style={{ background: isLocked ? 'rgba(255,255,255,0.04)' : 'rgba(16,185,129,0.12)' }}>{era.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[12px] font-semibold ${isLocked ? 'text-white/50' : 'text-white'}`}>{era.name}</p>
                                    <p className="text-[9px] text-white/[0.38]">{isLocked ? (idx === 3 ? 'Complete Baroque first' : 'Locked') : `${era.period} · ${prog.total} sessions`}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-[7px] py-[3px] rounded-full flex-shrink-0 ${isLocked ? 'bg-white/5 text-white/25' : 'bg-[rgba(249,115,22,0.18)] text-[#FB923C]'}`}>
                                    {isLocked ? '🔒' : 'New'}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Theme collections */}
                {themeEras.length > 0 && (
                    <>
                        <p className="text-[9px] font-bold text-white/30 tracking-[0.07em] uppercase px-4 mt-3 mb-[6px]">By Theme</p>
                        <div className="flex flex-col gap-[5px] px-4 pb-3">
                            {themeEras.map(era => (
                                <button
                                    key={era.id}
                                    onClick={() => onSwitch(era.id)}
                                    className="flex items-center gap-[9px] p-[9px_11px] rounded-[11px] border-[1.5px] border-transparent text-left w-full"
                                >
                                    <div className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center text-[18px] flex-shrink-0 bg-[rgba(59,130,246,0.12)]">{era.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold text-white">{era.name}</p>
                                        <p className="text-[9px] text-white/[0.38]">Any level</p>
                                    </div>
                                    <span className="text-[9px] font-bold px-[7px] py-[3px] rounded-full bg-[rgba(249,115,22,0.18)] text-[#FB923C] flex-shrink-0">New</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
                {/* Safe area padding */}
                <div className="h-4" />
            </div>
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        </>
    );
}

// ─── Main HomePage ──────────────────────────────────────────────
export default function HomePage() {
    const navigate = useNavigate();
    const completedLevels = useUserStore(s => s.completedLevels);

    const [activeEraId, setActiveEraId] = useState(() => {
        return localStorage.getItem('activeEraId') || 'ancient-art';
    });
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const [savedToast, setSavedToast] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const activeEra = ERAS.find(e => e.id === activeEraId) || ERAS[0];

    // Load artworks
    useEffect(() => {
        setLoading(true);
        getAllArtworks().then(all => {
            setArtworks(all);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // Filter artworks by selected era — artwork.era is normalized by sheetsApi
    const eraArtworks = artworks.filter(a => a.era === activeEraId);
    // Fallback: if no era match, show all
    const displayArtworks = eraArtworks.length > 0 ? eraArtworks : artworks;

    // Current session = first uncompleted
    const currentIdx = displayArtworks.findIndex(a => !completedLevels.includes(a.id));
    const currentSession = currentIdx >= 0 ? currentIdx + 1 : displayArtworks.length;
    const currentArtwork = currentIdx >= 0 ? displayArtworks[currentIdx] : displayArtworks[displayArtworks.length - 1];

    // Era progress
    const eraProgress: Record<string, { current: number; total: number }> = {};
    ERAS.forEach(era => {
        const eraIds = artworks.filter(a => a.era === era.id || ARTWORK_ERA_MAP[a.id] === era.id).map(a => a.id);
        const completed = eraIds.filter(id => completedLevels.includes(id)).length;
        eraProgress[era.id] = { current: completed, total: eraIds.length };
    });

    // Streak + XP (from localStorage/store for now)
    const streak = parseInt(localStorage.getItem('streak') || '0', 10);
    const xp = parseInt(localStorage.getItem('totalXP') || '0', 10);

    // Switch chapter
    const handleSwitchEra = useCallback((eraId: string) => {
        const oldEra = ERAS.find(e => e.id === activeEraId);
        localStorage.setItem('activeEraId', eraId);
        setActiveEraId(eraId);
        setSwitcherOpen(false);
        if (oldEra) {
            const oldProgress = eraProgress[activeEraId];
            setSavedToast(`${oldEra.name} · Session ${oldProgress?.current || 0} saved`);
            setTimeout(() => setSavedToast(null), 3000);
        }
    }, [activeEraId, eraProgress]);

    // Session progress dots
    const totalSessions = displayArtworks.length;
    const completedSessions = displayArtworks.filter(a => completedLevels.includes(a.id)).length;

    // Scroll to current card on load
    useEffect(() => {
        if (!loading && scrollRef.current && currentIdx > 0) {
            const target = scrollRef.current.children[currentIdx] as HTMLElement;
            if (target) {
                scrollRef.current.scrollTo({ left: target.offsetLeft - 16, behavior: 'smooth' });
            }
        }
    }, [loading, currentIdx]);

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* ── Splash overlay while loading ─────────────────────── */}
            {loading && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, #6B21A8 0%, #581C87 40%, #3B0764 100%)' }}
                >
                    {/* Radial glow */}
                    <div className="absolute rounded-full pointer-events-none"
                        style={{
                            width: 400, height: 400, top: '50%', left: '50%',
                            transform: 'translate(-50%, -60%)',
                            background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)',
                        }}
                    />
                    {/* Character */}
                    <div className="relative z-10 animate-[character-breathe_2.5s_ease-in-out_infinite]">
                        <MarieroseCharacter width={200} height={200} />
                    </div>
                    {/* Title */}
                    <h1 className="relative z-10 text-white font-bold text-[32px] tracking-wide mt-6"
                        style={{ fontFamily: '"Jost", sans-serif', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                    >
                        Masterstrokes
                    </h1>
                    <p className="text-[11px] text-white/40 mt-2 uppercase tracking-[0.15em]">Loading your museum...</p>
                </div>
            )}

            {/* ── Purple header ─────────────────────────────────────── */}
            <div className="flex-shrink-0 bg-[#7B2FF7] px-4 pt-3 pb-4">
                {/* Top row: era badge + streak/XP */}
                <div className="flex items-center justify-between mb-[9px]">
                    <button
                        onClick={() => setSwitcherOpen(true)}
                        className="inline-flex items-center gap-[5px] bg-white/[0.13] border border-white/[0.22] rounded-full py-1 pl-[5px] pr-[10px]"
                    >
                        <div className="w-[22px] h-[22px] rounded-full bg-black/25 flex items-center justify-center text-[12px]">{activeEra.icon}</div>
                        <span className="text-[13px] font-extrabold text-white">{currentSession}</span>
                        <span className="text-[10px] font-semibold text-white/[0.72]">{activeEra.name}</span>
                        <span className="text-[10px] text-white/40">▾</span>
                    </button>
                    <div className="flex items-center gap-[5px] bg-black/20 rounded-full py-1 px-[10px]">
                        <span className="text-[12px]">🔥</span>
                        <span className="text-[11px] font-bold text-white">{streak || 0}d</span>
                        <span className="w-px h-[11px] bg-white/[0.28]" />
                        <span className="text-[11px] font-bold text-white">{xp} XP</span>
                    </div>
                </div>
                {/* Saved toast */}
                {savedToast && (
                    <div className="bg-white/[0.14] rounded-[7px] py-[5px] px-[9px] mb-[7px] inline-flex items-center gap-[5px] animate-[fadeIn_0.3s]">
                        <span className="text-[10px]">✅</span>
                        <span className="text-[10px] font-semibold text-white">{savedToast}</span>
                    </div>
                )}
                {/* Current painting title */}
                <p className="text-[18px] font-extrabold text-white leading-[1.2]">{currentArtwork?.title || 'Loading...'}</p>
                <p className="text-[9px] text-white/50 mt-[2px] uppercase tracking-wider">
                    SESSION {currentSession} · {completedSessions} OF {totalSessions} RECOVERED
                </p>
                {/* Session dots */}
                <div className="flex gap-[3px] mt-2 flex-wrap">
                    {displayArtworks.slice(0, 30).map((a, i) => {
                        const done = completedLevels.includes(a.id);
                        const current = i === currentIdx;
                        return (
                            <div
                                key={a.id}
                                className="rounded-full"
                                style={{
                                    width: done || current ? 11 : 4,
                                    height: 4,
                                    borderRadius: done || current ? 2 : '50%',
                                    background: done ? '#fff' : current ? '#fff' : 'rgba(255,255,255,0.28)',
                                }}
                            />
                        );
                    })}
                    {displayArtworks.length > 30 && (
                        <span className="text-[8px] text-white/30 ml-1">+{displayArtworks.length - 30}</span>
                    )}
                </div>
            </div>

            {/* ── Body: cards fill remaining space ─────────────────── */}
            <div className="flex-1 bg-[#2A1F5C] px-4 pt-3 pb-2 flex flex-col gap-[10px] overflow-hidden min-h-0">
                {/* Painting cards carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar select-none"
                    style={{ flex: '1 1 0', minHeight: 0, cursor: 'grab' }}
                    onPointerDown={(e) => {
                        const el = scrollRef.current;
                        if (!el) return;
                        el.setPointerCapture(e.pointerId);
                        el.style.cursor = 'grabbing';
                        el.dataset.dragging = 'true';
                        el.dataset.startX = String(e.clientX);
                        el.dataset.scrollLeft = String(el.scrollLeft);
                        el.dataset.dragDist = '0';
                    }}
                    onPointerMove={(e) => {
                        const el = scrollRef.current;
                        if (!el || el.dataset.dragging !== 'true') return;
                        const dx = e.clientX - Number(el.dataset.startX);
                        el.scrollLeft = Number(el.dataset.scrollLeft) - dx;
                        el.dataset.dragDist = String(Math.abs(dx));
                    }}
                    onPointerUp={(e) => {
                        const el = scrollRef.current;
                        if (!el) return;
                        el.releasePointerCapture(e.pointerId);
                        el.style.cursor = 'grab';
                        el.dataset.dragging = 'false';
                    }}
                >
                    {displayArtworks.map((artwork, i) => {
                        const isCurrent = i === currentIdx;
                        const isCompleted = completedLevels.includes(artwork.id);
                        const isLocked = !isCurrent && !isCompleted;
                        const slug = urlToSlug(artwork.imageUrl);
                        const manifest = (imageManifest as Record<string, any>)[slug];
                        const aspectRatio = manifest?.aspectRatio || 0.75;

                        return (
                            <div
                                key={artwork.id}
                                className="flex-shrink-0 relative"
                                style={{ width: Math.max(140, Math.round(220 * aspectRatio)), height: '100%' }}
                            >
                                {/* Image area — fills all space minus ~30px for text */}
                                <div
                                    className={`absolute inset-0 bottom-[30px] rounded-[11px] overflow-hidden ${
                                        isCurrent ? 'border-2 border-[#7B2FF7]' :
                                        isCompleted ? 'border border-[#A78BFA]/30' :
                                        'border border-white/[0.08]'
                                    }`}
                                    onClick={() => {
                                        const dist = Number(scrollRef.current?.dataset.dragDist || 0);
                                        if (dist > 5) return;
                                        if (!isLocked) navigate(`/artwork/${artwork.id}`);
                                    }}
                                    style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                                >
                                    <Picture
                                        slug={slug}
                                        alt={artwork.title}
                                        variant="800"
                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                                        imgClassName="w-full h-full object-cover"
                                        priority={i < 6}
                                    />
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                                            <span className="text-[20px]">🔒</span>
                                        </div>
                                    )}
                                    {isCompleted && (
                                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center z-10">
                                            <span className="text-xl text-white">✓</span>
                                        </div>
                                    )}
                                    <div className="absolute top-[5px] right-[5px] bg-[#7B2FF7] rounded-[3px] px-[5px] py-[2px] text-[9px] font-bold text-white z-20">
                                        {isCurrent ? '!' : i + 1}
                                    </div>
                                </div>
                                {/* Text — pinned to bottom */}
                                <div className="absolute bottom-0 left-0 right-0">
                                    <p className={`text-[9px] font-bold uppercase tracking-[0.04em] leading-[1.3] line-clamp-1 ${isLocked ? 'text-white/[0.32]' : 'text-white'}`}>{artwork.title}</p>
                                    <p className="text-[7px] text-white/[0.38]">{artwork.artist || 'Unknown'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Continue button */}
                <button
                    onClick={() => currentArtwork && navigate(`/artwork/${currentArtwork.id}`)}
                    className="w-full flex-shrink-0 border-none rounded-full bg-[#7B2FF7] text-white text-[13px] font-bold py-3 cursor-pointer"
                >
                    Continue — Session {currentSession}
                </button>

                {/* Marierose hint */}
                <div className="flex-shrink-0 bg-white/5 rounded-[11px] p-[10px_12px] flex gap-[9px] items-start">
                    <div className="flex-shrink-0">
                        <MarieroseCharacter width={26} height={32} />
                    </div>
                    <p className="text-[10px] text-white/60 leading-[1.45]">
                        {currentArtwork
                            ? `${currentArtwork.title} — discover what makes this masterpiece unique.`
                            : 'Start your art history journey!'}
                    </p>
                </div>
            </div>

            {/* ── Chapter Switcher Sheet ────────────────────────────── */}
            <ChapterSwitcherSheet
                open={switcherOpen}
                onClose={() => setSwitcherOpen(false)}
                currentEraId={activeEraId}
                onSwitch={handleSwitchEra}
                eraProgress={eraProgress}
            />

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

