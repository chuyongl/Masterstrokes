import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';
import clsx from 'clsx';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200 p-6">
            {/* Logo / Mascot Area */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 flex items-center justify-center text-2xl">
                    🐌
                </div>
                <h1 className="text-xl font-bold text-sky-500 tracking-tight">Masterstrokes</h1>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-2 flex-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.path === currentPath && item.id === 'hub'; // simple active check

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={clsx(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-bold uppercase tracking-wide text-sm",
                                isActive
                                    ? "bg-sky-50 text-sky-500 border-2 border-sky-100"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 border-2 border-transparent"
                            )}
                        >
                            <item.icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Desktop Footer / User Profile Summary could go here */}
        </aside>
    );
}
