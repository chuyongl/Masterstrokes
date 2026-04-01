import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useUserStore } from '../store/useGameStore';

export default function SignInPage() {
    const navigate = useNavigate();
    const setUserId = useUserStore((s) => s.setUserId);
    const [email, setEmail] = useState('');

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setUserId(email.trim());
        localStorage.setItem('hasOnboarded', 'true');
        navigate('/home');
    };

    const handleGoogleLogin = () => {
        // TODO: Implement Google OAuth
        setUserId('Google User');
        localStorage.setItem('hasOnboarded', 'true');
        navigate('/home');
    };

    const handleAppleLogin = () => {
        // TODO: Implement Apple Sign In
        setUserId('Apple User');
        localStorage.setItem('hasOnboarded', 'true');
        navigate('/home');
    };

    return (
        <div className="w-full h-dvh flex flex-col bg-white relative">
            {/* Header with back button */}
            <motion.div
                className="flex items-center px-4 pt-4 pb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <button
                    onClick={() => navigate('/welcome')}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                    <ArrowLeft size={24} />
                </button>
            </motion.div>

            {/* Content */}
            <motion.div
                className="flex-1 flex flex-col px-8 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                {/* Title */}
                <h1
                    className="text-[28px] font-bold text-gray-900 mb-2"
                    style={{ fontFamily: '"Jost", sans-serif' }}
                >
                    Welcome back!
                </h1>
                <p className="text-gray-400 text-[15px] mb-8">
                    Sign in to continue your art journey.
                </p>

                {/* Social login buttons */}
                <div className="flex flex-col gap-3 mb-8">
                    {/* Continue with Google */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full py-4 rounded-full font-semibold text-[15px]
                                   border-2 border-gray-200 bg-white text-gray-700
                                   hover:bg-gray-50 transition-all duration-200 active:scale-95
                                   flex items-center justify-center gap-3 cursor-pointer"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Continue with Apple */}
                    <button
                        onClick={handleAppleLogin}
                        className="w-full py-4 rounded-full font-semibold text-[15px]
                                   border-2 border-gray-200 bg-white text-gray-700
                                   hover:bg-gray-50 transition-all duration-200 active:scale-95
                                   flex items-center justify-center gap-3 cursor-pointer"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        Continue with Apple
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-sm">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Email login */}
                <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Email or username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl text-[16px] outline-none transition-all duration-200
                                   placeholder:text-gray-400"
                        style={{
                            background: '#F3F0FF',
                            border: '2px solid transparent',
                            color: '#1F2937',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#7C3AED';
                            e.target.style.background = '#FEFEFE';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'transparent';
                            e.target.style.background = '#F3F0FF';
                        }}
                    />

                    <button
                        type="submit"
                        className="w-full py-4 rounded-full font-bold text-[15px] tracking-wider uppercase
                                   text-white transition-all duration-200 active:scale-95 cursor-pointer"
                        style={{
                            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                            boxShadow: '0 6px 20px rgba(124,58,237,0.3), 0 2px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        Log In
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
