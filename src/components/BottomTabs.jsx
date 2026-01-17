import { useAppDispatch, useAppState } from '../state/AppState'
import { IconCalendar, IconPlus, IconSettings, IconTag } from './Icons'

const tabs = [
  { id: 'calendar', label: 'Calendar', icon: IconCalendar },
  { id: 'add', label: 'Add', icon: IconPlus, isAdd: true, aria: 'Add appointment' },
  { id: 'categories', label: 'Categories', icon: IconTag },
  { id: 'settings', label: 'Settings', icon: IconSettings },
]

export default function BottomTabs() {
  const { ui } = useAppState()
  const dispatch = useAppDispatch()

  return (
    <nav className="tab-bar" aria-label="Primary navigation">
      {tabs.map((tab) => {
        const isActive = ui.tab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            className={`tab-item${isActive ? ' active' : ''}${tab.isAdd ? ' tab-add' : ''}`}
            onClick={() => dispatch({ type: 'SET_TAB', tab: tab.id })}
            type="button"
            aria-label={tab.aria ?? tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="tab-icon" />
            <span className="tab-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
