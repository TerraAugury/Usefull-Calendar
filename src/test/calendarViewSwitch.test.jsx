import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { DEFAULT_FILTERS, DEFAULT_TIME_ZONE, EMPTY_DRAFT } from '../utils/constants'
import { buildUtcFields } from '../utils/dates'
import { renderWithState } from './renderUtils'

function buildState(overrides = {}) {
  const { preferences: preferenceOverrides, ...rest } = overrides
  const categories = [
    { id: 'cat-1', name: 'General', color: 'blue', icon: '\u{1F5D3}\uFE0F' },
  ]
  const addDraft = { ...EMPTY_DRAFT, categoryId: categories[0].id }
  return {
    categories,
    appointments: [],
    preferences: {
      theme: 'system',
      showPast: false,
      timeMode: 'timezone',
      calendarViewMode: 'agenda',
      calendarGridMode: 'month',
      ...preferenceOverrides,
    },
    ui: {
      tab: 'calendar',
      filters: { ...DEFAULT_FILTERS },
      addDraft,
      toast: null,
      lastAddedId: null,
    },
    ...rest,
  }
}

describe('Calendar view switcher', () => {
  const timeZone = DEFAULT_TIME_ZONE

  it('switches between agenda and calendar views', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 10, 9, 0, 0, 0))
    const user = userEvent.setup()
    const appointmentTime = buildUtcFields({
      date: '2026-01-11',
      startTime: '09:00',
      endTime: '',
      timeMode: 'timezone',
      timeZone,
    }).startUtcMs
    const { container } = await renderWithState(
      buildState({
        appointments: [
          {
            id: 'apt-1',
            title: 'Upcoming',
            date: '2026-01-11',
            startTime: '09:00',
            endTime: '',
            categoryId: 'cat-1',
            location: '',
            notes: '',
            status: 'planned',
            createdAt: '2026-01-01T08:00:00.000Z',
            updatedAt: '2026-01-01T08:00:00.000Z',
            timeMode: 'timezone',
            timeZone,
            timeZoneSource: 'manual',
            startUtcMs: appointmentTime,
          },
        ],
      }),
    )

    expect(container.querySelector('.agenda')).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByLabelText(/open filters/i))
    })
    const drawer = screen.getByRole('dialog', { name: 'Filters' })
    await act(async () => {
      await user.click(within(drawer).getByRole('button', { name: 'Calendar' }))
    })
    await act(async () => {
      await user.keyboard('{Escape}')
    })

    expect(container.querySelector('.calendar-grid')).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByLabelText(/open filters/i))
    })
    const drawerWeek = screen.getByRole('dialog', { name: 'Filters' })
    await act(async () => {
      await user.click(within(drawerWeek).getByRole('button', { name: 'Week' }))
    })
    await act(async () => {
      await user.keyboard('{Escape}')
    })

    expect(container.querySelector('.calendar-grid--week')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('opens a day sheet from the calendar grid', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 10, 9, 0, 0, 0))
    const user = userEvent.setup()
    const appointmentTime = buildUtcFields({
      date: '2026-01-10',
      startTime: '10:00',
      endTime: '',
      timeMode: 'timezone',
      timeZone,
    }).startUtcMs
    const state = buildState({
      appointments: [
        {
          id: 'apt-1',
          title: 'Team sync',
          date: '2026-01-10',
          startTime: '10:00',
          endTime: '',
          categoryId: 'cat-1',
          location: '',
          notes: '',
          status: 'planned',
          createdAt: '2026-01-01T08:00:00.000Z',
          updatedAt: '2026-01-01T08:00:00.000Z',
          timeMode: 'timezone',
          timeZone,
          timeZoneSource: 'manual',
          startUtcMs: appointmentTime,
        },
      ],
      preferences: { calendarViewMode: 'calendar', calendarGridMode: 'month' },
    })

    const { container } = await renderWithState(state)

    const dayButton = container.querySelector('[data-date="2026-01-10"]')
    expect(dayButton).toBeInTheDocument()

    await act(async () => {
      await user.click(dayButton)
    })

    expect(await screen.findByText('Team sync')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('shows a week agenda list and opens details from it', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 10, 9, 0, 0, 0))
    const user = userEvent.setup()
    const appointmentTime = buildUtcFields({
      date: '2026-01-10',
      startTime: '10:00',
      endTime: '',
      timeMode: 'timezone',
      timeZone,
    }).startUtcMs
    const state = buildState({
      appointments: [
        {
          id: 'apt-1',
          title: 'Team sync',
          date: '2026-01-10',
          startTime: '10:00',
          endTime: '',
          categoryId: 'cat-1',
          location: '',
          notes: '',
          status: 'planned',
          createdAt: '2026-01-01T08:00:00.000Z',
          updatedAt: '2026-01-01T08:00:00.000Z',
          timeMode: 'timezone',
          timeZone,
          timeZoneSource: 'manual',
          startUtcMs: appointmentTime,
        },
      ],
      preferences: { calendarViewMode: 'calendar', calendarGridMode: 'week' },
    })

    await renderWithState(state)

    expect(screen.getByText('Appointments this week')).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /team sync/i }))
    })

    expect(await screen.findByRole('dialog', { name: /team sync/i })).toBeVisible()
    vi.useRealTimers()
  })

  it('toggles past items in the week list', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 10, 9, 0, 0, 0)))
    const user = userEvent.setup()
    const pastTime = buildUtcFields({
      date: '2026-01-10',
      startTime: '08:00',
      endTime: '',
      timeMode: 'timezone',
      timeZone,
    }).startUtcMs
    const futureTime = buildUtcFields({
      date: '2026-01-10',
      startTime: '10:00',
      endTime: '',
      timeMode: 'timezone',
      timeZone,
    }).startUtcMs
    const state = buildState({
      appointments: [
        {
          id: 'apt-past',
          title: 'Past item',
          date: '2026-01-10',
          startTime: '08:00',
          endTime: '',
          categoryId: 'cat-1',
          location: '',
          notes: '',
          status: 'done',
          createdAt: '2026-01-01T08:00:00.000Z',
          updatedAt: '2026-01-01T08:00:00.000Z',
          timeMode: 'timezone',
          timeZone,
          timeZoneSource: 'manual',
          startUtcMs: pastTime,
        },
        {
          id: 'apt-future',
          title: 'Future item',
          date: '2026-01-10',
          startTime: '10:00',
          endTime: '',
          categoryId: 'cat-1',
          location: '',
          notes: '',
          status: 'planned',
          createdAt: '2026-01-01T08:00:00.000Z',
          updatedAt: '2026-01-01T08:00:00.000Z',
          timeMode: 'timezone',
          timeZone,
          timeZoneSource: 'manual',
          startUtcMs: futureTime,
        },
      ],
      preferences: { calendarViewMode: 'calendar', calendarGridMode: 'week' },
    })

    await renderWithState(state)

    expect(screen.queryByText('Past item')).toBeNull()
    expect(screen.getByText('Future item')).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByLabelText(/open filters/i))
    })
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /show past appointments/i }))
    })

    expect(await screen.findByText('Past item')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('hides past indicators until show past is enabled', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 10, 9, 0, 0, 0))
    const user = userEvent.setup()
    const pastTime = buildUtcFields({
      date: '2026-01-09',
      startTime: '09:00',
      endTime: '',
      timeMode: 'timezone',
      timeZone,
    }).startUtcMs
    const futureTime = buildUtcFields({
      date: '2026-01-11',
      startTime: '09:00',
      endTime: '',
      timeMode: 'timezone',
      timeZone,
    }).startUtcMs
    const state = buildState({
      appointments: [
        {
          id: 'apt-past',
          title: 'Past item',
          date: '2026-01-09',
          startTime: '09:00',
          endTime: '',
          categoryId: 'cat-1',
          location: '',
          notes: '',
          status: 'done',
          createdAt: '2026-01-01T08:00:00.000Z',
          updatedAt: '2026-01-01T08:00:00.000Z',
          timeMode: 'timezone',
          timeZone,
          timeZoneSource: 'manual',
          startUtcMs: pastTime,
        },
        {
          id: 'apt-future',
          title: 'Future item',
          date: '2026-01-11',
          startTime: '09:00',
          endTime: '',
          categoryId: 'cat-1',
          location: '',
          notes: '',
          status: 'planned',
          createdAt: '2026-01-01T08:00:00.000Z',
          updatedAt: '2026-01-01T08:00:00.000Z',
          timeMode: 'timezone',
          timeZone,
          timeZoneSource: 'manual',
          startUtcMs: futureTime,
        },
      ],
      preferences: { calendarViewMode: 'calendar', calendarGridMode: 'month' },
    })

    const { container } = await renderWithState(state)

    const pastDay = container.querySelector('[data-date="2026-01-09"]')
    expect(pastDay.querySelector('.calendar-dot')).toBeNull()

    await act(async () => {
      await user.click(screen.getByLabelText(/open filters/i))
    })
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /show past appointments/i }))
    })

    const pastDayAfter = container.querySelector('[data-date="2026-01-09"]')
    expect(pastDayAfter.querySelector('.calendar-dot')).not.toBeNull()
    vi.useRealTimers()
  })
})
