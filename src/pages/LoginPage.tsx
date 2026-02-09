import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useGameStore';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const [view, setView] = useState<'splash' | 'login' | 'register'>('splash');
    const [input, setInput] = useState('');
    const setUserId = useUserStore((state) => state.setUserId);
    const navigate = useNavigate();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setUserId(input);
        // Register -> Onboarding (Tutorial Level)
        // For MVP, let's assume Level 0 is tutorial or handle via query param?
        // User requested: "Register after entering onboarding process" -> actually "Click Register -> Enter Onboarding"
        // Let's redirect to a Tutorial intro or Level 1 with tutorial flag.
        navigate('/onboarding');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setUserId(input);
        // Login -> Direct to Hub (Session View)
        navigate('/hub');
    };

    // Splash Screen (onboarding_1 equivalent)
    if (view === 'splash') {
        return (
            <div className="h-full flex flex-col items-center justify-between p-8 text-center bg-white">
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                    {/* Mascot Placeholder */}
                    <div className="w-64 h-64 bg-slate-100 rounded-full mb-8 flex items-center justify-center">
                        <span className="text-6xl">🐌</span>
                    </div>

                    <h1 className="text-4xl font-bold text-sky-500 mb-2">Masterstrokes</h1>
                    <p className="text-slate-500 text-lg">A Free tour into art history.</p>
                </div>

                <div className="w-full space-y-4 mb-8">
                    <button
                        onClick={() => setView('register')}
                        className="w-full py-4 rounded-full bg-sky-500 text-white font-bold text-lg shadow-lg hover:bg-sky-600 transition-transform active:scale-95"
                    >
                        Get Started
                    </button>
                    <button
                        onClick={() => setView('login')}
                        className="w-full py-4 rounded-full border-2 border-sky-200 text-sky-500 font-bold text-lg hover:bg-sky-50 transition-colors"
                    >
                        I've Been Here Before
                    </button>
                </div>
            </div>
        );
    }

    // Auth Forms
    const isRegister = view === 'register';
    const handleSubmit = isRegister ? handleRegister : handleLogin;

    return (
        <div className="h-full flex flex-col p-8 bg-sky-50">
            <button
                onClick={() => setView('splash')}
                className="self-start p-2 -ml-2 text-slate-400 hover:text-slate-600 mb-4"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="flex-1 flex flex-col items-center">
                <div className="w-32 h-32 bg-white rounded-full mb-6 flex items-center justify-center shadow-sm">
                    <span className="text-4xl">🐌</span>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-8">
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h2>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 ml-4">
                            {isRegister ? 'Choose a Username' : 'Enter your Username'}
                        </label>
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full px-6 py-4 rounded-2xl border-none shadow-sm text-lg focus:ring-2 focus:ring-sky-400 outline-none"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 rounded-full bg-sky-500 text-white font-bold text-lg shadow-lg hover:bg-sky-600 transition-transform active:scale-95 mt-8"
                    >
                        {isRegister ? 'Start Journey' : 'Log In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
