import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { IconClose, IconMenu } from './Icons'

export default function FilterDrawer({
  filters,
  categories,
  onChange,
  onReset,
  active,
  showPast,
  onToggleShowPast,
  mode = 'agenda',
}) {
  const [open, setOpen] = useState(false)
  const showAgendaFields = mode === 'agenda'

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="icon-button" type="button" aria-label="Open filters">
          <IconMenu className="tab-icon" />
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

          <div className="form-field">
            <span className="form-label">Past appointments</span>
            <button
              className="btn btn-secondary"
              type="button"
              aria-pressed={showPast}
              onClick={() => onToggleShowPast(!showPast)}
            >
              {showPast ? 'Hide past appointments' : 'Show past appointments'}
            </button>
          </div>

          <button className="btn btn-secondary" type="button" onClick={onReset}>
            Reset filters
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
