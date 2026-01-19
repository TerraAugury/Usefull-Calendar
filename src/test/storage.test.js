import { beforeEach, describe, expect, it } from 'vitest'
import { loadAppointmentsForDateRange, loadStoredData } from '../storage/storage'
import { getAllCategories, upsertCategoriesBatch, upsertAppointmentsBatch, setPreferencesBatch } from '../storage/db'
import { resetStorage } from './testUtils'
import { buildUtcFields } from '../utils/dates'

const hasIndexedDb = typeof indexedDB !== 'undefined'
const describeDb = hasIndexedDb ? describe : describe.skip

describeDb(
  hasIndexedDb ? 'storage normalization' : 'storage normalization (no indexedDB)',
  () => {
    beforeEach(async () => {
      await resetStorage()
    })

    it('adds default icon when missing and saves back', async () => {
      await upsertCategoriesBatch([
        { id: 'cat-1', name: 'Doctors', color: 'red' },
      ])
      await upsertAppointmentsBatch([])
      await setPreferencesBatch({ theme: 'system' })

      const data = await loadStoredData()
      expect(data.categories[0].icon).toBe('\u{1F3E5}')
      expect(data.preferences.showPast).toBe(false)
      expect(data.preferences.timeMode).toBe('timezone')
      expect(data.preferences.calendarViewMode).toBe('agenda')
      expect(data.preferences.calendarGridMode).toBe('month')
      expect(data.pax.selectedPaxName).toBe(null)

      const stored = await getAllCategories()
      expect(stored[0].icon).toBe('\u{1F3E5}')
    })

    it('loads appointments for a startUtcMs range in order', async () => {
      const categories = [
        { id: 'cat-1', name: 'Work', color: 'indigo', icon: '\u{1F4BC}' },
        { id: 'cat-2', name: 'General', color: 'blue', icon: '\u{1F5D3}\uFE0F' },
      ]
      await upsertCategoriesBatch(categories)

      const timeZone = 'Europe/London'
      const buildAppointment = (id, title, date, startTime, endTime, categoryId) => {
        const { startUtcMs, endUtcMs } = buildUtcFields({
          date,
          startTime,
          endTime,
          timeMode: 'timezone',
          timeZone,
        })
        return {
          id,
          title,
          date,
          startTime,
          endTime,
          categoryId,
          status: 'planned',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          timeMode: 'timezone',
          timeZone,
          timeZoneSource: 'manual',
          startUtcMs,
          endUtcMs,
        }
      }

      const first = buildAppointment(
        'apt-1',
        'First',
        '2026-01-10',
        '08:00',
        '08:30',
        'cat-1',
      )
      const second = buildAppointment(
        'apt-2',
        'Second',
        '2026-01-11',
        '10:00',
        '10:30',
        'cat-2',
      )
      const third = buildAppointment(
        'apt-3',
        'Third',
        '2026-01-12',
        '12:00',
        '12:30',
        'cat-1',
      )

      await upsertAppointmentsBatch([first, second, third])

      const results = await loadAppointmentsForDateRange(
        second.startUtcMs,
        third.startUtcMs,
      )
      expect(results.map((appointment) => appointment.id)).toEqual([
        'apt-2',
        'apt-3',
      ])
    })
  },
)
