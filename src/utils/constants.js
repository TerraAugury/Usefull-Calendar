export const CATEGORY_COLORS = [
  'blue',
  'green',
  'orange',
  'red',
  'purple',
  'teal',
  'indigo',
  'pink',
  'yellow',
  'gray',
]

export const STATUS_OPTIONS = ['planned', 'done', 'cancelled']

export const TIME_MODES = ['local', 'timezone']
export const CALENDAR_VIEW_MODES = ['agenda', 'calendar']
export const CALENDAR_GRID_MODES = ['week', 'month']

export const TIMEZONE_OPTIONS = [
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Dublin', label: 'Europe/Dublin' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin' },
  { value: 'Europe/Zurich', label: 'Europe/Zurich' },
  { value: 'Europe/Rome', label: 'Europe/Rome' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid' },
  { value: 'Europe/Lisbon', label: 'Europe/Lisbon' },
  { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam' },
  { value: 'Europe/Brussels', label: 'Europe/Brussels' },
  { value: 'Europe/Vienna', label: 'Europe/Vienna' },
  { value: 'Europe/Prague', label: 'Europe/Prague' },
  { value: 'Europe/Warsaw', label: 'Europe/Warsaw' },
  { value: 'Europe/Stockholm', label: 'Europe/Stockholm' },
  { value: 'Europe/Oslo', label: 'Europe/Oslo' },
  { value: 'Europe/Copenhagen', label: 'Europe/Copenhagen' },
  { value: 'Europe/Helsinki', label: 'Europe/Helsinki' },
  { value: 'Europe/Athens', label: 'Europe/Athens' },
  { value: 'Asia/Nicosia', label: 'Cyprus (Nicosia) - Asia/Nicosia' },
  { value: 'Europe/Bucharest', label: 'Europe/Bucharest' },
  { value: 'Europe/Sofia', label: 'Europe/Sofia' },
  { value: 'Europe/Budapest', label: 'Europe/Budapest' },
  { value: 'Europe/Belgrade', label: 'Europe/Belgrade' },
  { value: 'Europe/Istanbul', label: 'Europe/Istanbul' },
]

export const DEFAULT_TIME_ZONE = 'Europe/London'

export const DEFAULT_FILTERS = {
  search: '',
  categoryId: 'all',
  dateFrom: '',
  dateTo: '',
}

export const EMPTY_DRAFT = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  categoryId: '',
  location: '',
  notes: '',
  timeZone: '',
}
