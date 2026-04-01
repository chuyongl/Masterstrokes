export default function ChallengePage() {
    return (
        <div className="min-h-full bg-white">
            <div className="px-[18px] pt-4 pb-[14px]">
                <p className="text-[20px] font-extrabold text-[#18181b]">Challenge Board</p>

                {/* Monthly Challenge */}
                <div className="mt-3 rounded-[14px] overflow-hidden p-4" style={{ background: 'linear-gradient(135deg,#2C1654,#7B2FF7)' }}>
                    <span className="text-[9px] font-bold tracking-[0.06em] uppercase py-[3px] px-2 rounded bg-[rgba(249,115,22,0.15)] text-[#FB923C]">Monthly Challenge</span>
                    <p className="text-[15px] font-bold text-white mt-2">April Art Sprint</p>
                    <p className="text-[11px] text-white/60 mt-[3px]">Study 12 paintings this month</p>
                    <div className="mt-[10px] bg-white/15 rounded h-[6px] overflow-hidden">
                        <div className="h-full bg-[#A78BFA] rounded" style={{ width: '25%' }} />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-white/50">3 / 12 complete</span>
                        <span className="text-[10px] text-white/50">29 days left</span>
                    </div>
                </div>

                {/* Daily Quests */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-[10px]">
                        <p className="text-[14px] font-bold text-[#18181b]">Daily Quests</p>
                        <span className="text-[9px] font-bold py-[3px] px-2 rounded bg-[rgba(123,47,247,0.2)] text-[#A78BFA]">Resets in 8h</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {/* Quest 1: completed */}
                        <div className="flex items-center gap-3 p-[12px_14px] rounded-[12px] border-[1.5px] border-[#10B981] bg-[#F0FDF4]">
                            <div className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center text-[13px] text-white flex-shrink-0">✓</div>
                            <div className="flex-1">
                                <p className="text-[12px] font-semibold text-[#065F46]">Learn 1 artwork</p>
                                <p className="text-[10px] text-[#059669]">Completed!</p>
                            </div>
                            <span className="text-[11px] font-bold text-[#10B981]">+10 XP</span>
                        </div>
                        {/* Quest 2: in progress */}
                        <div className="flex items-center gap-3 p-[12px_14px] rounded-[12px] border-[1.5px] border-[#7B2FF7] bg-[#F5F3FF]">
                            <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[13px] flex-shrink-0">🎨</div>
                            <div className="flex-1">
                                <p className="text-[12px] font-semibold text-[#4C1D95]">Answer 3 quiz questions</p>
                                <div className="bg-[rgba(123,47,247,0.1)] rounded-[3px] h-1 mt-1 overflow-hidden">
                                    <div className="h-full bg-[#7B2FF7] rounded-[3px]" style={{ width: '33%' }} />
                                </div>
                                <p className="text-[10px] text-[#7B2FF7] mt-[2px]">1 / 3</p>
                            </div>
                            <span className="text-[11px] font-bold text-[#7B2FF7]">+15 XP</span>
                        </div>
                        {/* Quest 3: locked */}
                        <div className="flex items-center gap-3 p-[12px_14px] rounded-[12px] border border-black/[0.07] bg-[#FAFAFA]">
                            <div className="w-7 h-7 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[13px] flex-shrink-0">🔥</div>
                            <div className="flex-1">
                                <p className="text-[12px] font-semibold text-[#A1A1AA]">Keep your streak alive</p>
                                <p className="text-[10px] text-[#D4D4D8]">Come back tomorrow</p>
                            </div>
                            <span className="text-[11px] font-bold text-[#D4D4D8]">+20 XP</span>
                        </div>
                    </div>
                </div>

                {/* Streak Calendar */}
                <div className="mt-4">
                    <p className="text-[14px] font-bold text-[#18181b] mb-2">Streak Calendar</p>
                    <div className="grid grid-cols-7 gap-1">
                        {['M','T','W','T','F','S','S'].map((d, i) => (
                            <div key={i} className="text-center text-[9px] text-[#A1A1AA] font-medium">{d}</div>
                        ))}
                        {/* Week cells */}
                        <div className="h-6 rounded bg-[#7B2FF7]" />
                        <div className="h-6 rounded bg-[#7B2FF7]" />
                        <div className="h-6 rounded bg-[#7B2FF7]" />
                        <div className="h-6 rounded bg-[#EDE9FE] border-[1.5px] border-[#7B2FF7]" />
                        <div className="h-6 rounded bg-[#F4F4F5]" />
                        <div className="h-6 rounded bg-[#F4F4F5]" />
                        <div className="h-6 rounded bg-[#F4F4F5]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
