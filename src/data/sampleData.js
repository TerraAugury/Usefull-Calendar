import { buildUtcFields } from '../utils/dates'

const ICONS = {
  general: '\u{1F5D3}\uFE0F',
  doctors: '\u{1F3E5}',
  house: '\u{1F3E0}',
  friends: '\u{1F465}',
  work: '\u{1F4BC}',
  default: '\u{1F3F7}\uFE0F',
}

const CATEGORY_SEED = [
  { id: 'cat_default_general', name: 'General', color: 'blue', icon: ICONS.general },
  { id: 'cat_default_doctors', name: 'Doctors', color: 'red', icon: ICONS.doctors },
  { id: 'cat_default_house', name: 'House', color: 'orange', icon: ICONS.house },
  { id: 'cat_default_friends', name: 'Friends', color: 'green', icon: ICONS.friends },
  { id: 'cat_default_work', name: 'Work', color: 'indigo', icon: ICONS.work },
]

const DEFAULT_CATEGORY_ICON = ICONS.default

export function getCategoryIconForName(name) {
  const normalized = name?.trim().toLowerCase()
  switch (normalized) {
    case 'general':
      return ICONS.general
    case 'doctors':
      return ICONS.doctors
    case 'house':
      return ICONS.house
    case 'friends':
      return ICONS.friends
    case 'work':
      return ICONS.work
    default:
      return DEFAULT_CATEGORY_ICON
  }
}

export function getDefaultCategoryIcon() {
  return DEFAULT_CATEGORY_ICON
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(base, offset) {
  const result = new Date(base)
  result.setDate(result.getDate() + offset)
  return result
}

function localISO(base, offset, time) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = addDays(base, offset)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

function findCategoryId(categories, name) {
  const match = categories.find(
    (category) => category.name.trim().toLowerCase() === name,
  )
  return match ? match.id : ''
}

export function getDefaultCategories() {
  return CATEGORY_SEED.map((category) => ({ ...category }))
}

export function getSampleAppointments(categories, now = new Date()) {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const date = (offset) => formatDate(addDays(base, offset))
  const createdAt = (offset, time) => localISO(base, offset, time)
  const timeMode = 'local'

  const generalId = findCategoryId(categories, 'general')
  const doctorsId = findCategoryId(categories, 'doctors')
  const houseId = findCategoryId(categories, 'house')
  const friendsId = findCategoryId(categories, 'friends')
  const workId = findCategoryId(categories, 'work')

  const items = [
    {
      id: 'apt_sample_01',
      title: 'Budget review',
      date: date(-14),
      startTime: '09:00',
      endTime: '10:00',
      categoryId: workId,
      location: 'HQ 3F',
      notes: 'Project milestone recap and open items.',
      status: 'done',
      createdAt: createdAt(-21, '10:00'),
      updatedAt: createdAt(-14, '11:00'),
    },
    {
      id: 'apt_sample_02',
      title: 'Clinic follow-up',
      date: date(-14),
      startTime: '10:30',
      endTime: '11:30',
      categoryId: doctorsId,
      location: 'Riverside clinic',
      notes: '',
      status: 'done',
      createdAt: createdAt(-20, '09:15'),
      updatedAt: createdAt(-14, '12:00'),
    },
    {
      id: 'apt_sample_03',
      title: 'House inspection',
      date: date(-7),
      startTime: '14:00',
      endTime: '15:00',
      categoryId: houseId,
      location: 'Main St',
      notes: 'Check roof leak near the patio.',
      status: 'cancelled',
      createdAt: createdAt(-10, '08:30'),
      updatedAt: createdAt(-7, '09:00'),
    },
    {
      id: 'apt_sample_04',
      title: 'Coffee with Maya',
      date: date(-2),
      startTime: '08:30',
      endTime: '09:30',
      categoryId: friendsId,
      location: 'Luna coffee bar',
      notes: 'Coffee meetup to catch up on travel plans.',
      status: 'done',
      createdAt: createdAt(-5, '10:00'),
      updatedAt: createdAt(-2, '11:00'),
    },
    {
      id: 'apt_sample_05',
      title: 'General errand run',
      date: date(-2),
      startTime: '11:00',
      endTime: '',
      categoryId: generalId,
      location: '',
      notes: 'Pick up supplies and return mail.',
      status: 'done',
      createdAt: createdAt(-3, '15:45'),
      updatedAt: createdAt(-2, '12:00'),
    },
    {
      id: 'apt_sample_06',
      title: 'Project sync - North Tower Renovation (phase 2)',
      date: date(0),
      startTime: '09:00',
      endTime: '10:30',
      categoryId: workId,
      location: 'Zoom',
      notes: 'Review timeline, risks, and staffing for the next project sprint.',
      status: 'planned',
      createdAt: createdAt(-1, '17:10'),
      updatedAt: createdAt(-1, '17:10'),
    },
    {
      id: 'apt_sample_07',
      title: 'Dentist checkup',
      date: date(0),
      startTime: '09:45',
      endTime: '10:15',
      categoryId: doctorsId,
      location: 'City clinic',
      notes: 'Bring insurance card.',
      status: 'planned',
      createdAt: createdAt(-1, '12:00'),
      updatedAt: createdAt(-1, '12:00'),
    },
    {
      id: 'apt_sample_08',
      title: 'Evening walk',
      date: date(0),
      startTime: '18:45',
      endTime: '',
      categoryId: generalId,
      location: 'River trail',
      notes: '',
      status: 'planned',
      createdAt: createdAt(0, '08:00'),
      updatedAt: createdAt(0, '08:00'),
    },
    {
      id: 'apt_sample_09',
      title: 'Coffee catch-up',
      date: date(1),
      startTime: '12:00',
      endTime: '13:00',
      categoryId: friendsId,
      location: 'Coffee District',
      notes: 'Quick coffee before the afternoon meeting.',
      status: 'planned',
      createdAt: createdAt(0, '16:30'),
      updatedAt: createdAt(0, '16:30'),
    },
    {
      id: 'apt_sample_10',
      title: 'Apartment maintenance',
      date: date(2),
      startTime: '16:00',
      endTime: '17:30',
      categoryId: houseId,
      location: 'Building 5',
      notes: '',
      status: 'planned',
      createdAt: createdAt(1, '09:00'),
      updatedAt: createdAt(1, '09:00'),
    },
    {
      id: 'apt_sample_11',
      title: 'Grocery restock',
      date: date(5),
      startTime: '08:00',
      endTime: '',
      categoryId: generalId,
      location: 'Market Hall',
      notes: 'Remember the clinic supplies list for the neighbor.',
      status: 'planned',
      createdAt: createdAt(2, '11:20'),
      updatedAt: createdAt(2, '11:20'),
    },
    {
      id: 'apt_sample_12',
      title: 'Team retro',
      date: date(5),
      startTime: '15:00',
      endTime: '16:00',
      categoryId: workId,
      location: 'HQ 2F',
      notes: 'Project wrap-up and next goals.',
      status: 'planned',
      createdAt: createdAt(3, '13:10'),
      updatedAt: createdAt(3, '13:10'),
    },
    {
      id: 'apt_sample_13',
      title: 'Pediatric visit',
      date: date(7),
      startTime: '11:30',
      endTime: '12:15',
      categoryId: doctorsId,
      location: 'Sunrise clinic',
      notes: '',
      status: 'planned',
      createdAt: createdAt(4, '09:00'),
      updatedAt: createdAt(4, '09:00'),
    },
    {
      id: 'apt_sample_14',
      title: 'Dinner party with friends',
      date: date(14),
      startTime: '19:00',
      endTime: '22:00',
      categoryId: friendsId,
      location: 'Apt 12B',
      notes:
        'Menu planning: appetizers, main course, and dessert. Ask guests about dietary preferences and seating.',
      status: 'planned',
      createdAt: createdAt(7, '10:30'),
      updatedAt: createdAt(7, '10:30'),
    },
    {
      id: 'apt_sample_15',
      title: 'Water heater check',
      date: date(14),
      startTime: '10:00',
      endTime: '11:00',
      categoryId: houseId,
      location: '',
      notes: 'Confirm warranty details and access with the building manager.',
      status: 'cancelled',
      createdAt: createdAt(6, '14:00'),
      updatedAt: createdAt(10, '09:00'),
    },
  ]

  return items.map((appointment) => {
    const { startUtcMs, endUtcMs } = buildUtcFields({
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      timeMode,
    })
    const next = { ...appointment, timeMode, startUtcMs }
    if (appointment.endTime) {
      next.endUtcMs = endUtcMs
    }
    return next
  })
}
