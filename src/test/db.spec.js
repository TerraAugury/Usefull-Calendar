import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearAppointments,
  clearPax,
  clearPreferences,
  deleteAppointment,
  getAppointment,
  getAppointmentsByStartUtcMsRange,
  getAllAppointments,
  getAllPaxState,
  getAllPreferences,
  setPaxState,
  setPreference,
  upsertAppointment,
  upsertAppointmentsBatch,
} from '../storage/db'

const hasIndexedDb = typeof indexedDB !== 'undefined'
const describeDb = hasIndexedDb
  ? describe
  : describe.skip

async function deleteDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('CalendarDB')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}

describeDb(
  hasIndexedDb ? 'db' : 'db (indexedDB not available in test env)',
  () => {
    beforeEach(async () => {
      await deleteDb()
    })

    it('upserts, reads, and deletes an appointment', async () => {
      const appointment = {
        id: 'apt-1',
        title: 'Test',
        date: '2026-01-10',
        startTime: '09:00',
        categoryId: 'cat-1',
        startUtcMs: 1000,
      }

      await upsertAppointment(appointment)
      const stored = await getAppointment('apt-1')
      expect(stored).toEqual(appointment)

      await deleteAppointment('apt-1')
      const removed = await getAppointment('apt-1')
      expect(removed).toBeUndefined()
    })

    it('batch upserts appointments and queries by range', async () => {
      const appointments = [
        {
          id: 'apt-2',
          title: 'Early',
          date: '2026-01-10',
          startTime: '08:00',
          categoryId: 'cat-1',
          startUtcMs: 1000,
        },
        {
          id: 'apt-3',
          title: 'Mid',
          date: '2026-01-11',
          startTime: '10:00',
          categoryId: 'cat-2',
          startUtcMs: 2000,
        },
        {
          id: 'apt-4',
          title: 'Late',
          date: '2026-01-12',
          startTime: '12:00',
          categoryId: 'cat-3',
          startUtcMs: 3000,
        },
      ]

      await upsertAppointmentsBatch(appointments)
      const all = await getAllAppointments()
      expect(all).toHaveLength(3)

      const ranged = await getAppointmentsByStartUtcMsRange(1500, 3000)
      const ids = ranged.map((item) => item.id).sort()
      expect(ids).toEqual(['apt-3', 'apt-4'])
    })

    it('stores preferences and pax state', async () => {
      await setPreference('theme', 'dark')
      await setPreference('showPast', true)
      const prefs = await getAllPreferences()
      expect(prefs).toEqual({ theme: 'dark', showPast: true })

      await setPaxState('selectedPaxName', 'Alex')
      await setPaxState('paxNames', ['Alex', 'Jamie'])
      const pax = await getAllPaxState()
      expect(pax).toEqual({
        selectedPaxName: 'Alex',
        paxNames: ['Alex', 'Jamie'],
      })

      await clearPreferences()
      await clearPax()
      await clearAppointments()
    })
  },
)
