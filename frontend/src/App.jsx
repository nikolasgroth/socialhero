import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useMission } from './contexts/MissionContext';

import OnboardingPage from './pages/OnboardingPage';
import RegisterPage from './pages/RegisterPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import SetupPage from './pages/SetupPage';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import FAQPage from './pages/FAQPage';
import AccountPage from './pages/AccountPage';
import DatenschutzPage from './pages/DatenschutzPage';
import ImpressumPage from './pages/ImpressumPage';
import NutzungsbedingungenPage from './pages/NutzungsbedingungenPage';
import LocationPermissionPage from './pages/LocationPermissionPage';

import TabBar from './components/TabBar';
import IncomingAlert from './components/IncomingAlert';
import { useLocationExplanation } from './contexts/LocationExplanationContext';
import { isNativePlatform } from './utils/capacitor';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { seen: locationExplanationSeen, setSeen: setLocationExplanationSeen } = useLocationExplanation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{
          width: 32, height: 32, border: '3px solid var(--primary)',
          borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/onboarding" replace />;

  if (isNativePlatform() && locationExplanationSeen === false) {
    return (
      <LocationPermissionPage
        onContinue={() => setLocationExplanationSeen(true)}
      />
    );
  }

  if (isNativePlatform() && locationExplanationSeen === null) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{
          width: 32, height: 32, border: '3px solid var(--primary)',
          borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return children;
}

export default function App() {
  const { isAuthenticated } = useAuth();
  const { toast, activeMission } = useMission();

  return (
    <>
      {/* Toast notification */}
      {toast && <div className="toast">{toast}</div>}

      {/* Incoming alert overlay */}
      {isAuthenticated && <IncomingAlert />}

      <Routes>
        {/* Public routes */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/nutzungsbedingungen" element={<NutzungsbedingungenPage />} />

        {/* Protected routes */}
        <Route path="/role-selection" element={<ProtectedRoute><RoleSelectionPage /></ProtectedRoute>} />
        <Route path="/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/faq" element={<ProtectedRoute><FAQPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Tab bar (only shown when logged in and no active mission) */}
      {isAuthenticated && !activeMission && <TabBar />}
    </>
  );
}
