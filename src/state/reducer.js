import { DEFAULT_FILTERS, EMPTY_DRAFT } from '../utils/constants'
import { getDefaultCategories, getDefaultCategoryIcon } from '../data/sampleData'
import { createId } from '../utils/id'
import { DEFAULT_PAX_STATE } from '../utils/pax'

function buildDefaultCategories() {
  return getDefaultCategories()
}

function buildDraft(categories) {
  const fallbackId = categories[0]?.id ?? ''
  return { ...EMPTY_DRAFT, categoryId: fallbackId }
}

export function createInitialState() {
  const categories = buildDefaultCategories()
  const appointments = []
  const preferences = {
    theme: 'system',
    showPast: false,
    timeMode: 'timezone',
    calendarViewMode: 'agenda',
    calendarGridMode: 'month',
  }
  const pax = { ...DEFAULT_PAX_STATE, paxLocations: {} }
  return {
    categories,
    appointments,
    preferences,
    pax,
    ui: {
      tab: 'calendar',
      filters: { ...DEFAULT_FILTERS },
      addDraft: buildDraft(categories),
      toast: null,
      lastAddedId: null,
    },
  }
}

function ensureDraftCategory(draft, categories) {
  if (!draft.categoryId && categories[0]) {
    return { ...draft, categoryId: categories[0].id }
  }
  if (draft.categoryId && categories.some((cat) => cat.id === draft.categoryId)) {
    return draft
  }
  return { ...draft, categoryId: categories[0]?.id ?? '' }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, ui: { ...state.ui, tab: action.tab } }
    case 'HYDRATE_STATE': {
      const categories = action.values.categories ?? state.categories
      return {
        ...state,
        categories,
        appointments: action.values.appointments ?? state.appointments,
        preferences: action.values.preferences ?? state.preferences,
        pax: action.values.pax ?? state.pax,
        ui: {
          ...state.ui,
          addDraft: ensureDraftCategory(state.ui.addDraft, categories),
        },
      }
    }
    case 'SET_FILTERS':
      return {
        ...state,
        ui: { ...state.ui, filters: { ...state.ui.filters, ...action.filters } },
      }
    case 'RESET_FILTERS':
      return { ...state, ui: { ...state.ui, filters: { ...DEFAULT_FILTERS } } }
    case 'SET_ADD_DRAFT':
      return {
        ...state,
        ui: {
          ...state.ui,
          addDraft: ensureDraftCategory(
            { ...state.ui.addDraft, ...action.values },
            state.categories,
          ),
        },
      }
    case 'RESET_ADD_DRAFT':
      return {
        ...state,
        ui: { ...state.ui, addDraft: buildDraft(state.categories) },
      }
    case 'ADD_APPOINTMENT': {
      const now = new Date().toISOString()
      const newAppointment = {
        id: createId('apt_'),
        status: action.values.status ?? 'planned',
        createdAt: now,
        updatedAt: now,
        ...action.values,
      }
      return {
        ...state,
        appointments: [...state.appointments, newAppointment],
        ui: {
          ...state.ui,
          lastAddedId: newAppointment.id,
          toast: { message: 'Appointment added.', id: createId('toast_') },
        },
      }
    }
    case 'UPDATE_APPOINTMENT': {
      const now = new Date().toISOString()
      const appointments = state.appointments.map((appointment) =>
        appointment.id === action.id
          ? { ...appointment, ...action.values, updatedAt: now }
          : appointment,
      )
      return { ...state, appointments }
    }
    case 'DELETE_APPOINTMENT': {
      const appointments = state.appointments.filter(
        (appointment) => appointment.id !== action.id,
      )
      return { ...state, appointments }
    }
    case 'ADD_CATEGORY': {
      const newCategory = {
        id: createId('cat_'),
        name: action.values.name,
        color: action.values.color,
        icon: action.values.icon ?? getDefaultCategoryIcon(),
      }
      const categories = [...state.categories, newCategory]
      return {
        ...state,
        categories,
        ui: {
          ...state.ui,
          addDraft: ensureDraftCategory(state.ui.addDraft, categories),
        },
      }
    }
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.values, timeMode: 'timezone' },
      }
    case 'SET_PAX_STATE':
      return {
        ...state,
        pax: action.values,
      }
    case 'SET_TOAST':
      return {
        ...state,
        ui: { ...state.ui, toast: { message: action.message, id: createId('toast_') } },
      }
    case 'CLEAR_LAST_ADDED':
      return {
        ...state,
        ui: { ...state.ui, lastAddedId: null },
      }
    case 'CLEAR_TOAST':
      return { ...state, ui: { ...state.ui, toast: null } }
    case 'IMPORT_STATE': {
      const categories = action.values.categories
      return {
        ...state,
        categories,
        appointments: action.values.appointments,
        preferences: action.values.preferences,
        pax: action.values.pax ?? { ...DEFAULT_PAX_STATE, paxLocations: {} },
        ui: {
          ...state.ui,
          addDraft: buildDraft(categories),
          toast: { message: 'Import complete.', id: createId('toast_') },
        },
      }
    }
    case 'IMPORT_TRIP_FLIGHTS': {
      const now = new Date().toISOString()
      const newAppointments = action.values.appointments.map((appointment) => ({
        id: createId('apt_'),
        status: appointment.status ?? 'planned',
        createdAt: now,
        updatedAt: now,
        ...appointment,
      }))
      const categories = action.values.categories
      return {
        ...state,
        categories,
        appointments: [...state.appointments, ...newAppointments],
        pax: action.values.pax,
        ui: {
          ...state.ui,
          addDraft: ensureDraftCategory(state.ui.addDraft, categories),
          toast: {
            message: action.values.toastMessage,
            id: createId('toast_'),
          },
        },
      }
    }
    case 'LOAD_SAMPLE_DATA': {
      const categories = action.values.categories
      return {
        ...state,
        categories,
        appointments: action.values.appointments,
        preferences: state.preferences,
        pax: state.pax,
        ui: {
          ...state.ui,
          addDraft: buildDraft(categories),
          toast: { message: 'Sample data loaded.', id: createId('toast_') },
        },
      }
    }
    case 'RESET_ALL': {
      const categories = buildDefaultCategories()
      return {
        ...state,
        categories,
        appointments: [],
        preferences: {
          theme: 'system',
          showPast: false,
          timeMode: 'timezone',
          calendarViewMode: 'agenda',
          calendarGridMode: 'month',
        },
        pax: { ...DEFAULT_PAX_STATE, paxLocations: {} },
        ui: {
          tab: 'calendar',
          filters: { ...DEFAULT_FILTERS },
          addDraft: buildDraft(categories),
          toast: { message: 'All data cleared.', id: createId('toast_') },
          lastAddedId: null,
        },
      }
    }
    default:
      return state
  }
}
