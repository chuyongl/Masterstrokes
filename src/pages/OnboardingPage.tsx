import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarieroseCharacter from '../components/ui/MarieroseCharacter';

const SLIDES = [
    {
        theme: 'bg-[#1A1008]',
        gradient: 'from-[#2A1A08]/80 to-transparent',
        tag: 'Welcome',
        tagColor: 'text-[#F5C842]',
        title: 'The Museum of Ancient Arts',
        desc: 'Home to 49 masterworks covering thousands of years of human history. For decades, it has stood undisturbed.',
        content: (
            <div className="w-full h-full flex items-center justify-center p-8">
                <svg viewBox="0 0 100 100" className="w-[80vw] max-w-[300px] h-auto drop-shadow-2xl opacity-80">
                    <rect x="10" y="40" width="80" height="50" fill="none" stroke="#F5C842" strokeWidth="2" />
                    <polygon points="50,10 10,40 90,40" fill="none" stroke="#F5C842" strokeWidth="2" />
                    <line x1="25" y1="40" x2="25" y2="90" stroke="#F5C842" strokeWidth="2" />
                    <line x1="40" y1="40" x2="40" y2="90" stroke="#F5C842" strokeWidth="2" />
                    <line x1="60" y1="40" x2="60" y2="90" stroke="#F5C842" strokeWidth="2" />
                    <line x1="75" y1="40" x2="75" y2="90" stroke="#F5C842" strokeWidth="2" />
                    <path d="M40,90 C40,70 60,70 60,90" fill="none" stroke="#F5C842" strokeWidth="2" />
                </svg>
            </div>
        )
    },
    {
        theme: 'bg-[#1A1008]',
        gradient: 'from-transparent to-transparent',
        tag: 'Meet Margaret',
        tagColor: 'text-[#C8920A]',
        title: 'Retired Professor. Amateur Detective.',
        desc: 'Help her track down the thief and recover the missing collection before it is lost forever.',
        content: (
            <div className="w-full h-full flex flex-col items-center justify-center pt-16">
                <div className="relative flex flex-col items-center animate-[idle-breathe_3s_ease-in-out_infinite]">
                    {/* Speech bubble */}
                    <div className="relative z-10 w-56 bg-[#F5C842] text-[#1A1008] text-[14px] font-bold p-4 rounded-2xl shadow-xl leading-relaxed text-center mb-6">
                        "I've spent my whole life studying art. Nobody steals from MY museum."
                        {/* Triangle pointing down to character */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#F5C842]" />
                    </div>
                    {/* Character */}
                    <div className="flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                        <MarieroseCharacter width={200} height={200} />
                    </div>
                </div>
            </div>
        )
    },
    {
        theme: 'bg-[#0E0A04]',
        gradient: 'from-[#1a0f0d] to-transparent',
        tag: 'The Crime',
        tagColor: 'text-[#C8553A]',
        title: "Someone's stealing the art. Piece by piece.",
        desc: 'Each stolen fragment hides a clue. Decode the patterns, reconstruct the artifacts, and crack the case.',
        content: (
            <div className="w-full h-full flex items-center justify-center relative">
                <div className="relative w-40 h-48 border-[3px] border-[#C8553A] bg-[#1A1008] rounded-md shadow-[0_10px_30px_rgba(200,85,58,0.2)]">
                    {/* Torn Corner */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#0E0A04] rounded-bl-3xl border-b-2 border-l-2 border-[#C8553A]/30">
                        <svg className="absolute bottom-0 left-0 w-full h-full opacity-40 text-[#C8553A]" viewBox="0 0 100 100">
                            <path d="M0,100 L100,0 L100,100 Z" fill="currentColor" />
                        </svg>
                    </div>

                    {/* Thief Emoji */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-[64px] animate-[swing_2s_ease-in-out_infinite] origin-bottom tracking-tighter">🥷</div>
                    </div>
                </div>
            </div>
        )
    }
];

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const finishOnboarding = () => {
        localStorage.setItem('hasOnboarded', 'true');
        navigate('/hub');
    };

    const nextSlide = () => {
        if (currentSlide === SLIDES.length - 1) {
            finishOnboarding();
        } else {
            setCurrentSlide(c => c + 1);
        }
    };

    const slide = SLIDES[currentSlide];

    return (
        <div className={`w-full h-dvh flex flex-col font-sans transition-colors duration-700 ${slide.theme}`}>
            <div className={`absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b ${slide.gradient} pointer-events-none opacity-50`} />

            <div className="flex-1 relative overflow-hidden">
                {slide.content}
            </div>

            <div className="shrink-0 pt-6 px-8 pb-10 bg-gradient-to-t from-black/80 to-transparent relative z-10 w-full max-w-lg mx-auto">
                <div className={`${slide.tagColor} text-[11px] font-bold tracking-[2px] uppercase mb-3`}>
                    {slide.tag}
                </div>
                <h1 className="text-white font-serif text-[26px] leading-[1.1] mb-3">
                    {slide.title}
                </h1>
                <p className="text-white/60 text-[13px] leading-relaxed mb-10 min-h-[60px]">
                    {slide.desc}
                </p>

                <div className="flex items-center justify-between">
                    {/* Dots */}
                    <div className="flex gap-2">
                        {SLIDES.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-[#F5C842]' : 'w-1.5 bg-white/20'}`}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {currentSlide < SLIDES.length - 1 && (
                            <button
                                onClick={finishOnboarding}
                                className="text-white/40 text-xs font-bold uppercase tracking-wide hover:text-white/70 px-2"
                            >
                                Skip
                            </button>
                        )}
                        <button
                            onClick={nextSlide}
                            className="bg-[#F5C842] text-[#1A1008] px-6 py-3 rounded-full text-[13px] font-bold uppercase tracking-wider shadow-[0_4px_16px_rgba(245,200,66,0.3)] hover:scale-105 active:scale-95 transition-transform"
                        >
                            {currentSlide === SLIDES.length - 1 ? 'Start Investigating →' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes idle-breathe {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes swing {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
            `}</style>
        </div>
    );
}
