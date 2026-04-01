import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function WelcomePage() {
    const navigate = useNavigate();

    return (
        <div
            className="w-full h-dvh flex flex-col items-center justify-between relative overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)' }}
        >
            {/* Top spacer */}
            <div className="flex-1" />

            {/* Center content */}
            <motion.div
                className="flex flex-col items-center text-center px-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <h1
                    className="text-white font-bold text-[42px] leading-tight mb-3"
                    style={{
                        fontFamily: '"Jost", sans-serif',
                        textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    }}
                >
                    Masterstrokes
                </h1>
                <p className="text-white/70 text-[16px] leading-relaxed">
                    A Free journey into art world.
                </p>
            </motion.div>

            {/* Bottom spacer + Buttons */}
            <div className="flex-1" />

            <motion.div
                className="w-full px-8 pb-12 flex flex-col items-center gap-4 max-w-sm mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            >
                {/* Get Started - Solid pill button */}
                <button
                    onClick={() => navigate('/signup')}
                    className="w-full py-4 rounded-full font-bold text-[16px] tracking-wide
                               transition-all duration-200 active:scale-95 cursor-pointer"
                    style={{
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        color: 'white',
                        boxShadow: '0 6px 20px rgba(239,68,68,0.35), 0 2px 8px rgba(0,0,0,0.15)',
                    }}
                >
                    Get Started
                </button>

                {/* I've Been Here Before - Outlined pill */}
                <button
                    onClick={() => navigate('/signin')}
                    className="w-full py-4 rounded-full font-bold text-[16px] tracking-wide
                               border-2 border-white/50 text-white bg-transparent
                               hover:bg-white/10 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                    I've Been Here Before
                </button>
            </motion.div>

            {/* Subtle background shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute rounded-full opacity-10"
                    style={{
                        width: '500px',
                        height: '500px',
                        top: '-100px',
                        right: '-150px',
                        background: 'radial-gradient(circle, white 0%, transparent 70%)',
                    }}
                />
                <div
                    className="absolute rounded-full opacity-8"
                    style={{
                        width: '300px',
                        height: '300px',
                        bottom: '100px',
                        left: '-100px',
                        background: 'radial-gradient(circle, white 0%, transparent 70%)',
                    }}
                />
            </div>
        </div>
    );
}
