import { useState, useEffect } from 'react';
import type { Artwork } from '../../data/gameTypes';
import { useGameStore } from '../../store/gameStore';
import { getAllArtworks } from '../../services/sheetsApi';
import Picture from '../ui/Picture';
import { urlToSlug } from '../../utils/imageUtils';

interface ImageSwapCanvasProps {
    artwork: Artwork;
    onComplete: () => void;
}

interface TileOption {
    id: string;
    imageUrl: string;
    bgSize: string;
    bgPosition: string;
    isCorrect: boolean;
}

export default function ImageSwapCanvas({ artwork, onComplete }: ImageSwapCanvasProps) {
    const {
        currentRegionIndex,
        regionAnswers,
        submitRegionAnswer,
        nextRegion
    } = useGameStore();

    const regions = artwork.quizRegions || [];
    const currentRegion = regions[currentRegionIndex];
    const isLastRegion = currentRegionIndex === regions.length - 1;

    const [options, setOptions] = useState<TileOption[]>([]);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [animatingOptionId, setAnimatingOptionId] = useState<string | null>(null);
    const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

    // Generate options when current region changes
    useEffect(() => {
        if (!currentRegion) return;

        let isMounted = true;
        const generateOptions = async () => {
            const allArtworks = await getAllArtworks();

            // 1. Correct Option
            const { x, y, w, h } = currentRegion;

            // Calculate CSS background properties to extract the specific region
            // bgSize = 100 / w to scale the image appropriately
            const bgSizeX = (100 / w).toFixed(2);
            const bgSizeY = (100 / h).toFixed(2);

            // bgPosition = x / (1 - w) * 100 to offset correctly
            const posX = w < 1 ? (x / (1 - w) * 100).toFixed(2) : 0;
            const posY = h < 1 ? (y / (1 - h) * 100).toFixed(2) : 0;

            const correctOption: TileOption = {
                id: 'correct',
                imageUrl: artwork.imageUrl,
                bgSize: `${bgSizeX}% ${bgSizeY}%`,
                bgPosition: `${posX}% ${posY}%`,
                isCorrect: true
            };

            // 2. Wrong Option 1: Same era, different painting
            let wrongArtworks = allArtworks.filter(a => a.era === artwork.era && a.id !== artwork.id);
            if (wrongArtworks.length === 0) {
                wrongArtworks = allArtworks.filter(a => a.id !== artwork.id);
            }
            const randomWrongArt = wrongArtworks[Math.floor(Math.random() * wrongArtworks.length)] || artwork;

            const wrongOption1: TileOption = {
                id: 'wrong1',
                imageUrl: randomWrongArt.imageUrl,
                bgSize: 'cover',
                bgPosition: 'center',
                isCorrect: false
            };

            // 3. Wrong Option 2: AI Generated (Fallback to random crop from same painting)
            // AI hook would go here, fetching a base64 or URL. 
            // Fallback:
            const rx = Math.random() * (1 - w);
            const ry = Math.random() * (1 - h);
            const rPosX = w < 1 ? (rx / (1 - w) * 100).toFixed(2) : 0;
            const rPosY = h < 1 ? (ry / (1 - h) * 100).toFixed(2) : 0;

            const wrongOption2: TileOption = {
                id: 'wrong2',
                imageUrl: artwork.imageUrl,
                bgSize: `${bgSizeX}% ${bgSizeY}%`,
                bgPosition: `${rPosX}% ${rPosY}%`,
                isCorrect: false
            };

            const shuffled = [correctOption, wrongOption1, wrongOption2].sort(() => Math.random() - 0.5);

            if (isMounted) {
                setOptions(shuffled);
            }
        };

        generateOptions();
        return () => { isMounted = false; };
    }, [currentRegionIndex, artwork, currentRegion]);

    if (!currentRegion) return null;

    const handleOptionSelect = (optionId: string) => {
        if (answerStatus !== 'idle') return;

        setSelectedOptionId(optionId);
        
        const opt = options.find(o => o.id === optionId);
        if (!opt) return;

        if (opt.isCorrect) {
            setAnswerStatus('correct');
            setAnimatingOptionId(optionId);

            // Wait for animation
            setTimeout(() => {
                submitRegionAnswer(currentRegion.id, optionId);
                setAnimatingOptionId(null);
                setSelectedOptionId(null);
                setAnswerStatus('idle');

                if (isLastRegion) {
                    onComplete();
                } else {
                    nextRegion();
                }
            }, 800);
        } else {
            setAnswerStatus('incorrect');
            
            // Shake and reset
            setTimeout(() => {
                setSelectedOptionId(null);
                setAnswerStatus('idle');
            }, 600);
        }
    };

    return (
        <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col">
            {/* Header Progress */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold tracking-widest text-sm">
                RESTORE {currentRegionIndex} / {regions.length}
            </div>

            {/* Artwork Area */}
            <div className="flex-1 relative flex items-center justify-center p-4">
                <div className="relative max-w-full max-h-full">
                    {/* Base Artwork */}
                    <Picture
                        slug={urlToSlug(artwork.imageUrl)}
                        alt={artwork.title}
                        imgClassName="max-w-full max-h-[65vh] object-contain rounded-lg"
                        priority
                    />

                    {/* render completed regions */}
                    {regions.map((region, idx) => {
                        if (idx >= currentRegionIndex) return null; // Only show completed

                        const answerId = regionAnswers.get(region.id);
                        const isCorrect = answerId === 'correct';

                        // We recreate the options state for completed ones or derive them
                        // For simplicity, let's just show it normally if correct, or show a weird one if wrong
                        if (isCorrect) {
                            return null; // Blends perfectly, so we just don't draw anything!
                        }

                        // If wrong, it looks mismatched (we could save the wrong image info in store, but for now just a tinted box)
                        return (
                            <div
                                key={region.id}
                                className="absolute bg-red-900/40 mix-blend-multiply"
                                style={{
                                    left: `${region.x * 100}%`,
                                    top: `${region.y * 100}%`,
                                    width: `${region.w * 100}%`,
                                    height: `${region.h * 100}%`,
                                }}
                            />
                        );
                    })}

                    {/* The "Hole" for current region */}
                    {currentRegion && (
                        <div
                            className="absolute bg-[rgba(30,20,10,0.85)] mix-blend-overlay border-[1.5px] border-amber-900/50 backdrop-blur-[2px] shadow-inner transition-all duration-300"
                            style={{
                                left: `${currentRegion.x * 100}%`,
                                top: `${currentRegion.y * 100}%`,
                                width: `${currentRegion.w * 100}%`,
                                height: `${currentRegion.h * 100}%`
                            }}
                        />
                    )}

                    {/* Animating Tile (Flying in) */}
                    {animatingOptionId && (() => {
                        const opt = options.find(o => o.id === animatingOptionId);
                        if (!opt) return null;

                        // It starts at the bottom and flies to the currentRegion coordinates
                        return (
                            <div
                                className="absolute z-30 rounded-sm shadow-xl animate-fly-in-hole"
                                style={{
                                    backgroundImage: `url(${opt.imageUrl})`,
                                    backgroundSize: opt.bgSize,
                                    backgroundPosition: opt.bgPosition,
                                    // Target position
                                    left: `${currentRegion.x * 100}%`,
                                    top: `${currentRegion.y * 100}%`,
                                    width: `${currentRegion.w * 100}%`,
                                    height: `${currentRegion.h * 100}%`,
                                    // Animation properties that CSS can use
                                    animationDuration: '800ms',
                                    animationTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    animationFillMode: 'forwards'
                                }}
                            />
                        )
                    })()}
                </div>
            </div>

            {/* Quiz Panel / Options */}
            <div className="bg-slate-800 p-6 border-t border-slate-700">
                <div className="mb-4">
                    <h3 className="text-white font-bold text-lg text-center">
                        Select the missing piece
                    </h3>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            disabled={selectedOptionId !== null}
                            className={`
                                relative aspect-square rounded-xl overflow-hidden border-4 transition-all
                                ${selectedOptionId === option.id
                                    ? answerStatus === 'correct'
                                        ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-95 opacity-0'
                                        : answerStatus === 'incorrect'
                                            ? 'border-red-500 animate-shake'
                                            : 'border-sky-500 scale-95 opacity-0'
                                    : 'border-slate-600 hover:border-slate-400 active:scale-95'
                                }
                                ${selectedOptionId && selectedOptionId !== option.id ? 'opacity-30' : ''}
                                disabled:cursor-not-allowed
                                bg-slate-900 shadow-md
                            `}
                        >
                            <div
                                className="w-full h-full"
                                style={{
                                    backgroundImage: `url(${option.imageUrl})`,
                                    backgroundSize: option.bgSize,
                                    backgroundPosition: option.bgPosition,
                                }}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
