export default function CalendarViewSwitcher({
  viewMode,
  gridMode,
  onViewModeChange,
  onGridModeChange,
}) {
  return (
    <div className="calendar-view-switcher">
      <div className="segmented-control" role="group" aria-label="Calendar view">
        <button
          className={`segmented-button${viewMode === 'agenda' ? ' active' : ''}`}
          type="button"
          aria-pressed={viewMode === 'agenda'}
          onClick={() => onViewModeChange('agenda')}
        >
          Agenda
        </button>
        <button
          className={`segmented-button${viewMode === 'calendar' ? ' active' : ''}`}
          type="button"
          aria-pressed={viewMode === 'calendar'}
          onClick={() => onViewModeChange('calendar')}
        >
          Calendar
        </button>
      </div>
      {viewMode === 'calendar' ? (
        <div className="segmented-control" role="group" aria-label="Calendar layout">
          <button
            className={`segmented-button${gridMode === 'week' ? ' active' : ''}`}
            type="button"
            aria-pressed={gridMode === 'week'}
            onClick={() => onGridModeChange('week')}
          >
            Week
          </button>
          <button
            className={`segmented-button${gridMode === 'month' ? ' active' : ''}`}
            type="button"
            aria-pressed={gridMode === 'month'}
            onClick={() => onGridModeChange('month')}
          >
            Month
          </button>
        </div>
      ) : null}
    </div>
  )
}
