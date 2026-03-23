import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { getAllArtworks } from '../services/sheetsApi';
import { buildChapters, type ChapterDef } from '../services/sheetsApi';
import { useUserStore } from '../store/userStore';
import type { Artwork } from '../data/gameTypes';

export default function ArtworkChapterPage() {
    const { artworkId } = useParams<{ artworkId: string }>();
    const navigate = useNavigate();
    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [chapters, setChapters] = useState<ChapterDef[]>([]);
    const [loading, setLoading] = useState(true);

    const { isChapterCompleted, getCompletedChapterCount } = useUserStore();

    useEffect(() => {
        if (!artworkId) return;
        setLoading(true);
        getAllArtworks().then(artworks => {
            const found = artworks.find(a => a.id === artworkId) ?? null;
            setArtwork(found);
            if (found) {
                const pointIds = found.learningPoints.map(lp => lp.id);
                setChapters(buildChapters(pointIds));
            }
            setLoading(false);
        });
    }, [artworkId]);

    const getChapterStatus = useCallback((chapterIndex: number): 'locked' | 'current' | 'completed' => {
        if (!artworkId) return 'locked';
        if (isChapterCompleted(artworkId, chapterIndex)) return 'completed';
        if (chapterIndex === 0) return 'current';
        if (isChapterCompleted(artworkId, chapterIndex - 1)) return 'current';
        return 'locked';
    }, [artworkId, isChapterCompleted]);

    const handleChapterClick = (chapterIndex: number) => {
        const status = getChapterStatus(chapterIndex);
        if (status === 'locked' || !artworkId) return;
        navigate(`/play/${artworkId}/${chapterIndex}`);
    };

    const completedCount = artworkId ? getCompletedChapterCount(artworkId) : 0;
    const totalLearning = chapters.filter(c => c.type === 'learning').length;

    return (
        <div className="w-full min-h-[100dvh] bg-white flex flex-col">
            {/* Top bar */}
            <div className="flex-none h-16 flex items-center px-4 gap-4 border-b border-gray-100">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                {artwork && (
                    <div className="flex-1 min-w-0">
                        <div className="text-gray-900 font-bold text-base leading-tight truncate">{artwork.title}</div>
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
                            {completedCount} / {totalLearning} chapters
                        </div>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            {!loading && totalLearning > 0 && (
                <div className="flex-none h-1 bg-gray-100">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(completedCount / totalLearning) * 100}%` }}
                    />
                </div>
            )}

            {/* Chapter list */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="max-w-md mx-auto space-y-3">
                        {chapters.map((chapter, i) => {
                            const status = getChapterStatus(i);
                            const isLocked = status === 'locked';
                            const isCurrent = status === 'current';
                            const isCompleted = status === 'completed';
                            const pointCount = chapter.pointIds.length;

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleChapterClick(i)}
                                    disabled={isLocked}
                                    className={`
                                        w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200
                                        ${isCurrent
                                            ? 'bg-blue-50 border-2 border-blue-400 shadow-sm'
                                            : isCompleted
                                                ? 'bg-green-50 border-2 border-green-200'
                                                : isLocked
                                                    ? 'bg-gray-50 border-2 border-gray-100 opacity-60 cursor-not-allowed'
                                                    : 'bg-gray-50 border-2 border-gray-100'
                                        }
                                    `}
                                >
                                    {/* Icon */}
                                    <div className={`
                                        flex-none w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black
                                        ${isCurrent
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : isCompleted
                                                ? 'bg-green-500 text-white'
                                                : isLocked
                                                    ? 'bg-gray-200 text-gray-400'
                                                    : 'bg-gray-200 text-gray-500'
                                        }
                                    `}>
                                        {isCompleted ? (
                                            <CheckCircle2 size={22} />
                                        ) : isLocked ? (
                                            <Lock size={18} />
                                        ) : (
                                            <span>{i + 1}</span>
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-bold text-sm ${
                                            isLocked ? 'text-gray-400' : 'text-gray-800'
                                        }`}>
                                            {`Chapter ${i + 1}`}
                                        </div>
                                        <div className={`text-xs mt-0.5 ${
                                            isLocked ? 'text-gray-300' : 'text-gray-400'
                                        }`}>
                                            {`${pointCount} learning point${pointCount !== 1 ? 's' : ''}`}
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    {isCurrent && (
                                        <div className="flex-none px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider">
                                            Start
                                        </div>
                                    )}
                                    {isCompleted && (
                                        <div className="flex-none text-green-500 text-xs font-bold">
                                            Done
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
