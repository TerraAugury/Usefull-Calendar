import { applyImport, buildExport, parseImport } from '../storage/storage'

describe('import/export', () => {
  const state = {
    categories: [{ id: 'cat-1', name: 'General', color: 'blue', icon: '\u{1F5D3}\uFE0F' }],
    appointments: [
      {
        id: 'apt-1',
        title: 'Checkup',
        date: '2026-01-05',
        startTime: '10:00',
        endTime: '',
        categoryId: 'cat-1',
        location: '',
        notes: '',
        status: 'planned',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z',
        timeMode: 'timezone',
        timeZone: 'Europe/London',
        startUtcMs: Date.UTC(2026, 0, 5, 10, 0),
      },
    ],
    preferences: { theme: 'system', showPast: false, timeMode: 'timezone' },
    ui: {},
  }

  it('exports and parses valid data', () => {
    const exported = buildExport(state)
    const parsed = parseImport(exported)
    expect(parsed.categories).toHaveLength(1)
    expect(parsed.appointments).toHaveLength(1)
    expect(parsed.preferences.theme).toBe('system')
    expect(parsed.preferences.showPast).toBe(false)
    expect(parsed.categories[0].icon).toBe('\u{1F5D3}\uFE0F')
  })

  it('does not overwrite on invalid import', () => {
    const result = applyImport(state, '{bad json}')
    expect(result).toBe(state)
  })

  it('defaults icons when missing', () => {
    const legacy = JSON.stringify({
      categories: [{ id: 'cat-1', name: 'Work', color: 'indigo' }],
      appointments: [],
      preferences: { theme: 'system' },
    })
    const parsed = parseImport(legacy)
    expect(parsed.categories[0].icon).toBe('\u{1F4BC}')
    expect(parsed.preferences.showPast).toBe(false)
  })
})
