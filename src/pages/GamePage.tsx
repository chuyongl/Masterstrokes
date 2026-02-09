import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getArtworkById } from '../services/sheetsApi';
import type { Artwork } from '../data/mockArtwork';
import LearningCanvas from '../components/game/LearningCanvas';
import QuizCanvas from '../components/game/QuizCanvas';
import ResultsScreen from '../components/game/ResultsScreen';

export default function GamePage() {
    const { levelId } = useParams<{ levelId: string }>();
    const { gamePhase, setGamePhase, startGame } = useGameStore();
    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadArtwork() {
            if (!levelId) {
                console.warn('No levelId provided');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await getArtworkById(levelId);
                if (data) {
                    setArtwork(data);
                } else {
                    console.error(`Artwork not found: ${levelId}`);
                    setArtwork(null);
                }
            } catch (error) {
                console.error('Failed to load artwork from Google Sheets:', error);
                console.warn('Please check your VITE_APPS_SCRIPT_URL in .env file');
                setArtwork(null);
            } finally {
                setLoading(false);
            }
        }

        loadArtwork();
    }, [levelId]);

    useEffect(() => {
        // Initialize game on mount
        if (artwork) {
            startGame();
        }
    }, [artwork, startGame]);

    const handleLearningComplete = () => {
        setGamePhase('quiz');
    };

    const handleQuizComplete = () => {
        setGamePhase('results');
        useGameStore.setState({ endTime: Date.now() });
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-slate-900">
                <div className="text-white text-xl">Loading artwork...</div>
            </div>
        );
    }

    if (!artwork) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-slate-900">
                <div className="text-white text-xl">Artwork not found</div>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            {gamePhase === 'learning' && (
                <LearningCanvas
                    artwork={artwork}
                    onComplete={handleLearningComplete}
                />
            )}

            {gamePhase === 'quiz' && (
                <QuizCanvas
                    artwork={artwork}
                    onComplete={handleQuizComplete}
                />
            )}

            {gamePhase === 'results' && (
                <ResultsScreen artwork={artwork} />
            )}
        </div>
    );
}
