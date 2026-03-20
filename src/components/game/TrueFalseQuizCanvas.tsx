import { useState, useEffect, useCallback, useRef } from 'react';
import type { Artwork } from '../../data/gameTypes';
import type { SheetQ3TrueFalse } from '../../services/sheetsApi';
import Picture from '../ui/Picture';
import { urlToSlug } from '../../utils/imageUtils';

interface TrueFalseQuizCanvasProps {
    artwork: Artwork;
    questions: SheetQ3TrueFalse[];
    onComplete: () => void;
}

const PARTICLE_COLORS = [
    '#60a5fa', '#93D2FF', '#fbbf24', '#f472b6',
    '#a78bfa', '#34d399', '#fb923c', '#4ade80',
];

const SPEED_PRAISES = [
    { threshold: 2, text: '⚡ LIGHTNING!', color: '#fbbf24' },
    { threshold: 4, text: '🔥 FAST!', color: '#fb923c' },
    { threshold: 7, text: '👍 Nice!', color: '#4ade80' },
];

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

type AnswerResult = 'correct' | 'wrong' | 'timeout';
const TIMER_DURATION = 15;

export default function TrueFalseQuizCanvas({ artwork, questions, onComplete }: TrueFalseQuizCanvasProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<'TRUE' | 'FALSE' | null>(null);
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
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerKey, setTimerKey] = useState(0);
    const [cameraShake, setCameraShake] = useState(false);
    const [speedPraise, setSpeedPraise] = useState<{ text: string; color: string } | null>(null);
    const [speedPraiseKey, setSpeedPraiseKey] = useState(0);
    const [showFlashRed, setShowFlashRed] = useState(false);
    const questionStartRef = useRef(Date.now());

    const currentQuestion = questions[currentIndex] ?? null;
    const correctAnswer = currentQuestion?.correct_answer?.toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE';

    useEffect(() => {
        if (questions.length === 0) onComplete();
    }, [questions.length, onComplete]);

    // Reset on question change
    useEffect(() => {
        setSelectedAnswer(null);
        setAnswerStatus('idle');
        setParticles([]);
        setShowXpFloat(false);
        setShowFlashRed(false);
        setQuestionKey(prev => prev + 1);
        setTimerRunning(true);
        setTimerKey(prev => prev + 1);
        setCameraShake(false);
        setSpeedPraise(null);
        questionStartRef.current = Date.now();
    }, [currentIndex]);

    // Timer timeout
    useEffect(() => {
        if (!timerRunning || answerStatus !== 'idle') return;
        const timeout = setTimeout(() => {
            setStreak(0);
            setAnswerStatus('wrong');
            setCameraShake(true);
            setTimeout(() => setCameraShake(false), 500);
            setAnswerHistory(prev => [...prev, 'timeout']);
            // Auto-advance after timeout
            setTimeout(() => {
                const next = currentIndex + 1;
                if (next >= questions.length) {
                    setTimeout(onComplete, 300);
                } else {
                    setCurrentIndex(next);
                }
            }, 3000);
        }, TIMER_DURATION * 1000);
        return () => clearTimeout(timeout);
    }, [timerRunning, answerStatus, currentIndex, questions.length, onComplete]);

    const advance = useCallback(() => {
        const next = currentIndex + 1;
        if (next >= questions.length) {
            setTimeout(onComplete, 300);
        } else {
            setCurrentIndex(next);
        }
    }, [currentIndex, questions.length, onComplete]);

    const handleSelect = (answer: 'TRUE' | 'FALSE') => {
        if (answerStatus !== 'idle') return;
        setSelectedAnswer(answer);
        setTimerRunning(false);

        const isCorrect = answer === correctAnswer;

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

            const praise = SPEED_PRAISES.find(p => elapsed <= p.threshold);
            if (praise) {
                setSpeedPraise(praise);
                setSpeedPraiseKey(prev => prev + 1);
            }

            setParticles(spawnParticles(12));
            setShowXpFloat(true);
            setComboKey(prev => prev + 1);
            setAnswerHistory(prev => [...prev, 'correct']);
            setAnswerStatus('correct');
            // Wait for user to click Continue
        } else {
            setStreak(0);
            setAnswerStatus('wrong');
            setShowFlashRed(true);
            setCameraShake(true);
            setTimeout(() => setCameraShake(false), 500);
            setTimeout(() => setShowFlashRed(false), 500);
            setAnswerHistory(prev => [...prev, 'wrong']);
            // Wrong: auto-retry after showing explanation
            setTimeout(() => {
                setSelectedAnswer(null);
                setAnswerStatus('idle');
                setTimerRunning(true);
                setTimerKey(prev => prev + 1);
                questionStartRef.current = Date.now();
            }, 3500);
        }
    };

    if (questions.length === 0) return null;

    const slug = urlToSlug(artwork.imageUrl);
    const progress = questions.length > 0 ? (currentIndex + (answerStatus === 'correct' ? 1 : 0)) / questions.length : 0;
    const isPerfect = answerHistory.length === questions.length && answerHistory.every(r => r === 'correct');
    const timerGradient = 'linear-gradient(to right, #60a5fa, #93D2FF, #fbbf24, #f87171)';

    // Theme color for Q3
    const themeColor = '#60a5fa'; // blue

    return (
        <div className={`relative w-full h-full bg-black overflow-hidden select-none flex flex-col ${cameraShake ? 'animate-camera-shake' : ''}`}>
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 z-50">
                <div
                    className="h-full transition-all duration-700 ease-out rounded-r-full"
                    style={{
                        width: `${progress * 100}%`,
                        background: isPerfect
                            ? 'linear-gradient(to right, #fbbf24, #f59e0b, #fbbf24)'
                            : `linear-gradient(to right, ${themeColor}, #93D2FF)`,
                        boxShadow: isPerfect
                            ? '0 0 16px rgba(251,191,36,0.7)'
                            : `0 0 12px ${themeColor}80`,
                    }}
                />
            </div>

            {/* Timer bar */}
            <div className="absolute top-1.5 left-0 right-0 h-1 bg-white/5 z-50">
                {answerStatus === 'idle' && (
                    <div
                        key={timerKey}
                        className="h-full rounded-full"
                        style={{
                            background: timerGradient,
                            animation: `timer-drain ${TIMER_DURATION}s linear forwards`,
                            boxShadow: `0 0 8px ${themeColor}60`,
                        }}
                    />
                )}
            </div>

            {/* Top HUD */}
            <div className="absolute top-4 left-0 right-0 z-50 flex items-center justify-between px-4">
                <div
                    className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
                    style={{
                        color: themeColor,
                        borderColor: `${themeColor}33`,
                        background: `${themeColor}14`,
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                    }}
                >
                    True or False
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
                            streak >= 5 ? 'border-orange-400/40 text-orange-300'
                            : streak >= 3 ? 'border-amber-400/40 text-amber-300'
                            : 'border-blue-400/30 text-blue-400'
                        }`}
                        style={{
                            background: streak >= 5 ? 'rgba(249,115,22,0.15)' : streak >= 3 ? 'rgba(245,158,11,0.15)' : 'rgba(96,165,250,0.1)',
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

            {/* Speed praise */}
            {speedPraise && answerStatus === 'correct' && (
                <div key={speedPraiseKey} className="absolute top-[35%] left-1/2 z-[60] animate-speed-pop pointer-events-none">
                    <div className="font-black text-2xl whitespace-nowrap" style={{ color: speedPraise.color, textShadow: `0 2px 12px rgba(0,0,0,0.8), 0 0 30px ${speedPraise.color}50` }}>
                        {speedPraise.text}
                    </div>
                </div>
            )}

            {/* Image area (small context) */}
            <div className="flex-shrink-0 flex items-center justify-center p-4 pt-20 pb-2">
                <div className="relative inline-block">
                    <Picture
                        slug={slug}
                        alt={artwork.title}
                        imgClassName="max-w-full max-h-[22vh] object-contain rounded-lg block opacity-60"
                        priority
                    />
                    {/* Particle burst */}
                    {particles.length > 0 && (
                        <div className="absolute pointer-events-none z-50" style={{ left: '50%', top: '50%' }}>
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
                        <div className="absolute pointer-events-none z-50 animate-xp-float" style={{ left: '50%', top: '30%', transform: 'translate(-50%, -100%)' }}>
                            <div className="font-black text-lg whitespace-nowrap" style={{ color: '#4ade80', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                                +{xpAmount} XP
                            </div>
                        </div>
                    )}
                    {/* Red flash */}
                    {showFlashRed && (
                        <div className="absolute inset-0 rounded-lg pointer-events-none z-10 animate-flash-red" style={{ background: 'rgba(248,113,113,0.45)' }} />
                    )}
                </div>
            </div>

            {/* Statement + Answer area — takes remaining space */}
            <div
                className="flex-1 relative z-30 flex flex-col border-t border-white/5"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.8) 80%, transparent)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                }}
            >
                {/* Statement card */}
                <div className="flex-1 flex items-center px-5 py-4">
                    <div key={questionKey} className="max-w-lg mx-auto w-full animate-question-slide-up">
                        {/* Statement */}
                        <div
                            className="rounded-2xl border p-5 mb-4"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                borderColor: answerStatus === 'correct'
                                    ? 'rgba(74,222,128,0.3)'
                                    : answerStatus === 'wrong'
                                        ? 'rgba(248,113,113,0.3)'
                                        : 'rgba(255,255,255,0.08)',
                            }}
                        >
                            <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em] mb-2">
                                Is this statement true or false?
                            </div>
                            <p className="text-white font-medium text-base leading-relaxed">
                                "{currentQuestion?.statement}"
                            </p>
                        </div>

                        {/* Explanation (shown after answering) */}
                        {answerStatus === 'correct' && currentQuestion && (
                            <div className="animate-fade-in mb-4">
                                <div className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 ${isPerfect ? 'text-amber-400' : 'text-green-400'}`}>
                                    {isPerfect ? '🏆 PERFECT!' : `✓ Correct — ${correctAnswer}`}
                                </div>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                        )}

                        {answerStatus === 'wrong' && currentQuestion && (
                            <div className="animate-fade-in mb-4">
                                <div className="text-red-400 text-[10px] font-black uppercase tracking-[0.25em] mb-1">
                                    ✗ Wrong — The answer is {correctAnswer}
                                </div>
                                <p className="text-white/50 text-sm leading-relaxed">
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom buttons */}
                <div className="px-5 pb-6">
                    <div className="max-w-lg mx-auto">
                        {answerStatus === 'idle' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleSelect('TRUE')}
                                    className="py-3.5 rounded-xl font-bold text-base tracking-wide
                                        transition-all active:scale-[0.97] cursor-pointer border"
                                    style={{
                                        background: 'rgba(74,222,128,0.08)',
                                        borderColor: 'rgba(74,222,128,0.25)',
                                        color: '#4ade80',
                                    }}
                                >
                                    ✓ True
                                </button>
                                <button
                                    onClick={() => handleSelect('FALSE')}
                                    className="py-3.5 rounded-xl font-bold text-base tracking-wide
                                        transition-all active:scale-[0.97] cursor-pointer border"
                                    style={{
                                        background: 'rgba(248,113,113,0.08)',
                                        borderColor: 'rgba(248,113,113,0.25)',
                                        color: '#f87171',
                                    }}
                                >
                                    ✗ False
                                </button>
                            </div>
                        )}

                        {answerStatus === 'correct' && (
                            <button
                                onClick={advance}
                                className="w-full py-3 rounded-xl font-bold text-sm tracking-wide
                                    transition-all active:scale-[0.97] cursor-pointer animate-fade-in"
                                style={{
                                    background: isPerfect
                                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                                        : `linear-gradient(135deg, ${themeColor}, #3b82f6)`,
                                    color: isPerfect ? '#000' : '#fff',
                                    boxShadow: isPerfect
                                        ? '0 4px 20px rgba(251,191,36,0.3)'
                                        : `0 4px 20px ${themeColor}40`,
                                }}
                            >
                                Continue →
                            </button>
                        )}

                        {answerStatus === 'wrong' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    disabled
                                    className="py-3.5 rounded-xl font-bold text-base tracking-wide border opacity-30 cursor-not-allowed"
                                    style={{
                                        background: selectedAnswer === 'TRUE' ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.05)',
                                        borderColor: selectedAnswer === 'TRUE' ? 'rgba(248,113,113,0.4)' : 'rgba(74,222,128,0.15)',
                                        color: selectedAnswer === 'TRUE' ? '#f87171' : '#4ade80',
                                    }}
                                >
                                    {selectedAnswer === 'TRUE' ? '✗' : '✓'} True
                                </button>
                                <button
                                    disabled
                                    className="py-3.5 rounded-xl font-bold text-base tracking-wide border opacity-30 cursor-not-allowed"
                                    style={{
                                        background: selectedAnswer === 'FALSE' ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.05)',
                                        borderColor: selectedAnswer === 'FALSE' ? 'rgba(248,113,113,0.4)' : 'rgba(248,113,113,0.15)',
                                        color: selectedAnswer === 'FALSE' ? '#f87171' : '#f87171',
                                    }}
                                >
                                    {selectedAnswer === 'FALSE' ? '✗' : '✗'} False
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
