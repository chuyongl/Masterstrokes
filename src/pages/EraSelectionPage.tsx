import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const halls = [
    { id: 'ancient-art', name: 'Prehistoric Hall', era: '~40,000 – 6,000 BCE', icon: '🦴', status: 'current', progress: 2, total: 6 },
    { id: 'mesopotamian', name: 'Mesopotamian Hall', era: '~3,500 – 600 BCE', icon: '🏛', status: 'unlocked', progress: 0, total: 6 },
    { id: 'egyptian', name: 'Egyptian Hall', era: '~3,100 – 30 BCE', icon: '𓂀', status: 'unlocked', progress: 0, total: 6 },
    { id: 'greek', name: 'Greek & Roman Hall', era: '~800 BCE – 400 CE', icon: '🏺', status: 'locked', progress: 0, total: 6 },
    { id: 'indian', name: 'Ancient Indian Hall', era: 'Vedic – Gupta Period', icon: '🕌', status: 'locked', progress: 0, total: 6 },
];

export default function EraSelectionPage() {
    const navigate = useNavigate();
    const [toastMessage, setToastMessage] = useState('');

    const handlePress = (item: any) => {
        if (item.status === 'locked') {
            showToast("Complete 3 cases in the previous hall first.");
        } else {
            navigate(`/era/${item.id}`);
        }
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    return (
        <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, #F5F0FF 0%, #FAF5FF 100%)' }}>

            {/* StatusBar 36px placeholder */}
            <div className="h-9 w-full shrink-0" />

            {/* TopBar 52px */}
            <div className="h-[52px] px-5 flex items-center justify-between z-10 shrink-0">
                <div>
                    <div className="text-[11px] tracking-[2px] uppercase text-[#7C3AED] mb-1 font-bold">
                        Select Era
                    </div>
                    <h1 className="text-[22px] text-gray-900 font-bold leading-none">
                        All Museums
                    </h1>
                </div>
                <div className="bg-[#7C3AED]/10 px-3 py-1.5 rounded-full border border-[#7C3AED]/20 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#7C3AED]">🔥 7</span>
                </div>
            </div>

            {/* Hall FlatList - vertical scrolling */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-6 pb-24 z-10 relative">
                <div className="flex flex-col items-center max-w-md mx-auto w-full">
                    {halls.map((item, index) => {
                        let baseBg = "bg-white/60";
                        let borderStyle = "border-[1.5px] border-gray-200";
                        let opacityStyle = "opacity-50";

                        if (item.status === 'current') {
                            baseBg = "bg-[#7C3AED]/10";
                            borderStyle = "border-[1.5px] border-[#7C3AED]/50";
                            opacityStyle = "opacity-100";
                        } else if (item.status === 'unlocked') {
                            baseBg = "bg-[#7C3AED]/5";
                            borderStyle = "border-[1.5px] border-[#7C3AED]/20";
                            opacityStyle = "opacity-100";
                        }

                        return (
                            <div key={item.id} className="w-full flex flex-col items-center">
                                <button
                                    onClick={() => handlePress(item)}
                                    className={`w-full relative flex items-center p-3 rounded-2xl ${baseBg} ${borderStyle} ${opacityStyle} transition-all active:scale-95 text-left`}
                                >
                                    {item.status === 'current' && (
                                        <div className="absolute -top-2 -right-2 bg-[#7C3AED] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                                            Active
                                        </div>
                                    )}

                                    <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center text-2xl shrink-0 mr-4 border border-[#7C3AED]/10">
                                        {item.icon}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-2">
                                        <h3 className="text-[13px] font-bold text-gray-900 mb-1 truncate">
                                            {item.name}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 mb-2 truncate">
                                            {item.era}
                                        </p>
                                        
                                        <div className="w-full h-[3px] bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#7C3AED] rounded-full"
                                                style={{ width: `${(item.progress / item.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="shrink-0 pl-2 flex flex-col items-end justify-center w-12 text-center">
                                        {item.status === 'locked' ? (
                                            <span className="opacity-40 text-xl">🔒</span>
                                        ) : (
                                            <span className="text-[11px] font-bold text-[#7C3AED]">
                                                {item.progress}/{item.total}
                                            </span>
                                        )}
                                    </div>
                                </button>

                                {index < halls.length - 1 && (
                                    <div className="w-[2px] h-8 rounded-[1px] bg-[#7C3AED]/15 my-1" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-white border border-[#EF4444] text-gray-900 text-xs px-4 py-2 rounded-full shadow-xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
