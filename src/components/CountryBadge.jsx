import { formatCountryLabel } from '../utils/pax'
import { FLAG_SVGS } from '../data/flags.generated'

export default function CountryBadge({ country, className = '' }) {
  const { flag, label } = formatCountryLabel(country)
  if (!label) return null
  const code = typeof country?.countryCode === 'string'
    ? country.countryCode.trim().toUpperCase()
    : ''
  const svgSrc = code ? FLAG_SVGS[code] : ''
  const classes = ['countryBadge', className].filter(Boolean).join(' ')
  return (
    <span className={classes}>
      {svgSrc ? (
        <img className="countryBadge__flag" src={svgSrc} alt={`Flag of ${label}`} />
      ) : flag ? (
        <span className="countryBadge__flag" role="img" aria-label={`Flag of ${label}`}>
          {flag}
        </span>
      ) : null}
      <span className="countryBadge__name">{label}</span>
    </span>
  )
}
