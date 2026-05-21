/**
 * Componente Badge para mostrar etiquetas de estado, prioridad, etc.
 * @param {string} type - Tipo de badge: 'success', 'warning', 'error', 'info', 'priority', 'status'
 * @param {string} children - Contenido del badge
 * @param {object} props - Props adicionales (className, etc.)
 */
function Badge({ type = 'info', children, className = '', ...props }) {
  // Mapeo de tipos a clases de Tailwind
  const typeClasses = {
    success:  'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    warning:  'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    error:    'bg-red-100 text-red-700 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    info:     'bg-sky-100 text-sky-700 border border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
    priority: 'bg-violet-100 text-violet-700 border border-violet-300 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
    status:   'bg-zinc-200 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    open:     'bg-sky-100 text-sky-700 border border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
    resolved: 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    pending:  'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    closed:   'bg-zinc-200 text-zinc-500 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
    // Priority levels
    low:      'bg-zinc-200 text-zinc-500 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
    medium:   'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    high:     'bg-orange-100 text-orange-700 border border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    critical: 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  }

  const badgeClass = typeClasses[type] || typeClasses.info

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${badgeClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
