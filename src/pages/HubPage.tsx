import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/hub/StatusBar';
import { ERAS } from '../config/eras';
import { ChevronRight } from 'lucide-react';

export default function HubPage() {
    const navigate = useNavigate();

    return (
        <div className="h-full flex flex-col bg-[#f8fafc] font-sans">
            <StatusBar />

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto relative bg-[#f8fafc] custom-scrollbar pb-20">
                <div className="py-8 px-6 max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                            Choose Your Era
                        </h1>
                        <p className="text-slate-600">
                            Explore masterpieces from different periods of art history
                        </p>
                    </div>

                    {/* Era Cards */}
                    <div className="space-y-4">
                        {ERAS.map((era) => (
                            <button
                                key={era.id}
                                onClick={() => navigate(`/era/${era.id}`)}
                                className="w-full bg-white rounded-2xl p-6 shadow-md hover:shadow-xl 
                                           transition-all active:scale-98 flex items-center gap-4 group"
                                style={{
                                    borderLeft: `6px solid ${era.color}`
                                }}
                            >
                                {/* Icon */}
                                <div
                                    className="text-5xl w-20 h-20 flex items-center justify-center rounded-xl"
                                    style={{
                                        backgroundColor: `${era.color}20`
                                    }}
                                >
                                    {era.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-left">
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                                        {era.name}
                                    </h3>
                                    <p className="text-slate-600 text-sm">
                                        {era.period}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <ChevronRight
                                    className="text-slate-400 group-hover:text-slate-600 
                                               group-hover:translate-x-1 transition-all"
                                    size={24}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Mascot */}
                    <div className="mt-12 text-center">
                        <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
                            🐌
                        </div>
                        <p className="text-slate-500 text-sm">
                            Take your time exploring each era!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
