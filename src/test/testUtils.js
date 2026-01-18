const STORAGE_KEYS = [
  'app_categories',
  'app_appointments',
  'app_preferences',
  'app_pax',
]

export function resetStorage() {
  STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
}
