import { useState } from 'react'
import { useAppDispatch, useAppState } from '../state/AppState'
import { CATEGORY_COLORS } from '../utils/constants'
import { validateCategoryInput } from '../utils/validation'

export default function CategoriesScreen() {
  const { categories } = useAppState()
  const dispatch = useAppDispatch()
  const [values, setValues] = useState({ name: '', color: CATEGORY_COLORS[0] })
  const [errors, setErrors] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateCategoryInput(values, categories)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    dispatch({ type: 'ADD_CATEGORY', values })
    setValues({ name: '', color: CATEGORY_COLORS[0] })
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
          <input
            id="category-name"
            type="text"
            value={values.name}
            onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Category name"
          />
          {errors.name ? <span className="form-error">{errors.name}</span> : null}
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

      <div className="agenda">
        {categories.map((category) => (
          <div
            key={category.id}
            className="appointment-card category-card"
            style={{ '--accent': `var(--c-${category.color})` }}
          >
            <div className="appointment-accent" />
            <div className="appointment-body">
              <h3 className="appointment-title">{category.name}</h3>
              <div className="category-pill">
                <span className="dot" />
                <span>{category.color}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
