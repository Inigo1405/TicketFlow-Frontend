/**
 * Componente EmptyState para mostrar cuando no hay datos
 * @param {string} type - 'default', 'success', 'error'
 * @param {string} title - Título principal
 * @param {string} description - Descripción
 * @param {string} icon - Icono SVG (opcional)
 * @param {ReactNode} action - Acción/botón (opcional)
 */
function EmptyState({
  type = 'default',
  title = 'No hay datos',
  description = 'No se encontraron resultados',
  icon = null,
  action,
}) {
  // Clases por tipo
  const typeClasses = {
    default: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    error:   'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  }

  // Iconos por tipo
  const defaultIcons = {
    default: (
      <svg className="w-16 h-16 mx-auto text-zinc-400 dark:text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    success: (
      <svg className="w-16 h-16 mx-auto text-emerald-400 dark:text-emerald-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-16 h-16 mx-auto text-red-400 dark:text-red-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-16 h-16 mx-auto text-amber-400 dark:text-amber-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 12c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  }

  return (
    <div className={`text-center py-16 px-4 border border-zinc-200 dark:border-zinc-800 ${typeClasses[type]}`}>
      {icon || defaultIcons[type]}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm mb-6 opacity-80">{description}</p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
