export default function AppointmentForm({
  values,
  errors,
  categories,
  onChange,
  onSubmit,
  submitLabel,
  submitDisabled = false,
  showTimeZone = false,
  timeZones = [],
  dateMin = '',
  startTimeMin = '',
  endTimeMin = '',
  timeDisabled = false,
  timeDisabledMessage = '',
  dateWarning = '',
  onCancel,
  showActions = true,
  formId,
}) {
  const handleSubmit = (event) => {
    event.preventDefault()
    if (submitDisabled) return
    onSubmit()
  }

  return (
    <form className="form" id={formId} onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="form-label" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Appointment title"
        />
        {errors.title ? <span className="form-error">{errors.title}</span> : null}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={values.date}
            onChange={(event) => onChange({ date: event.target.value })}
            min={dateMin || undefined}
          />
          {errors.date ? <span className="form-error">{errors.date}</span> : null}
          {!errors.date && dateWarning ? (
            <span className="form-error">{dateWarning}</span>
          ) : null}
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={values.categoryId}
            onChange={(event) => onChange({ categoryId: event.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon ? `${category.icon} ${category.name}` : category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? (
            <span className="form-error">{errors.categoryId}</span>
          ) : null}
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label" htmlFor="startTime">
            Start time
          </label>
          <input
            id="startTime"
            type="time"
            value={values.startTime}
            onChange={(event) => onChange({ startTime: event.target.value })}
            min={startTimeMin || undefined}
            disabled={timeDisabled}
          />
          {errors.startTime ? (
            <span className="form-error">{errors.startTime}</span>
          ) : null}
          {!errors.startTime && timeDisabledMessage ? (
            <span className="helper-text">{timeDisabledMessage}</span>
          ) : null}
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="endTime">
            End time
          </label>
          <input
            id="endTime"
            type="time"
            value={values.endTime}
            onChange={(event) => onChange({ endTime: event.target.value })}
            min={endTimeMin || undefined}
            disabled={timeDisabled}
          />
          {errors.endTime ? (
            <span className="form-error">{errors.endTime}</span>
          ) : null}
        </div>
      </div>

      {showTimeZone ? (
        <div className="form-field">
          <label className="form-label" htmlFor="timeZone">
            Timezone
          </label>
          <select
            id="timeZone"
            value={values.timeZone}
            onChange={(event) => onChange({ timeZone: event.target.value })}
          >
            <option value="">Select timezone</option>
            {timeZones.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
          {errors.timeZone ? (
            <span className="form-error">{errors.timeZone}</span>
          ) : null}
          <p className="helper-text">Time is stored in the selected timezone.</p>
        </div>
      ) : null}

      <div className="form-field">
        <label className="form-label" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={values.location}
          onChange={(event) => onChange({ location: event.target.value })}
          placeholder="Where is it?"
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          value={values.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="Extra details"
        />
      </div>

      {showActions ? (
        <div className="button-row">
          <button className="btn btn-primary" type="submit" disabled={submitDisabled}>
            {submitLabel}
          </button>
          {onCancel ? (
            <button className="btn btn-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
