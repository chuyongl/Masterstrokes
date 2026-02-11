import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ERAS } from '../config/eras';

export default function EraSelectionPage() {
    const navigate = useNavigate();

    const handleEraClick = (eraId: string) => {
        navigate(`/era/${eraId}`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-sky-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

            {/* Header */}
            <div className="p-6 md:p-10 max-w-7xl mx-auto w-full relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white/50 backdrop-blur-sm border border-white/60 text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-md rounded-full transition-all duration-300 group"
                        >
                            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-sm animate-bounce-subtle border border-white/50">
                                🐌
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                                    Choose an Era
                                </h1>
                                <p className="text-slate-500 font-medium">
                                    Where would you like to start your journey?
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Era Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                    {ERAS.map((era, index) => (
                        <button
                            key={era.id}
                            onClick={() => handleEraClick(era.id)}
                            className="group relative flex flex-col h-full text-left transition-all duration-300 hover:-translate-y-2 outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 rounded-3xl"
                            style={{
                                animationDelay: `${index * 50}ms`,
                                animationName: 'fadeInUp',
                                animationDuration: '0.6s',
                                animationFillMode: 'both'
                            }}
                        >
                            {/* Card Background & Border */}
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:bg-white/80 group-hover:border-sky-200/50" />

                            {/* Content */}
                            <div className="relative p-6 z-10 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    {/* Icon Box */}
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                                        style={{ backgroundColor: `${era.color}20` }}
                                    >
                                        <span className="drop-shadow-sm">{era.icon}</span>
                                    </div>

                                    {/* Arrow Indicator */}
                                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                        <ArrowLeft size={16} className="rotate-180 text-sky-500" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-sky-700 transition-colors line-clamp-2">
                                    {era.name}
                                </h3>

                                <p className="text-sm font-medium text-slate-500 mb-6 flex-1">
                                    {era.period}
                                </p>

                                {/* Footer / Status */}
                                <div className="pt-4 border-t border-slate-100/50 flex items-center justify-between">
                                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100/50 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                                        Explorer
                                    </span>
                                </div>
                            </div>

                            {/* Decorative Blur */}
                            <div
                                className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
                                style={{ backgroundColor: era.color }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* CSS for FadeIn Animation */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
