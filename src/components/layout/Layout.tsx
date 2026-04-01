import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '../hub/BottomNav';

export default function Layout() {
    const location = useLocation();
    const p = location.pathname;

    // Pages where BottomNav is visible
    const showNav = ['/home', '/explore', '/challenge', '/detective', '/profile', '/era'].some(
        prefix => p === prefix || p.startsWith(prefix + '/')
    );

    // Dark pages: home, detective, era drill-down
    const isDark = p.startsWith('/home') || p.startsWith('/detective') || p.startsWith('/era/');

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                background: isDark
                    ? '#1C1B2E'
                    : 'linear-gradient(180deg, #F5F0FF 0%, #FAF5FF 50%, #FFFFFF 100%)',
                color: isDark ? '#fff' : '#1F2937',
            }}
        >
            <main className="flex-1 flex flex-col h-[100dvh] relative overflow-hidden">
                <div className="flex-1 w-full relative flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar relative w-full flex flex-col">
                    <Outlet />
                    </div>
                    {showNav && (
                        <div className="flex-none w-full relative z-50">
                            <BottomNav />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
