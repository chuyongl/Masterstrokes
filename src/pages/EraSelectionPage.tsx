import { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GalaxyBackground } from '../components/ui/GalaxyBackground';
import { ERAS } from '../config/eras';

// Define positions for clusters in a "Galaxy" arrangement
const GALAXY_POSITIONS = [
    { x: 50, y: 50 },   // Center (Renaissance)
    { x: 30, y: 30 },   // Top Left
    { x: 70, y: 30 },   // Top Right
    { x: 20, y: 60 },   // Mid Left
    { x: 80, y: 60 },   // Mid Right
    { x: 50, y: 80 },   // Bottom
    { x: 85, y: 20 },   // Far Top Right (Surrealism)
    { x: 15, y: 85 },   // Far Bottom Left
];

export default function EraSelectionPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef<HTMLDivElement>(null);

    // Check if we just arrived from "The Fall"
    const fromOnboarding = new URLSearchParams(location.search).get('transition') === 'from-onboarding';

    const handleEraClick = (eraId: string) => {
        navigate(`/era/${eraId}`);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black text-white">
            {/* Infinite Starfield Background */}
            <div className="absolute inset-0 pointer-events-none">
                <GalaxyBackground />
            </div>

            {/* Draggable Universe Container */}
            <motion.div
                ref={containerRef}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                drag
                dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                initial={fromOnboarding ? { scale: 0.1, opacity: 0 } : { scale: 1, opacity: 1 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
            >
                <div className="relative w-[200vw] h-[200vh] -translate-x-1/4 -translate-y-1/4">

                    {/* Central Galaxy Label */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-50">
                        <h1 className="text-6xl font-black tracking-widest text-slate-700 uppercase blur-sm">
                            Art Universe
                        </h1>
                    </div>

                    {/* Era Clusters */}
                    {ERAS.map((era, index) => {
                        const pos = GALAXY_POSITIONS[index] || { x: 50, y: 50 };
                        return (
                            <motion.button
                                key={era.id}
                                onClick={() => handleEraClick(era.id)}
                                className="absolute group flex flex-col items-center justify-center w-64 h-64 rounded-full"
                                style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                }}
                                whileHover={{ scale: 1.2, zIndex: 50 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Cluster Glow */}
                                <div
                                    className="absolute inset-0 rounded-full blur-[60px] opacity-30 group-hover:opacity-60 transition-opacity duration-500"
                                    style={{ backgroundColor: era.color }}
                                />

                                {/* Core Star/Icon */}
                                <div className="relative z-10 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-4xl shadow-lg ring-1 ring-white/10 group-hover:ring-white/50 transition-all">
                                    {era.icon}
                                </div>

                                {/* Orbiting Particles (CSS Animation) */}
                                <div className="absolute inset-0 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity animate-spin-slow pointer-events-none" />

                                {/* Label */}
                                <div className="mt-4 text-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <h3
                                        className="text-lg font-bold tracking-wide"
                                        style={{ textShadow: `0 0 10px ${era.color}` }}
                                    >
                                        {era.name}
                                    </h3>
                                    <p className="text-xs text-slate-400">{era.period}</p>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* UI Overlay */}
            <div className="absolute top-8 left-8 z-50 pointer-events-none">
                <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <span className="text-2xl">🐌</span>
                    <span className="text-sm font-medium text-slate-300">Drag to explore</span>
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
            `}</style>
        </div>
    );
}
