import { useNavigate } from 'react-router-dom';
import type { Artwork } from '../../data/mockArtwork';
import { useGameStore } from '../../store/gameStore';

interface ResultsScreenProps {
    artwork: Artwork;
}

export default function ResultsScreen({ artwork }: ResultsScreenProps) {
    const navigate = useNavigate();
    const { userAnswers, overlaidImages, startTime, endTime, resetGame } = useGameStore();

    // Calculate score
    const correctCount = Array.from(userAnswers.entries()).filter(([questionId, optionId]) => {
        const question = artwork.quizQuestions.find((q) => q.id === questionId);
        const option = question?.options.find((opt) => opt.id === optionId);
        return option?.isCorrect;
    }).length;

    const totalQuestions = artwork.quizQuestions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // Calculate time
    const timeTaken = endTime && startTime ? Math.round((endTime - startTime) / 1000) : 0;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    const handleContinue = () => {
        resetGame();
        navigate('/hub');
    };

    return (
        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
            <div className="max-w-2xl mx-auto p-8 flex flex-col items-center">
                {/* Mascot Celebration */}
                <div className="text-8xl mb-6 animate-bounce">
                    🐌
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-white mb-2">
                    {scorePercentage >= 70 ? 'Great Job!' : 'Keep Learning!'}
                </h1>
                <p className="text-slate-400 text-lg mb-8">
                    You completed {artwork.title}
                </p>

                {/* Final Artwork with Overlays */}
                <div className="relative mb-8 rounded-xl overflow-hidden shadow-2xl">
                    <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="max-w-full max-h-[40vh] object-contain"
                    />

                    {/* Show all overlaid images */}
                    {overlaidImages.map((overlay) => (
                        <img
                            key={overlay.questionId}
                            src={overlay.imageUrl}
                            alt="Your answer"
                            className="absolute object-cover"
                            style={{
                                left: `${overlay.position.x}%`,
                                top: `${overlay.position.y}%`,
                                width: `${overlay.position.width}%`,
                                height: `${overlay.position.height}%`
                            }}
                        />
                    ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 w-full mb-8">
                    <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700">
                        <div className="text-4xl font-bold text-sky-400 mb-2">
                            {scorePercentage}%
                        </div>
                        <div className="text-slate-400 text-sm">Score</div>
                    </div>

                    <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700">
                        <div className="text-4xl font-bold text-green-400 mb-2">
                            {correctCount}/{totalQuestions}
                        </div>
                        <div className="text-slate-400 text-sm">Correct</div>
                    </div>

                    <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700">
                        <div className="text-4xl font-bold text-purple-400 mb-2">
                            {minutes}:{seconds.toString().padStart(2, '0')}
                        </div>
                        <div className="text-slate-400 text-sm">Time</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 w-full">
                    <button
                        onClick={handleContinue}
                        className="flex-1 py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold text-lg rounded-2xl
                                   shadow-lg hover:from-sky-600 hover:to-sky-700 active:scale-95 transition-all"
                    >
                        Claim Reward
                    </button>
                </div>
            </div>
        </div>
    );
}
