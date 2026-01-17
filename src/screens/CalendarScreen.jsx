import { useEffect, useMemo, useState } from 'react'
import AppointmentCard from '../components/AppointmentCard'
import DetailsDialog from '../components/DetailsDialog'
import EditDialog from '../components/EditDialog'
import FilterDrawer from '../components/FilterDrawer'
import { useAppDispatch, useAppState } from '../state/AppState'
import {
  applyFilters,
  areFiltersActive,
  groupByDate,
  splitAndSortAppointments,
} from '../utils/agenda'
import { formatDateLabel } from '../utils/dates'

export default function CalendarScreen() {
  const { appointments, categories, ui, preferences } = useAppState()
  const dispatch = useAppDispatch()
  const [selectedId, setSelectedId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

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
  const filtersActive = areFiltersActive(ui.filters)
  const showPast = preferences.showPast

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

  return (
    <section className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Calendar</h1>
        <FilterDrawer
          filters={ui.filters}
          categories={categories}
          onChange={(filters) => dispatch({ type: 'SET_FILTERS', filters })}
          onReset={() => dispatch({ type: 'RESET_FILTERS' })}
          active={filtersActive}
          showPast={showPast}
          onToggleShowPast={(value) =>
            dispatch({ type: 'SET_PREFERENCES', values: { showPast: value } })
          }
        />
      </header>

      {showEmpty ? (
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
      ) : (
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
      )}

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
