import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const tabs = NAV_ITEMS;

    return (
        <nav className="w-full bg-[#F5C842] border-t-2 border-[#1A1008]/10 
                   flex justify-around items-center h-16 pb-1 z-50 relative">

            {tabs.map(tab => {
                const isActive = tab.path === currentPath && tab.id === 'hub';

                return (
                    <button 
                        key={tab.id} 
                        className={`flex flex-col items-center gap-1 cursor-pointer transition-opacity ${isActive ? 'opacity-100' : 'opacity-35 hover:opacity-75'}`}
                        onClick={() => navigate(tab.path)}
                    >
                        {/* We use the lucide-react icon directly */}
                        <div className={`mb-0.5 ${isActive ? 'scale-110 text-[#1A1008]' : 'text-[#1A1008]'}`}>
                            <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="text-[9px] font-bold text-[#1A1008] tracking-[0.5px] uppercase">
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
