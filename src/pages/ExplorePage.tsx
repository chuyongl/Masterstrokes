import { useState } from 'react';

const CATEGORIES = ['Styles', 'Artists', 'Museums', 'Eras'] as const;

const STYLES = [
    { name: 'Baroque', gradient: 'linear-gradient(135deg,#1a0533,#4A1D96)' },
    { name: 'Romanticism', gradient: 'linear-gradient(135deg,#1C3A5E,#1D4ED8)' },
    { name: 'Impressionism', gradient: 'linear-gradient(135deg,#14532D,#166534)' },
    { name: 'Renaissance', gradient: 'linear-gradient(135deg,#7C2D12,#C2410C)' },
    { name: 'Modernism', gradient: 'linear-gradient(135deg,#1E1B4B,#4338CA)' },
    { name: 'Realism', gradient: 'linear-gradient(135deg,#422006,#92400E)' },
];

const MUSEUMS = [
    { flag: '🇫🇷', name: 'Louvre, Paris', count: 38 },
    { flag: '🇳🇱', name: 'Rijksmuseum, Amsterdam', count: 22 },
    { flag: '🇬🇧', name: 'National Gallery, London', count: 31 },
    { flag: '🇺🇸', name: 'Met Museum, New York', count: 26 },
    { flag: '🇮🇹', name: 'Uffizi Gallery, Florence', count: 19 },
];

export default function ExplorePage() {
    const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>('Styles');

    return (
        <div className="min-h-full bg-white">
            {/* Header */}
            <div className="px-[18px] pt-4 pb-[10px]">
                <p className="text-[20px] font-extrabold text-[#18181b]">Discover</p>
                {/* Search bar */}
                <div className="mt-[10px] bg-[#F4F4F5] rounded-full flex items-center py-2 px-[14px] gap-2">
                    <span className="text-[14px] text-[#A1A1AA]">🔍</span>
                    <span className="text-[13px] text-[#A1A1AA]">Artists, artworks, styles…</span>
                </div>
            </div>

            {/* Daily Pick */}
            <div className="mx-[18px] mb-[14px] rounded-[14px] overflow-hidden relative h-[120px]" style={{ background: 'linear-gradient(135deg,#2C1654,#7B2FF7)' }}>
                <div className="absolute inset-0 p-[14px_16px] flex flex-col justify-between">
                    <span className="self-start text-[9px] font-bold tracking-[0.06em] uppercase py-[3px] px-2 rounded bg-[rgba(249,115,22,0.15)] text-[#FB923C]">Daily Pick</span>
                    <div>
                        <p className="text-[14px] font-bold text-white leading-[1.2]">Girl with a Pearl Earring</p>
                        <p className="text-[11px] text-white/60">Johannes Vermeer · 1665</p>
                    </div>
                </div>
            </div>

            {/* Category pills */}
            <div className="px-[18px] mb-3">
                <p className="text-[12px] font-bold text-[#18181b] mb-2">Browse by</p>
                <div className="flex gap-2 overflow-x-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className="flex-shrink-0 rounded-full text-[11px] font-semibold py-[6px] px-[14px]"
                            style={{
                                background: activeCategory === cat ? '#7B2FF7' : '#F4F4F5',
                                color: activeCategory === cat ? '#fff' : '#52525B',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Styles grid */}
            {activeCategory === 'Styles' && (
                <div className="px-[18px] mb-3">
                    <p className="text-[12px] font-bold text-[#18181b] mb-2">Styles & Movements</p>
                    <div className="grid grid-cols-2 gap-2">
                        {STYLES.map(s => (
                            <div key={s.name} className="rounded-[10px] overflow-hidden h-[62px] flex items-end p-2 cursor-pointer hover:scale-[1.02] transition-transform" style={{ background: s.gradient }}>
                                <p className="text-[11px] font-bold text-white">{s.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Museums list */}
            {activeCategory === 'Museums' && (
                <div className="px-[18px] mb-3">
                    <p className="text-[12px] font-bold text-[#18181b] mb-2">City Museums</p>
                    <div className="flex flex-col gap-2">
                        {MUSEUMS.map(m => (
                            <div key={m.name} className="flex items-center gap-[10px] p-[10px_12px] border border-black/[0.08] rounded-[10px] cursor-pointer hover:bg-gray-50 transition-colors">
                                <span className="text-[20px]">{m.flag}</span>
                                <div className="flex-1">
                                    <p className="text-[13px] font-semibold text-[#18181b]">{m.name}</p>
                                    <p className="text-[10px] text-[#71717A]">{m.count} artworks</p>
                                </div>
                                <span className="text-[12px] text-[#A1A1AA]">›</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Artists / Eras placeholders */}
            {(activeCategory === 'Artists' || activeCategory === 'Eras') && (
                <div className="px-[18px] py-8 text-center">
                    <p className="text-[40px] mb-2">{activeCategory === 'Artists' ? '👨‍🎨' : '⏳'}</p>
                    <p className="text-[14px] font-bold text-[#18181b]">{activeCategory}</p>
                    <p className="text-[12px] text-[#71717A] mt-1">Coming soon</p>
                </div>
            )}
        </div>
    );
}
