import { describe, expect, it } from 'vitest'
import { buildUtcFields } from '../utils/dates'
import { parseImport } from '../storage/storage'

describe('import roundtrip', () => {
  it('parses minimal valid JSON and preserves key appointment fields', () => {
    const category = {
      id: 'cat-1',
      name: 'Work',
      color: 'indigo',
      icon: '\u{1F4BC}',
    }
    const { startUtcMs } = buildUtcFields({
      date: '2026-01-10',
      startTime: '09:00',
      endTime: '',
      timeMode: 'timezone',
      timeZone: 'Europe/London',
    })
    const appointment = {
      id: 'apt-1',
      title: 'Checkup',
      date: '2026-01-10',
      startTime: '09:00',
      endTime: '',
      categoryId: category.id,
      location: '',
      notes: '',
      status: 'planned',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
      timeMode: 'timezone',
      timeZone: 'Europe/London',
      timeZoneSource: 'manual',
      startUtcMs,
    }
    const payload = {
      categories: [category],
      appointments: [appointment],
      preferences: { theme: 'system' },
      pax: { selectedPaxName: null, paxNames: [], paxLocations: {} },
    }

    const parsed = parseImport(JSON.stringify(payload))
    expect(parsed).not.toBeNull()
    expect(parsed.categories[0].id).toBe(category.id)
    expect(parsed.appointments[0].id).toBe(appointment.id)
    expect(parsed.appointments[0].title).toBe(appointment.title)
    expect(parsed.appointments[0].date).toBe(appointment.date)
    expect(parsed.appointments[0].timeMode).toBe(appointment.timeMode)
    expect(parsed.appointments[0].startUtcMs).toBe(startUtcMs)
  })
})
