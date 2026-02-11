import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Star, Play } from 'lucide-react';
import { ERAS, ARTWORK_ERA_MAP } from '../config/eras';
import { getAllArtworks } from '../services/sheetsApi';
import type { Artwork } from '../data/mockArtwork';

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
                const filtered = data.filter((artwork) => {
                    const artworkEra = ARTWORK_ERA_MAP[artwork.id];
                    return artworkEra === eraId;
                });
                setArtworks(filtered);
            } catch (error) {
                console.error('Failed to load artworks:', error);
                setArtworks([]);
            } finally {
                setLoading(false);
            }
        }

        loadArtworks();
    }, [eraId]);

    const generateLevelNodes = (): LevelNode[] => {
        return artworks.map((artwork, index) => {
            const isLeft = index % 2 === 0;
            const x = isLeft ? 25 : 75; // Adjusted for better centering
            const y = 15 + (index * 20); // Spacing between nodes

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

    if (!era) return null;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, ${era.color} 0%, transparent 70%)`
                }}
            />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => navigate('/hub')}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex items-center gap-3">
                    <span className="text-2xl">{era.icon}</span>
                    <h1 className="text-xl font-bold text-slate-800">{era.name}</h1>
                </div>

                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Level Roadmap */}
            <div className="flex-1 overflow-y-auto relative w-full scroll-smooth">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
                        <div className="text-slate-500 font-medium">Loading Journey...</div>
                    </div>
                ) : levelNodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className="text-6xl mb-4 animate-bounce">🎨</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No levels yet</h3>
                        <p className="text-slate-500">Add artworks to this era to stat your journey.</p>
                    </div>
                ) : (
                    <div className="relative min-h-screen py-20 max-w-lg mx-auto w-full">
                        {/* SVG Path */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: `${levelNodes.length * 20 + 40}%` }}>
                            <defs>
                                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor={era.color} stopOpacity="0.4" />
                                    <stop offset="100%" stopColor={era.color} stopOpacity="0.1" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            {levelNodes.map((node, index) => {
                                if (index === levelNodes.length - 1) return null;
                                const nextNode = levelNodes[index + 1];
                                const y1 = `${node.position.y}%`;
                                const y2 = `${nextNode.position.y}%`;
                                const midY = (node.position.y + nextNode.position.y) / 2;

                                return (
                                    <path
                                        key={`path-${index}`}
                                        d={`M ${node.position.x}% ${y1} C ${node.position.x}% ${midY}%, ${nextNode.position.x}% ${midY}%, ${nextNode.position.x}% ${y2}`}
                                        stroke={node.status !== 'locked' ? era.color : '#e2e8f0'}
                                        strokeWidth="6"
                                        fill="none"
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-in-out"
                                        style={{ filter: node.status === 'current' ? 'url(#glow)' : 'none' }}
                                    />
                                );
                            })}
                        </svg>

                        {/* Level Nodes with Session Headers */}
                        {levelNodes.map((node, index) => {
                            // Determine if we need a session header
                            // Session 1: Index 0, Session 2: Index 3, Session 3: Index 6, Session 4: Index 9
                            let sessionTitle = "";
                            let sessionColor = "";

                            if (index === 0) { sessionTitle = "Session 1: The Face of the Republic"; sessionColor = "bg-amber-100 text-amber-800 border-amber-200"; }
                            else if (index === 3) { sessionTitle = "Session 2: Life in Detail"; sessionColor = "bg-sky-100 text-sky-800 border-sky-200"; }
                            else if (index === 6) { sessionTitle = "Session 3: The World Around Us"; sessionColor = "bg-emerald-100 text-emerald-800 border-emerald-200"; }
                            else if (index === 9) { sessionTitle = "Session 4: Silent Beauty"; sessionColor = "bg-purple-100 text-purple-800 border-purple-200"; }

                            return (
                                <div key={node.artwork.id}>
                                    {/* Session Header */}
                                    {sessionTitle && (
                                        <div className="absolute left-0 right-0 z-0 flex justify-center pointer-events-none"
                                            style={{ top: `${node.position.y - 8}%` }}>
                                            <div className={`px-6 py-2 rounded-full border shadow-sm backdrop-blur-md font-bold text-sm uppercase tracking-wider ${sessionColor}`}>
                                                {sessionTitle}
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
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
                                            className={`relative group flex flex-col items-center justify-center transition-all duration-300
                                                ${node.status === 'locked' ? 'grayscale opacity-80' : 'hover:scale-110'}
                                            `}
                                        >
                                            {/* Level Number Badge */}
                                            <div className={`absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border-2 border-white
                                                ${node.status === 'completed' ? 'bg-yellow-500 text-white' : 'bg-slate-700 text-white'}
                                            `}>
                                                {index + 1}
                                            </div>

                                            {/* Main Circle */}
                                            <div
                                                className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-lg transition-all duration-500 relative overflow-hidden bg-white
                                                    ${node.status === 'current' ? 'ring-4 ring-offset-4 ring-sky-200 border-sky-500' : ''}
                                                    ${node.status === 'completed' ? 'border-yellow-400' : 'border-slate-200'}
                                                `}
                                            >
                                                {/* Image Background */}
                                                <div className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity">
                                                    <img
                                                        src={node.artwork.imageUrl}
                                                        alt={node.artwork.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className={`absolute inset-0 bg-black/10 ${node.status === 'locked' ? 'bg-slate-100/90' : ''}`} />
                                                </div>

                                                {/* Status Icon Overlay */}
                                                <div className="z-10 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-sm">
                                                    {node.status === 'locked' ? (
                                                        <Lock className="text-slate-400" size={24} />
                                                    ) : node.status === 'completed' ? (
                                                        <Star className="text-yellow-500 fill-yellow-500" size={24} />
                                                    ) : (
                                                        <Play className="text-sky-600 fill-sky-600 ml-1" size={24} />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Artwork Title Label */}
                                            {node.status !== 'locked' && (
                                                <div className="absolute top-28 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-slate-100 w-48 text-center transform scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all z-30">
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-1">
                                                        {node.artwork.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {node.artwork.artist}
                                                    </p>
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Bottom Mascot */}
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center"
                            style={{ top: `${(levelNodes.length * 20) + 10}%` }}>
                            <div className="text-6xl animate-bounce" style={{ animationDuration: '3s' }}>
                                🐌
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
