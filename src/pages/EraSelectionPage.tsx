import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ERAS } from '../config/eras';

export default function EraSelectionPage() {
    const navigate = useNavigate();

    const handleEraClick = (eraId: string) => {
        navigate(`/era/${eraId}`);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    {/* Running Snail Mascot */}
                    <div className="flex items-center gap-3">
                        <div className="text-4xl animate-bounce-subtle">🐌</div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Choose an Era</h1>
                            <p className="text-slate-500">Where would you like to start your journey?</p>
                        </div>
                    </div>
                </div>

                {/* Era Grid - Responsive Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                    {ERAS.map((era) => (
                        <button
                            key={era.id}
                            onClick={() => handleEraClick(era.id)}
                            className="group relative bg-white rounded-2xl p-6 text-left border-2 border-slate-100 
                                     hover:border-sky-500 hover:shadow-xl hover:-translate-y-1 
                                     active:scale-98 transition-all duration-200 overflow-hidden"
                        >
                            {/* Card Decoration */}
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-8xl select-none">{era.icon}</span>
                            </div>

                            {/* Icon */}
                            <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-3xl mb-4 
                                          group-hover:bg-sky-100 group-hover:scale-110 transition-all duration-300">
                                {era.icon}
                            </div>

                            {/* Text */}
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-sky-600 transition-colors">
                                    {era.name}
                                </h3>
                                <p className="text-sm font-medium text-slate-500 mb-4">
                                    {era.period}
                                </p>

                                <div className="flex items-center text-sky-500 font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                    Start Journey →
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
