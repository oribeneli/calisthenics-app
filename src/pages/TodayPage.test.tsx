import { render, screen, waitFor } from '@testing-library/react'
import { HashRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { seedFresh } from '../dev/seed'
import TodayPage from './TodayPage'

describe('TodayPage — state E (dashboard)', () => {
  it('renders the plan explanation and a Start session button for a freshly onboarded user', async () => {
    await seedFresh()

    render(
      <HashRouter>
        <TodayPage />
      </HashRouter>,
    )

    expect(
      await screen.findByText(/Week 0 is about finding your starting level/i),
    ).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /start session/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('20-second check-in')).toBeInTheDocument()
    })
  })
})
