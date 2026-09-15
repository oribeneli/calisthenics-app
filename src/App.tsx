import { HashRouter, Route, Routes } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { RequireOnboarded } from './components/RequireOnboarded'
import { ToastProvider } from './components/ui/Toast'
import { useThemeEffect } from './db/hooks'
import CheckinPage from './pages/CheckinPage'
import LadderPage from './pages/LadderPage'
import OnboardingPage from './pages/OnboardingPage'
import ProgramPage from './pages/ProgramPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'
import TodayPage from './pages/TodayPage'
import WhyPage from './pages/WhyPage'

function AppRoutes() {
  useThemeEffect()

  return (
    <AppShell>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<RequireOnboarded />}>
          <Route path="/" element={<TodayPage />} />
          <Route path="/checkin" element={<CheckinPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/program" element={<ProgramPage />} />
          <Route path="/program/why" element={<WhyPage />} />
          <Route path="/program/:ladderId" element={<LadderPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </HashRouter>
  )
}
