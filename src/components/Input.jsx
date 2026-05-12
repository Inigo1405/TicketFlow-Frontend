/**
 * Componente Input reutilizable con validación básica
 * @param {string} type - Tipo de input
 * @param {string} label - Label del input
 * @param {string} error - Mensaje de error
 * @param {object} props - Props HTML adicionales
 */
function Input({
  type = 'text',
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded
          text-zinc-900 placeholder-zinc-400 dark:text-zinc-100 dark:placeholder-zinc-500
          bg-white dark:bg-zinc-900
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
          disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-950 dark:disabled:text-zinc-600
          transition-colors
          ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-600 dark:focus:border-red-600' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
