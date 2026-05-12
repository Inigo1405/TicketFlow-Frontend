import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api.js'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import Toast from '../components/Toast.jsx'

function Alerts() {
  const [toast, setToast] = useState(null)
  const queryClient = useQueryClient()

  // Obtener notificaciones
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications')
      return response.data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // Marcar como leídas
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      await api.patch(`/notifications/${notificationId}/read`)
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Eliminar notificación
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      await api.delete(`/notifications/${notificationId}`)
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setToast({ type: 'success', message: 'Notificación eliminada' })
      setTimeout(() => setToast(null), 3000)
    },
  })

  // Marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/mark-all-read')
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setToast({ type: 'success', message: 'Todas las notificaciones marcadas como leídas' })
      setTimeout(() => setToast(null), 3000)
    },
  })

  // Filtrar no leídas
  const unreadNotifications = notifications?.filter((notif) => !notif.read) || []
  const readNotifications = notifications?.filter((notif) => notif.read) || []

  // Contadores
  const unreadCount = unreadNotifications.length
  const totalCount = notifications?.length || 0

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Notificaciones</h1>
          <p className="text-zinc-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} pendiente${unreadCount > 1 ? 's' : ''}`
              : 'No tienes notificaciones pendientes'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Actualizar'}
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || unreadCount === 0}
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-100 border border-zinc-200 border-l-4 border-l-cyan-500 dark:bg-zinc-900 dark:border-zinc-800 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Totales</p>
          <p className="text-4xl font-black text-cyan-600 dark:text-cyan-400 mt-2 leading-none">{totalCount}</p>
        </div>
        <div className="bg-zinc-100 border border-zinc-200 border-l-4 border-l-sky-500 dark:bg-zinc-900 dark:border-zinc-800 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pendientes</p>
          <p className="text-4xl font-black text-sky-600 dark:text-sky-400 mt-2 leading-none">{unreadCount}</p>
        </div>
        <div className="bg-zinc-100 border border-zinc-200 border-l-4 border-l-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:border-l-zinc-600 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Leídas</p>
          <p className="text-4xl font-black text-zinc-500 dark:text-zinc-400 mt-2 leading-none">{readNotifications.length}</p>
        </div>
      </div>

      {/* Notificaciones no leídas */}
      {unreadCount > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Pendientes</h2>
          <div className="space-y-2">
            {unreadNotifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white border-l-4 border-l-cyan-500 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge type={notif.type}>{notif.type}</Badge>
                        <span className="text-xs text-zinc-400 dark:text-zinc-600">
                          {new Date(notif.created_at).toLocaleString('es-MX', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                        {notif.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{notif.message}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(notif.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        {markAsReadMutation.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          'Leída'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotificationMutation.mutate(notif.id)}
                        disabled={deleteNotificationMutation.isPending}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notificaciones leídas */}
      {readNotifications.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-3">Leídas</h2>
          <div className="space-y-2">
            {readNotifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-zinc-50/80 border-l-4 border-l-zinc-300 border border-zinc-200 dark:bg-zinc-900/50 dark:border-l-zinc-700 dark:border-zinc-800 opacity-60"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge type={notif.type}>{notif.type}</Badge>
                        <span className="text-xs text-zinc-400 dark:text-zinc-600">
                          {new Date(notif.created_at).toLocaleString('es-MX', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        {notif.title}
                      </h3>
                      <p className="text-xs text-zinc-600">{notif.message}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotificationMutation.mutate(notif.id)}
                      disabled={deleteNotificationMutation.isPending}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado de carga */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Estado vacío */}
      {!isLoading && totalCount === 0 && (
        <div className="text-center py-12 bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <svg className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.865 5 9.914 5 13.159c0 1.311.226 2.595.638 3.732M15 17a5.979 5.979 0 00-.638-10.542M21 11a5.001 5.001 0 00-4.242-4.971V5a2 2 0 00-4 0v.341c-.76.342-1.457.99-1.843 1.722" />
          </svg>
          <h3 className="text-base font-semibold text-zinc-600 dark:text-zinc-300">No hay notificaciones</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Cuando reciba notificaciones, aparecerán aquí.
          </p>
        </div>
      )}
    </div>
  )
}

export default Alerts
