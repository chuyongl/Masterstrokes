import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '../hub/BottomNav';

export default function Layout() {
    const location = useLocation();

    // Define routes where interaction/nav bars should be visible
    const showNav = ['/hub', '/map', '/collection', '/profile', '/era'].some(path => location.pathname.startsWith(path));

    return (
        <div className="min-h-screen bg-[#1A1008] text-[#FFFEF5] flex flex-row font-sans">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-[100dvh] relative overflow-hidden">
                {/* Responsive Container: Full width on all devices */}
                <div className="flex-1 w-full bg-transparent relative flex flex-col overflow-hidden">
                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative w-full">
                        <Outlet />
                    </div>

                    {/* Universal Bottom Nav (System 2) - Visible on all screens now */}
                    <div className="flex-none w-full shadow-[0_-4px_20px_rgba(0,0,0,0.3)] relative z-50">
                        {showNav && <BottomNav />}
                    </div>
                </div>
            </main>
        </div>
    );
}
