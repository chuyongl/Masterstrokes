import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import type { Hotspot } from '../../services/api';
import clsx from 'clsx';
import { Info } from 'lucide-react';

interface ArtworkCanvasProps {
    artworkUrl: string;
    hotspots: Hotspot[];
    onHotspotClick?: (id: string) => void;
}

export default function ArtworkCanvas({ artworkUrl, hotspots, onHotspotClick }: ArtworkCanvasProps) {
    const { phase, visitedHotspots, visitHotspot, selectedAnswers, currentLevel } = useGameStore();

    const handleHotspotClick = (id: string) => {
        if (phase === 'learning') {
            visitHotspot(id);
            onHotspotClick?.(id);
        }
    };

    return (
        <div className="relative w-full aspect-square bg-slate-100 rounded-lg overflow-hidden shadow-inner">
            {/* Base Artwork */}
            <img
                src={artworkUrl}
                alt="Artwork"
                className="w-full h-full object-cover"
            />

            {/* Learning Phase: Hotspots */}
            {phase === 'learning' && hotspots.map((hotspot) => {
                const isVisited = visitedHotspots.includes(hotspot.id);

                return (
                    <motion.button
                        key={hotspot.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={clsx(
                            "absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors",
                            isVisited ? "bg-green-500/80 text-white" : "bg-sky-500/80 text-white animate-pulse"
                        )}
                        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                        onClick={() => handleHotspotClick(hotspot.id)}
                    >
                        {isVisited ? '✓' : <Info size={24} />}
                    </motion.button>
                );
            })}

            {/* Learning Phase: Tooltip/Description Overlay */}
            <AnimatePresence>
                {phase === 'learning' && visitedHotspots.length > 0 && (
                    <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none">
                        {/* Show the description of the most recently visited hotspot */}
                        {/* Logic to determine "active" hotspot could be improved, simplistic for now */}
                    </div>
                )}
            </AnimatePresence>

            {/* Quiz Phase: Masks */}
            {(phase === 'quiz' || phase === 'result') && currentLevel?.questions.map((q) => {
                // Find the correct option to know *where* this piece belongs visually?
                // In this simplified model, we assume the question correlates to a specific 'area'.
                // But wait, the PRD says: "Question 1... chosen option is placed onto the canvas".
                // Use the MOCK data structure: we don't have explicit coordinates for questions yet.
                // Let's assume for now that questions map 1:1 to hotspots or have their own coordinates.
                // For the prototype, I'll map question Index to hotspot Index for positioning (a hack, but works for demo).

                const qIndex = currentLevel.questions.findIndex(quest => quest.id === q.id);
                const targetHotspot = hotspots[qIndex % hotspots.length]; // Fallback mapping

                if (!targetHotspot) return null;

                const selectedOptionId = selectedAnswers[q.id];
                const selectedOption = q.options.find(o => o.id === selectedOptionId);

                return (
                    <div
                        key={q.id}
                        className="absolute bg-white/90 backdrop-blur-sm border-2 border-slate-200 border-dashed"
                        style={{
                            left: `${targetHotspot.x - 15}%`,
                            top: `${targetHotspot.y - 15}%`,
                            width: '30%',
                            height: '30%',
                            borderRadius: '10%'
                        }}
                    >
                        {selectedOption && (
                            <img
                                src={selectedOption.imageUrl}
                                className="w-full h-full object-cover rounded-[inherit]"
                                alt="Selected piece"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
