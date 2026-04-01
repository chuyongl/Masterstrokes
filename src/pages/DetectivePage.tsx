export default function DetectivePage() {
    return (
        <div className="min-h-full bg-[#1C1B2E]">
            {/* Header */}
            <div className="px-[18px] pt-4 pb-[14px]">
                <p className="text-[11px] font-semibold text-[#A78BFA] tracking-[0.06em] uppercase">Case Files</p>
                <p className="text-[20px] font-extrabold text-white">Detective Mode</p>
            </div>

            {/* Subscribe banner */}
            <div className="mx-[18px] mb-[14px] rounded-[14px] p-[14px] flex items-center gap-[10px]" style={{ background: 'linear-gradient(135deg,#2C1654,#7B2FF7)' }}>
                <span className="text-[22px]">🔓</span>
                <div className="flex-1">
                    <p className="text-[13px] font-bold text-white">Unlock All Cases</p>
                    <p className="text-[10px] text-white/60">Subscribe for full detective access</p>
                </div>
                <button className="bg-white text-[#7B2FF7] border-none rounded-full py-[7px] px-3 text-[11px] font-bold cursor-pointer flex-shrink-0">Pro</button>
            </div>

            {/* Active Case */}
            <div className="px-[18px] mb-[14px]">
                <p className="text-[12px] font-bold text-white/50 mb-2 tracking-[0.04em] uppercase">Active Case</p>
                <div className="border-[1.5px] border-[#7B2FF7] rounded-[14px] overflow-hidden">
                    <div className="h-[70px] flex items-center p-[12px_14px] gap-[10px]" style={{ background: 'linear-gradient(135deg,#2C1654,#4C1D96)' }}>
                        <span className="text-[28px]">🖼️</span>
                        <div>
                            <p className="text-[13px] font-bold text-white">The Missing Lion Panel</p>
                            <p className="text-[10px] text-[#A78BFA]">Act 1 · Scene of the Crime</p>
                        </div>
                    </div>
                    <div className="p-[10px_14px] bg-[rgba(123,47,247,0.1)]">
                        <div className="h-1 bg-white/10 rounded-[2px] overflow-hidden mb-[6px]">
                            <div className="h-full bg-[#7B2FF7] rounded-[2px]" style={{ width: '30%' }} />
                        </div>
                        <p className="text-[10px] text-white/50">30% investigated</p>
                    </div>
                </div>
            </div>

            {/* More Cases (locked) */}
            <div className="px-[18px] mb-[14px]">
                <p className="text-[12px] font-bold text-white/50 mb-2 tracking-[0.04em] uppercase">
                    More Cases <span className="text-[9px] bg-[rgba(123,47,247,0.3)] text-[#A78BFA] py-[2px] px-[6px] rounded-[3px] ml-1">PRO</span>
                </p>
                <div className="flex flex-col gap-2">
                    {[
                        { name: 'The Stolen Vermeer', sub: 'Dutch Golden Age' },
                        { name: 'The Severed Fresco', sub: 'Ancient Rome' },
                    ].map(c => (
                        <div key={c.name} className="flex items-center gap-[10px] p-[10px_12px] rounded-[10px] bg-white/[0.04] border border-white/[0.07]">
                            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[16px]">🔒</div>
                            <div className="flex-1">
                                <p className="text-[12px] font-semibold text-white/40">{c.name}</p>
                                <p className="text-[10px] text-white/25">{c.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Collected Clues */}
            <div className="px-[18px] pb-4">
                <p className="text-[12px] font-bold text-white/50 mb-2 tracking-[0.04em] uppercase">Collected Clues</p>
                <div className="flex gap-2">
                    <div className="w-11 h-11 rounded-[10px] bg-[rgba(123,47,247,0.2)] border border-[#7B2FF7] flex items-center justify-center text-[18px]">🔎</div>
                    <div className="w-11 h-11 rounded-[10px] bg-[rgba(123,47,247,0.2)] border border-[#7B2FF7] flex items-center justify-center text-[18px]">🗺️</div>
                    <div className="w-11 h-11 rounded-[10px] bg-white/5 border border-dashed border-white/15 flex items-center justify-center text-[16px] text-white/20">?</div>
                    <div className="w-11 h-11 rounded-[10px] bg-white/5 border border-dashed border-white/15 flex items-center justify-center text-[16px] text-white/20">?</div>
                </div>
            </div>
        </div>
    );
}
