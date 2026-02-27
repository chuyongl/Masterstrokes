import { useNavigate } from 'react-router-dom';
import { ERAS } from '../config/eras';

export default function HubPage() {
    const navigate = useNavigate();

    return (
        <div className="h-full flex flex-col bg-[#1A1008] font-sans text-[#FFFEF5] overflow-hidden">


            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar pb-24">
                <div className="py-10 px-6 max-w-2xl mx-auto text-center flex flex-col items-center">
                    {/* Header matching HTML motif */}
                    <div className="mb-10 w-full">
                        <div className="text-[11px] tracking-[3px] uppercase text-[#F5C842] mb-2 font-bold">
                            MasterStroke · Exhibits
                        </div>
                        <h1 className="font-serif text-[28px] text-[#FFFEF5] mb-2 font-bold">
                            Museum Halls
                        </h1>
                        <p className="text-[13px] text-white/45">
                            Select an era to begin exploring its masterpieces
                        </p>
                    </div>

                    {/* Era Cards */}
                    <div className="w-full space-y-4">
                        {ERAS.map((era) => (
                            <button
                                key={era.id}
                                onClick={() => navigate(`/era/${era.id}`)}
                                className="w-full relative overflow-hidden bg-[#2a1c10] border border-[#F5C842]/20 rounded-2xl p-6 shadow-lg hover:-translate-y-1 transition-transform group text-left flex items-center gap-5"
                                style={{
                                    borderLeft: `4px solid ${era.color || '#F5C842'}`
                                }}
                            >
                                {/* Subtle background glow based on era color */}
                                <div 
                                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                                    style={{ background: `radial-gradient(circle at right, ${era.color || '#F5C842'}, transparent)` }}
                                />

                                {/* Icon */}
                                <div className="text-4xl w-16 h-16 flex items-center justify-center rounded-xl bg-[#1A1008] shadow-inner shrink-0">
                                    {era.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="font-serif text-xl font-bold text-[#F5C842] mb-1 group-hover:text-[#FBE88A] transition-colors">
                                        {era.name}
                                    </h3>
                                    <p className="text-[#FFFEF5]/60 text-xs font-bold uppercase tracking-wider">
                                        {era.period}
                                    </p>
                                </div>
                                
                                {/* Status or arrow */}
                                <div className="shrink-0 w-8 h-8 rounded-full border border-[#F5C842]/30 flex items-center justify-center text-[#F5C842] group-hover:bg-[#F5C842] group-hover:text-[#1A1008] transition-colors">
                                    →
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Mascot */}
                    <div className="mt-14 text-center">
                        <div className="text-5xl mb-3 animate-[idle-breathe_2.5s_ease-in-out_infinite]">
                            👵
                        </div>
                        <p className="text-white/40 text-xs font-bold tracking-wide uppercase">
                            Take your time exploring each hall!
                        </p>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes idle-breathe {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
            `}</style>
        </div>
    );
}
