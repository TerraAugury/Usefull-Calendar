import { useState } from 'react'
import CategoryPill from '../components/CategoryPill'
import EmojiPickerDialog from '../components/EmojiPickerDialog'
import { getDefaultCategoryIcon } from '../data/sampleData'
import { useAppDispatch, useAppState } from '../state/AppState'
import { CATEGORY_COLORS } from '../utils/constants'
import { validateCategoryInput } from '../utils/validation'

export default function CategoriesScreen() {
  const { categories } = useAppState()
  const dispatch = useAppDispatch()
  const [values, setValues] = useState({
    name: '',
    color: CATEGORY_COLORS[0],
    icon: getDefaultCategoryIcon(),
  })
  const [errors, setErrors] = useState({})
  const [pickerOpen, setPickerOpen] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateCategoryInput(values, categories)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    dispatch({ type: 'ADD_CATEGORY', values })
    setValues({
      name: '',
      color: CATEGORY_COLORS[0],
      icon: getDefaultCategoryIcon(),
    })
    setErrors({})
  }

  return (
    <section className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Categories</h1>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="category-name">
            Name
          </label>
          <div className="category-name-row">
            <span className="icon-preview" aria-hidden="true">
              {values.icon}
            </span>
            <input
              id="category-name"
              type="text"
              value={values.name}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Category name"
            />
          </div>
          {errors.name ? <span className="form-error">{errors.name}</span> : null}
        </div>
        <div className="form-field">
          <span className="form-label">Icon</span>
          <div className="icon-picker-row">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setPickerOpen(true)}
            >
              Choose icon
            </button>
          </div>
          {errors.icon ? <span className="form-error">{errors.icon}</span> : null}
        </div>
        <div className="form-field">
          <span className="form-label">Color</span>
          <div className="chip-group">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-chip${values.color === color ? ' selected' : ''}`}
                style={{ background: `var(--c-${color})` }}
                onClick={() => setValues((prev) => ({ ...prev, color }))}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>
          {errors.color ? <span className="form-error">{errors.color}</span> : null}
        </div>
        <button className="btn btn-primary" type="submit">
          Add category
        </button>
      </form>

      <EmojiPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(icon) => {
          setValues((prev) => ({ ...prev, icon }))
          setPickerOpen(false)
        }}
      />

      <div className="agenda">
        {categories.map((category) => (
          <div
            key={category.id}
            className="appointment-card category-card"
            style={{ '--accent': `var(--c-${category.color})` }}
          >
            <div className="appointment-accent" />
            <div className="appointment-body">
              <h3 className="appointment-title">
                <span className="emoji-inline">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </span>
              </h3>
              <CategoryPill name={category.color} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
