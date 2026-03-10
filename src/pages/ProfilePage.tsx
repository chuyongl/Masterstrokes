import MarieroseCharacter from '../components/ui/MarieroseCharacter';

export default function ProfilePage() {
    return (
        <div className="h-full flex flex-col bg-[#1A1008] font-sans text-white overflow-hidden">


            <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 relative">
                {/* Hero Section */}
                <div className="pt-12 pb-6 px-6 bg-gradient-to-b from-[#2A1A08] to-[#1A1008] flex flex-col items-center relative">
                    {/* Avatar */}
                    <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#F5C842] to-[#C8920A] border-[3px] border-[#C8920A] flex items-center justify-center shadow-[0_4px_16px_rgba(245,200,66,0.3)] overflow-hidden">
                            <div className="mt-2 w-[120px] h-[120px] flex items-center justify-center flex-shrink-0">
                                <MarieroseCharacter width={100} height={100} />
                            </div>
                        </div>
                        {/* Level Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-[#2C3E50] border border-[#2A1A08] text-[#FFFEF5] text-[9px] font-bold px-2 py-0.5 rounded-md shadow-md">
                            Detective Lv.3
                        </div>
                    </div>

                    {/* Name & Title */}
                    <h1 className="font-serif text-[18px] text-[#FFFEF5] font-bold">Margaret</h1>
                    <p className="text-[11px] text-[#F5C842] mt-0.5 font-bold tracking-wide">
                        Junior Art Investigator
                    </p>

                    {/* XP Progress */}
                    <div className="w-full max-w-[260px] mt-5">
                        <div className="flex justify-between text-[10px] text-white/50 mb-1 font-bold tracking-wider">
                            <span>1,240 XP</span>
                            <span>Lv.4 at 2,000 XP</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#C8553A] to-[#F5C842] w-[62%] rounded-full shadow-[0_0_8px_rgba(245,200,66,0.6)]" />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex justify-between items-center px-4 py-5 border-y border-white/5 bg-[#1A1008]/80 backdrop-blur-sm sticky top-0 z-10 w-full">
                    <div className="flex-1 border-r border-white/10 flex flex-col items-center justify-center px-1">
                        <div className="text-sm font-bold text-[#F5C842] flex items-center gap-1">
                            <span>🔥</span> 7
                        </div>
                        <div className="text-[9px] text-white/40 uppercase tracking-wider mt-1 text-center leading-tight">Streak</div>
                    </div>
                    <div className="flex-1 border-r border-white/10 flex flex-col items-center justify-center px-1">
                        <div className="text-[15px] font-bold text-white">8</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-wider mt-1 text-center leading-tight">Recovered</div>
                    </div>
                    <div className="flex-1 border-r border-white/10 flex flex-col items-center justify-center px-1">
                        <div className="text-[15px] font-bold text-white">24</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-wider mt-1 text-center leading-tight">Cases</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center px-1">
                        <div className="text-[15px] font-bold text-[#4CAF82]">94%</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-wider mt-1 text-center leading-tight">Accuracy</div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="px-5 pt-6 space-y-8 pb-8">
                    {/* This Week / Streak Calendar */}
                    <section>
                        <h2 className="text-[13px] font-bold text-white/80 mb-3 uppercase tracking-wider">This Week</h2>
                        <div className="bg-white/[0.04] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                                const isPast = i < 4;
                                const isToday = i === 4;

                                let boxStyle = "bg-white/[0.04] border-white/5 text-white/30";
                                if (isPast) boxStyle = "bg-[#F5C842] border-[#F5C842] text-[#1A1008] shadow-[0_0_10px_rgba(245,200,66,0.3)]";
                                if (isToday) boxStyle = "bg-[#F5C842]/20 border-[#F5C842]/40 text-[#F5C842]";

                                return (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <div className="text-[9px] font-bold uppercase text-white/40">{day}</div>
                                        <div className={`w-[26px] h-[26px] rounded-[6px] border ${boxStyle} flex items-center justify-center text-xs`}>
                                            {isPast && '✓'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Badges */}
                    <section>
                        <h2 className="text-[13px] font-bold text-white/80 mb-3 uppercase tracking-wider">Badges</h2>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
                            {[
                                { icon: '🔍', name: 'Eagle Eye', earned: true },
                                { icon: '⚡', name: 'Speedster', earned: true },
                                { icon: '🧠', name: 'Historian', earned: false },
                                { icon: '🛡', name: 'Guardian', earned: false },
                            ].map((badge, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                                    <div className={`w-[56px] h-[56px] rounded-full flex items-center justify-center text-2xl border ${badge.earned
                                        ? 'border-[#C8920A] bg-[#C8920A]/15 shadow-inner'
                                        : 'border-white/5 bg-white/5 opacity-30 grayscale'
                                        }`}>
                                        {badge.icon}
                                    </div>
                                    <div className="text-[9px] font-bold text-white/50 tracking-wide uppercase">
                                        {badge.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Settings */}
                    <section>
                        <h2 className="text-[13px] font-bold text-white/80 mb-3 uppercase tracking-wider">Settings</h2>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                            {[
                                { icon: '🎵', label: 'Sound Effects', type: 'toggle', value: true },
                                { icon: '📳', label: 'Haptic Feedback', type: 'toggle', value: true },
                                { icon: '🔔', label: 'Daily Reminder', type: 'toggle', value: false },
                                { icon: '🌐', label: 'Language', type: 'link', value: 'English' },
                                { icon: '📖', label: 'View Tutorial', type: 'link' },
                            ].map((setting, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg opacity-80">{setting.icon}</span>
                                        <span className="text-sm text-white/80 font-medium">{setting.label}</span>
                                    </div>
                                    {setting.type === 'toggle' ? (
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${setting.value ? 'bg-[#F5C842]' : 'bg-white/10'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${setting.value ? 'translate-x-4 bg-[#1A1008]' : 'translate-x-0'}`} />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {setting.value && <span className="text-xs text-white/40">{setting.value}</span>}
                                            <span className="text-white/20">›</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
