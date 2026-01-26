import { db } from '../storage/dexieDb'

export async function resetStorage() {
  if (typeof indexedDB === 'undefined') return
  await db.delete()
}
