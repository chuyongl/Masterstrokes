import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MarieroseCharacter from '../components/ui/MarieroseCharacter';

// ─── Types ─────────────────────────────────────────────────────
type StepId =
    | 'story-museum'
    | 'interests'
    | 'referral'
    | 'story-margaret'
    | 'motivation'
    | 'daily-goal'
    | 'three-month'
    | 'story-crime'
    | 'mode';

interface OnboardingState {
    interests: string[];
    referral: string;
    motivation: string;
    dailyGoal: number;
    mode: string;
}

// ─── Constants ──────────────────────────────────────────────────
const STEP_ORDER: StepId[] = [
    'story-museum',
    'interests',
    'referral',
    'story-margaret',
    'motivation',
    'daily-goal',
    'three-month',
    'story-crime',
    'mode',
];

const INTEREST_OPTIONS = [
    { emoji: '🏛️', label: 'Art History' },
    { emoji: '🖌️', label: 'Painting Styles' },
    { emoji: '🔍', label: 'Detective Cases' },
    { emoji: '🌍', label: 'World Cultures' },
    { emoji: '✏️', label: 'Drawing' },
    { emoji: '🎨', label: 'Color Theory' },
    { emoji: '🏺', label: 'Ancient Art' },
    { emoji: '🖼️', label: 'Famous Masters' },
];

const REFERRAL_OPTIONS = [
    { emoji: '📱', label: 'Social Media' },
    { emoji: '👥', label: 'Friend or Family' },
    { emoji: '🔍', label: 'Web Search' },
    { emoji: '🎙️', label: 'Podcast / YouTube' },
    { emoji: '📰', label: 'Article / Blog' },
    { emoji: '✨', label: 'Other' },
];

const MOTIVATION_OPTIONS = [
    { emoji: '🧠', label: 'Expand my general knowledge' },
    { emoji: '🎓', label: 'Prepare for school / exams' },
    { emoji: '✈️', label: 'Travel to museums confidently' },
    { emoji: '💬', label: 'Impress in conversation' },
    { emoji: '🎨', label: 'Improve my art practice' },
    { emoji: '🕵️', label: 'Just here for the mystery' },
];

const GOAL_OPTIONS = [
    { minutes: 5, label: 'min / day', sub: '1 painting/week' },
    { minutes: 10, label: 'min / day', sub: '2 paintings/week' },
    { minutes: 15, label: 'min / day', sub: '3 paintings/week' },
    { minutes: 20, label: 'min / day', sub: '4 paintings/week' },
];

// ─── Step Components ────────────────────────────────────────────

function StoryMuseum({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex-1 flex flex-col" style={{ background: 'linear-gradient(180deg, #581C87 0%, #3B0764 50%, #1E0038 100%)' }}>
            <div className="flex-1 flex items-center justify-center p-8">
                <svg viewBox="0 0 100 100" className="w-[60vw] max-w-[260px] h-auto drop-shadow-2xl opacity-80">
                    <rect x="10" y="40" width="80" height="50" fill="none" stroke="#A855F7" strokeWidth="2" />
                    <polygon points="50,10 10,40 90,40" fill="none" stroke="#A855F7" strokeWidth="2" />
                    <line x1="25" y1="40" x2="25" y2="90" stroke="#A855F7" strokeWidth="2" />
                    <line x1="40" y1="40" x2="40" y2="90" stroke="#A855F7" strokeWidth="2" />
                    <line x1="60" y1="40" x2="60" y2="90" stroke="#A855F7" strokeWidth="2" />
                    <line x1="75" y1="40" x2="75" y2="90" stroke="#A855F7" strokeWidth="2" />
                    <path d="M40,90 C40,70 60,70 60,90" fill="none" stroke="#A855F7" strokeWidth="2" />
                </svg>
            </div>
            <div className="px-8 pb-10">
                <div className="text-[#A855F7] text-[11px] font-bold tracking-[2px] uppercase mb-3">Welcome</div>
                <h1 className="text-white font-bold text-[26px] leading-[1.1] mb-3">The Museum of Ancient Arts</h1>
                <p className="text-white/55 text-[13px] leading-relaxed mb-8">Home to 49 masterworks covering thousands of years of human history. For decades, it has stood undisturbed.</p>
                <button onClick={onNext} className="w-full py-3.5 rounded-full text-[14px] font-semibold text-white" style={{ background: '#7B2FF7' }}>
                    Continue
                </button>
            </div>
        </div>
    );
}

function StoryMargaret({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex-1 flex flex-col" style={{ background: 'linear-gradient(180deg, #581C87 0%, #3B0764 50%, #1E0038 100%)' }}>
            <div className="flex-1 flex flex-col items-center justify-center pt-8">
                <div className="relative flex flex-col items-center">
                    <div className="relative z-10 w-56 bg-[#7C3AED] text-white text-[13px] font-bold p-4 rounded-2xl shadow-xl leading-relaxed text-center mb-4">
                        "I've spent my whole life studying art. Nobody steals from MY museum."
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#7C3AED]" />
                    </div>
                    <MarieroseCharacter width={180} height={180} />
                </div>
            </div>
            <div className="px-8 pb-10">
                <div className="text-[#9333EA] text-[11px] font-bold tracking-[2px] uppercase mb-3">Meet Margaret</div>
                <h1 className="text-white font-bold text-[26px] leading-[1.1] mb-3">Retired Professor. Amateur Detective.</h1>
                <p className="text-white/55 text-[13px] leading-relaxed mb-8">Help her track down the thief and recover the missing collection before it is lost forever.</p>
                <button onClick={onNext} className="w-full py-3.5 rounded-full text-[14px] font-semibold text-white" style={{ background: '#7B2FF7' }}>
                    Continue
                </button>
            </div>
        </div>
    );
}

function StoryCrime({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex-1 flex flex-col" style={{ background: 'linear-gradient(180deg, #581C87 0%, #3B0764 50%, #1E0038 100%)' }}>
            <div className="flex-1 flex items-center justify-center relative">
                {/* Wall nail */}
                <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-400 shadow-md z-10" />
                {/* Wire from nail to frame */}
                <div className="absolute top-[19%] left-1/2 -translate-x-1/2 w-px h-[8%] bg-gray-400/50 z-10 origin-top animate-[painting-sway_4s_ease-in-out_infinite]" />

                {/* Painting frame - swaying */}
                <div className="animate-[painting-sway_4s_ease-in-out_infinite] origin-top" style={{ transformOrigin: '50% 0%' }}>
                    {/* Gold ornate frame */}
                    <div className="relative p-[6px] rounded-sm" style={{ background: 'linear-gradient(135deg, #D4A843 0%, #F5D36E 30%, #B8860B 60%, #D4A843 100%)', boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(212,168,67,0.3), inset 0 1px 2px rgba(255,255,255,0.4)' }}>
                        {/* Inner frame border */}
                        <div className="p-[3px] rounded-sm" style={{ background: 'linear-gradient(135deg, #8B6914, #D4A843)' }}>
                            {/* Canvas area with visible art */}
                            <div className="w-36 h-44 rounded-sm relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a3a5c 0%, #2d5a3d 30%, #8B4513 50%, #d4956b 70%, #4a2d6b 100%)' }}>
                                {/* Abstract painting strokes */}
                                <div className="absolute inset-0 opacity-80">
                                    <div className="absolute top-[15%] left-[10%] w-[45%] h-[30%] rounded-full bg-[#E8B84B]/60 blur-[8px]" />
                                    <div className="absolute bottom-[20%] right-[15%] w-[35%] h-[25%] rounded-full bg-[#C0392B]/50 blur-[6px]" />
                                    <div className="absolute top-[40%] left-[30%] w-[40%] h-[20%] rounded-full bg-[#2E86C1]/40 blur-[10px]" />
                                </div>

                                {/* Torn/stolen corner — white with shadow to show tear */}
                                <div className="absolute top-0 right-0 w-14 h-14 z-10">
                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                        <path d="M30,0 L100,0 L100,70 C90,55 70,40 55,35 C40,30 25,20 30,0 Z" fill="#F5F0FF" />
                                        <path d="M30,0 L100,0 L100,70 C90,55 70,40 55,35 C40,30 25,20 30,0 Z" fill="rgba(0,0,0,0.06)" />
                                    </svg>
                                </div>
                                {/* Under-tear shadow */}
                                <div className="absolute top-0 right-0 w-12 h-12">
                                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
                                        <path d="M35,0 L100,0 L100,65 C85,50 65,38 50,33 C38,28 30,18 35,0 Z" fill="#000" />
                                    </svg>
                                </div>

                                {/* Thief shadow silhouette */}
                                <div className="absolute bottom-2 right-2 text-[40px] opacity-90 drop-shadow-lg">🥷</div>

                                {/* Red "STOLEN" tape */}
                                <div className="absolute bottom-0 left-0 right-0 bg-[#EF4444]/90 py-1 text-center">
                                    <span className="text-white text-[9px] font-black tracking-[4px] uppercase">STOLEN</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert red glow pulse */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-60 h-60 rounded-full animate-[alert-pulse_3s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)' }} />
                </div>
            </div>
            <div className="px-8 pb-10">
                <div className="text-[#EF4444] text-[11px] font-bold tracking-[2px] uppercase mb-3">The Crime</div>
                <h1 className="text-white font-bold text-[26px] leading-[1.1] mb-3">Someone's stealing the art. Piece by piece.</h1>
                <p className="text-white/55 text-[13px] leading-relaxed mb-8">Each stolen fragment hides a clue. Decode the patterns, reconstruct the artifacts, and crack the case.</p>
                <button onClick={onNext} className="w-full py-3.5 rounded-full text-[14px] font-semibold text-white" style={{ background: '#7B2FF7' }}>
                    Continue
                </button>
            </div>
            <style>{`
                @keyframes painting-sway {
                    0%, 100% { transform: rotate(-2.5deg); }
                    25% { transform: rotate(1.5deg); }
                    50% { transform: rotate(-1deg); }
                    75% { transform: rotate(2deg); }
                }
                @keyframes alert-pulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
}

// ─── Survey Steps ─────────────────────────────────────────────

function DotIndicator({ total, current }: { total: number; current: number }) {
    return (
        <div className="flex gap-[5px] justify-center mb-4">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`h-[6px] rounded-full transition-all duration-300 ${i === current ? 'w-[18px] bg-[#7B2FF7]' : 'w-[6px] bg-black/10'}`} />
            ))}
        </div>
    );
}

function InterestsStep({ state, setState, onNext }: { state: OnboardingState; setState: (s: OnboardingState) => void; onNext: () => void }) {
    const toggle = (label: string) => {
        const next = state.interests.includes(label)
            ? state.interests.filter(i => i !== label)
            : [...state.interests, label];
        setState({ ...state, interests: next });
    };
    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 px-5 pt-5 pb-5 flex flex-col gap-3">
                <DotIndicator total={5} current={0} />
                <div>
                    <p className="text-[19px] font-bold text-gray-900 leading-[1.3]">What do you want<br />to learn about?</p>
                    <p className="text-[12px] text-gray-500 mt-1">Choose everything that calls to you</p>
                </div>
                <div className="flex flex-wrap gap-2 flex-1 content-start">
                    {INTEREST_OPTIONS.map(opt => {
                        const on = state.interests.includes(opt.label);
                        return (
                            <button key={opt.label} onClick={() => toggle(opt.label)}
                                className={`inline-flex items-center gap-[6px] border-[1.5px] rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ${on ? 'border-[#7B2FF7] bg-[#F3EEFE] text-[#7B2FF7]' : 'border-gray-200 bg-white text-gray-900'}`}>
                                {opt.emoji} {opt.label}
                            </button>
                        );
                    })}
                </div>
                <button onClick={onNext} disabled={state.interests.length === 0}
                    className="w-full py-3.5 rounded-full text-[14px] font-semibold text-white disabled:opacity-40 transition-opacity" style={{ background: '#7B2FF7' }}>
                    Continue
                </button>
            </div>
        </div>
    );
}

function ReferralStep({ state, setState, onNext }: { state: OnboardingState; setState: (s: OnboardingState) => void; onNext: () => void }) {
    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 px-5 pt-5 pb-5 flex flex-col gap-3">
                <DotIndicator total={5} current={1} />
                <div>
                    <p className="text-[19px] font-bold text-gray-900 leading-[1.3]">How did you discover<br />Masterstrokes?</p>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    {REFERRAL_OPTIONS.map(opt => {
                        const on = state.referral === opt.label;
                        return (
                            <button key={opt.label} onClick={() => setState({ ...state, referral: opt.label })}
                                className={`w-full flex items-center gap-[6px] border-[1.5px] rounded-xl px-4 py-3 text-[12px] font-medium text-left transition-colors ${on ? 'border-[#7B2FF7] bg-[#F3EEFE] text-[#7B2FF7]' : 'border-gray-200 bg-white text-gray-900'}`}>
                                {opt.emoji} {opt.label}
                            </button>
                        );
                    })}
                </div>
                <button onClick={onNext} disabled={!state.referral}
                    className="w-full py-3.5 rounded-full text-[14px] font-semibold text-white disabled:opacity-40 transition-opacity" style={{ background: '#7B2FF7' }}>
                    Continue
                </button>
            </div>
        </div>
    );
}

function MotivationStep({ state, setState, onNext }: { state: OnboardingState; setState: (s: OnboardingState) => void; onNext: () => void }) {
    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 px-5 pt-5 pb-5 flex flex-col gap-3">
                <DotIndicator total={5} current={2} />
                <div>
                    <p className="text-[19px] font-bold text-gray-900 leading-[1.3]">Why do you want to<br />learn <em className="text-[#7B2FF7] not-italic">Art History?</em></p>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    {MOTIVATION_OPTIONS.map(opt => {
                        const on = state.motivation === opt.label;
                        return (
                            <button key={opt.label} onClick={() => setState({ ...state, motivation: opt.label })}
                                className={`w-full flex items-center gap-[6px] border-[1.5px] rounded-xl px-4 py-3 text-[12px] font-medium text-left transition-colors ${on ? 'border-[#7B2FF7] bg-[#F3EEFE] text-[#7B2FF7]' : 'border-gray-200 bg-white text-gray-900'}`}>
                                {opt.emoji} {opt.label}
                            </button>
                        );
                    })}
                </div>
                <button onClick={onNext} disabled={!state.motivation}
                    className="w-full py-3.5 rounded-full text-[14px] font-semibold text-white disabled:opacity-40 transition-opacity" style={{ background: '#7B2FF7' }}>
                    Continue
                </button>
            </div>
        </div>
    );
}

function DailyGoalStep({ state, setState, onNext }: { state: OnboardingState; setState: (s: OnboardingState) => void; onNext: () => void }) {
    const goalInfo: Record<number, string> = {
        5: "You'll finish 1 full painting in your first week",
        10: "You'll finish 2 full paintings in your first week — enough to crack your first detective case 🕵️",
        15: "You'll move through 3 paintings a week — impressive pace!",
        20: "Power learner! 4 paintings a week means fast progress 🚀",
    };
    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 px-5 pt-5 pb-5 flex flex-col gap-3">
                <DotIndicator total={5} current={3} />
                <div>
                    <p className="text-[19px] font-bold text-gray-900 leading-[1.3]">Set your daily<br />learning goal</p>
                    <p className="text-[12px] text-gray-500 mt-1">Consistency beats intensity, always</p>
                </div>
                <div className="grid grid-cols-2 gap-[10px]">
                    {GOAL_OPTIONS.map(opt => {
                        const on = state.dailyGoal === opt.minutes;
                        return (
                            <button key={opt.minutes} onClick={() => setState({ ...state, dailyGoal: opt.minutes })}
                                className={`border-[1.5px] rounded-xl p-3.5 text-center transition-colors ${on ? 'border-[#7B2FF7] bg-[#F3EEFE]' : 'border-gray-200 bg-white'}`}>
                                <div className="text-[24px] font-extrabold text-[#7B2FF7]">{opt.minutes}</div>
                                <div className="text-[11px] text-gray-500">{opt.label}</div>
                                <div className={`text-[10px] mt-1 ${on ? 'text-[#7B2FF7]' : 'text-gray-400'}`}>{opt.sub}</div>
                            </button>
                        );
                    })}
                </div>
                {/* Achievement callout */}
                <div className="bg-[#F3EEFE] rounded-xl p-3 border-l-[3px] border-[#7B2FF7]">
                    <p className="text-[12px] font-bold text-[#7B2FF7]">At {state.dailyGoal} min/day</p>
                    <p className="text-[12px] text-gray-900 mt-0.5 leading-[1.5]">{goalInfo[state.dailyGoal]}</p>
                </div>
                <button onClick={onNext}
                    className="w-full py-3.5 rounded-full text-[14px] font-semibold text-white" style={{ background: '#7B2FF7' }}>
                    That works for me
                </button>
            </div>
        </div>
    );
}

function ThreeMonthStep({ state, onNext }: { state: OnboardingState; onNext: () => void }) {
    const paintingsPerWeek = state.dailyGoal / 5;
    const totalMonths3 = Math.round(paintingsPerWeek * 12);
    const casesCount = Math.round(totalMonths3 / 3);
    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 px-5 pt-5 pb-5 flex flex-col gap-3">
                <DotIndicator total={5} current={4} />
                <div>
                    <p className="text-[11px] font-bold text-[#7B2FF7] tracking-[0.06em] uppercase">In 3 months at {state.dailyGoal} min/day</p>
                    <p className="text-[19px] font-bold text-gray-900 leading-[1.3] mt-1">Here's what you'll<br />have achieved</p>
                </div>
                {/* Big stat */}
                <div className="bg-[#7B2FF7] rounded-[14px] p-[18px] text-white">
                    <p className="text-[36px] font-extrabold">{totalMonths3}</p>
                    <p className="text-[13px] opacity-85">paintings studied in depth</p>
                </div>
                {/* Two-stat grid */}
                <div className="grid grid-cols-2 gap-[10px]">
                    <div className="bg-[#FFF3E0] rounded-xl p-3.5">
                        <p className="text-[26px] font-extrabold text-[#E65100]">{casesCount}</p>
                        <p className="text-[11px] text-[#BF360C] leading-[1.4]">detective cases<br />cracked</p>
                    </div>
                    <div className="bg-[#EDE9FE] rounded-xl p-3.5">
                        <p className="text-[26px] font-extrabold text-[#7B2FF7]">3</p>
                        <p className="text-[11px] text-[#5B21B6] leading-[1.4]">historical eras<br />mastered</p>
                    </div>
                </div>
                <div className="flex-1" />
                <button onClick={onNext}
                    className="w-full py-3.5 rounded-full text-[14px] font-semibold text-white" style={{ background: '#7B2FF7' }}>
                    Let's do it →
                </button>
            </div>
        </div>
    );
}

function ModeStep({ onDetective, onExplore }: { onDetective: () => void; onExplore: () => void }) {
    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 px-5 pt-6 pb-5 flex flex-col gap-3">
                <div>
                    <p className="text-[19px] font-bold text-gray-900 leading-[1.3]">How do you want<br />to get started?</p>
                    <p className="text-[12px] text-gray-500 mt-1">You can always switch later</p>
                </div>

                {/* Detective Mode Card */}
                <div className="flex-1 rounded-2xl p-[18px] flex flex-col justify-between" style={{ background: '#1C1B2E' }}>
                    <div>
                        <div className="inline-block bg-[#FFF3E0] text-[#E65100] text-[10px] font-bold tracking-[0.06em] uppercase px-2.5 py-0.5 rounded mb-3">Recommended</div>
                        <p className="text-[28px] mb-1">🕵️</p>
                        <p className="text-[16px] font-bold text-white">Detective Mode</p>
                        <p className="text-[12px] text-white/55 mt-1.5 leading-[1.5]">A masterpiece has been stolen. Investigate art history to recover it. Learn through mystery and narrative.</p>
                    </div>
                    <button onClick={onDetective}
                        className="w-full py-3 rounded-full text-[14px] font-semibold text-white mt-3" style={{ background: '#7B2FF7' }}>
                        Start Investigating
                    </button>
                </div>

                {/* Free Explore */}
                <div className="border-[1.5px] border-gray-200 rounded-[14px] p-3.5 flex items-center gap-3">
                    <span className="text-[22px]">📖</span>
                    <div className="flex-1">
                        <p className="text-[13px] font-semibold text-gray-900">Free Explore</p>
                        <p className="text-[11px] text-gray-500">Browse artworks at your own pace</p>
                    </div>
                    <button onClick={onExplore}
                        className="px-3.5 py-2 rounded-full text-[12px] font-semibold border-2 border-[#7B2FF7] text-[#7B2FF7]">
                        Explore
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Onboarding Flow ─────────────────────────────────────

export default function OnboardingFlowPage() {
    const navigate = useNavigate();
    const [stepIdx, setStepIdx] = useState(0);
    const [state, setState] = useState<OnboardingState>({
        interests: [],
        referral: '',
        motivation: '',
        dailyGoal: 10,
        mode: 'detective',
    });

    const currentStep = STEP_ORDER[stepIdx];
    const isStoryStep = currentStep.startsWith('story-');

    const next = useCallback(() => {
        if (stepIdx < STEP_ORDER.length - 1) {
            setStepIdx(i => i + 1);
        }
    }, [stepIdx]);

    const back = useCallback(() => {
        if (stepIdx > 0) {
            setStepIdx(i => i - 1);
        } else {
            // First step → go back to signup
            navigate('/signup');
        }
    }, [stepIdx, navigate]);

    const finish = useCallback((mode: string) => {
        localStorage.setItem('hasOnboarded', 'true');
        localStorage.setItem('onboarding_prefs', JSON.stringify({ ...state, mode }));
        navigate('/home');
    }, [navigate, state]);

    const progress = ((stepIdx + 1) / STEP_ORDER.length) * 100;

    return (
        <div className="w-full h-dvh flex flex-col overflow-hidden relative">
            {/* Top bar: back button + progress */}
            <div className={`flex-none flex items-center gap-3 px-4 pt-3 pb-2 z-20 ${isStoryStep ? '' : 'bg-white'}`}>
                <button
                    onClick={back}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isStoryStep
                            ? 'bg-white/15 text-white hover:bg-white/25'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className={`flex-1 h-[4px] rounded-full overflow-hidden ${isStoryStep ? 'bg-white/20' : 'bg-gray-200'}`}>
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%`, background: '#7B2FF7' }}
                    />
                </div>
                <span className={`text-[11px] font-bold tabular-nums ${isStoryStep ? 'text-white/50' : 'text-gray-400'}`}>
                    {stepIdx + 1}/{STEP_ORDER.length}
                </span>
            </div>

            {/* Step content */}
            {(() => {
                switch (currentStep) {
                    case 'story-museum': return <StoryMuseum onNext={next} />;
                    case 'interests': return <InterestsStep state={state} setState={setState} onNext={next} />;
                    case 'referral': return <ReferralStep state={state} setState={setState} onNext={next} />;
                    case 'story-margaret': return <StoryMargaret onNext={next} />;
                    case 'motivation': return <MotivationStep state={state} setState={setState} onNext={next} />;
                    case 'daily-goal': return <DailyGoalStep state={state} setState={setState} onNext={next} />;
                    case 'three-month': return <ThreeMonthStep state={state} onNext={next} />;
                    case 'story-crime': return <StoryCrime onNext={next} />;
                    case 'mode': return <ModeStep onDetective={() => finish('detective')} onExplore={() => finish('explore')} />;
                    default: return null;
                }
            })()}
        </div>
    );
}

