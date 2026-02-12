import { useState } from 'react';
import { MOCK_ARTWORKS } from '../data/allArtworks';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CuratorPage() {
    const navigate = useNavigate();
    const [selectedArtworkId, setSelectedArtworkId] = useState<string>(MOCK_ARTWORKS[0].id);
    const [clickCoords, setClickCoords] = useState<{ x: number; y: number } | null>(null);
    const [copied, setCopied] = useState(false);

    const selectedArtwork = MOCK_ARTWORKS.find((a) => a.id === selectedArtworkId);

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Round to 1 decimal place for cleaner JSON
        setClickCoords({
            x: Math.round(x * 10) / 10,
            y: Math.round(y * 10) / 10
        });
        setCopied(false);
    };

    const copyToClipboard = () => {
        if (!clickCoords) return;
        const text = `x: ${clickCoords.x}, y: ${clickCoords.y}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-700 flex items-center gap-2">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-800 rounded-lg">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-bold text-lg">Curator Tool</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {MOCK_ARTWORKS.map((artwork) => (
                        <button
                            key={artwork.id}
                            onClick={() => {
                                setSelectedArtworkId(artwork.id);
                                setClickCoords(null);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                                ${selectedArtworkId === artwork.id
                                    ? 'bg-sky-600 text-white'
                                    : 'hover:bg-slate-800 text-slate-400'}
                            `}
                        >
                            {artwork.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 flex flex-col">
                {/* Image Area */}
                <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center p-8">
                    {selectedArtwork ? (
                        <div className="relative inline-block shadow-2xl">
                            <img
                                src={selectedArtwork.imageUrl}
                                alt={selectedArtwork.title}
                                className="max-h-[80vh] max-w-full object-contain cursor-crosshair border border-slate-700"
                                onClick={handleImageClick}
                            />

                            {/* Existing Learning Points (Visual Reference) */}
                            {selectedArtwork.learningPoints.map((lp) => (
                                <div
                                    key={lp.id}
                                    className="absolute w-4 h-4 border-2 border-yellow-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50"
                                    style={{ left: `${lp.clickArea.x}%`, top: `${lp.clickArea.y}%` }}
                                    title={lp.label}
                                />
                            ))}

                            {/* Current Click Marker */}
                            {clickCoords && (
                                <div
                                    className="absolute w-6 h-6 border-2 border-red-500 bg-red-500/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping"
                                    style={{ left: `${clickCoords.x}%`, top: `${clickCoords.y}%` }}
                                />
                            )}
                            {clickCoords && (
                                <div
                                    className="absolute w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ left: `${clickCoords.x}%`, top: `${clickCoords.y}%` }}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="text-slate-500">Select an artwork to start calibrating</div>
                    )}
                </div>

                {/* Bottom Panel (Inspector) */}
                <div className="h-48 border-t border-slate-700 bg-slate-800 p-6 flex gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-white">
                                {selectedArtwork?.title}
                            </h2>
                            <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                                {selectedArtwork?.artist}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-3 rounded border border-slate-700">
                                <label className="block text-xs text-slate-500 uppercase mb-1">Cursor Position (Percentage)</label>
                                <div className="font-mono text-lg text-sky-400">
                                    {clickCoords ? `x: ${clickCoords.x}, y: ${clickCoords.y}` : '--'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-96 bg-slate-900 p-4 rounded border border-slate-700 flex flex-col">
                        <label className="block text-xs text-slate-500 uppercase mb-2">JSON Output</label>
                        <div className="flex-1 font-mono text-sm text-slate-300 bg-black/50 p-2 rounded mb-2 overflow-auto select-all">
                            {clickCoords
                                ? `{ x: ${clickCoords.x}, y: ${clickCoords.y}, radius: 15 }`
                                : '// Click image to generate coordinates'
                            }
                        </div>
                        <button
                            onClick={copyToClipboard}
                            disabled={!clickCoords}
                            className={`w-full py-2 rounded font-bold flex items-center justify-center gap-2 transition-all
                                ${copied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'}
                            `}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy Coordinates'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
