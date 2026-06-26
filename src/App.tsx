import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import { OnboardingPage } from '@/features/auth/OnboardingPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { QRScanPage } from '@/features/qr/QRScanPage';
import { CheckInResultPage } from '@/features/qr/CheckInResultPage';
import { BadgesPage } from '@/features/badges/BadgesPage';
import { AdminPage } from '@/features/admin/AdminPage';
import { AppShell } from '@/components/layout/AppShell';
import { SplashScreen } from '@/components/ui/SplashScreen';

export default function App() {
  const { state } = useApp();

  if (state.loading) return <SplashScreen />;

  if (!state.user) {
    return (
      <Routes>
        <Route
          path='/onboarding'
          element={<OnboardingPage />}
        />
        <Route
          path='*'
          element={
            <Navigate
              to='/onboarding'
              replace
            />
          }
        />
      </Routes>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route
          path='/'
          element={<DashboardPage />}
        />
        <Route
          path='/scan'
          element={<QRScanPage />}
        />
        <Route
          path='/checkin/:dayId'
          element={<CheckInResultPage />}
        />
        <Route
          path='/badges'
          element={<BadgesPage />}
        />
        <Route
          path='/admin'
          element={<AdminPage />}
        />
        <Route
          path='*'
          element={
            <Navigate
              to='/'
              replace
            />
          }
        />
      </Routes>
    </AppShell>
  );
}
