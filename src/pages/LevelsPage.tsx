import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { LevelData } from '../services/api'; // Fix: Use type import
import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface Era {
    id: string;
    title: string;
    levels: LevelData[]; // In real app, this might be IDs or fetched on demand
}

// Mock Data Structure for Eras
const MOCK_ERAS: Era[] = [
    { id: 'prehistoric', title: 'Prehistoric & Early Symbolic Mark-Making', levels: [] },
    { id: 'ancient', title: 'Ancient Near East & Egypt', levels: [] },
    { id: 'aegean', title: 'Aegean & Classical Mediterranean', levels: [] },
    { id: 'south_asia', title: 'South Asia: Early Indian Painting Traditions', levels: [] },
    { id: 'east_asia', title: 'East Asia: Early China/Korea/Japan', levels: [] },
    { id: 'dutch', title: 'Dutch Golden Age', levels: [] },
];

export default function LevelsPage() {
    const navigate = useNavigate();
    const [selectedEraId, setSelectedEraId] = useState<string | null>(null);
    const [levels, setLevels] = useState<LevelData[]>([]);

    useEffect(() => {
        // Ideally fetch Eras, then fetch levels for selected Era
        api.fetchLevels().then(setLevels);
    }, []);

    const handleEraClick = (eraId: string) => {
        if (selectedEraId === eraId) {
            setSelectedEraId(null); // Toggle off? Or keep open?
        } else {
            setSelectedEraId(eraId);
        }
    };

    const handleContinue = () => {
        // If Dutch Golden Age is selected, default to Girl with a Pearl Earring (ID: 1)
        if (selectedEraId === 'dutch') {
            navigate('/play/1');
        }
    };

    return (
        <div className="h-full flex flex-col p-6 bg-white">
            {/* Header with Mascot Bubble */}
            <div className="flex items-start space-x-4 mb-6 mt-4">
                <div className="w-24 h-24 bg-sky-100 rounded-full flex-shrink-0 flex items-center justify-center">
                    <span className="text-4xl">🐌</span>
                </div>
                <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm relative bubble-left">
                    <p className="text-slate-800 font-medium text-lg">Where would you like to start?</p>
                </div>
            </div>

            {/* Eras List */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-4 px-1">
                {MOCK_ERAS.map((era) => {
                    const isSelected = selectedEraId === era.id;
                    return (
                        <div key={era.id} className="space-y-2">
                            <button
                                onClick={() => handleEraClick(era.id)}
                                className={clsx(
                                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 font-semibold text-lg",
                                    isSelected
                                        ? "bg-sky-500 border-sky-500 text-white shadow-md text-center" // Figma: Blue fill when selected
                                        : "bg-white border-sky-100 text-slate-700 hover:border-sky-300 text-center" // Figma: White fill default
                                )}
                            >
                                {era.title}
                            </button>

                            {/* Expanded Levels for Era (Hardcoded for Dutch only for prototype) */}
                            {isSelected && era.id === 'dutch' && (
                                <div className="pl-4 pr-1 space-y-2 animate-in slide-in-from-top-2">
                                    {levels.map(level => (
                                        <button
                                            key={level.id}
                                            onClick={() => navigate(`/play/${level.id}`)}
                                            className="w-full p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 font-medium hover:bg-sky-100 flex justify-between items-center"
                                        >
                                            <span>{level.title}</span>
                                            <span className="text-xs bg-white px-2 py-1 rounded text-sky-500">{level.year}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer CTA */}
            <div className="pt-4 border-t border-slate-100">
                <button
                    onClick={handleContinue}
                    disabled={!selectedEraId} // Disable if nothing selected
                    className={clsx(
                        "w-full py-4 rounded-full font-bold text-lg shadow-lg transition-all",
                        selectedEraId
                            ? "bg-sky-500 text-white hover:bg-sky-600 active:scale-95"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
