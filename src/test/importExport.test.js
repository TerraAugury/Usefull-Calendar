import { applyImport, buildExport, parseImport } from '../storage/storage'

describe('import/export', () => {
  const state = {
    categories: [{ id: 'cat-1', name: 'General', color: 'blue' }],
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
      },
    ],
    preferences: { theme: 'system' },
    ui: {},
  }

  it('exports and parses valid data', () => {
    const exported = buildExport(state)
    const parsed = parseImport(exported)
    expect(parsed.categories).toHaveLength(1)
    expect(parsed.appointments).toHaveLength(1)
    expect(parsed.preferences.theme).toBe('system')
  })

  it('does not overwrite on invalid import', () => {
    const result = applyImport(state, '{bad json}')
    expect(result).toBe(state)
  })
})
