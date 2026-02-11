import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface OnboardingLayoutProps {
    children: ReactNode;
    onBack?: () => void;
    showBack?: boolean;
}

export function OnboardingLayout({ children, onBack, showBack = true }: OnboardingLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
            {/* Header / Back Button */}
            <div className="absolute top-0 left-0 p-6 z-10">
                {showBack && (
                    <button
                        onClick={onBack}
                        className="p-3 text-slate-400 hover:text-slate-800 transition-colors bg-white/50 backdrop-blur-sm rounded-full hover:bg-white hover:shadow-md"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}
            </div>

            {/* Content Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 w-full h-full">
                {children}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------

interface StepSelectionProps {
    onNext: () => void;
}

export function StepSelection({ onNext }: StepSelectionProps) {
    const options = [
        "Prehistoric & Early Symbolic Mark-Making",
        "Ancient Near East & Egypt",
        "Aegean & Classical Mediterranean",
        "South Asia: Early Indian Painting Traditions",
        "East Asia: Early China/Korea/Japan",
        "Dutch Golden Age"
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Mascot Area */}
            <div className="flex items-start gap-4 mb-8 mt-4">
                {/* Snail Placeholder - Replace with Rive or Image */}
                <div className="w-24 h-24 text-6xl flex items-center justify-center shrink-0">
                    🐌
                </div>

                {/* Speech Bubble */}
                <div className="border-2 border-slate-300 rounded-2xl p-4 relative bg-white">
                    <p className="text-xl font-bold text-slate-700 leading-tight">
                        Where would you like to start?
                    </p>
                    {/* Bubble Tail */}
                    <div className="absolute top-6 -left-2.5 w-4 h-4 bg-white border-l-2 border-b-2 border-slate-300 transform rotate-45"></div>
                </div>
            </div>

            {/* Options List */}
            <div className="flex-1 space-y-3 overflow-y-auto mb-6 custom-scrollbar pr-2">
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 
                                   hover:bg-sky-50 hover:border-sky-300 active:bg-sky-100 
                                   transition-colors text-slate-700 font-semibold"
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {/* Footer Button */}
            <button
                onClick={onNext}
                className="w-full py-4 rounded-2xl bg-sky-500 text-white font-bold text-lg 
                           shadow-[0_4px_0_#0ea5e9] active:shadow-none active:translate-y-1 
                           transition-all uppercase tracking-wide mb-4"
            >
                Continue
            </button>
        </div>
    );
}

// ----------------------------------------------------------------------

interface StepLoadingProps {
    onNext: () => void; // Usually auto-called
}

export function StepLoading({ }: StepLoadingProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
            {/* Snail */}
            <div className="w-40 h-40 text-8xl flex items-center justify-center mb-8 animate-bounce">
                🐌
            </div>

            <h2 className="text-2xl font-bold text-slate-300 mb-4 animate-pulse">
                Course Loading...
            </h2>

            <p className="text-slate-800 text-lg font-medium px-8 leading-relaxed">
                Get ready to boost your visual literacy with Masterstrokes!
            </p>
        </div>
    );
}
