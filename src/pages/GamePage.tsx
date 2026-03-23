import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getAllArtworks, buildChapters, getQ1Hotspot, getQ2Composition, getQ3TrueFalse, getQ4Match, shuffleOptions } from '../services/sheetsApi';
import { getManifestImageUrl } from '../utils/imageUtils';
import type { SheetQ1Hotspot, SheetQ2Composition, SheetQ3TrueFalse, Q4MatchQuestion } from '../services/sheetsApi';
import type { Artwork } from '../data/gameTypes';
import LearningCanvas from '../components/game/LearningCanvas';
import MixedQuizFlow from '../components/game/MixedQuizFlow';
import type { MixedQuizItem } from '../components/game/MixedQuizFlow';
import QuizCanvas from '../components/game/QuizCanvas';
import ResultsScreen from '../components/game/ResultsScreen';

export default function GamePage() {
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
    const [q4Questions, setQ4Questions] = useState<Q4MatchQuestion[]>([]);
    const [distractorUrls, setDistractorUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const effectiveArtworkId = artworkId || levelId;
    const chapterIndex = chapterId !== undefined ? parseInt(chapterId, 10) : undefined;

    useEffect(() => {
        if (!effectiveArtworkId) {
            setLoading(false);
            return;
        }

        setLoading(true);

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
            getQ4Match(effectiveArtworkId),
        ]).then(([artworks, q1Rows, q2Rows, q3Rows, q4Rows]) => {
            const found = artworks.find(a => a.id === effectiveArtworkId) ?? null;

            if (found && chapterIndex !== undefined && !isNaN(chapterIndex)) {
                const allPointIds = found.learningPoints.map(lp => lp.id);
                const chapters = buildChapters(allPointIds);
                const chapter = chapters[chapterIndex];

                if (chapter && chapter.type === 'learning') {
                    const chapterPointSet = new Set(chapter.pointIds);
                    const learnedPointIds = buildLearnedPointIds(allPointIds, chapters, chapterIndex);
                    const learnedPointSet = new Set(learnedPointIds);

                    setQ1Questions(shuffleOptions(q1Rows.filter(q => learnedPointSet.has(q.point_id))));
                    setQ2Questions(shuffleOptions(q2Rows));
                    setQ3Questions(shuffleOptions(q3Rows.filter(q => {
                        const pids = q.point_id.split(',').map(s => s.trim());
                        return pids.some(pid => learnedPointSet.has(pid));
                    })));
                    setQ4Questions(shuffleOptions(q4Rows.filter(q => {
                        const pids = q.point_id.split(',').map(s => s.trim());
                        return pids.some(pid => learnedPointSet.has(pid));
                    })));
                    setFullArtwork(found);

                    let allowedQuizQuestions = found.quizQuestions.filter(q => learnedPointSet.has(q.learningPointId));
                    allowedQuizQuestions = allowedQuizQuestions.sort(() => Math.random() - 0.5);
                    let allowedQuizRegions = (found.quizRegions ?? []).filter(r => learnedPointSet.has(r.point_id));
                    allowedQuizRegions = allowedQuizRegions.sort(() => Math.random() - 0.5);

                    setChapterArtwork({
                        ...found,
                        learningPoints: found.learningPoints.filter(lp => chapterPointSet.has(lp.id)),
                        quizQuestions: allowedQuizQuestions,
                        quizRegions: allowedQuizRegions
                    });
                } else {
                    setChapterArtwork(found);
                    setQ1Questions(shuffleOptions(q1Rows));
                    setQ2Questions(shuffleOptions(q2Rows));
                    setQ3Questions(shuffleOptions(q3Rows));
                    setQ4Questions(shuffleOptions(q4Rows));
                }
            } else if (found) {
                setChapterArtwork({
                    ...found,
                    quizQuestions: [...found.quizQuestions].sort(() => Math.random() - 0.5),
                    quizRegions: [...(found.quizRegions ?? [])].sort(() => Math.random() - 0.5)
                });
                setQ1Questions(shuffleOptions(q1Rows));
                setQ2Questions(shuffleOptions(q2Rows));
                setQ3Questions(shuffleOptions(q3Rows));
                setQ4Questions(shuffleOptions(q4Rows));
            }

            // Pre-compute Q5 distractor URLs from same-era artworks (already fetched)
            if (found) {
                const sameEra = artworks.filter(a => a.era === found.era && a.id !== found.id);
                const urls = sameEra
                    .map(a => getManifestImageUrl(a.imageUrl, '800'))
                    .filter(Boolean);
                setDistractorUrls(urls.length > 0 ? urls : []);
            }

            setLoading(false);
        }).catch(() => setLoading(false));
    }, [effectiveArtworkId, chapterIndex]);

    useEffect(() => {
        if (chapterArtwork) startGame();
    }, [chapterArtwork, startGame]);

    // ── Build mixed quiz items (shuffled Q1-Q5) ──────────────────────────────
    const mixedQuizItems: MixedQuizItem[] = useMemo(() => {
        if (!chapterArtwork) return [];

        const items: MixedQuizItem[] = [];

        // Q1 Hotspot
        q1Questions.forEach(q => items.push({ type: 'hotspot', data: q }));

        // Q2 Composition
        q2Questions.forEach(q => items.push({ type: 'composition', data: q }));

        // Q3 True/False
        q3Questions.forEach(q => items.push({ type: 'truefalse', data: q }));

        // Q4 Match
        q4Questions.forEach(q => items.push({ type: 'match', data: q }));

        // Q5 Fill-blank (from annotation regions)
        const fillRegions = (chapterArtwork.quizRegions ?? []).filter(r => r.point_id).slice(0, 3);
        fillRegions.forEach(r => items.push({
            type: 'fillblank',
            data: {
                artwork: chapterArtwork,
                region: { point_id: r.point_id, label: r.label },
                distractorUrls,
            }
        }));

        // Shuffle all items together
        return items.sort(() => Math.random() - 0.5);
    }, [chapterArtwork, q1Questions, q2Questions, q3Questions, q4Questions, distractorUrls]);

    // ── Phase transitions ────────────────────────────────────────────────────
    // Flow: learning → mixed-quiz (all Q1-Q5 shuffled) → quiz (legacy) → results

    const handleLearningComplete = () => {
        if (mixedQuizItems.length > 0) {
            setGamePhase('mixed-quiz');
        } else if (chapterArtwork && chapterArtwork.quizQuestions.length > 0) {
            setGamePhase('quiz');
        } else {
            goToResults();
        }
    };

    const handleMixedQuizComplete = () => {
        if (chapterArtwork && chapterArtwork.quizQuestions.length > 0) {
            setGamePhase('quiz');
        } else {
            goToResults();
        }
    };

    const handleQuizComplete = () => {
        goToResults();
    };

    const goToResults = () => {
        setGamePhase('results');
        useGameStore.setState({ endTime: Date.now() });
    };

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-2 border-[#93D2FF]/30 border-t-[#93D2FF] rounded-full animate-spin" />
            </div>
        );
    }

    if (!chapterArtwork) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-white text-gray-800">
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

    if (gamePhase === 'mixed-quiz') {
        return (
            <div className="h-full w-full">
                <MixedQuizFlow
                    artwork={chapterArtwork}
                    fullArtwork={fullArtwork}
                    items={mixedQuizItems}
                    onComplete={handleMixedQuizComplete}
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

    return (
        <div className="h-full w-full">
            <LearningCanvas
                artwork={chapterArtwork}
                onComplete={handleLearningComplete}
            />
        </div>
    );
}
