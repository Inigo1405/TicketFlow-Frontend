/**
 * Returns Tailwind color classes for a given ticket status.
 * @param {string} status - 'open' | 'pending' | 'resolved' | 'closed'
 * @returns {{ bg: string, text: string, border: string }}
 */
export function getStatusColor(status) {
  const map = {
    open:     { bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-300' },
    pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-300' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
    closed:   { bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-300' },
  }
  return map[status] || map.closed
}

/**
 * Returns Tailwind color classes for a given ticket priority.
 * @param {string} priority - 'low' | 'medium' | 'high' | 'critical'
 * @returns {{ bg: string, text: string, border: string }}
 */
export function getPriorityColor(priority) {
  const map = {
    low:      { bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-300' },
    medium:   { bg: 'bg-indigo-100', text: 'text-indigo-700',  border: 'border-indigo-300' },
    high:     { bg: 'bg-amber-100',  text: 'text-amber-700',   border: 'border-amber-300' },
    critical: { bg: 'bg-red-100',    text: 'text-red-700',     border: 'border-red-300' },
  }
  return map[priority] || map.low
}
