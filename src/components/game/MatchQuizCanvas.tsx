import { useState, useCallback } from 'react';
import type { Q4MatchQuestion } from '../../services/sheetsApi';

interface MatchQuizCanvasProps {
    questions: Q4MatchQuestion[];
    onComplete: () => void;
}

/**
 * Q4 Match Quiz — user matches left labels to right labels.
 * Shows shuffled left and right columns; user taps one from each to match.
 */
export default function MatchQuizCanvas({ questions, onComplete }: MatchQuizCanvasProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
    const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
    const [shuffledLeft, setShuffledLeft] = useState<string[]>([]);
    const [shuffledRight, setShuffledRight] = useState<string[]>([]);

    const current = questions[currentIdx] ?? null;
    const isLast = currentIdx >= questions.length - 1;

    // Shuffle columns when question changes
    const initQuestion = useCallback((q: Q4MatchQuestion) => {
        const left = q.pairs.map(p => p.left).sort(() => Math.random() - 0.5);
        const right = q.pairs.map(p => p.right).sort(() => Math.random() - 0.5);
        setShuffledLeft(left);
        setShuffledRight(right);
        setMatchedPairs(new Set());
        setSelectedLeft(null);
        setWrongPair(null);
    }, []);

    // Init on mount / question change
    useState(() => {
        if (current) initQuestion(current);
    });

    // Re-init when currentIdx changes
    const handleNextQuestion = () => {
        if (isLast) {
            onComplete();
        } else {
            const nextIdx = currentIdx + 1;
            setCurrentIdx(nextIdx);
            if (questions[nextIdx]) initQuestion(questions[nextIdx]);
        }
    };

    if (!current) return null;

    const handleLeftTap = (label: string) => {
        if (matchedPairs.has(label)) return;
        setSelectedLeft(label === selectedLeft ? null : label);
        setWrongPair(null);
    };

    const handleRightTap = (rightLabel: string) => {
        if (!selectedLeft) return;
        // Check if pairing exists
        const pair = current.pairs.find(p => p.left === selectedLeft && p.right === rightLabel);
        if (pair) {
            // Correct match
            const newMatched = new Set(matchedPairs);
            newMatched.add(pair.left);
            setMatchedPairs(newMatched);
            setSelectedLeft(null);
            setWrongPair(null);

            // If all matched, advance
            if (newMatched.size === current.pairs.length) {
                setTimeout(() => handleNextQuestion(), 600);
            }
        } else {
            // Wrong match
            setWrongPair({ left: selectedLeft, right: rightLabel });
            setTimeout(() => {
                setWrongPair(null);
                setSelectedLeft(null);
            }, 500);
        }
    };

    const isLeftMatched = (label: string) => matchedPairs.has(label);
    const isRightMatched = (label: string) => current.pairs.some(p => matchedPairs.has(p.left) && p.right === label);

    return (
        <div className="relative w-full h-full bg-white overflow-hidden flex flex-col">
            {/* Progress */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200 z-50">
                <div
                    className="h-full transition-all duration-500 bg-purple-500"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Header */}
            <div className="flex-none pt-6 pb-3 px-5 text-center">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                    Match {currentIdx + 1} / {questions.length}
                </div>
                <div className="text-gray-800 font-bold text-lg">
                    {current.question_text || 'Match the pairs'}
                </div>
            </div>

            {/* Match area */}
            <div className="flex-1 flex items-center justify-center px-4 pb-4">
                <div className="w-full max-w-md">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Left column */}
                        <div className="space-y-3">
                            {shuffledLeft.map((label) => {
                                const matched = isLeftMatched(label);
                                const isSelected = selectedLeft === label;
                                const isWrong = wrongPair?.left === label;

                                return (
                                    <button
                                        key={label}
                                        onClick={() => handleLeftTap(label)}
                                        disabled={matched}
                                        className={`
                                            w-full p-3 rounded-xl text-sm font-semibold text-left transition-all duration-200
                                            ${matched
                                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                                : isWrong
                                                    ? 'bg-red-100 text-red-700 border-2 border-red-400 animate-shake'
                                                    : isSelected
                                                        ? 'bg-purple-100 text-purple-800 border-2 border-purple-500 shadow-md scale-[1.02]'
                                                        : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 active:scale-95'
                                            }
                                        `}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right column */}
                        <div className="space-y-3">
                            {shuffledRight.map((label) => {
                                const matched = isRightMatched(label);
                                const isWrong = wrongPair?.right === label;

                                return (
                                    <button
                                        key={label}
                                        onClick={() => handleRightTap(label)}
                                        disabled={matched || !selectedLeft}
                                        className={`
                                            w-full p-3 rounded-xl text-sm font-semibold text-right transition-all duration-200
                                            ${matched
                                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                                : isWrong
                                                    ? 'bg-red-100 text-red-700 border-2 border-red-400 animate-shake'
                                                    : selectedLeft
                                                        ? 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-purple-300 active:scale-95'
                                                        : 'bg-gray-50 text-gray-500 border-2 border-gray-100'
                                            }
                                        `}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress dots */}
                    <div className="flex justify-center mt-6 gap-2">
                        {current.pairs.map((pair) => (
                            <div
                                key={pair.pair_id}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    matchedPairs.has(pair.left)
                                        ? 'bg-green-500 scale-110'
                                        : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
