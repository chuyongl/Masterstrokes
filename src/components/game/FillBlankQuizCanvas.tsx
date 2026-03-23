import { useState, useEffect, useCallback } from 'react';
import type { Artwork } from '../../data/gameTypes';
import { getAnnotationRegions } from '../../services/sheetsApi';
import type { AnnotationRect } from '../../services/sheetsApi';
import { getManifestImageUrl } from '../../utils/imageUtils';
import { urlToSlug } from '../../utils/imageUtils';
import Picture from '../ui/Picture';

interface FillBlankQuizCanvasProps {
    artwork: Artwork;
    /** Quiz regions — each has point_id + annotation rects */
    regions: { point_id: string; label: string }[];
    /** Pre-resolved distractor image URLs (same-era artworks) */
    distractorUrls?: string[];
    onComplete: () => void;
}

interface CropOption {
    id: string;
    imageUrl: string;
    bgSize: string;
    bgPosition: string;
    isCorrect: boolean;
}

/**
 * Q5 Fill-in-the-Blank quiz.
 * Shows the artwork with a white overlay blanking out a region.
 * Player picks the correct crop from 3 CSS-cropped options.
 */
export default function FillBlankQuizCanvas({ artwork, regions, distractorUrls, onComplete }: FillBlankQuizCanvasProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [options, setOptions] = useState<CropOption[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

    const current = regions[currentIdx] ?? null;
    const isLast = currentIdx >= regions.length - 1;

    // Resolve annotation rect for the current point
    const getRect = useCallback((): AnnotationRect | null => {
        if (!current) return null;
        const regionMap = getAnnotationRegions(artwork.id);
        const region = regionMap.get(current.point_id);
        if (!region || region.rects.length === 0) return null;
        return region.rects[0];
    }, [artwork.id, current]);

    // Build CSS background crop options when region changes (synchronous — no API call)
    useEffect(() => {
        if (!current) return;
        const rect = getRect();
        if (!rect) {
            if (isLast) onComplete();
            else setCurrentIdx(i => i + 1);
            return;
        }

        const artworkUrl = getManifestImageUrl(artwork.imageUrl, '800');

        // CSS background props for the correct crop
        const bgSizeX = (100 / rect.w).toFixed(2);
        const bgSizeY = (100 / rect.h).toFixed(2);
        const posX = rect.w < 1 ? (rect.x / (1 - rect.w) * 100).toFixed(2) : '0';
        const posY = rect.h < 1 ? (rect.y / (1 - rect.h) * 100).toFixed(2) : '0';

        const correctOption: CropOption = {
            id: 'correct',
            imageUrl: artworkUrl,
            bgSize: `${bgSizeX}% ${bgSizeY}%`,
            bgPosition: `${posX}% ${posY}%`,
            isCorrect: true,
        };

        // Distractors: use pre-resolved URLs if available, else random crops from same image
        const distractors: CropOption[] = [];
        for (let i = 0; i < 2; i++) {
            if (distractorUrls && distractorUrls.length > 0) {
                const dUrl = distractorUrls[i % distractorUrls.length];
                distractors.push({
                    id: `wrong${i}`,
                    imageUrl: dUrl,
                    bgSize: 'cover',
                    bgPosition: `${Math.random() * 80}% ${Math.random() * 80}%`,
                    isCorrect: false,
                });
            } else {
                // Fallback: random crop from same artwork, different position
                const rx = Math.random() * (1 - rect.w);
                const ry = Math.random() * (1 - rect.h);
                const rPosX = rect.w < 1 ? (rx / (1 - rect.w) * 100).toFixed(2) : '0';
                const rPosY = rect.h < 1 ? (ry / (1 - rect.h) * 100).toFixed(2) : '0';
                distractors.push({
                    id: `wrong${i}`,
                    imageUrl: artworkUrl,
                    bgSize: `${bgSizeX}% ${bgSizeY}%`,
                    bgPosition: `${rPosX}% ${rPosY}%`,
                    isCorrect: false,
                });
            }
        }

        const shuffled = [correctOption, ...distractors].sort(() => Math.random() - 0.5);
        setOptions(shuffled);
        setSelectedId(null);
        setStatus('idle');
    }, [artwork, currentIdx, current, getRect, isLast, onComplete, distractorUrls]);

    const handleSelect = (id: string) => {
        if (status !== 'idle') return;
        setSelectedId(id);
        const opt = options.find(o => o.id === id);
        if (!opt) return;

        if (opt.isCorrect) {
            setStatus('correct');
            setTimeout(() => {
                if (isLast) {
                    onComplete();
                } else {
                    setCurrentIdx(i => i + 1);
                }
            }, 800);
        } else {
            setStatus('incorrect');
            setTimeout(() => {
                setSelectedId(null);
                setStatus('idle');
            }, 600);
        }
    };

    const rect = getRect();

    return (
        <div className="relative w-full h-full bg-white overflow-hidden flex flex-col">
            {/* Artwork with white overlay "hole" */}
            <div className="flex-1 relative flex items-center justify-center p-4 pt-4">
                <div className="relative inline-block">
                    <Picture
                        slug={urlToSlug(artwork.imageUrl)}
                        alt={artwork.title}
                        imgClassName="max-w-full max-h-[55vh] object-contain rounded-lg"
                        priority
                    />

                    {/* White blank overlay on the target region */}
                    {rect && status !== 'correct' && (
                        <div
                            className="absolute border-2 border-dashed border-gray-300 transition-opacity duration-300"
                            style={{
                                left: `${rect.x * 100}%`,
                                top: `${rect.y * 100}%`,
                                width: `${rect.w * 100}%`,
                                height: `${rect.h * 100}%`,
                                background: 'white',
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Prompt */}
            <div className="text-center px-4 pb-2">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
                    Find the missing piece
                </div>
                {current && (
                    <div className="text-gray-800 font-bold text-base">
                        {current.label}
                    </div>
                )}
            </div>

            {/* Options — CSS background-image crop */}
            <div className="bg-gray-100 p-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleSelect(opt.id)}
                            disabled={selectedId !== null && status === 'correct'}
                            className={`
                                relative aspect-square rounded-xl overflow-hidden border-4 transition-all
                                ${selectedId === opt.id
                                    ? status === 'correct'
                                        ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-95'
                                        : status === 'incorrect'
                                            ? 'border-red-500 animate-shake'
                                            : 'border-blue-500'
                                    : 'border-gray-300 hover:border-gray-400 active:scale-95'
                                }
                                ${selectedId && selectedId !== opt.id ? 'opacity-30' : ''}
                                disabled:cursor-not-allowed bg-gray-200 shadow-md
                            `}
                        >
                            <div
                                className="w-full h-full"
                                style={{
                                    backgroundImage: `url(${opt.imageUrl})`,
                                    backgroundSize: opt.bgSize,
                                    backgroundPosition: opt.bgPosition,
                                }}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
