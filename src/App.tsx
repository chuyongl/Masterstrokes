import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import GamePage from './pages/GamePage';
import EraSelectionPage from './pages/EraSelectionPage'; // "Map" tab
import LevelRoadmapPage from './pages/LevelRoadmapPage'; // "Museum" tab
import CollectionPage from './pages/CollectionPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import CuratorPage from './pages/CuratorPage';

function RootRedirect() {
  const hasOnboarded = localStorage.getItem('hasOnboarded');
  if (!hasOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Navigate to="/hub" replace />; // Default starts at Hub (Museum)
}

function App() {
  return (
    <BrowserRouter basename="/Masterstrokes">
      <Routes>
        <Route path="/curator" element={<CuratorPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<RootRedirect />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          
          {/* Main Tabs (Layout will render BottomNav) */}
          <Route path="hub" element={<LevelRoadmapPage />} /> {/* 🏛 Museum Tab */}
          <Route path="map" element={<EraSelectionPage />} /> {/* 🗺 Map Tab */}
          <Route path="collection" element={<CollectionPage />} /> {/* 🖼 Collection Tab */}
          <Route path="profile" element={<ProfilePage />} /> {/* 👤 Profile Tab */}
          
          {/* Specific era override (if they navigate backwards) */}
          <Route path="era/:eraId" element={<LevelRoadmapPage />} />
          
          <Route path="play/:levelId" element={<GamePage />} />
          <Route path="play/tutorial" element={<GamePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
