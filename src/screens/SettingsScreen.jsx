import { useMemo, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAppDispatch, useAppState } from '../state/AppState'
import { buildExport, parseImport } from '../storage/storage'
import { getDefaultCategories, getSampleAppointments } from '../data/sampleData'

export default function SettingsScreen() {
  const { categories, appointments, preferences } = useAppState()
  const dispatch = useAppDispatch()
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [pendingImport, setPendingImport] = useState(null)
  const [confirmImportOpen, setConfirmImportOpen] = useState(false)
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [confirmSampleOpen, setConfirmSampleOpen] = useState(false)

  const canLoadSample = useMemo(() => {
    if (appointments.length > 0) return false
    const defaults = getDefaultCategories()
    if (categories.length !== defaults.length) return false
    const normalize = (items) =>
      items
        .map((item) => ({
          name: item.name.trim().toLowerCase(),
          color: item.color,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    const current = normalize(categories)
    const expected = normalize(defaults)
    return current.every(
      (item, index) =>
        item.name === expected[index].name && item.color === expected[index].color,
    )
  }, [appointments.length, categories])

  const handleExport = () => {
    const data = buildExport({ categories, appointments, preferences })
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'appointment-notebook.json'
    link.click()
    URL.revokeObjectURL(url)
    dispatch({ type: 'SET_TOAST', message: 'Export ready.' })
  }

  const handleImportCheck = () => {
    const parsed = parseImport(importText)
    if (!parsed) {
      setImportError('Invalid JSON. Nothing was imported.')
      return
    }
    setImportError('')
    setPendingImport(parsed)
    setConfirmImportOpen(true)
  }

  return (
    <section className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Settings</h1>
      </header>

      <div className="form-field">
        <label className="form-label" htmlFor="theme">
          Theme
        </label>
        <select
          id="theme"
          value={preferences.theme}
          onChange={(event) =>
            dispatch({ type: 'SET_PREFERENCES', values: { theme: event.target.value } })
          }
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="form-field">
        <span className="form-label">Export</span>
        <button className="btn btn-secondary" type="button" onClick={handleExport}>
          Export JSON
        </button>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="import">
          Import JSON
        </label>
        <textarea
          id="import"
          value={importText}
          onChange={(event) => {
            setImportText(event.target.value)
            if (importError) setImportError('')
          }}
          placeholder="Paste exported JSON here"
        />
        {importError ? <span className="form-error">{importError}</span> : null}
        <button className="btn btn-primary" type="button" onClick={handleImportCheck}>
          Import JSON
        </button>
      </div>

      <div className="form-field">
        <span className="form-label">Reset</span>
        <button
          className="btn btn-destructive"
          type="button"
          onClick={() => setConfirmResetOpen(true)}
        >
          Reset all data
        </button>
      </div>

      <div className="form-field">
        <span className="form-label">Sample data</span>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => setConfirmSampleOpen(true)}
          disabled={!canLoadSample}
        >
          Load sample data
        </button>
        {!canLoadSample ? (
          <p className="helper-text">Sample data can only be loaded into an empty app.</p>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmImportOpen}
        onOpenChange={setConfirmImportOpen}
        title="Overwrite all data?"
        description="Importing will replace current categories and appointments."
        confirmLabel="Overwrite"
        destructive
        onConfirm={() => {
          if (!pendingImport) return
          dispatch({ type: 'IMPORT_STATE', values: pendingImport })
          setConfirmImportOpen(false)
          setImportText('')
          setPendingImport(null)
        }}
      />

      <ConfirmDialog
        open={confirmResetOpen}
        onOpenChange={setConfirmResetOpen}
        title="Reset everything?"
        description="This clears all categories and appointments."
        confirmLabel="Reset"
        destructive
        onConfirm={() => {
          dispatch({ type: 'RESET_ALL' })
          setConfirmResetOpen(false)
        }}
      />

      <ConfirmDialog
        open={confirmSampleOpen}
        onOpenChange={setConfirmSampleOpen}
        title="Load sample data?"
        description="This adds sample categories and appointments for demo purposes."
        confirmLabel="Load sample data"
        onConfirm={() => {
          if (!canLoadSample) return
          const sampleCategories = getDefaultCategories()
          const sampleAppointments = getSampleAppointments(sampleCategories, new Date())
          dispatch({
            type: 'LOAD_SAMPLE_DATA',
            values: { categories: sampleCategories, appointments: sampleAppointments },
          })
          setConfirmSampleOpen(false)
        }}
      />
    </section>
  )
}
