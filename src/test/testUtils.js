export async function resetStorage() {
  if (typeof indexedDB === 'undefined') return
  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('CalendarDB')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}
