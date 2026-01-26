import Dexie from 'dexie'

export const db = new Dexie('CalendarDB')

db.version(1).stores({
  appointments: 'id,startUtcMs,date,categoryId',
  categories: 'id',
  preferences: 'key',
  pax: 'key',
})
