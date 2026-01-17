import { useEffect, useMemo, useState } from 'react'
import AppointmentCard from '../components/AppointmentCard'
import CalendarViewSwitcher from '../components/CalendarViewSwitcher'
import DaySheet from '../components/DaySheet'
import DetailsDialog from '../components/DetailsDialog'
import EditDialog from '../components/EditDialog'
import FilterDrawer from '../components/FilterDrawer'
import MonthGrid from '../components/MonthGrid'
import WeekGrid from '../components/WeekGrid'
import { useAppDispatch, useAppState } from '../state/AppState'
import {
  applyFilters,
  areFiltersActive,
  groupByDate,
  splitAndSortAppointments,
} from '../utils/agenda'
import { DEFAULT_TIME_ZONE } from '../utils/constants'
import {
  addDays,
  buildAppointmentDateMap,
  filterAppointmentsByDateVisibility,
  getWeekDays,
} from '../utils/calendar'
import { formatDateLabel, getTodayYYYYMMDD } from '../utils/dates'

export default function CalendarScreen() {
  const { appointments, categories, ui, preferences } = useAppState()
  const dispatch = useAppDispatch()
  const [selectedId, setSelectedId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [calendarAnchor, setCalendarAnchor] = useState(() => new Date())
  const [daySheetDate, setDaySheetDate] = useState(null)

  const viewMode = preferences.calendarViewMode ?? 'agenda'
  const gridMode = preferences.calendarGridMode ?? 'month'

  const filtered = useMemo(
    () => applyFilters(appointments, ui.filters),
    [appointments, ui.filters],
  )
  const { upcoming, past } = useMemo(
    () => splitAndSortAppointments(filtered),
    [filtered],
  )
  const upcomingGroups = useMemo(() => groupByDate(upcoming), [upcoming])
  const pastGroups = useMemo(() => groupByDate(past), [past])
  const filtersActive =
    viewMode === 'agenda'
      ? areFiltersActive(ui.filters)
      : ui.filters.categoryId !== 'all'
  const showPast = preferences.showPast
  const timeMode = preferences.timeMode ?? 'local'
  const calendarTimeZone =
    timeMode === 'timezone'
      ? appointments.find((appointment) => appointment.timeZone)?.timeZone ??
        DEFAULT_TIME_ZONE
      : undefined
  const todayDateStr = getTodayYYYYMMDD({
    mode: timeMode,
    timeZone: calendarTimeZone,
    now: new Date(),
  })

  const calendarFiltered = useMemo(() => {
    if (ui.filters.categoryId && ui.filters.categoryId !== 'all') {
      return appointments.filter(
        (appointment) => appointment.categoryId === ui.filters.categoryId,
      )
    }
    return appointments
  }, [appointments, ui.filters.categoryId])

  const calendarVisible = useMemo(
    () => filterAppointmentsByDateVisibility(calendarFiltered, todayDateStr, showPast),
    [calendarFiltered, todayDateStr, showPast],
  )
  const appointmentMap = useMemo(
    () => buildAppointmentDateMap(calendarVisible),
    [calendarVisible],
  )
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  useEffect(() => {
    if (viewMode !== 'calendar' && daySheetDate) {
      setDaySheetDate(null)
    }
  }, [viewMode, daySheetDate])

  useEffect(() => {
    if (!ui.lastAddedId) return
    const target = document.querySelector(
      `[data-appointment-id="${ui.lastAddedId}"]`,
    )
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    dispatch({ type: 'CLEAR_LAST_ADDED' })
  }, [ui.lastAddedId, upcomingGroups.length, dispatch])

  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedId)
  const selectedCategory = categories.find(
    (category) => category.id === selectedAppointment?.categoryId,
  )
  const editingAppointment = appointments.find((appointment) => appointment.id === editingId)

  const hasAppointments = appointments.length > 0
  const hasUpcoming = upcomingGroups.length > 0
  const hasPast = pastGroups.length > 0
  const showEmpty = !hasUpcoming && (!showPast || !hasPast)
  let emptyMessage = 'No appointments yet.'
  if (hasAppointments) {
    if (!showPast && filtered.length > 0 && !hasUpcoming && hasPast) {
      emptyMessage = 'No upcoming appointments match your filters.'
    } else {
      emptyMessage = 'No matching appointments.'
    }
  }

  const weekLabel = useMemo(() => {
    if (gridMode !== 'week') return ''
    const weekDays = getWeekDays(calendarAnchor, 1)
    if (weekDays.length !== 7) return ''
    const start = weekDays[0]
    const end = weekDays[6]
    const startLabel = start.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    const endLabel = end.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${startLabel} – ${endLabel}`
  }, [calendarAnchor, gridMode])

  const monthLabel = useMemo(() => {
    if (gridMode !== 'month') return ''
    const date = new Date(calendarAnchor.getFullYear(), calendarAnchor.getMonth(), 1)
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  }, [calendarAnchor, gridMode])

  const daySheetAppointments = daySheetDate
    ? appointmentMap.get(daySheetDate) ?? []
    : []

  return (
    <section className="screen">
      <header className="screen-header calendar-header">
        <div className="calendar-header__row">
          <h1 className="screen-title">Calendar</h1>
          <FilterDrawer
            filters={ui.filters}
            categories={categories}
            onChange={(filters) => dispatch({ type: 'SET_FILTERS', filters })}
            onReset={() => dispatch({ type: 'RESET_FILTERS' })}
            active={filtersActive}
            showPast={showPast}
            mode={viewMode}
            onToggleShowPast={(value) =>
              dispatch({ type: 'SET_PREFERENCES', values: { showPast: value } })
            }
          />
        </div>
        <CalendarViewSwitcher
          viewMode={viewMode}
          gridMode={gridMode}
          onViewModeChange={(mode) =>
            dispatch({ type: 'SET_PREFERENCES', values: { calendarViewMode: mode } })
          }
          onGridModeChange={(mode) =>
            dispatch({ type: 'SET_PREFERENCES', values: { calendarGridMode: mode } })
          }
        />
      </header>

      {viewMode === 'agenda' && showEmpty ? (
        <div className="empty-state">
          <p>{emptyMessage}</p>
          {hasAppointments ? (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            >
              Reset filters
            </button>
          ) : (
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => dispatch({ type: 'SET_TAB', tab: 'add' })}
            >
              Add your first appointment
            </button>
          )}
        </div>
      ) : null}

      {viewMode === 'agenda' && !showEmpty ? (
        <div className="agenda">
          {showPast ? (
            <>
              {upcomingGroups.length > 0 ? (
                <div className="agenda-section">
                  <div className="section-label">Upcoming</div>
                  {upcomingGroups.map((group) => (
                    <div key={group.date} className="agenda-group">
                      <div className="agenda-date">{formatDateLabel(group.date)}</div>
                      {group.items.map((appointment) => {
                        const category = categories.find(
                          (item) => item.id === appointment.categoryId,
                        )
                        return (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            category={category}
                            onClick={() => {
                              setSelectedId(appointment.id)
                              setDetailsOpen(true)
                            }}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              ) : null}
              {pastGroups.length > 0 ? (
                <div className="agenda-section">
                  <div className="section-label">Past</div>
                  {pastGroups.map((group) => (
                    <div key={group.date} className="agenda-group">
                      <div className="agenda-date">{formatDateLabel(group.date)}</div>
                      {group.items.map((appointment) => {
                        const category = categories.find(
                          (item) => item.id === appointment.categoryId,
                        )
                        return (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            category={category}
                            onClick={() => {
                              setSelectedId(appointment.id)
                              setDetailsOpen(true)
                            }}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            upcomingGroups.map((group) => (
              <div key={group.date} className="agenda-group">
                <div className="agenda-date">{formatDateLabel(group.date)}</div>
                {group.items.map((appointment) => {
                  const category = categories.find(
                    (item) => item.id === appointment.categoryId,
                  )
                  return (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      category={category}
                      onClick={() => {
                        setSelectedId(appointment.id)
                        setDetailsOpen(true)
                      }}
                    />
                  )
                })}
              </div>
            ))
          )}
        </div>
      ) : null}

      {viewMode === 'calendar' ? (
        <>
          <div className="calendar-nav">
            <div className="calendar-nav__title">
              {gridMode === 'month' ? monthLabel : weekLabel}
            </div>
            <div className="calendar-nav__actions">
              <button
                className="calendar-nav-button"
                type="button"
                onClick={() =>
                  setCalendarAnchor((prev) =>
                    gridMode === 'month'
                      ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                      : addDays(prev, -7),
                  )
                }
              >
                Prev
              </button>
              <button
                className="calendar-nav-button"
                type="button"
                onClick={() => setCalendarAnchor(new Date())}
              >
                Today
              </button>
              <button
                className="calendar-nav-button"
                type="button"
                onClick={() =>
                  setCalendarAnchor((prev) =>
                    gridMode === 'month'
                      ? new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                      : addDays(prev, 7),
                  )
                }
              >
                Next
              </button>
            </div>
          </div>

          {gridMode === 'month' ? (
            <MonthGrid
              year={calendarAnchor.getFullYear()}
              monthIndex={calendarAnchor.getMonth()}
              appointmentsByDate={appointmentMap}
              categoriesById={categoriesById}
              todayDateStr={todayDateStr}
              showPast={showPast}
              onSelectDate={(dateStr) => setDaySheetDate(dateStr)}
            />
          ) : (
            <WeekGrid
              anchorDate={calendarAnchor}
              appointmentsByDate={appointmentMap}
              categoriesById={categoriesById}
              todayDateStr={todayDateStr}
              showPast={showPast}
              onSelectDate={(dateStr) => setDaySheetDate(dateStr)}
            />
          )}
        </>
      ) : null}

      <DetailsDialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open)
          if (!open) setSelectedId(null)
        }}
        appointment={selectedAppointment}
        category={selectedCategory}
        onEdit={() => {
          setEditingId(selectedAppointment?.id ?? null)
          setDetailsOpen(false)
        }}
        onDelete={() => {
          if (selectedAppointment) {
            dispatch({ type: 'DELETE_APPOINTMENT', id: selectedAppointment.id })
          }
          setDetailsOpen(false)
          setSelectedId(null)
        }}
        onStatusChange={(status) => {
          if (!selectedAppointment) return
          dispatch({
            type: 'UPDATE_APPOINTMENT',
            id: selectedAppointment.id,
            values: { status },
          })
        }}
      />

      <DaySheet
        open={Boolean(daySheetDate)}
        onOpenChange={(open) => {
          if (!open) setDaySheetDate(null)
        }}
        date={daySheetDate}
        appointments={daySheetAppointments}
        categoriesById={categoriesById}
        onSelectAppointment={(appointment) => {
          setSelectedId(appointment.id)
          setDetailsOpen(true)
          setDaySheetDate(null)
        }}
      />

      <EditDialog
        open={Boolean(editingId)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingId(null)
            if (selectedAppointment) setDetailsOpen(true)
          }
        }}
        appointment={editingAppointment}
        categories={categories}
        preferences={preferences}
        onSave={(values) => {
          if (!editingAppointment) return
          dispatch({
            type: 'UPDATE_APPOINTMENT',
            id: editingAppointment.id,
            values,
          })
          setEditingId(null)
          setDetailsOpen(true)
        }}
        onCancel={() => {
          setEditingId(null)
          setDetailsOpen(true)
        }}
      />
    </section>
  )
}
