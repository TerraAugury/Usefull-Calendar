export function formatDateLabel(dateString) {
  if (!dateString) return ''
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTimeRange(startTime, endTime) {
  if (!startTime) return ''
  if (!endTime) return startTime
  return `${startTime} - ${endTime}`
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
