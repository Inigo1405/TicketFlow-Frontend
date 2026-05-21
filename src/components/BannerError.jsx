/**
 * Componente BannerError para mostrar mensajes de error globales
 * @param {string} type - 'error', 'warning', 'info'
 * @param {string} message - Mensaje de error
 * @param {string} title - Título del banner (opcional)
 * @param {function} onClose - Función para cerrar
 * @param {number} duration - Duración en ms (opcional)
 */
function BannerError({
  type = 'error',
  message,
  title = 'Error',
  onClose,
  duration = 10000,
}) {
  // Clases por tipo
  const typeClasses = {
    error:   'bg-red-50 border-red-400 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300',
    warning: 'bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300',
    info:    'bg-sky-50 border-sky-400 text-sky-700 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-300',
    timeout: 'bg-violet-50 border-violet-400 text-violet-700 dark:bg-violet-950/50 dark:border-violet-800 dark:text-violet-300',
    network: 'bg-white border-zinc-300 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300',
  }

  // Iconos por tipo
  const iconClasses = {
    error: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 12c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 12c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    timeout: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    network: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  }

  // Determinar título por tipo
  const displayTitle = {
    error: title,
    warning: 'Advertencia',
    info: 'Información',
    timeout: 'Tiempo de espera agotado',
    network: 'Error de red',
  }[type]

  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-sm w-full p-4 rounded-lg border shadow-lg animate-slide-in-right ${typeClasses[type]}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-1">{displayTitle}</h3>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-3 text-current opacity-70 hover:opacity-100 focus:outline-none focus:opacity-100"
          aria-label="Cerrar notificación"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default BannerError
