import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarieroseCharacter from '../components/ui/MarieroseCharacter';

export default function SplashPage() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter');

    useEffect(() => {
        // Character enters -> idle breathing -> then navigate
        const idleTimer = setTimeout(() => setPhase('idle'), 800);
        const exitTimer = setTimeout(() => setPhase('exit'), 3200);
        const navTimer = setTimeout(() => navigate('/welcome', { replace: true }), 3800);

        return () => {
            clearTimeout(idleTimer);
            clearTimeout(exitTimer);
            clearTimeout(navTimer);
        };
    }, [navigate]);

    return (
        <div className="w-full h-dvh flex flex-col items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #6B21A8 0%, #581C87 40%, #3B0764 100%)' }}
        >
            {/* Subtle radial glow behind character */}
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: '400px',
                    height: '400px',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -60%)',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)',
                }}
            />

            {/* Character container */}
            <div
                className={`relative z-10 transition-all duration-700 ease-out ${
                    phase === 'enter'
                        ? 'animate-[character-bounce-in_0.8s_cubic-bezier(0.34,1.56,0.64,1)_forwards]'
                        : phase === 'idle'
                        ? 'animate-[character-breathe_2.5s_ease-in-out_infinite]'
                        : 'animate-[character-exit_0.5s_ease-in_forwards]'
                }`}
            >
                <MarieroseCharacter width={220} height={220} />
            </div>

            {/* Title */}
            <h1
                className={`relative z-10 text-white font-bold text-[36px] tracking-wide mt-6 transition-all duration-600 ${
                    phase === 'exit' ? 'opacity-0 translate-y-4' : 'opacity-100'
                }`}
                style={{
                    fontFamily: '"Jost", sans-serif',
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    animation: 'title-fade-in 0.8s 0.4s ease-out both',
                }}
            >
                Masterstrokes
            </h1>

            {/* Tap to skip */}
            <button
                onClick={() => navigate('/welcome', { replace: true })}
                className="absolute bottom-12 z-20 text-white/40 text-xs tracking-widest uppercase"
                style={{ animation: 'title-fade-in 1s 1.5s ease-out both' }}
            >
                Tap to continue
            </button>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white/10"
                        style={{
                            width: `${4 + Math.random() * 6}px`,
                            height: `${4 + Math.random() * 6}px`,
                            left: `${Math.random() * 100}%`,
                            bottom: `-10px`,
                            animation: `float-particle ${4 + Math.random() * 4}s ${Math.random() * 3}s ease-in-out infinite`,
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes character-bounce-in {
                    0% { opacity: 0; transform: scale(0.3) translateY(60px); }
                    50% { opacity: 1; transform: scale(1.1) translateY(-10px); }
                    70% { transform: scale(0.95) translateY(5px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes character-breathe {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes character-exit {
                    0% { opacity: 1; transform: scale(1) translateY(0); }
                    100% { opacity: 0; transform: scale(0.8) translateY(-40px); }
                }
                @keyframes title-fade-in {
                    0% { opacity: 0; transform: translateY(16px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes float-particle {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.6; }
                    90% { opacity: 0.6; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
