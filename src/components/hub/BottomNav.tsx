import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    // Determine if current page is dark-themed
    const activeTab = NAV_ITEMS.find(t => currentPath === t.path || currentPath.startsWith(t.path + '/'));
    const isDark = activeTab?.dark ?? (currentPath.startsWith('/home') || currentPath.startsWith('/detective') || currentPath.startsWith('/era/') || currentPath.startsWith('/artwork/'));

    return (
        <nav
            className="w-full flex items-center justify-around h-14 flex-shrink-0 relative z-50"
            style={{
                background: isDark ? '#1C1B2E' : '#fff',
                borderTop: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
            }}
        >
            {NAV_ITEMS.map(tab => {
                const isActive = currentPath === tab.path
                    || currentPath.startsWith(tab.path + '/')
                    || (tab.id === 'home' && (currentPath.startsWith('/era/') || currentPath.startsWith('/artwork/')));

                return (
                    <button
                        key={tab.id}
                        className="flex flex-col items-center gap-[3px] flex-1 py-[5px] cursor-pointer"
                        onClick={() => navigate(tab.path)}
                    >
                        <span className="text-[17px] leading-none">{tab.emoji}</span>
                        <span
                            className="text-[8px] font-semibold tracking-[0.04em] uppercase"
                            style={{
                                color: isActive
                                    ? (isDark ? '#A78BFA' : '#7B2FF7')
                                    : (isDark ? 'rgba(255,255,255,0.28)' : '#A1A1AA'),
                            }}
                        >
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
