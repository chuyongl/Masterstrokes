import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getAllArtworks, buildChapters } from '../services/sheetsApi';
import type { Artwork } from '../data/mockArtwork';
import LearningCanvas from '../components/game/LearningCanvas';
import ResultsScreen from '../components/game/ResultsScreen';

export default function GamePage() {
    // Support both /play/:artworkId/:chapterId (new) and /play/:levelId (legacy)
    const { artworkId, chapterId, levelId } = useParams<{
        artworkId?: string;
        chapterId?: string;
        levelId?: string;
    }>();

    const navigate = useNavigate();
    const { gamePhase, setGamePhase, startGame } = useGameStore();
    const [chapterArtwork, setChapterArtwork] = useState<Artwork | null>(null);
    const [loading, setLoading] = useState(true);

    const effectiveArtworkId = artworkId || levelId;
    const chapterIndex = chapterId !== undefined ? parseInt(chapterId, 10) : undefined;

    useEffect(() => {
        if (!effectiveArtworkId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        getAllArtworks().then(artworks => {
            const found = artworks.find(a => a.id === effectiveArtworkId) ?? null;


            if (found && chapterIndex !== undefined && !isNaN(chapterIndex)) {
                // Filter learning points to just this chapter's points
                const allPointIds = found.learningPoints.map(lp => lp.id);
                const chapters = buildChapters(allPointIds);
                const chapter = chapters[chapterIndex];

                if (chapter && chapter.type === 'learning') {
                    const chapterPointSet = new Set(chapter.pointIds);
                    const filteredArtwork: Artwork = {
                        ...found,
                        learningPoints: found.learningPoints.filter(lp => chapterPointSet.has(lp.id)),
                        quizRegions: (found.quizRegions ?? []).filter(r => chapterPointSet.has(r.point_id))

                    };
                    setChapterArtwork(filteredArtwork);
                } else if (chapter?.type === 'jigsaw') {
                    // TODO: navigate to jigsaw screen
                    setChapterArtwork(found);
                } else {
                    setChapterArtwork(found);
                }
            } else {
                // Legacy mode: use full artwork
                setChapterArtwork(found);
            }

            setLoading(false);
        }).catch(() => setLoading(false));
    }, [effectiveArtworkId, chapterIndex]);

    useEffect(() => {
        if (chapterArtwork) startGame();
    }, [chapterArtwork, startGame]);

    const handleLearningComplete = () => {
        // After all LPs in chapter learned → results for now
        // TODO: transition to Q1/Q3/Q4/Q5 quiz phase
        setGamePhase('results');
        useGameStore.setState({ endTime: Date.now() });
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-black">
                <div className="w-10 h-10 border-2 border-[#93D2FF]/30 border-t-[#93D2FF] rounded-full animate-spin" />
            </div>
        );
    }

    if (!chapterArtwork) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-black text-white">
                Artwork not found
            </div>
        );
    }

    // Results
    if (gamePhase === 'results') {
        return (
            <ResultsScreen
                artwork={chapterArtwork}
                onContinue={() => navigate(artworkId ? `/artwork/${artworkId}` : '/hub')}
            />
        );
    }

    return (
        <div className="h-full w-full">
            <LearningCanvas
                artwork={chapterArtwork}
                onComplete={handleLearningComplete}
            />
        </div>
    );
}
