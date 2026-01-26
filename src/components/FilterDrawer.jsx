import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import CalendarViewSwitcher from './CalendarViewSwitcher'
import { IconClose, IconMore } from './Icons'

export default function FilterDrawer({
  filters,
  categories,
  onChange,
  onReset,
  active,
  showPast,
  onToggleShowPast,
  mode = 'agenda',
  viewMode,
  gridMode,
  onViewModeChange,
  onGridModeChange,
  paxNames = [],
  selectedPaxName,
  onSelectPax,
  open: openProp,
  onOpenChange,
  focusOnPax = false,
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const paxSelectRef = useRef(null)
  const open = typeof openProp === 'boolean' ? openProp : internalOpen
  const setOpen = (next) => {
    if (onOpenChange) {
      onOpenChange(next)
    }
    if (typeof openProp !== 'boolean') {
      setInternalOpen(next)
    }
  }
  const showAgendaFields = mode === 'agenda'
  const showOptions = typeof onViewModeChange === 'function'
  const showPax = paxNames.length > 0 && typeof onSelectPax === 'function'

  useEffect(() => {
    if (open && focusOnPax && paxSelectRef.current) {
      paxSelectRef.current.focus()
    }
  }, [open, focusOnPax])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="icon-button" type="button" aria-label="More options">
          <IconMore className="tab-icon" />
          {active ? <span className="badge-dot" /> : null}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="drawer-content">
          <div className="drawer-header">
            <Dialog.Title className="dialog-title">Filters</Dialog.Title>
            <Dialog.Close asChild>
              <button className="icon-button" type="button" aria-label="Close filters">
                <IconClose className="tab-icon" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            {showAgendaFields
              ? 'Filter appointments by search, category, date range, and past visibility.'
              : 'Filter appointments by category and past visibility.'}
          </Dialog.Description>

          {showOptions ? (
            <div className="drawer-section">
              <div className="drawer-section__title">Calendar options</div>
              <CalendarViewSwitcher
                viewMode={viewMode}
                gridMode={gridMode}
                onViewModeChange={onViewModeChange}
                onGridModeChange={onGridModeChange}
              />
              {showPax ? (
                <div className="form-field">
                  <label className="form-label" htmlFor="pax-select">
                    Passenger
                  </label>
                  <select
                    id="pax-select"
                    ref={paxSelectRef}
                    value={selectedPaxName ?? ''}
                    onChange={(event) => onSelectPax(event.target.value)}
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
              {typeof onToggleShowPast === 'function' ? (
                <div className="form-field">
                  <span className="form-label">Past</span>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    aria-pressed={showPast}
                    aria-label="Past"
                    onClick={() => onToggleShowPast(!showPast)}
                  >
                    {showPast ? 'On' : 'Off'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {showAgendaFields ? (
            <div className="form-field">
              <label className="form-label" htmlFor="search">
                Search
              </label>
              <input
                id="search"
                type="search"
                value={filters.search}
                onChange={(event) => onChange({ search: event.target.value })}
                placeholder="Title, location, notes"
              />
            </div>
          ) : null}

          <div className="form-field">
            <label className="form-label" htmlFor="filter-category">
              Category
            </label>
            <select
              id="filter-category"
              value={filters.categoryId}
              onChange={(event) => onChange({ categoryId: event.target.value })}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon ? `${category.icon} ${category.name}` : category.name}
                </option>
              ))}
            </select>
          </div>

          {showAgendaFields ? (
            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="date-from">
                  From
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(event) => onChange({ dateFrom: event.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="date-to">
                  To
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(event) => onChange({ dateTo: event.target.value })}
                />
              </div>
            </div>
          ) : null}

          <button className="btn btn-secondary" type="button" onClick={onReset}>
            Reset filters
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
