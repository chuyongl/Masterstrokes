import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import SplashPage from './pages/SplashPage';
import WelcomePage from './pages/WelcomePage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import OnboardingFlowPage from './pages/OnboardingFlowPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ChallengePage from './pages/ChallengePage';
import DetectivePage from './pages/DetectivePage';
import ProfilePage from './pages/ProfilePage';
import GamePage from './pages/GamePage';
import LevelRoadmapPage from './pages/LevelRoadmapPage';
import ArtworkChapterPage from './pages/ArtworkChapterPage';
import CollectionPage from './pages/CollectionPage';
import CuratorPage from './pages/CuratorPage';

function RootRedirect() {
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    if (!hasOnboarded) {
        return <Navigate to="/splash" replace />;
    }
    return <Navigate to="/home" replace />;
}

function App() {
    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
                {/* ── Pre-auth flow (no Layout, no BottomNav) ──────────── */}
                <Route path="/splash" element={<SplashPage />} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/onboarding" element={<OnboardingFlowPage />} />

                {/* ── Admin ──────────────────────────────────────────── */}
                <Route path="/curator" element={<CuratorPage />} />

                {/* ── Main app (wrapped in Layout + BottomNav) ──────── */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<RootRedirect />} />
                    {/* Legacy redirect */}
                    <Route path="hub" element={<Navigate to="/home" replace />} />
                    <Route path="login" element={<Navigate to="/welcome" replace />} />

                    {/* 5 Main tab pages */}
                    <Route path="home" element={<HomePage />} />
                    <Route path="explore" element={<ExplorePage />} />
                    <Route path="challenge" element={<ChallengePage />} />
                    <Route path="detective" element={<DetectivePage />} />
                    <Route path="profile" element={<ProfilePage />} />

                    {/* Drill-down pages */}
                    <Route path="era/:eraId" element={<LevelRoadmapPage />} />
                    <Route path="artwork/:artworkId" element={<ArtworkChapterPage />} />
                    <Route path="collection" element={<CollectionPage />} />

                    {/* Game pages (BottomNav hidden via Layout logic) */}
                    <Route path="play/:artworkId/:chapterId" element={<GamePage />} />
                    <Route path="play/:levelId" element={<GamePage />} />
                    <Route path="play/tutorial" element={<GamePage />} />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
