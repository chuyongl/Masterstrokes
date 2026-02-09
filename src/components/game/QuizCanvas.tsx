import { useState, useEffect } from 'react';
import { cropImage } from '../../utils/imageUtils';
import type { Artwork } from '../../data/mockArtwork';
import { useGameStore } from '../../store/gameStore';

interface QuizCanvasProps {
    artwork: Artwork;
    onComplete: () => void;
}

export default function QuizCanvas({ artwork, onComplete }: QuizCanvasProps) {
    const {
        currentQuestionIndex,
        overlaidImages,
        submitAnswer,
        nextQuestion
    } = useGameStore();

    const currentQuestion = artwork.quizQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === artwork.quizQuestions.length - 1;

    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [croppedOptions, setCroppedOptions] = useState<Record<string, string>>({});

    // Generate crops when question changes
    useEffect(() => {
        let isMounted = true;

        const generateCrops = async () => {
            const newCrops: Record<string, string> = {};

            // Generate crop for each option
            await Promise.all(currentQuestion.options.map(async (opt) => {
                if (opt.crop) {
                    try {
                        const blobUrl = await cropImage(
                            artwork.imageUrl,
                            opt.crop.x,
                            opt.crop.y,
                            opt.crop.zoom
                        );
                        newCrops[opt.id] = blobUrl;
                    } catch (e) {
                        console.error('Failed to crop image', e);
                        // Fallback to full image if crop fails
                        if (opt.imageUrl) newCrops[opt.id] = opt.imageUrl;
                    }
                } else if (opt.imageUrl) {
                    newCrops[opt.id] = opt.imageUrl;
                }
            }));

            if (isMounted) {
                setCroppedOptions(newCrops);
            }
        };

        generateCrops();

        return () => {
            isMounted = false;
        };
    }, [currentQuestion, artwork.imageUrl]);



    const handleOptionSelect = (optionId: string) => {
        const selectedOpt = currentQuestion.options.find((opt) => opt.id === optionId);
        if (!selectedOpt) return;

        setSelectedOption(optionId);

        // Submit answer and overlay image
        submitAnswer(
            currentQuestion.id,
            optionId,
            selectedOpt.imageUrl,
            selectedOpt.crop,
            currentQuestion.overlayPosition
        );

        // Move to next question or complete
        setTimeout(() => {
            if (isLastQuestion) {
                onComplete();
            } else {
                nextQuestion();
                setSelectedOption(null);
            }
        }, 800);
    };

    return (
        <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col">
            {/* Artwork with Masks and Overlays */}
            <div className="flex-1 relative flex items-center justify-center p-4">
                {/* Base Artwork */}
                <div className="relative max-w-full max-h-full">
                    <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="max-w-full max-h-[60vh] object-contain rounded-lg"
                    />

                    {/* White Circle Masks - ALL visible from start */}
                    {artwork.quizQuestions.map((question) => {
                        const isAnswered = overlaidImages.some((img) => img.questionId === question.id);

                        return (
                            <div
                                key={question.id}
                                className="absolute bg-white rounded-full transition-opacity duration-500"
                                style={{
                                    left: `${question.whiteCircle.x}%`,
                                    top: `${question.whiteCircle.y}%`,
                                    width: `${question.whiteCircle.radius * 2}%`,
                                    height: `${question.whiteCircle.radius * 2}%`,
                                    transform: 'translate(-50%, -50%)',
                                    opacity: isAnswered ? 0 : 0.95
                                }}
                            />
                        );
                    })}

                    {/* Overlaid Images */}
                    {overlaidImages.map((overlay) => (
                        overlay.crop ? (
                            <div
                                key={overlay.questionId}
                                className="absolute rounded-lg animate-fade-in bg-no-repeat shadow-md z-10"
                                style={{
                                    left: `${overlay.position.x}%`,
                                    top: `${overlay.position.y}%`,
                                    width: `${overlay.position.width}%`,
                                    height: `${overlay.position.height}%`,
                                    backgroundImage: `url(${artwork.imageUrl})`,
                                    backgroundPosition: `${overlay.crop.x}% ${overlay.crop.y}%`,
                                    backgroundSize: `${overlay.crop.zoom}%`
                                }}
                            />
                        ) : (
                            <img
                                key={overlay.questionId}
                                src={overlay.imageUrl}
                                alt="Selected answer"
                                className="absolute object-cover rounded-lg animate-fade-in shadow-md z-10"
                                style={{
                                    left: `${overlay.position.x}%`,
                                    top: `${overlay.position.y}%`,
                                    width: `${overlay.position.width}%`,
                                    height: `${overlay.position.height}%`
                                }}
                            />
                        )
                    ))}
                </div>
            </div>

            {/* Quiz Panel */}
            <div className="bg-slate-800 p-6 border-t border-slate-700">
                {/* Question Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg">
                        {currentQuestion.questionText}
                    </h3>
                    <span className="text-slate-400 text-sm font-semibold">
                        Question {currentQuestionIndex + 1}/{artwork.quizQuestions.length}
                    </span>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-4 gap-3">
                    {currentQuestion.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            disabled={selectedOption !== null}
                            className={`
                                relative aspect-square rounded-xl overflow-hidden border-4 transition-all
                                ${selectedOption === option.id
                                    ? 'border-sky-500 scale-95'
                                    : 'border-slate-600 hover:border-slate-400 active:scale-95'
                                }
                                ${selectedOption && selectedOption !== option.id ? 'opacity-50' : ''}
                                disabled:cursor-not-allowed
                                bg-slate-800
                            `}
                        >
                            {croppedOptions[option.id] ? (
                                <div
                                    className="w-full h-full bg-no-repeat bg-center transition-all duration-300"
                                    style={{
                                        backgroundImage: `url(${croppedOptions[option.id]})`,
                                        backgroundSize: 'cover', // Blob is already cropped to correct zoom
                                        filter: option.filter || 'none'
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-800 animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
