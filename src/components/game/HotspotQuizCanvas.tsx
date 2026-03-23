import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Artwork, Hotspot } from '../../data/gameTypes';
import type { SheetQ1Hotspot } from '../../services/sheetsApi';
import { shuffleOptions } from '../../services/sheetsApi';
import Picture from '../ui/Picture';
import { urlToSlug } from '../../utils/imageUtils';

interface HotspotQuizCanvasProps {
    artwork: Artwork;
    questions: SheetQ1Hotspot[];
    onComplete: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];


const PARTICLE_COLORS = [
    '#4ade80', '#93D2FF', '#fbbf24', '#f472b6',
    '#a78bfa', '#34d399', '#fb923c', '#60a5fa',
];

const SPEED_PRAISES = [
    { threshold: 2, text: '⚡ LIGHTNING!', color: '#fbbf24' },
    { threshold: 3.5, text: '🔥 FAST!', color: '#fb923c' },
    { threshold: 6, text: '👍 Nice!', color: '#4ade80' },
];

function getCenters(hotspot: Hotspot): { cx: number; cy: number }[] {
    const rects = hotspot.clickArea.rects;
    if (rects && rects.length > 0) {
        return rects.map(r => ({ cx: r.x + r.w / 2, cy: r.y + r.h / 2 }));
    }
    if (hotspot.clickArea.rect) {
        const r = hotspot.clickArea.rect;
        return [{ cx: r.x + r.w / 2, cy: r.y + r.h / 2 }];
    }
    return [{ cx: hotspot.clickArea.x, cy: hotspot.clickArea.y }];
}

function spawnParticles(count: number): { px: string; py: string; color: string; delay: string }[] {
    return Array.from({ length: count }, (_, i) => {
        const angle = (360 / count) * i + (Math.random() * 30 - 15);
        const distance = 40 + Math.random() * 80;
        const rad = (angle * Math.PI) / 180;
        return {
            px: `${Math.cos(rad) * distance}px`,
            py: `${Math.sin(rad) * distance}px`,
            color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
            delay: `${Math.random() * 0.15}s`,
        };
    });
}

type AnswerResult = 'correct' | 'wrong';

export default function HotspotQuizCanvas({ artwork, questions, onComplete }: HotspotQuizCanvasProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [streak, setStreak] = useState(0);
    const [score, setScore] = useState(0);
    const [showScoreBump, setShowScoreBump] = useState(false);
    const [particles, setParticles] = useState<ReturnType<typeof spawnParticles>>([]);
    const [particleOrigin, setParticleOrigin] = useState({ x: '50%', y: '50%' });
    const [showXpFloat, setShowXpFloat] = useState(false);
    const [xpAmount, setXpAmount] = useState(0);
    const [showRingBurst, setShowRingBurst] = useState(false);
    const [showFlashRed, setShowFlashRed] = useState(false);
    const [comboKey, setComboKey] = useState(0);
    const [questionKey, setQuestionKey] = useState(0);
    const [showHintFlash, setShowHintFlash] = useState(false);
    const [zoomToDetail, setZoomToDetail] = useState(false);
    const [answerHistory, setAnswerHistory] = useState<AnswerResult[]>([]);

    const [markersReady, setMarkersReady] = useState(false);
    const [cameraShake, setCameraShake] = useState(false);
    const [speedPraise, setSpeedPraise] = useState<{ text: string; color: string } | null>(null);
    const [speedPraiseKey, setSpeedPraiseKey] = useState(0);
    const questionStartRef = useRef(Date.now());
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const currentQuestion = questions[currentIndex] ?? null;

    const hotspotMap = useMemo(() => {
        const map = new Map<string, Hotspot>();
        artwork.learningPoints.forEach(lp => map.set(lp.id, lp));
        return map;
    }, [artwork.learningPoints]);

    const targetRectIndex = currentQuestion
        ? (currentQuestion.rect_index !== '' ? parseInt(currentQuestion.rect_index, 10) : undefined)
        : undefined;

    const options = useMemo(() => {
        if (!currentQuestion) return [];
        const target = hotspotMap.get(currentQuestion.point_id);
        const decoyIds = currentQuestion.decoy_point_ids.split(',').map(s => s.trim()).filter(Boolean);
        const decoys = decoyIds.map(id => hotspotMap.get(id)).filter(Boolean) as Hotspot[];
        if (!target) return [];
        const items = [
            { hotspot: target, isCorrect: true, rectIndex: targetRectIndex },
            ...decoys.map(h => ({ hotspot: h, isCorrect: false, rectIndex: undefined as number | undefined })),
        ];
        return shuffleOptions(items).map((item, i) => ({
            letter: LETTERS[i] || String(i + 1),
            ...item,
        }));
    }, [currentQuestion, hotspotMap, targetRectIndex]);

    useEffect(() => {
        if (questions.length === 0) onComplete();
    }, [questions.length, onComplete]);

    // Reset on question change
    useEffect(() => {
        setSelectedLetter(null);
        setAnswerStatus('idle');
        setParticles([]);
        setShowXpFloat(false);
        setShowRingBurst(false);
        setShowFlashRed(false);
        setShowHintFlash(false);
        setZoomToDetail(false);
        setQuestionKey(prev => prev + 1);

        setMarkersReady(false);
        setCameraShake(false);
        setSpeedPraise(null);
        questionStartRef.current = Date.now();

        const t = setTimeout(() => setMarkersReady(true), 200);
        return () => clearTimeout(t);
    }, [currentIndex]);



    const advance = useCallback(() => {
        const next = currentIndex + 1;
        if (next >= questions.length) {
            setTimeout(onComplete, 300);
        } else {
            setCurrentIndex(next);
        }
    }, [currentIndex, questions.length, onComplete]);

    const handleSelect = (letter: string, isCorrect: boolean, centerX: number, centerY: number) => {
        if (answerStatus !== 'idle') return;
        setSelectedLetter(letter);


        if (isCorrect) {
            const newStreak = streak + 1;
            setStreak(newStreak);

            const elapsed = (Date.now() - questionStartRef.current) / 1000;
            const speedBonus = elapsed < 3 ? 15 : elapsed < 6 ? 10 : elapsed < 9 ? 5 : 0;
            const streakBonus = Math.min(newStreak - 1, 5) * 5;
            const earned = 10 + streakBonus + speedBonus;
            setXpAmount(earned);
            setScore(prev => prev + earned);
            setShowScoreBump(true);
            setTimeout(() => setShowScoreBump(false), 400);

            // Speed praise
            const praise = SPEED_PRAISES.find(p => elapsed <= p.threshold);
            if (praise) {
                setSpeedPraise(praise);
                setSpeedPraiseKey(prev => prev + 1);
            }

            // Check if this will be a perfect score
            const newHistory = [...answerHistory, 'correct' as AnswerResult];
            const willBePerfect = newHistory.length === questions.length && newHistory.every(r => r === 'correct');

            setParticleOrigin({ x: `${centerX}%`, y: `${centerY}%` });
            // Double particles on perfect score final question
            setParticles(spawnParticles(willBePerfect ? 28 : 14));
            setShowRingBurst(true);
            setShowXpFloat(true);
            setComboKey(prev => prev + 1);
            setAnswerHistory(newHistory);

            setAnswerStatus('correct');
            setTimeout(() => setZoomToDetail(true), 400);
        } else {
            setStreak(0);
            setAnswerStatus('wrong');
            setShowFlashRed(true);
            setShowHintFlash(true);
            setCameraShake(true);
            setTimeout(() => setCameraShake(false), 500);
            setAnswerHistory(prev => [...prev, 'wrong']);
            setTimeout(() => setShowFlashRed(false), 500);
            setTimeout(() => {
                setShowHintFlash(false);
                setSelectedLetter(null);
                setAnswerStatus('idle');

                questionStartRef.current = Date.now();
                setMarkersReady(false);
                setTimeout(() => setMarkersReady(true), 200);
            }, 2500);
        }
    };

    if (questions.length === 0) return null;

    const slug = urlToSlug(artwork.imageUrl);
    const progress = questions.length > 0 ? (currentIndex + (answerStatus === 'correct' ? 1 : 0)) / questions.length : 0;
    const correctOption = options.find(o => o.isCorrect);
    const correctCenter = correctOption ? getCenters(correctOption.hotspot)[0] : null;
    const isPerfect = answerHistory.length === questions.length && answerHistory.every(r => r === 'correct');



    // Build flat marker list for stagger index
    const allMarkers: {
        opt: (typeof options)[number];
        center: { cx: number; cy: number };
        ci: number;
        idx: number;
    }[] = [];
    let mIdx = 0;
    for (const opt of options) {
        const centers = getCenters(opt.hotspot);
        for (let ci = 0; ci < centers.length; ci++) {
            allMarkers.push({ opt, center: centers[ci], ci, idx: mIdx++ });
        }
    }

    return (
        <div className={`relative w-full h-full bg-white overflow-hidden select-none flex flex-col ${cameraShake ? 'animate-camera-shake' : ''}`}>
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 z-50">
                <div
                    className="h-full transition-all duration-700 ease-out rounded-r-full"
                    style={{
                        width: `${progress * 100}%`,
                        background: isPerfect
                            ? 'linear-gradient(to right, #fbbf24, #f59e0b, #fbbf24)'
                            : 'linear-gradient(to right, #93D2FF, #4ade80)',
                        boxShadow: isPerfect
                            ? '0 0 16px rgba(251,191,36,0.7)'
                            : '0 0 12px rgba(147,210,255,0.5)',
                    }}
                />
            </div>



            {/* Top HUD */}
            <div className="absolute top-4 left-0 right-0 z-50 flex items-center justify-between px-4">
                <div
                    className="text-[#93D2FF] text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-[#93D2FF]/20"
                    style={{ background: 'rgba(147,210,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                    Hotspot Quiz
                </div>
                <div className="flex items-center gap-3">
                    <div
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 border border-white/10 ${showScoreBump ? 'animate-score-bump' : ''}`}
                        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                    >
                        <span className="text-amber-400 text-xs">⭐</span>
                        <span className="text-white font-bold text-xs tabular-nums">{score}</span>
                    </div>
                    <div className="text-white/40 text-[11px] font-bold tracking-widest tabular-nums">
                        {currentIndex + 1}/{questions.length}
                    </div>
                </div>
            </div>

            {/* Answer history dots */}
            {questions.length > 1 && (
                <div className="absolute top-[52px] left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5">
                    {questions.map((_, i) => {
                        let dotClass = 'answer-dot answer-dot-pending';
                        if (i < answerHistory.length) {
                            dotClass = answerHistory[i] === 'correct' ? 'answer-dot answer-dot-correct' : 'answer-dot answer-dot-wrong';
                        } else if (i === currentIndex) {
                            dotClass = 'answer-dot answer-dot-current';
                        }
                        return <div key={i} className={dotClass} />;
                    })}
                </div>
            )}

            {/* Streak/Combo indicator */}
            {streak >= 2 && answerStatus !== 'wrong' && (
                <div key={comboKey} className="absolute top-[68px] left-1/2 -translate-x-1/2 z-50 animate-combo-pop">
                    <div
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${
                            streak >= 5
                                ? 'border-orange-400/40 text-orange-300'
                                : streak >= 3
                                    ? 'border-amber-400/40 text-amber-300'
                                    : 'border-[#93D2FF]/30 text-[#93D2FF]'
                        }`}
                        style={{
                            background: streak >= 5
                                ? 'rgba(249,115,22,0.15)'
                                : streak >= 3
                                    ? 'rgba(245,158,11,0.15)'
                                    : 'rgba(147,210,255,0.1)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                        }}
                    >
                        <span className={`text-lg ${streak >= 5 ? 'animate-fire-glow' : ''}`}>
                            {streak >= 5 ? '🔥' : streak >= 3 ? '⚡' : '✨'}
                        </span>
                        <span className="font-black text-sm tracking-wider uppercase">
                            {streak}x Combo!
                        </span>
                    </div>
                </div>
            )}

            {/* Speed praise pop */}
            {speedPraise && answerStatus === 'correct' && (
                <div key={speedPraiseKey} className="absolute top-[38%] left-1/2 z-[60] animate-speed-pop pointer-events-none">
                    <div
                        className="font-black text-2xl whitespace-nowrap"
                        style={{ color: speedPraise.color, textShadow: `0 2px 12px rgba(0,0,0,0.8), 0 0 30px ${speedPraise.color}50` }}
                    >
                        {speedPraise.text}
                    </div>
                </div>
            )}

            {/* Image area */}
            <div key={questionKey} className="flex-1 relative flex items-center justify-center p-4 pt-20 animate-image-enter overflow-hidden">
                <div
                    className={`relative inline-block ${zoomToDetail ? 'animate-zoom-detail' : ''}`}
                    ref={imageContainerRef}
                    style={zoomToDetail && correctCenter ? {
                        '--zoom-x': `${correctCenter.cx}%`,
                        '--zoom-y': `${correctCenter.cy}%`,
                    } as React.CSSProperties : undefined}
                >
                    <Picture
                        slug={slug}
                        alt={artwork.title}
                        imgClassName="max-w-full max-h-[50vh] object-contain rounded-lg block"
                        priority
                    />

                    {/* Particle burst */}
                    {particles.length > 0 && (
                        <div className="absolute pointer-events-none z-50" style={{ left: particleOrigin.x, top: particleOrigin.y }}>
                            {particles.map((p, i) => (
                                <div
                                    key={`p-${currentIndex}-${i}`}
                                    className="quiz-particle"
                                    style={{ '--px': p.px, '--py': p.py, backgroundColor: p.color, animationDelay: p.delay } as React.CSSProperties}
                                />
                            ))}
                        </div>
                    )}

                    {/* Ring burst */}
                    {showRingBurst && (
                        <div
                            className="absolute pointer-events-none z-40 w-12 h-12 rounded-full border-4 border-green-400 animate-ring-burst"
                            style={{ left: particleOrigin.x, top: particleOrigin.y }}
                        />
                    )}

                    {/* XP float */}
                    {showXpFloat && (
                        <div
                            className="absolute pointer-events-none z-50 animate-xp-float"
                            style={{ left: particleOrigin.x, top: particleOrigin.y, transform: 'translate(-50%, -100%)' }}
                        >
                            <div
                                className="font-black text-lg whitespace-nowrap"
                                style={{
                                    color: isPerfect ? '#fbbf24' : '#4ade80',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                                }}
                            >
                                +{xpAmount} XP
                            </div>
                        </div>
                    )}

                    {/* Markers with stagger + outer pulse ring */}
                    {allMarkers.map(({ opt, center, ci, idx }) => {
                        const isSelected = selectedLetter === opt.letter;
                        const isCorrectAnswer = opt.isCorrect;

                        let markerBg = 'rgba(147, 210, 255, 0.88)';
                        let textColor = '#000';
                        let extraClass = markersReady ? 'animate-marker-breathe' : 'animate-marker-pop-in';
                        let borderColor = 'rgba(255,255,255,0.6)';
                        let zIndex = 20;
                        const staggerDelay = markersReady ? undefined : `${idx * 0.1}s`;
                        let showPulseRing = answerStatus === 'idle' && markersReady;

                        if (answerStatus === 'correct' && isCorrectAnswer) {
                            markerBg = 'rgba(74, 222, 128, 1)';
                            extraClass = 'animate-correct-bounce';
                            borderColor = 'rgba(255,255,255,0.9)';
                            zIndex = 30;
                            showPulseRing = false;
                        } else if (answerStatus === 'correct' && !isCorrectAnswer) {
                            markerBg = 'rgba(80,80,80,0.12)';
                            textColor = 'rgba(255,255,255,0.1)';
                            extraClass = '';
                            borderColor = 'rgba(255,255,255,0.03)';
                            showPulseRing = false;
                        } else if (isSelected && answerStatus === 'wrong') {
                            markerBg = 'rgba(248, 113, 113, 1)';
                            extraClass = 'animate-shake';
                            borderColor = 'rgba(255,255,255,0.5)';
                            showPulseRing = false;
                        } else if (answerStatus === 'wrong' && isCorrectAnswer && showHintFlash) {
                            markerBg = 'rgba(74, 222, 128, 0.9)';
                            extraClass = 'animate-hint-flash';
                            borderColor = 'rgba(74,222,128,0.8)';
                            zIndex = 30;
                            showPulseRing = false;
                        }

                        return (
                            <div key={`m-${opt.letter}-${ci}`}>
                                {/* Outer pulse ring */}
                                {showPulseRing && (
                                    <div
                                        className="marker-pulse-ring"
                                        style={{
                                            left: `${center.cx}%`,
                                            top: `${center.cy}%`,
                                            width: 40,
                                            height: 40,
                                            animationDelay: `${idx * 0.5}s`,
                                        }}
                                    />
                                )}
                                <button
                                    onClick={() => handleSelect(opt.letter, opt.isCorrect, center.cx, center.cy)}
                                    disabled={answerStatus !== 'idle'}
                                    className={`absolute flex items-center justify-center rounded-full
                                        font-black cursor-pointer
                                        disabled:cursor-not-allowed ${extraClass}`}
                                    style={{
                                        left: `${center.cx}%`,
                                        top: `${center.cy}%`,
                                        width: 42,
                                        height: 42,
                                        backgroundColor: markerBg,
                                        color: textColor,
                                        border: `2.5px solid ${borderColor}`,
                                        fontSize: 15,
                                        fontWeight: 900,
                                        letterSpacing: '0.03em',
                                        textShadow: textColor === '#000' ? '0 1px 2px rgba(255,255,255,0.3)' : 'none',
                                        zIndex,
                                        animationDelay: staggerDelay,
                                    }}
                                >
                                    {opt.letter}
                                </button>
                            </div>
                        );
                    })}

                    {/* Dim overlay when correct */}
                    {answerStatus === 'correct' && (
                        <div
                            className="absolute inset-0 rounded-lg pointer-events-none z-10"
                            style={{
                                background: 'rgba(0,0,0,0.45)',
                                transition: 'opacity 0.5s ease',
                            }}
                        />
                    )}

                    {/* Red flash overlay on wrong */}
                    {showFlashRed && (
                        <div className="absolute inset-0 rounded-lg pointer-events-none z-10 animate-flash-red" style={{ background: 'rgba(248,113,113,0.45)' }} />
                    )}
                </div>
            </div>

            {/* Bottom panel — glassmorphism */}
            <div
                className="relative z-30 p-4 pb-6 border-t border-white/5"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.92) 60%, rgba(0,0,0,0.7) 85%, transparent)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                }}
            >
                {answerStatus === 'idle' && currentQuestion && (
                    <div key={`q-${currentIndex}`} className="max-w-lg mx-auto text-center animate-question-slide-up">
                        <div className="text-[#93D2FF] text-[10px] font-black uppercase tracking-[0.25em] mb-2 opacity-80">
                            Tap the correct marker on the painting
                        </div>
                        <div className="text-white font-bold text-base leading-snug">
                            {currentQuestion.question_text}
                        </div>
                    </div>
                )}

                {/* Wrong answer feedback */}
                {answerStatus === 'wrong' && showHintFlash && correctOption && (
                    <div className="max-w-lg mx-auto text-center animate-fade-in">
                        <div className="text-red-400 text-[10px] font-black uppercase tracking-[0.25em] mb-1">
                            Not quite — look for the green flash!
                        </div>
                        <div className="text-white/50 text-sm">
                            The correct answer is <span className="text-green-400 font-bold">{correctOption.letter}</span> — {correctOption.hotspot.label}
                        </div>
                    </div>
                )}

                {/* Correct answer feedback */}
                {answerStatus === 'correct' && correctOption && (
                    <div className="max-w-lg mx-auto animate-fade-in">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                                style={{ backgroundColor: isPerfect ? '#fbbf24' : 'rgba(74,222,128,1)', color: '#000' }}
                            >
                                {isPerfect ? '🏆' : correctOption.letter}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isPerfect ? 'text-amber-400' : 'text-green-400'}`}>
                                {isPerfect ? 'PERFECT SCORE!' : 'Correct!'}
                            </span>
                            {(streak >= 2 || xpAmount > 10) && (
                                <span className="text-amber-400/80 text-[10px] font-bold ml-auto tabular-nums">
                                    +{xpAmount} XP{streak >= 2 ? ` (${streak}x)` : ''}
                                </span>
                            )}
                        </div>
                        <div className="text-white font-bold text-sm mb-0.5">
                            {correctOption.hotspot.label}
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">
                            {correctOption.hotspot.tooltip.text}
                        </p>
                        <button
                            onClick={advance}
                            className="mt-3 w-full py-2.5 rounded-xl font-bold text-sm tracking-wide
                                transition-all active:scale-[0.97] cursor-pointer"
                            style={{
                                background: isPerfect
                                    ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                                    : 'linear-gradient(135deg, #4ade80, #22c55e)',
                                color: '#000',
                                boxShadow: isPerfect
                                    ? '0 4px 20px rgba(251,191,36,0.3)'
                                    : '0 4px 20px rgba(74,222,128,0.3)',
                            }}
                        >
                            Continue →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
