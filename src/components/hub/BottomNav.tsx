import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const tabs = NAV_ITEMS;

    return (
        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 
                   flex justify-around items-center h-20 px-4 z-50
                   shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">

            {tabs.map(tab => {
                const isActive = tab.path === currentPath && tab.id === 'hub';

                return isActive ? (
                    /* HOME - 选中状态 */
                    <button key={tab.id} className="flex flex-col items-center gap-1 relative" onClick={() => navigate(tab.path)}>
                        <div className="bg-gradient-to-br from-blue-400 to-blue-600 
                                rounded-2xl px-6 py-2 shadow-lg
                                shadow-blue-400/30">
                            <tab.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs text-blue-600 font-semibold">{tab.label}</span>
                    </button>
                ) : (
                    /* OTHER - 未选中状态 */
                    <button key={tab.id} className="flex flex-col items-center gap-1" onClick={() => navigate(tab.path)}>
                        <tab.icon className="w-6 h-6 text-gray-400" />
                        <span className="text-xs text-gray-400">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
