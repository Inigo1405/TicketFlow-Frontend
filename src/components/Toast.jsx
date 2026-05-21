import { useEffect } from 'react'

/**
 * Componente Toast para notificaciones
 * @param {string} type - 'success', 'error', 'info', 'warning'
 * @param {string} message - Mensaje a mostrar
 * @param {function} onClose - Función para cerrar
 * @param {number} duration - Duración en ms (0 = sin auto-cierre)
 */
function Toast({ type = 'info', message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (!duration) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])
  // Clases por tipo
  const typeClasses = {
    success: 'bg-white border-emerald-400 text-emerald-700 dark:bg-zinc-900 dark:border-emerald-800 dark:text-emerald-300',
    error:   'bg-white border-red-400 text-red-700 dark:bg-zinc-900 dark:border-red-800 dark:text-red-300',
    warning: 'bg-white border-amber-400 text-amber-700 dark:bg-zinc-900 dark:border-amber-800 dark:text-amber-300',
    info:    'bg-white border-sky-400 text-sky-700 dark:bg-zinc-900 dark:border-sky-800 dark:text-sky-300',
  }

  // Iconos por tipo
  const iconClasses = {
    success: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L12 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 12c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-sm w-full p-4 border shadow-2xl shadow-black/50 animate-slide-in-right ${typeClasses[type]}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
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

export default Toast
