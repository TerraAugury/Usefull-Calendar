import { useEffect, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAppDispatch, useAppState } from '../state/hooks'
import { buildExport, checkStorageStatus, parseImport } from '../storage/storage'
import { getDefaultCategories, getSampleAppointments } from '../data/sampleData'
import { DEFAULT_PAX_STATE } from '../utils/pax'
import {
  buildFlightDedupKey,
  buildImportedFlight,
  collectFlightsForPax,
  dedupeImportedFlights,
  extractPaxNames,
  getTripImportStats,
} from '../utils/trip'
import { createId } from '../utils/id'
import { IconClose } from '../components/Icons'

export default function SettingsScreen() {
  const { categories, appointments, preferences, pax } = useAppState()
  const dispatch = useAppDispatch()
  const [importFile, setImportFile] = useState(null)
  const [importFileName, setImportFileName] = useState('')
  const [importError, setImportError] = useState('')
  const [pendingImport, setPendingImport] = useState(null)
  const [confirmImportOpen, setConfirmImportOpen] = useState(false)
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [confirmSampleOpen, setConfirmSampleOpen] = useState(false)
  const [tripError, setTripError] = useState('')
  const [pendingTrips, setPendingTrips] = useState(null)
  const [pendingPaxNames, setPendingPaxNames] = useState([])
  const [selectPaxOpen, setSelectPaxOpen] = useState(false)
  const importInputRef = useRef(null)
  const [storageStatus, setStorageStatus] = useState('checking')

  const paxState = pax ?? DEFAULT_PAX_STATE

  useEffect(() => {
    let active = true
    checkStorageStatus().then((result) => {
      if (active) {
        setStorageStatus(result.status)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const ensureFlightsCategory = (current) => {
    const existing = current.find(
      (category) => category.name.trim().toLowerCase() === 'flights',
    )
    if (existing) {
      return { categories: current, category: existing, added: false }
    }
    const flightsCategory = {
      id: createId('cat_'),
      name: 'Flights',
      color: 'teal',
      icon: '\u2708\uFE0F',
    }
    return {
      categories: [...current, flightsCategory],
      category: flightsCategory,
      added: true,
    }
  }

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

  const handleExport = async () => {
    try {
      const data = await buildExport()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'appointment-notebook.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 250)
      dispatch({ type: 'SET_TOAST', message: 'Export ready.' })
    } catch {
      dispatch({ type: 'SET_TOAST', message: 'Export failed.' })
    }
  }

  const resetImportSelection = () => {
    setImportFile(null)
    setImportFileName('')
    if (importInputRef.current) {
      importInputRef.current.value = ''
    }
  }

  const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result ?? '')
      reader.onerror = () => reject(new Error('File read failed'))
      reader.readAsText(file)
    })

  const handleImportFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const name = file.name.toLowerCase()
    const isJson = name.endsWith('.json') || file.type === 'application/json'
    if (!isJson) {
      setImportError('Please choose a .json file.')
      resetImportSelection()
      return
    }
    setImportError('')
    setImportFile(file)
    setImportFileName(file.name)
  }

  const handleImportCheck = async () => {
    if (!importFile) return
    try {
      const text = await readFileAsText(importFile)
      const safeText = typeof text === 'string' ? text : ''
      const parsed = parseImport(safeText)
      if (!parsed) {
        if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
          console.error('Import JSON invalid.', {
            length: safeText.length,
            preview: safeText.slice(0, 200),
          })
        }
        setImportError('Invalid JSON file. Nothing was imported.')
        dispatch({ type: 'SET_TOAST', message: 'Invalid JSON file.' })
        resetImportSelection()
        return
      }
      setImportError('')
      setPendingImport(parsed)
      setConfirmImportOpen(true)
    } catch {
      setImportError('Unable to read the JSON file.')
      dispatch({ type: 'SET_TOAST', message: 'Unable to read the JSON file.' })
      resetImportSelection()
    }
  }

  const handleTripFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    let parsed = null
    try {
      parsed = JSON.parse(text)
    } catch {
      setTripError('Invalid JSON file.')
      event.target.value = ''
      return
    }
    if (!Array.isArray(parsed)) {
      setTripError('Trip JSON must be an array of trips.')
      event.target.value = ''
      return
    }
    const paxNames = extractPaxNames(parsed)
    if (!paxNames.length) {
      const stats = getTripImportStats(parsed)
      setTripError(
        `No passengers found. Trips: ${stats.tripCount}, records: ${stats.recordCount}, flights recognized: ${stats.flightCount}.`,
      )
      event.target.value = ''
      return
    }
    setTripError('')
    setPendingTrips(parsed)
    setPendingPaxNames(paxNames)
    setSelectPaxOpen(true)
    event.target.value = ''
  }

  const handleImportTripsForPax = (paxName) => {
    if (!pendingTrips || !paxName) return
    const flightRecords = collectFlightsForPax(pendingTrips, paxName)
    const normalizedFlights = flightRecords
      .map((record) => buildImportedFlight(record, paxName))
      .filter(Boolean)

    const importedFlights = dedupeImportedFlights(
      normalizedFlights.map((item) => item.importedFlight),
    )
    const existingFlightKeys = new Set(
      appointments
        .filter((appointment) => appointment.source?.type === 'flight')
        .map(
          (appointment) =>
            `${appointment.source.paxName}__${appointment.date}__${appointment.source.flightNumber}`,
        ),
    )

    const { categories: nextCategories, category: flightsCategory } =
      ensureFlightsCategory(categories)

    let skipped = 0
    const newAppointments = []
    normalizedFlights.forEach((item) => {
      const key = buildFlightDedupKey(
        paxName,
        item.importedFlight.flightDate,
        item.importedFlight.flightNumber,
      )
      if (existingFlightKeys.has(key)) {
        skipped += 1
        return
      }
      existingFlightKeys.add(key)
      newAppointments.push({
        ...item.appointment,
        categoryId: flightsCategory.id,
      })
    })

    const existingFlights = paxState.paxLocations?.[paxName]?.flights ?? []
    const mergedFlights = dedupeImportedFlights([
      ...existingFlights,
      ...importedFlights,
    ])
    const nextPaxNames = Array.from(
      new Set([...paxState.paxNames, ...pendingPaxNames]),
    ).sort((a, b) => a.localeCompare(b))
    const nextPaxState = {
      selectedPaxName: paxName,
      paxNames: nextPaxNames,
      paxLocations: {
        ...paxState.paxLocations,
        [paxName]: { flights: mergedFlights },
      },
    }

    const toastMessage = `Imported ${newAppointments.length} new flights (${skipped} duplicates skipped) for ${paxName}.`
    dispatch({
      type: 'IMPORT_TRIP_FLIGHTS',
      values: {
        appointments: newAppointments,
        pax: nextPaxState,
        categories: nextCategories,
        toastMessage,
      },
    })
    dispatch({ type: 'SET_TAB', tab: 'calendar' })
    setSelectPaxOpen(false)
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
        <div className="detail-row">
          <span className="detail-label">Storage status</span>
          <span>
            {storageStatus === 'checking'
              ? 'Checking...'
              : storageStatus === 'ok'
                ? 'OK'
                : 'Limited'}
          </span>
        </div>
      </div>

      <div className="form-field">
        <span className="form-label">Export</span>
        <button className="btn btn-secondary" type="button" onClick={handleExport}>
          Export JSON
        </button>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="import-file">
          Import JSON
        </label>
        <input
          ref={importInputRef}
          id="import-file"
          className="sr-only"
          type="file"
          accept="application/json,.json"
          onChange={handleImportFileChange}
        />
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => importInputRef.current?.click()}
        >
          Choose JSON file...
        </button>
        {importFileName ? (
          <p className="helper-text">Selected: {importFileName}</p>
        ) : null}
        <p className="helper-text">Importing will overwrite your current data.</p>
        {importError ? <span className="form-error">{importError}</span> : null}
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleImportCheck}
          disabled={!importFile}
        >
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
        <label className="form-label" htmlFor="trip-import">
          Import Trip JSON
        </label>
        <input
          id="trip-import"
          type="file"
          accept="application/json"
          onChange={handleTripFile}
        />
        {tripError ? <span className="form-error">{tripError}</span> : null}
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
        onOpenChange={(open) => {
          setConfirmImportOpen(open)
          if (!open) {
            setPendingImport(null)
          }
        }}
        title="Overwrite all data?"
        description="Importing will overwrite your current data."
        confirmLabel="Overwrite"
        destructive
        onConfirm={() => {
          if (!pendingImport) return
          dispatch({ type: 'IMPORT_STATE', values: pendingImport })
          const appointmentCount = pendingImport.appointments.length
          const categoryCount = pendingImport.categories.length
          const paxCount = pendingImport.pax?.paxNames?.length ?? 0
          const paxText = paxCount ? `, ${paxCount} passengers` : ''
          dispatch({
            type: 'SET_TOAST',
            message: `Imported ${appointmentCount} appointments, ${categoryCount} categories${paxText}.`,
          })
          setConfirmImportOpen(false)
          resetImportSelection()
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
          const sampleAppointments = getSampleAppointments(sampleCategories, new Date(), {
            timeMode: preferences.timeMode,
          })
          dispatch({
            type: 'LOAD_SAMPLE_DATA',
            values: { categories: sampleCategories, appointments: sampleAppointments },
          })
          setConfirmSampleOpen(false)
        }}
      />

      <Dialog.Root
        open={selectPaxOpen}
        onOpenChange={(open) => {
          setSelectPaxOpen(open)
          if (!open) {
            setPendingTrips(null)
            setPendingPaxNames([])
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="sheet-content">
            <div className="dialog-header">
              <Dialog.Title className="dialog-title">Select passenger</Dialog.Title>
              <Dialog.Close asChild>
                <button className="icon-button" type="button" aria-label="Close pax selector">
                  <IconClose className="tab-icon" />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="dialog-description">
              Choose the passenger whose flights should be imported.
            </Dialog.Description>
            <div className="dialog-body">
              <div className="pax-list">
                {pendingPaxNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleImportTripsForPax(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  )
}
