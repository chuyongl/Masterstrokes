import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getAllArtworks, buildChapters, getQ1Hotspot, getQ2Composition, getQ3TrueFalse, shuffleOptions } from '../services/sheetsApi';
import type { SheetQ1Hotspot, SheetQ2Composition, SheetQ3TrueFalse } from '../services/sheetsApi';
import type { Artwork } from '../data/gameTypes';
import LearningCanvas from '../components/game/LearningCanvas';
import HotspotQuizCanvas from '../components/game/HotspotQuizCanvas';
import CompositionQuizCanvas from '../components/game/CompositionQuizCanvas';
import TrueFalseQuizCanvas from '../components/game/TrueFalseQuizCanvas';
import QuizCanvas from '../components/game/QuizCanvas';
import ImageSwapCanvas from '../components/game/ImageSwapCanvas';
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
    const [fullArtwork, setFullArtwork] = useState<Artwork | null>(null);
    const [q1Questions, setQ1Questions] = useState<SheetQ1Hotspot[]>([]);
    const [q2Questions, setQ2Questions] = useState<SheetQ2Composition[]>([]);
    const [q3Questions, setQ3Questions] = useState<SheetQ3TrueFalse[]>([]);
    const [loading, setLoading] = useState(true);

    const effectiveArtworkId = artworkId || levelId;
    const chapterIndex = chapterId !== undefined ? parseInt(chapterId, 10) : undefined;

    useEffect(() => {
        if (!effectiveArtworkId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Build learned point IDs for chapter gating
        const buildLearnedPointIds = (_allPointIds: string[], chapters: ReturnType<typeof buildChapters>, idx: number): string[] => {
            const learned: string[] = [];
            for (let i = 0; i <= idx; i++) {
                if (chapters[i]?.pointIds) {
                    learned.push(...chapters[i].pointIds);
                }
            }
            return learned;
        };

        Promise.all([
            getAllArtworks(),
            getQ1Hotspot(effectiveArtworkId),
            getQ2Composition(effectiveArtworkId),
            getQ3TrueFalse(effectiveArtworkId),
        ]).then(([artworks, q1Rows, q2Rows, q3Rows]) => {
            const found = artworks.find(a => a.id === effectiveArtworkId) ?? null;

            if (found && chapterIndex !== undefined && !isNaN(chapterIndex)) {
                const allPointIds = found.learningPoints.map(lp => lp.id);
                const chapters = buildChapters(allPointIds);
                const chapter = chapters[chapterIndex];

                if (chapter && chapter.type === 'learning') {
                    const chapterPointSet = new Set(chapter.pointIds);
                    const learnedPointIds = buildLearnedPointIds(allPointIds, chapters, chapterIndex);
                    const learnedPointSet = new Set(learnedPointIds);

                    // Filter Q1 by learned points, shuffle
                    const filteredQ1 = shuffleOptions(
                        q1Rows.filter(q => learnedPointSet.has(q.point_id))
                    );
                    setQ1Questions(filteredQ1);
                    setQ2Questions(shuffleOptions(q2Rows));
                    // Q3 filtered by learned points
                    const learnedQ3 = q3Rows.filter(q => {
                        const pids = q.point_id.split(',').map(s => s.trim());
                        return pids.some(pid => learnedPointSet.has(pid));
                    });
                    setQ3Questions(shuffleOptions(learnedQ3));
                    setFullArtwork(found);

                    // Legacy quiz questions & swap regions
                    let allowedQuizQuestions = found.quizQuestions.filter(q => learnedPointSet.has(q.learningPointId));
                    allowedQuizQuestions = allowedQuizQuestions.sort(() => Math.random() - 0.5);

                    let allowedQuizRegions = (found.quizRegions ?? []).filter(r => learnedPointSet.has(r.point_id));
                    allowedQuizRegions = allowedQuizRegions.sort(() => Math.random() - 0.5);

                    const filteredArtwork: Artwork = {
                        ...found,
                        learningPoints: found.learningPoints.filter(lp => chapterPointSet.has(lp.id)),
                        quizQuestions: allowedQuizQuestions,
                        quizRegions: allowedQuizRegions
                    };
                    setChapterArtwork(filteredArtwork);
                } else if (chapter?.type === 'jigsaw') {
                    setChapterArtwork(found);
                    setQ1Questions([]);
                    setQ2Questions([]);
                    setQ3Questions([]);
                } else {
                    setChapterArtwork(found);
                    setQ1Questions(shuffleOptions(q1Rows));
                    setQ2Questions(shuffleOptions(q2Rows));
                    setQ3Questions(shuffleOptions(q3Rows));
                }
            } else if (found) {
                // Legacy mode
                const filteredArtwork: Artwork = {
                    ...found,
                    quizQuestions: [...found.quizQuestions].sort(() => Math.random() - 0.5),
                    quizRegions: [...(found.quizRegions ?? [])].sort(() => Math.random() - 0.5)
                };
                setChapterArtwork(filteredArtwork);
                setQ1Questions(shuffleOptions(q1Rows));
                setQ2Questions(shuffleOptions(q2Rows));
                setQ3Questions(shuffleOptions(q3Rows));
            }

            setLoading(false);
        }).catch(() => setLoading(false));
    }, [effectiveArtworkId, chapterIndex]);

    useEffect(() => {
        if (chapterArtwork) startGame();
    }, [chapterArtwork, startGame]);

    // ── Phase transitions ────────────────────────────────────────────────────
    // Flow: learning → Q1 → Q2 → Q3 → quiz (legacy) → image-swap-quiz → results
    const handleLearningComplete = () => {
        if (q1Questions.length > 0) {
            setGamePhase('hotspot-quiz');
        } else if (q2Questions.length > 0) {
            setGamePhase('composition-quiz');
        } else if (q3Questions.length > 0) {
            setGamePhase('truefalse-quiz');
        } else if (chapterArtwork && chapterArtwork.quizQuestions.length > 0) {
            setGamePhase('quiz');
        } else if (chapterArtwork && chapterArtwork.quizRegions && chapterArtwork.quizRegions.length > 0) {
            setGamePhase('image-swap-quiz');
        } else {
            goToResults();
        }
    };

    const handleHotspotQuizComplete = () => {
        if (q2Questions.length > 0) {
            setGamePhase('composition-quiz');
        } else if (q3Questions.length > 0) {
            setGamePhase('truefalse-quiz');
        } else if (chapterArtwork && chapterArtwork.quizQuestions.length > 0) {
            setGamePhase('quiz');
        } else if (chapterArtwork && chapterArtwork.quizRegions && chapterArtwork.quizRegions.length > 0) {
            setGamePhase('image-swap-quiz');
        } else {
            goToResults();
        }
    };

    const handleCompositionQuizComplete = () => {
        if (q3Questions.length > 0) {
            setGamePhase('truefalse-quiz');
        } else if (chapterArtwork && chapterArtwork.quizQuestions.length > 0) {
            setGamePhase('quiz');
        } else if (chapterArtwork && chapterArtwork.quizRegions && chapterArtwork.quizRegions.length > 0) {
            setGamePhase('image-swap-quiz');
        } else {
            goToResults();
        }
    };

    const handleTrueFalseQuizComplete = () => {
        if (chapterArtwork && chapterArtwork.quizQuestions.length > 0) {
            setGamePhase('quiz');
        } else if (chapterArtwork && chapterArtwork.quizRegions && chapterArtwork.quizRegions.length > 0) {
            setGamePhase('image-swap-quiz');
        } else {
            goToResults();
        }
    };

    const handleQuizComplete = () => {
        if (gamePhase === 'quiz' && chapterArtwork && chapterArtwork.quizRegions && chapterArtwork.quizRegions.length > 0) {
            setGamePhase('image-swap-quiz');
        } else {
            goToResults();
        }
    };

    const goToResults = () => {
        setGamePhase('results');
        useGameStore.setState({ endTime: Date.now() });
    };

    // ── Render ────────────────────────────────────────────────────────────────
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

    if (gamePhase === 'results') {
        return (
            <ResultsScreen
                artwork={chapterArtwork}
                onContinue={() => navigate(artworkId ? `/artwork/${artworkId}` : '/hub')}
            />
        );
    }

    if (gamePhase === 'hotspot-quiz') {
        return (
            <div className="h-full w-full">
                <HotspotQuizCanvas
                    artwork={fullArtwork || chapterArtwork}
                    questions={q1Questions}
                    onComplete={handleHotspotQuizComplete}
                />
            </div>
        );
    }

    if (gamePhase === 'composition-quiz') {
        return (
            <div className="h-full w-full">
                <CompositionQuizCanvas
                    artwork={fullArtwork || chapterArtwork}
                    questions={q2Questions}
                    onComplete={handleCompositionQuizComplete}
                />
            </div>
        );
    }

    if (gamePhase === 'truefalse-quiz') {
        return (
            <div className="h-full w-full">
                <TrueFalseQuizCanvas
                    artwork={fullArtwork || chapterArtwork}
                    questions={q3Questions}
                    onComplete={handleTrueFalseQuizComplete}
                />
            </div>
        );
    }

    if (gamePhase === 'quiz') {
        return (
            <div className="h-full w-full">
                <QuizCanvas
                    artwork={chapterArtwork}
                    onComplete={handleQuizComplete}
                />
            </div>
        );
    }

    if (gamePhase === 'image-swap-quiz') {
        return (
            <div className="h-full w-full">
                <ImageSwapCanvas
                    artwork={chapterArtwork}
                    onComplete={handleQuizComplete}
                />
            </div>
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
