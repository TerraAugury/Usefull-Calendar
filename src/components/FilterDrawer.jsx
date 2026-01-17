import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { IconChevronDown, IconClose, IconMenu } from './Icons'

const sortOptions = [
  { value: 'date-asc', label: 'Date (asc)' },
  { value: 'date-desc', label: 'Date (desc)' },
  { value: 'category', label: 'Category' },
  { value: 'created', label: 'Created at' },
]

export default function FilterDrawer({ filters, categories, onChange, onReset, active }) {
  const [open, setOpen] = useState(false)
  const currentSort = sortOptions.find((option) => option.value === filters.sort)

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
                  {category.name}
                </option>
              ))}
            </select>
          </div>

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

          <div className="form-field">
            <span className="form-label">Sort</span>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="btn btn-secondary" type="button">
                  {currentSort?.label ?? 'Sort'}
                  <IconChevronDown className="tab-icon" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="menu-content" sideOffset={6}>
                  {sortOptions.map((option) => (
                    <DropdownMenu.Item
                      key={option.value}
                      className="menu-item"
                      onSelect={() => onChange({ sort: option.value })}
                    >
                      {option.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          <button className="btn btn-secondary" type="button" onClick={onReset}>
            Reset filters
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
