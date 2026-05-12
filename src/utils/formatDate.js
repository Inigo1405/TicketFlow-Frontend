/**
 * Format a date string/ISO to a localized display string.
 * @param {string|Date} date
 * @param {'short'|'medium'|'long'} style
 * @returns {string}
 */
export function formatDate(date, style = 'short') {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'

  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: '2-digit', month: 'short', year: 'numeric' },
    long: { dateStyle: 'long', timeStyle: 'short' },
  }

  return d.toLocaleString('es-MX', options[style] || options.short)
}

/**
 * Format a date as a relative time string (e.g. "hace 3 horas").
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'

  const rtf = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })
  const diffMs = d.getTime() - Date.now()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second')
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour')
  return rtf.format(diffDay, 'day')
}
