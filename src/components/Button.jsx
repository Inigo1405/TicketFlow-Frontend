/**
 * Componente Button reutilizable
 * @param {string} variant - 'primary', 'secondary', 'ghost', 'danger'
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {boolean} disabled - Estado disabled
 * @param {string} className - Clases adicionales
 * @param {React.ReactNode} children - Contenido
 * @param {object} props - Props HTML adicionales
 */
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...props
}) {
  // Clases por variante
  const variantClasses = {
    primary:   'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-500 font-semibold dark:bg-cyan-400 dark:text-zinc-900 dark:hover:bg-cyan-300 dark:focus:ring-cyan-400',
    secondary: 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 border border-zinc-300 focus:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:focus:ring-zinc-600',
    ghost:     'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 dark:focus:ring-zinc-600',
    danger:    'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 focus:ring-red-400 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 dark:border-red-800 dark:focus:ring-red-700',
  }

  // Clases por tamaño
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const buttonClass = `${variantClasses[variant]} ${sizeClasses[size]} font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed ${className}`

  return (
    <button
      className={buttonClass}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
