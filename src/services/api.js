import axios from 'axios'

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Almacenar request ID para trazabilidad (opcional)
let requestIdCounter = 0

// Interceptor de solicitud: agregar request_id y token
api.interceptors.request.use(
  (config) => {
    // Generar request_id único para cada solicitud
    config.headers['X-Request-ID'] = `req-${++requestIdCounter}`
    
    // Obtener token del localStorage
    const token = localStorage.getItem('token')
    
    // Agregar token a las cabeceras si existe
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuesta: manejo de errores global
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejo de errores específicos
    
    // Error 503: Servicio no disponible
    if (error.response?.status === 503) {
      console.error('Servicio no disponible')
      // El error ya fue manejado en el interceptor global
      return Promise.reject(error)
    }
    
    // Error 401: No autorizado - redirigir a login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(new Error('Sesión expirada. Por favor, inicie sesión.'))
    }
    
    // Error 403: No autorizado (acceso denegado)
    if (error.response?.status === 403) {
      return Promise.reject(new Error('No tiene permisos para acceder a este recurso.'))
    }
    
    // Error 404: No encontrado
    if (error.response?.status === 404) {
      return Promise.reject(new Error('Recurso no encontrado.'))
    }
    
    // Error 500-599: Errores del servidor
    if (error.response?.status >= 500) {
      return Promise.reject(
        new Error(`Error del servidor (${error.response.status}): ${error.response.data?.message || 'Intente más tarde'}`)
      )
    }
    
    // Error 422: Validación fallida
    if (error.response?.status === 422) {
      return Promise.reject(new Error(error.response.data?.message || 'Datos inválidos'))
    }
    
    // Error 429: Rate limiting
    if (error.response?.status === 429) {
      return Promise.reject(new Error('Demasiadas solicitudes. Por favor, espere un momento.'))
    }
    
    // Timeout (ECONNABORTED)
    if (error.code === 'ECONNABORTED') {
      console.error('Solicitud timeout')
      return Promise.reject(new Error('La solicitud tomó demasiado tiempo. Por favor, intente nuevamente.'))
    }
    
    // Error de red
    if (error.code === 'NETWORK' || error.message === 'Network Error') {
      console.error('Error de red')
      return Promise.reject(new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.'))
    }
    
    // Error genérico
    return Promise.reject(new Error(error.message || 'Ocurrió un error inesperado'))
  }
)

// ---------------------------------------------------------------------------
// Mock adapter — activo cuando VITE_MOCK_MODE=true (solo en desarrollo)
// ---------------------------------------------------------------------------
if (import.meta.env.VITE_MOCK_MODE === 'true') {
  // Top-level await is valid in Vite ES modules
  const { mockUsers, initialTickets, initialNotifications } = await import('../mocks/data.js')

  let _tickets = [...initialTickets]
  let _notifications = [...initialNotifications]
  let _nextId = 1011
  // Track which user is currently logged in (by email)
  let _currentUser = mockUsers[0]

  const delay = () => new Promise((r) => setTimeout(r, 200 + Math.random() * 150))
  const ok = (data, status = 200) => ({ data, status, statusText: 'OK', headers: {}, config: {} })

  const throwUnauthorized = () => {
    const err = new Error('Credenciales inválidas')
    err.response = { status: 401, data: { message: 'Credenciales inválidas' } }
    throw err
  }

  // Handlers estáticos por método + ruta exacta
  const staticHandlers = {
    get: {
      '/auth/me':       () => ok({ user: _currentUser }),
      '/tickets':       () => ok([..._tickets]),
      '/tickets/mine':  () => ok(_tickets.filter((t) => t.created_by === _currentUser.id)),
      '/notifications': () => ok([..._notifications]),
      '/health':        () => ok({ status: 'ok', checks: { db: true, redis: true, rabbitmq: true } }),
    },
    post: {
      '/auth/login': (_, body) => {
        if (!body?.email || !body?.password) throwUnauthorized()
        const found = mockUsers.find((u) => u.email === body.email)
        if (!found) throwUnauthorized()
        _currentUser = found
        return ok({ token: `mock-dev-token-${found.id}`, user: found })
      },
      '/tickets': (_, body) => {
        const t = { id: _nextId++, title: body.title, description: body.description || '',
          category: body.category || 'general', priority: body.priority || 'medium',
          status: 'open', created_at: new Date().toISOString(), sla_breached: false,
          created_by: _currentUser.id, replies: [] }
        _tickets = [t, ..._tickets]
        return ok(t, 201)
      },
    },
    patch: {
      '/notifications/mark-all-read': () => {
        _notifications = _notifications.map((n) => ({ ...n, read: true }))
        return ok({})
      },
    },
    delete: {},
    put: {},
  }

  // Handlers dinámicos (rutas con parámetros)
  const dynamicHandlers = {
    patch: [
      { re: /^\/tickets\/(\d+)\/close$/, fn: (url) => {
          const id = +url.match(/\/tickets\/(\d+)\//)[1]
          _tickets = _tickets.map((t) => t.id === id ? { ...t, status: 'closed' } : t)
          return ok({})
        },
      },
      { re: /^\/tickets\/(\d+)\/resolve$/, fn: (url) => {
          const id = +url.match(/\/tickets\/(\d+)\//)[1]
          _tickets = _tickets.map((t) => t.id === id ? { ...t, status: 'resolved' } : t)
          return ok({})
        },
      },
      { re: /^\/tickets\/(\d+)$/, fn: (url, body) => {
          const id = +url.match(/\/tickets\/(\d+)/)[1]
          _tickets = _tickets.map((t) => t.id === id ? { ...t, ...body } : t)
          return ok(_tickets.find((t) => t.id === id))
        },
      },
      { re: /^\/notifications\/(\d+)\/read$/, fn: (url) => {
          const id = +url.match(/\/notifications\/(\d+)\//)[1]
          _notifications = _notifications.map((n) => n.id === id ? { ...n, read: true } : n)
          return ok({})
        },
      },
    ],
    post: [
      { re: /^\/tickets\/(\d+)\/replies$/, fn: (url, body) => {
          const id = +url.match(/\/tickets\/(\d+)\//)[1]
          let _nextReplyId = 100
          const reply = { id: _nextReplyId++, author_id: _currentUser.id, author_name: _currentUser.name, text: body.text, created_at: new Date().toISOString() }
          _tickets = _tickets.map((t) => t.id === id ? { ...t, replies: [...(t.replies || []), reply] } : t)
          return ok(reply, 201)
        },
      },
      { re: /^\/notifications\/(\d+)\/read$/, fn: (url) => {
          const id = +url.match(/\/notifications\/(\d+)\//)[1]
          _notifications = _notifications.map((n) => n.id === id ? { ...n, read: true } : n)
          return ok({})
        },
      },
    ],
    delete: [
      { re: /^\/notifications\/(\d+)$/, fn: (url) => {
          const id = +url.match(/\/notifications\/(\d+)/)[1]
          _notifications = _notifications.filter((n) => n.id !== id)
          return ok({})
        },
      },
    ],
    get: [
      { re: /^\/tickets\/mine$/, fn: () => ok(_tickets.filter((t) => t.created_by === _currentUser.id)) },
      { re: /^\/tickets\/(?!mine)(\d+)$/, fn: (url) => {
          const id = +url.match(/\/tickets\/(\d+)/)[1]
          const t = _tickets.find((t) => t.id === id)
          return t ? ok(t) : (() => { const e = new Error('Not found'); e.response = { status: 404 }; throw e })()
        },
      },
      { re: /^\/tickets\/(\d+)\/replies$/, fn: (url) => {
          const id = +url.match(/\/tickets\/(\d+)\//)[1]
          const t = _tickets.find((t) => t.id === id)
          return ok(t?.replies || [])
        },
      },
    ],
    put: [],
  }

  const createMockMethod = (method) => async (url, dataOrConfig) => {
    await delay()
    const body = ['post', 'put', 'patch'].includes(method) ? dataOrConfig : undefined
    // Exact match
    const exact = staticHandlers[method]?.[url]
    if (exact) return exact(url, body)
    // Dynamic match
    for (const { re, fn } of dynamicHandlers[method] || []) {
      if (re.test(url)) return fn(url, body)
    }
    console.warn(`[Mock API] Sin handler: ${method.toUpperCase()} ${url}`)
    return ok({})
  }

  api.get    = createMockMethod('get')
  api.post   = createMockMethod('post')
  api.patch  = createMockMethod('patch')
  api.put    = createMockMethod('put')
  api.delete = createMockMethod('delete')

  console.info('[TicketFlow] Modo mock activo. Cuentas: demo@ticketflow.com / demo1234  |  carlos@ticketflow.com / agente1234  |  cliente@empresa.com / cliente1234')
}

// Exportar instancia de API
export default api
