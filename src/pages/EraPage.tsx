import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ERAS, ARTWORK_ERA_MAP } from '../config/eras';
import { getAllArtworks } from '../services/sheetsApi';
import type { Artwork } from '../data/mockArtwork';
import { MOCK_ARTWORKS } from '../data/allArtworks';

export default function EraPage() {
    const { eraId } = useParams<{ eraId: string }>();
    const navigate = useNavigate();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);

    const era = ERAS.find((e) => e.id === eraId);

    useEffect(() => {
        async function loadArtworks() {
            if (!eraId) return;

            setLoading(true);
            try {
                // Try to fetch from Google Sheets
                const data = await getAllArtworks();

                if (data.length > 0) {
                    // Filter by era from API data
                    const filtered = data.filter((artwork) => {
                        const artworkEra = ARTWORK_ERA_MAP[artwork.id];
                        return artworkEra === eraId;
                    });
                    setArtworks(filtered);
                } else {
                    // Fallback to mock data and filter by era
                    const filtered = MOCK_ARTWORKS.filter((artwork) => {
                        const artworkEra = ARTWORK_ERA_MAP[artwork.id];
                        return artworkEra === eraId;
                    });
                    setArtworks(filtered);
                }
            } catch (error) {
                console.error('Failed to load artworks:', error);
                // Fallback to mock data and filter by era
                const filtered = MOCK_ARTWORKS.filter((artwork) => {
                    const artworkEra = ARTWORK_ERA_MAP[artwork.id];
                    return artworkEra === eraId;
                });
                setArtworks(filtered);
            } finally {
                setLoading(false);
            }
        }

        loadArtworks();
    }, [eraId]);

    if (!era) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-slate-600">Era not found</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#f8fafc]">
            {/* Header */}
            <div
                className="p-6 text-white relative"
                style={{
                    background: `linear-gradient(135deg, ${era.color} 0%, ${era.color}dd 100%)`
                }}
            >
                <button
                    onClick={() => navigate('/hub')}
                    className="mb-4 text-white/80 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex items-center gap-4 mb-2">
                    <div className="text-5xl">{era.icon}</div>
                    <div>
                        <h1 className="text-3xl font-bold">{era.name}</h1>
                        <p className="text-white/80">{era.period}</p>
                    </div>
                </div>
            </div>

            {/* Artworks Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-slate-600">Loading artworks...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {artworks.map((artwork) => (
                            <button
                                key={artwork.id}
                                onClick={() => navigate(`/play/${artwork.id}`)}
                                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl 
                                           transition-all active:scale-98 text-left group"
                            >
                                {/* Artwork Image */}
                                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                                    <img
                                        src={artwork.imageUrl}
                                        alt={artwork.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-slate-800 mb-1">
                                        {artwork.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-3">
                                        {artwork.artist}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex gap-4 text-xs text-slate-500">
                                        <span>📍 {artwork.learningPoints.length} Points</span>
                                        <span>❓ {artwork.quizQuestions.length} Questions</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && artworks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-6xl mb-4">🎨</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            No artworks yet
                        </h3>
                        <p className="text-slate-600">
                            Add artworks to your Google Sheet to see them here
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
