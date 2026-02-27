import { useState } from 'react';

const TABS = ['All', 'Prehistoric', 'Mesopotamian', 'Egyptian'];

const mockCollection = [
    { id: '1', title: 'Chauvet Lions', era: '~36,000 BCE', recovered: true, category: 'Prehistoric' },
    { id: '2', title: 'Lascaux Bulls', era: '~17,000 BCE', recovered: true, category: 'Prehistoric' },
    { id: '3', title: 'Bird-Headed Man', era: '~17,000 BCE', recovered: false, category: 'Prehistoric' },
    { id: '4', title: 'Altamira Bison', era: '~15,000 BCE', recovered: false, category: 'Prehistoric' },
    { id: '5', title: 'Standard of Ur', era: '~2,600 BCE', recovered: true, category: 'Mesopotamian' },
    { id: '6', title: 'Lyre of Ur', era: '~2,500 BCE', recovered: false, category: 'Mesopotamian' },
    { id: '7', title: 'Narmer Palette', era: '~3,100 BCE', recovered: true, category: 'Egyptian' },
    { id: '8', title: 'Bust of Nefertiti', era: '~1,345 BCE', recovered: false, category: 'Egyptian' },
];

export default function CollectionPage() {
    const [activeTab, setActiveTab] = useState('All');
    const [toastMessage, setToastMessage] = useState('');

    const filtered = mockCollection.filter(c => activeTab === 'All' || c.category === activeTab);

    const handlePress = (item: any) => {
        if (!item.recovered) {
            setToastMessage("Recover this artwork to reveal it.");
            setTimeout(() => setToastMessage(''), 3000);
        } else {
            console.log("Open artwork modal for", item.title);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#FDF6EC] font-sans">


            {/* Top Bar */}
            <div className="pt-11 px-5 pb-4 shrink-0 flex items-end justify-between">
                <h1 className="font-serif text-[22px] text-[#1A1008] font-bold leading-none">
                    My Collection
                </h1>
                <div className="bg-[#2a1c10]/10 px-3 py-1.5 rounded-full flex items-center">
                    <span className="text-[11px] font-bold text-[#C8920A]">8 / 49</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="shrink-0 overflow-x-auto no-scrollbar px-5 pb-4">
                <div className="flex gap-2">
                    {TABS.map(tab => {
                        const active = tab === activeTab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                                    active 
                                    ? 'bg-[#1A1008] text-[#F5C842]' 
                                    : 'bg-[#1A1008]/5 text-[#1A1008]/45'
                                }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 relative">
                <div className="grid grid-cols-2 gap-3 pb-8">
                    {filtered.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handlePress(item)}
                            className="text-left bg-[#FFFEF5] rounded-[14px] shadow-[0_3px_12px_rgba(26,16,8,0.1)] flex flex-col overflow-hidden active:scale-[0.98] transition-all"
                        >
                            {/* Image Area height: 90px */}
                            <div className="h-[90px] w-full bg-[#E5DCCF] relative flex items-center justify-center">
                                {item.recovered ? (
                                    <>
                                        {/* Mock image gradient for recovered artwork */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1008]/60 to-[#1A1008]/90 mix-blend-overlay" />
                                        <div className="absolute inset-0 bg-[#C8920A] opacity-20" />
                                        
                                        {/* Era Badge */}
                                        <div className="absolute top-2 left-2 bg-black/55 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                                            {item.category}
                                        </div>

                                        {/* Recovered Checkmark */}
                                        <div className="absolute top-2 right-2 w-[18px] h-[18px] bg-[#4CAF82] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Unrecovered dark gray placeholder */}
                                        <div className="absolute inset-0 bg-[#A0988E]" />
                                        <span className="text-4xl text-white/20 font-serif relative z-10 select-none">?</span>
                                    </>
                                )}
                            </div>

                            {/* Info Area */}
                            <div className="pt-2 pb-2.5 px-2.5 bg-[#FFFEF5]">
                                <h4 className="text-[10px] font-bold text-[#1A1008] truncate">
                                    {item.title}
                                </h4>
                                <p className="text-[9px] text-[#8C8C8C] mt-0.5 truncate">
                                    {item.era}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Toast */}
            {toastMessage && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-[#1A1008] border border-[#C8553A] text-[#FFFEF5] text-xs px-4 py-2 rounded-full shadow-xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 whitespace-nowrap">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
