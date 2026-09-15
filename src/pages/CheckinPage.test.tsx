import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ToastProvider } from '../components/ui/Toast'
import { db } from '../db/db'
import { todayKey } from '../lib/dates'
import CheckinPage from './CheckinPage'

function renderCheckinPage() {
  return render(
    <MemoryRouter initialEntries={['/checkin']}>
      <ToastProvider>
        <Routes>
          <Route path="/checkin" element={<CheckinPage />} />
          <Route path="/" element={<div>Home screen</div>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  )
}

beforeEach(async () => {
  await Promise.all([db.checkins.clear(), db.habits.clear()])
})

describe('CheckinPage', () => {
  it('saves a new check-in for today and navigates home', async () => {
    renderCheckinPage()

    fireEvent.click(screen.getByRole('button', { name: /save check-in/i }))

    await waitFor(async () => {
      const row = await db.checkins.where('date').equals(todayKey()).first()
      expect(row).toBeDefined()
      expect(row?.sleepHours).toBe(7)
      expect(row?.weightKg).toBeUndefined()
    })
    await screen.findByText('Home screen')
  })

  it('logging weight includes it on save', async () => {
    renderCheckinPage()

    fireEvent.click(screen.getByRole('switch', { name: /log weight today/i }))
    fireEvent.click(screen.getByRole('button', { name: /save check-in/i }))

    await waitFor(async () => {
      const row = await db.checkins.where('date').equals(todayKey()).first()
      expect(row?.weightKg).toBe(80)
    })
  })

  it('loads an existing check-in for today and shows "Update"', async () => {
    const date = todayKey()
    await db.checkins.add({
      date,
      sleepHours: 6.5,
      sleepQuality: 4,
      mood: 5,
      soreness: 2,
      weightKg: 79.2,
    })

    renderCheckinPage()

    expect(await screen.findByRole('button', { name: 'Update' })).toBeInTheDocument()
    // The weight-hydration effect commits in a render after "existing" first
    // resolves, so this needs an async query rather than a synchronous one.
    expect(await screen.findByText(/79.2/)).toBeInTheDocument()
  })

  it('persists a habit toggle immediately to db.habits', async () => {
    renderCheckinPage()
    const date = todayKey()

    const habitToggle = await screen.findByRole('switch', { name: /protein at every meal/i })
    fireEvent.click(habitToggle)

    await waitFor(async () => {
      const row = await db.habits.where('[date+key]').equals([date, 'protein_each_meal']).first()
      expect(row?.done).toBe(true)
    })
  })
})
