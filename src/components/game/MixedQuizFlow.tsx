import { useState } from 'react';
import type { Artwork } from '../../data/gameTypes';
import type { SheetQ1Hotspot, SheetQ2Composition, SheetQ3TrueFalse, Q4MatchQuestion } from '../../services/sheetsApi';
import HotspotQuizCanvas from './HotspotQuizCanvas';
import CompositionQuizCanvas from './CompositionQuizCanvas';
import TrueFalseQuizCanvas from './TrueFalseQuizCanvas';
import MatchQuizCanvas from './MatchQuizCanvas';
import FillBlankQuizCanvas from './FillBlankQuizCanvas';

// ─── Discriminated union for all quiz item types ────────────────────────────

export type MixedQuizItem =
    | { type: 'hotspot'; data: SheetQ1Hotspot }
    | { type: 'composition'; data: SheetQ2Composition }
    | { type: 'truefalse'; data: SheetQ3TrueFalse }
    | { type: 'match'; data: Q4MatchQuestion }
    | { type: 'fillblank'; data: { artwork: Artwork; region: { point_id: string; label: string }; distractorUrls: string[] } };

interface MixedQuizFlowProps {
    artwork: Artwork;
    fullArtwork?: Artwork | null;     // for hotspot/composition that need all points
    items: MixedQuizItem[];
    onComplete: () => void;
}

/**
 * Renders a shuffled sequence of Q1-Q5 questions one at a time.
 * Each sub-component handles a single question, then we advance.
 */
export default function MixedQuizFlow({ artwork, fullArtwork, items, onComplete }: MixedQuizFlowProps) {
    const [currentIdx, setCurrentIdx] = useState(0);

    if (items.length === 0) {
        onComplete();
        return null;
    }

    const item = items[currentIdx];
    const isLast = currentIdx >= items.length - 1;
    const total = items.length;

    const handleItemComplete = () => {
        if (isLast) {
            onComplete();
        } else {
            setCurrentIdx(i => i + 1);
        }
    };

    const progressBar = (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200 z-50">
            <div
                className="h-full transition-all duration-500 bg-blue-500"
                style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
            />
        </div>
    );

    const counter = (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold tracking-widest text-sm">
            Question {currentIdx + 1} / {total}
        </div>
    );

    // Render the appropriate component for this single question
    switch (item.type) {
        case 'hotspot':
            return (
                <div className="relative w-full h-full">
                    {progressBar}
                    {counter}
                    <HotspotQuizCanvas
                        artwork={fullArtwork || artwork}
                        questions={[item.data]}
                        onComplete={handleItemComplete}
                    />
                </div>
            );

        case 'composition':
            return (
                <div className="relative w-full h-full">
                    {progressBar}
                    {counter}
                    <CompositionQuizCanvas
                        artwork={fullArtwork || artwork}
                        questions={[item.data]}
                        onComplete={handleItemComplete}
                    />
                </div>
            );

        case 'truefalse':
            return (
                <div className="relative w-full h-full">
                    {progressBar}
                    {counter}
                    <TrueFalseQuizCanvas
                        artwork={fullArtwork || artwork}
                        questions={[item.data]}
                        onComplete={handleItemComplete}
                    />
                </div>
            );

        case 'match':
            return (
                <div className="relative w-full h-full">
                    {progressBar}
                    {counter}
                    <MatchQuizCanvas
                        questions={[item.data]}
                        onComplete={handleItemComplete}
                    />
                </div>
            );

        case 'fillblank':
            return (
                <div className="relative w-full h-full">
                    {progressBar}
                    {counter}
                    <FillBlankQuizCanvas
                        artwork={artwork}
                        regions={[item.data.region]}
                        distractorUrls={item.data.distractorUrls}
                        onComplete={handleItemComplete}
                    />
                </div>
            );

        default:
            return null;
    }
}
