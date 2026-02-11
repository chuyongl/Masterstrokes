import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StepLoading } from '../components/onboarding/OnboardingSteps';
import { GalaxyBackground } from '../components/ui/GalaxyBackground';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState<'reality' | 'fall' | 'void'>('reality');

    // Sequence:
    // 1. Reality (Course Loading) -> 2. Fall (Light breaks, Snail falls) -> 3. Void (Navigate to Hub)

    useEffect(() => {
        // Start "Fall" sequence after typical loading time
        const timer1 = setTimeout(() => {
            setPhase('fall');
        }, 2500);

        // Navigate to Hub after fall animation completes
        const timer2 = setTimeout(() => {
            setPhase('void');
            navigate('/hub?transition=from-onboarding'); // Pass flag to trigger "Arrival" anim in Hub
        }, 5000); // 2.5s loading + 2.5s fall

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [navigate]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-50">
            <AnimatePresence>
                {/* Phase 1: Reality (White Background) */}
                {phase === 'reality' && (
                    <motion.div
                        key="reality-bg"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }} // Reality fades away
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-white"
                    >
                        <div className="flex flex-col items-center">
                            <StepLoading onNext={() => { }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Phase 2: The Snail (The Protagonist) */}
            <motion.div
                className="absolute z-30 pointer-events-none"
                initial={{
                    top: "40%",
                    left: "50%",
                    x: "-50%",
                    y: "-50%",
                    scale: 1,
                    rotate: 0
                }}
                animate={
                    phase === 'fall' ? {
                        top: "120%", // Falls off screen
                        scale: 0.2,   // Gets smaller (falling away)
                        rotate: 720,  // Spins
                    } : {}
                }
                transition={{
                    duration: 2,
                    ease: "easeIn", // Accelerate down
                    delay: 0.2 // Wait slightly for bg to start fading
                }}
            >
                <div className="text-8xl">🐌</div>
            </motion.div>

            {/* Phase 3: The Universe (Underneath Reality) */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${phase === 'reality' ? 'opacity-0' : 'opacity-100'}`}>
                <GalaxyBackground />
            </div>
        </div>
    );
}
