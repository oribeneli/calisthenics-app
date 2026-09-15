import { Navigate, Outlet } from 'react-router'
import { useProfile } from '../db/hooks'

/** Redirects to /onboarding until a local profile row exists. */
export function RequireOnboarded() {
  const { loading, profile } = useProfile()

  if (loading) return null

  if (!profile?.onboardedAt) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
