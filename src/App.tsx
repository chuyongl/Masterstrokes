import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
// import LevelsPage from './pages/LevelsPage';
import GamePage from './pages/GamePage';
import EraSelectionPage from './pages/EraSelectionPage';
import LevelRoadmapPage from './pages/LevelRoadmapPage';
import OnboardingPage from './pages/OnboardingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LoginPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="hub" element={<EraSelectionPage />} />
          <Route path="era/:eraId" element={<LevelRoadmapPage />} />
          <Route path="play/:levelId" element={<GamePage />} />
          <Route path="play/tutorial" element={<GamePage />} /> {/* Map tutorial to GamePage (logic inside) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
