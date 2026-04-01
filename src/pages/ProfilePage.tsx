import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const navigate = useNavigate();
    const streak = parseInt(localStorage.getItem('streak') || '0', 10);
    const xp = parseInt(localStorage.getItem('totalXP') || '0', 10);
    const paintingsLearned = 5; // TODO: derive from store

    const handleLogout = () => {
        localStorage.removeItem('hasOnboarded');
        localStorage.removeItem('activeEraId');
        navigate('/splash');
    };

    return (
        <div className="min-h-full bg-white">
            {/* Purple header */}
            <div className="bg-[#7B2FF7] px-[18px] pt-[18px] pb-[22px]">
                <div className="flex items-center gap-3">
                    <div className="w-[52px] h-[52px] rounded-full bg-white/20 flex items-center justify-center text-[22px] border-2 border-white/40">👩</div>
                    <div className="flex-1">
                        <p className="text-[18px] font-extrabold text-white">Marie Rose</p>
                        <p className="text-[11px] text-white/60">Art Detective · Level 4</p>
                    </div>
                    <div className="bg-white/15 rounded-lg py-[5px] px-[10px] text-[11px] font-semibold text-white cursor-pointer">Edit</div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-[14px]">
                    {[
                        { value: streak || 0, label: 'Day streak' },
                        { value: xp, label: 'Total XP' },
                        { value: paintingsLearned, label: 'Paintings' },
                    ].map(s => (
                        <div key={s.label} className="text-center bg-white/10 rounded-[10px] py-2">
                            <p className="text-[20px] font-extrabold text-white">{s.value}</p>
                            <p className="text-[9px] text-white/60 uppercase tracking-[0.04em]">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-[14px_18px] flex flex-col gap-[14px]">
                {/* Monthly Badges */}
                <div>
                    <p className="text-[13px] font-bold text-[#18181b] mb-2">Monthly Badges</p>
                    <div className="flex gap-[10px]">
                        <div className="text-center">
                            <div className="w-11 h-11 rounded-full bg-[#EDE9FE] border-2 border-[#7B2FF7] flex items-center justify-center text-[20px]">🔥</div>
                            <p className="text-[9px] text-[#7B2FF7] mt-[3px] font-semibold">Streak</p>
                        </div>
                        <div className="text-center">
                            <div className="w-11 h-11 rounded-full bg-[#FFF3E0] border-2 border-[#F97316] flex items-center justify-center text-[20px]">⭐</div>
                            <p className="text-[9px] text-[#F97316] mt-[3px] font-semibold">First Case</p>
                        </div>
                        {[1, 2].map(i => (
                            <div key={i} className="text-center opacity-35">
                                <div className="w-11 h-11 rounded-full bg-[#F4F4F5] border-2 border-dashed border-[#D4D4D8] flex items-center justify-center text-[18px] text-[#A1A1AA]">?</div>
                                <p className="text-[9px] text-[#A1A1AA] mt-[3px]">Locked</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account section */}
                <div>
                    <p className="text-[13px] font-bold text-[#18181b] mb-2">Account</p>
                    <div className="rounded-[12px] overflow-hidden border border-black/[0.07]">
                        {[
                            { icon: '🔔', label: 'Notifications', right: '›' },
                            { icon: '🔒', label: 'Privacy Settings', right: '›' },
                            { icon: '💳', label: 'Subscription', right: 'badge' },
                            { icon: '💬', label: 'Help & Feedback', right: '›' },
                        ].map((item, i, arr) => (
                            <div
                                key={item.label}
                                className={`flex items-center p-[12px_14px] cursor-pointer hover:bg-gray-50 transition-colors ${i < arr.length - 1 ? 'border-b border-black/5' : ''}`}
                            >
                                <span className="text-[14px] mr-[10px]">{item.icon}</span>
                                <p className="text-[13px] text-[#18181b] flex-1">{item.label}</p>
                                {item.right === 'badge' ? (
                                    <span className="text-[9px] font-bold py-[3px] px-2 rounded bg-[rgba(123,47,247,0.2)] text-[#A78BFA]">Free</span>
                                ) : (
                                    <span className="text-[12px] text-[#A1A1AA]">›</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-transparent border border-[#FCA5A5] text-[#EF4444] rounded-full py-[11px] text-[13px] font-semibold cursor-pointer hover:bg-red-50 transition-colors"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
}
