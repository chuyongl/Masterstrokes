import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Star, Circle } from 'lucide-react';
import { ERAS, ARTWORK_ERA_MAP } from '../config/eras';
import { getAllArtworks } from '../services/sheetsApi';
import type { Artwork } from '../data/mockArtwork';
import { preloadImage } from '../utils/preload';

interface LevelNode {
    artwork: Artwork;
    position: { x: number; y: number };
    status: 'locked' | 'current' | 'completed';
}

export default function LevelRoadmapPage() {
    const { eraId } = useParams<{ eraId: string }>();
    const navigate = useNavigate();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [completedLevels] = useState<Set<string>>(new Set());

    const era = ERAS.find((e) => e.id === eraId);

    useEffect(() => {
        async function loadArtworks() {
            if (!eraId) return;

            setLoading(true);
            try {
                const data = await getAllArtworks();

                // Filter by era
                const filtered = data.filter((artwork) => {
                    const artworkEra = ARTWORK_ERA_MAP[artwork.id];
                    return artworkEra === eraId;
                });
                setArtworks(filtered);

                // Preload removed to improve initial load performance
                // if (filtered.length > 0) {
                //     preloadImage(filtered[0].imageUrl);
                //     setTimeout(() => {
                //         filtered.slice(1, 3).forEach(art => preloadImage(art.imageUrl));
                //     }, 1000);
                // }
            } catch (error) {
                console.error('Failed to load artworks from Google Sheets:', error);
                console.warn('Please check your VITE_APPS_SCRIPT_URL in .env file');
                setArtworks([]);
            } finally {
                setLoading(false);
            }
        }

        loadArtworks();
    }, [eraId]);

    // Generate level nodes with curved path positions
    const generateLevelNodes = (): LevelNode[] => {
        return artworks.map((artwork, index) => {
            // Curved path: alternate left and right
            const isLeft = index % 2 === 0;
            const x = isLeft ? 30 : 70;
            const y = 20 + (index * 25);

            // Linear unlocking: first level is current, rest are locked
            let status: 'locked' | 'current' | 'completed' = 'locked';
            if (completedLevels.has(artwork.id)) {
                status = 'completed';
            } else if (index === 0 || completedLevels.has(artworks[index - 1]?.id)) {
                status = 'current';
            }

            return {
                artwork,
                position: { x, y },
                status
            };
        });
    };

    const levelNodes = generateLevelNodes();

    if (!era) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-slate-600">Era not found</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white">
            {/* Top Stats Bar */}
            <div className="flex items-center justify-center gap-4 p-4 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full font-bold">
                    🔥 <span>3</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-full font-bold">
                    ⭐ <span>120</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-full font-bold">
                    ⚡ <span>5</span>
                </div>
            </div>

            {/* Header */}
            <div className="p-6 bg-white border-b border-slate-200">
                <button
                    onClick={() => navigate('/hub')}
                    className="mb-4 text-slate-600 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex items-center gap-3">
                    <div className="text-4xl">{era.icon}</div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{era.name}</h1>
                        <p className="text-slate-600">{era.period}</p>
                    </div>
                </div>
            </div>

            {/* Level Roadmap */}
            <div className="flex-1 overflow-y-auto relative w-full">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-slate-600">Loading levels...</div>
                    </div>
                ) : levelNodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className="text-6xl mb-4">🎨</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            No levels yet
                        </h3>
                        <p className="text-slate-600">
                            Add artworks to this era in your Google Sheet
                        </p>
                    </div>
                ) : (
                    <div className="relative min-h-full py-8 max-w-2xl mx-auto w-full">
                        {/* SVG Path */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <defs>
                                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor={era.color} stopOpacity="0.3" />
                                    <stop offset="100%" stopColor={era.color} stopOpacity="0.1" />
                                </linearGradient>
                            </defs>
                            {levelNodes.map((node, index) => {
                                if (index === levelNodes.length - 1) return null;
                                const nextNode = levelNodes[index + 1];

                                const x1 = `${node.position.x}%`;
                                const y1 = `${node.position.y}%`;
                                const x2 = `${nextNode.position.x}%`;
                                const y2 = `${nextNode.position.y}%`;

                                // Curved path
                                const midY = (node.position.y + nextNode.position.y) / 2;
                                const controlX = node.position.x < nextNode.position.x ? 50 : 50;

                                return (
                                    <path
                                        key={`path-${index}`}
                                        d={`M ${x1} ${y1} Q ${controlX}% ${midY}% ${x2} ${y2}`}
                                        stroke="url(#pathGradient)"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={node.status === 'locked' ? '8,8' : '0'}
                                    />
                                );
                            })}
                        </svg>

                        {/* Level Nodes */}
                        {levelNodes.map((node, index) => (
                            <div
                                key={node.artwork.id}
                                className="absolute transform -translate-x-1/2"
                                style={{
                                    left: `${node.position.x}%`,
                                    top: `${node.position.y}%`
                                }}
                            >
                                <button
                                    onClick={() => {
                                        if (node.status !== 'locked') {
                                            navigate(`/play/${node.artwork.id}`);
                                        }
                                    }}
                                    disabled={node.status === 'locked'}
                                    className={`relative group ${node.status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    {/* Node Circle */}
                                    <div
                                        className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all
                                            ${node.status === 'completed'
                                                ? 'bg-yellow-400 border-yellow-500 shadow-lg'
                                                : node.status === 'current'
                                                    ? 'bg-white border-sky-500 shadow-lg group-hover:scale-110'
                                                    : 'bg-slate-200 border-slate-300'
                                            }`}
                                        style={{
                                            borderColor: node.status === 'current' ? era.color : undefined
                                        }}
                                    >
                                        {node.status === 'locked' ? (
                                            <Lock className="text-slate-400" size={32} />
                                        ) : node.status === 'completed' ? (
                                            <Star className="text-white fill-white" size={32} />
                                        ) : (
                                            <Circle className="text-sky-500" size={32} />
                                        )}
                                    </div>

                                    {/* Level Number */}
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                    </div>

                                    {/* Artwork Info - Desktop optimized */}
                                    {node.status !== 'locked' && (
                                        <div className="mt-3 text-center w-[200px] absolute left-1/2 -translate-x-1/2 group-hover:scale-105 transition-transform">
                                            <p className="text-sm font-bold text-slate-800 line-clamp-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                                                {node.artwork.title}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1 bg-white/50 inline-block px-2 rounded-full">
                                                {node.artwork.artist}
                                            </p>
                                        </div>
                                    )}
                                </button>
                            </div>
                        ))}

                        {/* Bottom Mascot */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                            <div className="text-5xl mb-2 animate-bounce" style={{ animationDuration: '3s' }}>
                                🐌
                            </div>
                            <p className="text-slate-600 font-medium">Keep going!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
