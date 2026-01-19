import { useEffect, useMemo, useState } from 'react'
import AppointmentCard from '../components/AppointmentCard'
import CalendarViewSwitcher from '../components/CalendarViewSwitcher'
import CountryBadge from '../components/CountryBadge'
import DaySheet from '../components/DaySheet'
import DetailsDialog from '../components/DetailsDialog'
import EditDialog from '../components/EditDialog'
import FilterDrawer from '../components/FilterDrawer'
import MonthGrid from '../components/MonthGrid'
import WeekGrid from '../components/WeekGrid'
import { useAppDispatch, useAppState } from '../state/hooks'
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
  filterAppointmentsInWeek,
  getWeekRange,
} from '../utils/calendar'
import { formatDateLabel, formatDateYYYYMMDD, getTodayYYYYMMDD } from '../utils/dates'
import { DEFAULT_PAX_STATE, getPaxCountryForDate } from '../utils/pax'

export default function CalendarScreen() {
  const { appointments, categories, ui, preferences, pax } = useAppState()
  const dispatch = useAppDispatch()
  const [selectedId, setSelectedId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [calendarAnchor, setCalendarAnchor] = useState(() => new Date())
  const [daySheetDate, setDaySheetDate] = useState(null)

  const viewMode = preferences.calendarViewMode ?? 'agenda'
  const gridMode = preferences.calendarGridMode ?? 'month'
  const now = new Date()
  const nowMs = now.getTime()

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
  const timeMode = preferences.timeMode ?? 'timezone'
  const paxState = pax ?? DEFAULT_PAX_STATE
  const paxNames = paxState.paxNames ?? []
  const selectedPaxName = paxState.selectedPaxName
  const paxFlights = useMemo(() => {
    if (!selectedPaxName) return []
    return paxState.paxLocations?.[selectedPaxName]?.flights ?? []
  }, [paxState.paxLocations, selectedPaxName])
  const calendarTimeZone =
    timeMode === 'timezone'
      ? appointments.find((appointment) => appointment.timeZone)?.timeZone ??
        DEFAULT_TIME_ZONE
      : undefined
  const todayDateStr = getTodayYYYYMMDD({
    mode: timeMode,
    timeZone: calendarTimeZone,
    now,
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

  const countryForDate = useMemo(() => {
    if (!selectedPaxName || paxFlights.length === 0) {
      return null
    }
    const cache = new Map()
    return (dateStr) => {
      if (!dateStr) return null
      if (cache.has(dateStr)) return cache.get(dateStr)
      const country = getPaxCountryForDate(paxFlights, dateStr)
      cache.set(dateStr, country)
      return country
    }
  }, [paxFlights, selectedPaxName])

  const renderCountryBadge = (dateStr) => {
    const country = countryForDate ? countryForDate(dateStr) : null
    return country ? (
      <CountryBadge country={country} className="agenda-country" />
    ) : null
  }

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

  const weekRange = useMemo(
    () => getWeekRange(calendarAnchor, 1),
    [calendarAnchor],
  )
  const weekAppointments = useMemo(
    () =>
      filterAppointmentsInWeek({
        appointments: calendarFiltered,
        weekStartStr: weekRange.startStr,
        weekEndStr: weekRange.endStr,
        showPast,
        nowMs,
      }),
    [calendarFiltered, weekRange.startStr, weekRange.endStr, showPast, nowMs],
  )
  const weekAppointmentMap = useMemo(
    () => buildAppointmentDateMap(weekAppointments),
    [weekAppointments],
  )
  const weekGroups = useMemo(() => {
    return weekRange.days.reduce((acc, day) => {
      const dateStr = formatDateYYYYMMDD(day)
      const items = weekAppointmentMap.get(dateStr)
      if (items && items.length) {
        acc.push({ date: dateStr, items })
      }
      return acc
    }, [])
  }, [weekAppointmentMap, weekRange.days])

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
    const startLabel = weekRange.start.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    const endLabel = weekRange.end.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${startLabel} – ${endLabel}`
  }, [gridMode, weekRange.end, weekRange.start])

  const monthLabel = useMemo(() => {
    if (gridMode !== 'month') return ''
    const date = new Date(calendarAnchor.getFullYear(), calendarAnchor.getMonth(), 1)
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  }, [calendarAnchor, gridMode])

  const daySheetAppointments = daySheetDate
    ? appointmentMap.get(daySheetDate) ?? []
    : []
  const daySheetCountry =
    daySheetDate && countryForDate ? countryForDate(daySheetDate) : null

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
          onViewModeChange={(mode) => {
            if (mode !== 'calendar') {
              setDaySheetDate(null)
            }
            dispatch({
              type: 'SET_PREFERENCES',
              values: { calendarViewMode: mode },
            })
          }}
          onGridModeChange={(mode) =>
            dispatch({ type: 'SET_PREFERENCES', values: { calendarGridMode: mode } })
          }
        />
        {paxNames.length ? (
          <div className="pax-selector">
            <label className="form-label" htmlFor="pax-select">
              Passenger
            </label>
            <select
              id="pax-select"
              value={selectedPaxName ?? ''}
              onChange={(event) =>
                dispatch({
                  type: 'SET_PAX_STATE',
                  values: {
                    ...paxState,
                    selectedPaxName: event.target.value || null,
                  },
                })
              }
            >
              <option value="">Select passenger</option>
              {paxNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
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
                      <div className="agenda-date">
                        {formatDateLabel(group.date)}
                        {renderCountryBadge(group.date)}
                      </div>
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
                      <div className="agenda-date">
                        {formatDateLabel(group.date)}
                        {renderCountryBadge(group.date)}
                      </div>
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
                <div className="agenda-date">
                  {formatDateLabel(group.date)}
                  {renderCountryBadge(group.date)}
                </div>
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
                getCountryForDate={countryForDate}
                onSelectDate={(dateStr) => setDaySheetDate(dateStr)}
              />
          ) : (
            <>
              <WeekGrid
                anchorDate={calendarAnchor}
                appointmentsByDate={appointmentMap}
                categoriesById={categoriesById}
                todayDateStr={todayDateStr}
                showPast={showPast}
                getCountryForDate={countryForDate}
                onSelectDate={(dateStr) => setDaySheetDate(dateStr)}
              />
              <div className="week-agenda">
                <div className="section-label">Appointments this week</div>
                {weekGroups.length ? (
                  <div className="agenda">
                    {weekGroups.map((group) => (
                      <div key={group.date} className="agenda-group">
                        <div className="agenda-date">
                          {formatDateLabel(group.date)}
                          {renderCountryBadge(group.date)}
                        </div>
                        {group.items.map((appointment) => {
                          const category = categoriesById.get(appointment.categoryId)
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
                ) : (
                  <div className="empty-state">
                    <p>No appointments this week.</p>
                  </div>
                )}
              </div>
            </>
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
        country={daySheetCountry}
        appointments={daySheetAppointments}
        categoriesById={categoriesById}
        onSelectAppointment={(appointment) => {
          setSelectedId(appointment.id)
          setDetailsOpen(true)
          setDaySheetDate(null)
        }}
      />

      <EditDialog
        key={editingAppointment?.id ?? 'edit-dialog'}
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
        pax={paxState}
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
