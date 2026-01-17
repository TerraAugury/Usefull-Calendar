export default function CategoryPill({ name }) {
  return (
    <div className="category-pill">
      <span className="dot" aria-hidden="true" />
      <span className="category-pill__label" title={name}>
        {name}
      </span>
    </div>
  )
}
