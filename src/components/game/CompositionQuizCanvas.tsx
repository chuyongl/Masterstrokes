import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Artwork } from '../../data/gameTypes';
import type { SheetQ2Composition } from '../../services/sheetsApi';
import { shuffleOptions } from '../../services/sheetsApi';
import Picture from '../ui/Picture';
import { urlToSlug } from '../../utils/imageUtils';
import compositionManifest from '../../data/compositionManifest.json';

interface CompositionQuizCanvasProps {
    artwork: Artwork;
    questions: SheetQ2Composition[];
    onComplete: () => void;
}

const PARTICLE_COLORS = [
    '#a78bfa', '#93D2FF', '#fbbf24', '#f472b6',
    '#4ade80', '#34d399', '#fb923c', '#60a5fa',
];

const SPEED_PRAISES = [
    { threshold: 3, text: '⚡ LIGHTNING!', color: '#fbbf24' },
    { threshold: 5, text: '🔥 FAST!', color: '#fb923c' },
    { threshold: 8, text: '👍 Nice!', color: '#4ade80' },
];

/** Human-friendly label for a composition key */
function compositionLabel(key: string): string {
    return key
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function spawnParticles(count: number): { px: string; py: string; color: string; delay: string }[] {
    return Array.from({ length: count }, (_, i) => {
        const angle = (360 / count) * i + (Math.random() * 30 - 15);
        const distance = 50 + Math.random() * 70;
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

interface CompositionOption {
    key: string;
    label: string;
    svgUrl: string;
    isCorrect: boolean;
}



export default function CompositionQuizCanvas({ artwork, questions, onComplete }: CompositionQuizCanvasProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [streak, setStreak] = useState(0);
    const [score, setScore] = useState(0);
    const [showScoreBump, setShowScoreBump] = useState(false);
    const [particles, setParticles] = useState<ReturnType<typeof spawnParticles>>([]);
    const [showXpFloat, setShowXpFloat] = useState(false);
    const [xpAmount, setXpAmount] = useState(0);
    const [comboKey, setComboKey] = useState(0);
    const [questionKey, setQuestionKey] = useState(0);
    const [answerHistory, setAnswerHistory] = useState<AnswerResult[]>([]);

    const [cameraShake, setCameraShake] = useState(false);
    const [speedPraise, setSpeedPraise] = useState<{ text: string; color: string } | null>(null);
    const [speedPraiseKey, setSpeedPraiseKey] = useState(0);
    const [overlayKey, setOverlayKey] = useState<string | null>(null); // which SVG to overlay on the image
    const [showFlashRed, setShowFlashRed] = useState(false);
    const questionStartRef = useRef(Date.now());

    const currentQuestion = questions[currentIndex] ?? null;

    // Build shuffled options for current question
    const options: CompositionOption[] = useMemo(() => {
        if (!currentQuestion) return [];
        const manifest = compositionManifest as Record<string, string>;

        const correct: CompositionOption = {
            key: currentQuestion.correct_composition,
            label: compositionLabel(currentQuestion.correct_composition),
            svgUrl: manifest[currentQuestion.correct_composition] || '',
            isCorrect: true,
        };

        const wrongKeys = currentQuestion.wrong_compositions
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .filter(k => k !== currentQuestion.correct_composition);

        const wrongs: CompositionOption[] = wrongKeys.map(k => ({
            key: k,
            label: compositionLabel(k),
            svgUrl: manifest[k] || '',
            isCorrect: false,
        }));

        return shuffleOptions([correct, ...wrongs]);
    }, [currentQuestion]);

    useEffect(() => {
        if (questions.length === 0) onComplete();
    }, [questions.length, onComplete]);

    // Reset on question change
    useEffect(() => {
        setSelectedKey(null);
        setAnswerStatus('idle');
        setParticles([]);
        setShowXpFloat(false);
        setOverlayKey(null);
        setShowFlashRed(false);
        setQuestionKey(prev => prev + 1);

        setCameraShake(false);
        setSpeedPraise(null);
        questionStartRef.current = Date.now();
    }, [currentIndex]);



    const advance = useCallback(() => {
        const next = currentIndex + 1;
        if (next >= questions.length) {
            setTimeout(onComplete, 300);
        } else {
            setCurrentIndex(next);
        }
    }, [currentIndex, questions.length, onComplete]);

    const handleSelect = (option: CompositionOption) => {
        if (answerStatus !== 'idle') return;
        setSelectedKey(option.key);
        setOverlayKey(option.key); // Show selected SVG on image

        if (option.isCorrect) {
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

            const praise = SPEED_PRAISES.find(p => elapsed <= p.threshold);
            if (praise) {
                setSpeedPraise(praise);
                setSpeedPraiseKey(prev => prev + 1);
            }

            setParticles(spawnParticles(14));
            setShowXpFloat(true);
            setComboKey(prev => prev + 1);
            setAnswerHistory(prev => [...prev, 'correct']);
            setAnswerStatus('correct');
        } else {
            setStreak(0);
            setAnswerStatus('wrong');
            setShowFlashRed(true);
            setCameraShake(true);
            setTimeout(() => setCameraShake(false), 500);
            setTimeout(() => setShowFlashRed(false), 500);
            setAnswerHistory(prev => [...prev, 'wrong']);

            // After showing wrong overlay, switch to correct
            setTimeout(() => {
                if (currentQuestion) setOverlayKey(currentQuestion.correct_composition);
            }, 1200);

            setTimeout(() => {
                setSelectedKey(null);
                setOverlayKey(null);
                setAnswerStatus('idle');

                questionStartRef.current = Date.now();
            }, 3500);
        }
    };

    if (questions.length === 0) return null;

    const slug = urlToSlug(artwork.imageUrl);
    const progress = questions.length > 0 ? (currentIndex + (answerStatus === 'correct' ? 1 : 0)) / questions.length : 0;
    const isPerfect = answerHistory.length === questions.length && answerHistory.every(r => r === 'correct');


    // Resolve the overlay SVG URL
    const overlaySvgUrl = overlayKey
        ? (compositionManifest as Record<string, string>)[overlayKey] || ''
        : '';

    // Focus region (normalised 0-1). If present, overlay is positioned there.
    const focusRegion = currentQuestion?.region_x
        ? {
              x: parseFloat(currentQuestion.region_x) || 0,
              y: parseFloat(currentQuestion.region_y ?? '0') || 0,
              w: parseFloat(currentQuestion.region_w ?? '1') || 1,
              h: parseFloat(currentQuestion.region_h ?? '1') || 1,
          }
        : null;

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
                            : 'linear-gradient(to right, #a78bfa, #93D2FF)',
                        boxShadow: isPerfect
                            ? '0 0 16px rgba(251,191,36,0.7)'
                            : '0 0 12px rgba(167,139,250,0.5)',
                    }}
                />
            </div>



            {/* Top HUD */}
            <div className="absolute top-4 left-0 right-0 z-50 flex items-center justify-between px-4">
                <div
                    className="text-[#a78bfa] text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-[#a78bfa]/20"
                    style={{ background: 'rgba(167,139,250,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                    Composition
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

            {/* Streak/Combo */}
            {streak >= 2 && answerStatus !== 'wrong' && (
                <div key={comboKey} className="absolute top-[68px] left-1/2 -translate-x-1/2 z-50 animate-combo-pop">
                    <div
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${
                            streak >= 5
                                ? 'border-orange-400/40 text-orange-300'
                                : streak >= 3
                                    ? 'border-amber-400/40 text-amber-300'
                                    : 'border-[#a78bfa]/30 text-[#a78bfa]'
                        }`}
                        style={{
                            background: streak >= 5 ? 'rgba(249,115,22,0.15)' : streak >= 3 ? 'rgba(245,158,11,0.15)' : 'rgba(167,139,250,0.1)',
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
                <div key={speedPraiseKey} className="absolute top-[35%] left-1/2 z-[60] animate-speed-pop pointer-events-none">
                    <div className="font-black text-2xl whitespace-nowrap" style={{ color: speedPraise.color, textShadow: `0 2px 12px rgba(0,0,0,0.8), 0 0 30px ${speedPraise.color}50` }}>
                        {speedPraise.text}
                    </div>
                </div>
            )}

            {/* Image area — artwork with SVG overlay */}
            <div key={questionKey} className="flex-1 relative flex items-center justify-center p-4 pt-16 animate-image-enter overflow-hidden">
                <div className="relative inline-block">
                    <Picture
                        slug={slug}
                        alt={artwork.title}
                        imgClassName="max-w-full max-h-[42vh] object-contain rounded-lg block"
                        priority
                    />

                    {/* SVG composition overlay */}
                    {overlaySvgUrl && (
                        focusRegion ? (
                            /* Region-scoped overlay */
                            <div
                                className="absolute rounded pointer-events-none animate-fade-in"
                                style={{
                                    left: `${focusRegion.x * 100}%`,
                                    top: `${focusRegion.y * 100}%`,
                                    width: `${focusRegion.w * 100}%`,
                                    height: `${focusRegion.h * 100}%`,
                                }}
                            >
                                <img
                                    src={overlaySvgUrl}
                                    alt="Composition overlay"
                                    className="w-full h-full pointer-events-none"
                                    style={{
                                        objectFit: 'contain',
                                        mixBlendMode: 'screen',
                                        opacity: answerStatus === 'correct' ? 0.9 : 0.7,
                                    }}
                                />
                                {/* Subtle border around focus region */}
                                <div
                                    className="absolute inset-0 rounded pointer-events-none"
                                    style={{
                                        border: answerStatus === 'correct'
                                            ? '2px solid rgba(74,222,128,0.4)'
                                            : '1.5px solid rgba(255,255,255,0.2)',
                                        boxShadow: answerStatus === 'correct'
                                            ? '0 0 20px rgba(74,222,128,0.15)'
                                            : '0 0 12px rgba(255,255,255,0.05)',
                                    }}
                                />
                            </div>
                        ) : (
                            /* Full-image overlay fallback */
                            <img
                                src={overlaySvgUrl}
                                alt="Composition overlay"
                                className="absolute inset-0 w-full h-full rounded-lg pointer-events-none animate-fade-in"
                                style={{
                                    objectFit: 'contain',
                                    mixBlendMode: 'screen',
                                    opacity: answerStatus === 'correct' ? 0.9 : 0.7,
                                }}
                            />
                        )
                    )}

                    {/* Particle burst */}
                    {particles.length > 0 && (
                        <div className="absolute pointer-events-none z-50" style={{
                            left: focusRegion ? `${(focusRegion.x + focusRegion.w / 2) * 100}%` : '50%',
                            top: focusRegion ? `${(focusRegion.y + focusRegion.h / 2) * 100}%` : '50%',
                        }}>
                            {particles.map((p, i) => (
                                <div
                                    key={`p-${currentIndex}-${i}`}
                                    className="quiz-particle"
                                    style={{ '--px': p.px, '--py': p.py, backgroundColor: p.color, animationDelay: p.delay } as React.CSSProperties}
                                />
                            ))}
                        </div>
                    )}

                    {/* XP float */}
                    {showXpFloat && (
                        <div className="absolute pointer-events-none z-50 animate-xp-float" style={{ left: '50%', top: '40%', transform: 'translate(-50%, -100%)' }}>
                            <div className="font-black text-lg whitespace-nowrap" style={{ color: isPerfect ? '#fbbf24' : '#4ade80', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                                +{xpAmount} XP
                            </div>
                        </div>
                    )}

                    {/* Red flash on wrong */}
                    {showFlashRed && (
                        <div className="absolute inset-0 rounded-lg pointer-events-none z-10 animate-flash-red" style={{ background: 'rgba(248,113,113,0.45)' }} />
                    )}
                </div>
            </div>

            {/* Bottom panel — question + option cards */}
            <div
                className="relative z-30 p-4 pb-5 border-t border-white/5"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.94) 60%, rgba(0,0,0,0.75) 85%, transparent)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                }}
            >
                {/* Question text */}
                {currentQuestion && (
                    <div className="max-w-lg mx-auto text-center mb-3">
                        {answerStatus === 'idle' && (
                            <div key={`q-${currentIndex}`} className="animate-question-slide-up">
                                <div className="text-[#a78bfa] text-[10px] font-black uppercase tracking-[0.25em] mb-1.5 opacity-80">
                                    Identify the composition
                                </div>
                                <div className="text-white font-bold text-sm leading-snug">
                                    {currentQuestion.question_text}
                                </div>
                            </div>
                        )}
                        {answerStatus === 'correct' && (
                            <div className="animate-fade-in">
                                <div className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 ${isPerfect ? 'text-amber-400' : 'text-green-400'}`}>
                                    {isPerfect ? '🏆 PERFECT!' : '✓ Correct!'}
                                </div>
                                <p className="text-white/60 text-xs leading-relaxed">
                                    {currentQuestion.explanation}
                                </p>
                                <button
                                    onClick={advance}
                                    className="mt-3 w-full py-2.5 rounded-xl font-bold text-sm tracking-wide
                                        transition-all active:scale-[0.97] cursor-pointer"
                                    style={{
                                        background: isPerfect
                                            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                                            : 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                                        color: '#fff',
                                        boxShadow: isPerfect
                                            ? '0 4px 20px rgba(251,191,36,0.3)'
                                            : '0 4px 20px rgba(167,139,250,0.3)',
                                    }}
                                >
                                    Continue →
                                </button>
                            </div>
                        )}
                        {answerStatus === 'wrong' && (
                            <div className="animate-fade-in">
                                <div className="text-red-400 text-[10px] font-black uppercase tracking-[0.25em] mb-1">
                                    Not quite — the correct answer is shown
                                </div>
                                <p className="text-white/50 text-xs leading-relaxed">
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Option cards — 2x2 grid with SVG previews */}
                <div className="max-w-lg mx-auto grid grid-cols-2 gap-2">
                    {options.map((opt, i) => {
                        const isSelected = selectedKey === opt.key;
                        const isCorrectOpt = opt.isCorrect;

                        let cardBorder = 'border-white/10';
                        let cardBg = 'rgba(255,255,255,0.05)';
                        let textColorCls = 'text-white/80';
                        let extraCardClass = '';

                        if (answerStatus === 'correct' && isCorrectOpt) {
                            cardBorder = 'border-green-500/60';
                            cardBg = 'rgba(74,222,128,0.12)';
                            textColorCls = 'text-green-400';
                            extraCardClass = 'animate-success-pop';
                        } else if (answerStatus === 'correct' && !isCorrectOpt) {
                            cardBg = 'rgba(255,255,255,0.02)';
                            textColorCls = 'text-white/20';
                        } else if (isSelected && answerStatus === 'wrong') {
                            cardBorder = 'border-red-500/60';
                            cardBg = 'rgba(248,113,113,0.12)';
                            textColorCls = 'text-red-400';
                            extraCardClass = 'animate-shake';
                        } else if (answerStatus === 'wrong' && isCorrectOpt) {
                            cardBorder = 'border-green-500/40';
                            cardBg = 'rgba(74,222,128,0.08)';
                            textColorCls = 'text-green-400';
                        }

                        return (
                            <button
                                key={opt.key}
                                onClick={() => handleSelect(opt)}
                                disabled={answerStatus !== 'idle'}
                                className={`relative rounded-xl border p-2.5 flex items-center gap-2.5 transition-all duration-200
                                    cursor-pointer active:scale-[0.97] disabled:cursor-not-allowed ${cardBorder} ${extraCardClass}`}
                                style={{
                                    background: cardBg,
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    animationDelay: `${i * 0.05}s`,
                                }}
                            >
                                {/* SVG preview thumbnail */}
                                <div
                                    className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                >
                                    {opt.svgUrl && (
                                        <img
                                            src={opt.svgUrl}
                                            alt={opt.label}
                                            className="w-8 h-8 object-contain"
                                            style={{ filter: 'brightness(1.2)' }}
                                        />
                                    )}
                                </div>
                                <span className={`text-xs font-bold leading-tight ${textColorCls}`}>
                                    {opt.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
