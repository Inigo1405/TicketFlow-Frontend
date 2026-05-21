/**
 * Maps API errors to user-friendly messages for display in the UI.
 * @param {Error} error - Axios error or generic Error
 * @returns {{ type: 'error'|'warning'|'timeout'|'network', message: string }}
 */
export function handleRequestError(error) {
  // Timeout
  if (error.code === 'ECONNABORTED') {
    return {
      type: 'timeout',
      message: 'La solicitud tomó demasiado tiempo. Verifique su conexión e intente de nuevo.',
    }
  }

  // Network error (no response received)
  if (!error.response) {
    return {
      type: 'network',
      message: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
    }
  }

  const status = error.response?.status

  if (status === 503) {
    return {
      type: 'warning',
      message: 'El servicio no está disponible en este momento. Intente más tarde.',
    }
  }

  if (status === 429) {
    return {
      type: 'warning',
      message: 'Demasiadas solicitudes. Espere un momento antes de intentar de nuevo.',
    }
  }

  if (status >= 500) {
    return {
      type: 'error',
      message: `Error del servidor (${status}). ${error.response?.data?.message || 'Intente más tarde.'}`,
    }
  }

  return {
    type: 'error',
    message: error.message || 'Ocurrió un error inesperado.',
  }
}
