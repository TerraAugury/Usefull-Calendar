const STORAGE_KEYS = ['app_categories', 'app_appointments', 'app_preferences']

export function resetStorage() {
  STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
}
