/**
 * Componente LoadingSpinner
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {string} className - Clases adicionales
 */
function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-cyan-400 ${sizeClasses[size]} ${className}`} />
  )
}

export default LoadingSpinner
