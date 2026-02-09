import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from '../hub/BottomNav';

export default function Layout() {
    const location = useLocation();

    // Define routes where interaction/nav bars should be visible
    // For MVP, show nav on Hub, Profile, etc.
    // Hide on Game (/play), Login (/), Onboarding (/onboarding)
    const showNav = ['/hub', '/daily', '/rank', '/profile'].some(path => location.pathname.startsWith(path));

    return (
        <div className="min-h-screen bg-slate-50 flex flex-row">
            {/* Desktop Sidebar (System 1) - Only show if Nav should be visible */}
            {showNav && <Sidebar />}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen relative overflow-hidden">

                {/* Responsive Container: Full width on all devices */}
                <div className="flex-1 w-full bg-white relative flex flex-col overflow-hidden">

                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        <Outlet />
                    </div>

                    {/* Mobile Bottom Nav (System 2) - Hidden on desktop */}
                    <div className="md:hidden border-t border-slate-200">
                        {showNav && <BottomNav />}
                    </div>
                </div>
            </main>
        </div>
    );
}
