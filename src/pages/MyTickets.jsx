import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import Badge from '../components/Badge.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import BannerError from '../components/BannerError.jsx'
import { TicketDetailModal } from '../components/TicketModal.jsx'

const TICKET_TYPES = {
  open:     { label: 'Abierto' },
  pending:  { label: 'Pendiente' },
  resolved: { label: 'Resuelto' },
  closed:   { label: 'Cerrado' },
}

const PRIORITY_LEVELS = {
  low:      { label: 'Baja' },
  medium:   { label: 'Media' },
  high:     { label: 'Alta' },
  critical: { label: 'Crítica' },
}

const CATEGORY_LABELS = {
  general:   'General',
  technical: 'Técnico',
  billing:   'Facturación',
  access:    'Acceso',
  other:     'Otro',
}

function MyTickets() {
  const { user } = useAuth()
  const [detailTicket, setDetailTicket] = useState(null)

  const { data: tickets, isLoading, error, refetch } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets/mine')
      return response.data || []
    },
    refetchInterval: 30000,
  })

  return (
    <div className="space-y-6">
      <TicketDetailModal
        ticket={detailTicket}
        onClose={() => setDetailTicket(null)}
        currentUser={user}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Mis Tickets</h1>
          <p className="text-sm text-zinc-500 mt-1">Estado de tus solicitudes de soporte</p>
        </div>
        <Link
          to="/create-ticket"
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 dark:bg-cyan-400 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-cyan-600 dark:hover:bg-cyan-300 transition-colors"
        >
          + Nuevo ticket
        </Link>
      </div>

      {/* Error */}
      {error && (
        <BannerError message="No se pudieron cargar los tickets. Verifica tu conexión." onRetry={refetch} />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && tickets?.length === 0 && (
        <div className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 p-12 text-center">
          <div className="w-14 h-14 bg-zinc-100 border border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-200 mb-1">No tienes tickets aún</h3>
          <p className="text-sm text-zinc-500 mb-4">Crea un ticket para reportar un problema o solicitar ayuda.</p>
          <Link
            to="/create-ticket"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 dark:bg-cyan-400 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-cyan-600 dark:hover:bg-cyan-300 transition-colors"
          >
            Crear primer ticket
          </Link>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && tickets?.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-100 dark:bg-zinc-950">
              <tr>
                {['ID', 'Título', 'Categoría', 'Prioridad', 'Estado', 'Fecha', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
              {tickets.map((ticket) => {
                const rowBg =
                  ticket.status === 'closed'    ? 'bg-red-50 dark:bg-red-950/20' :
                  ticket.status === 'resolved'  ? 'bg-emerald-50 dark:bg-emerald-950/20' :
                  'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'

                return (
                  <tr key={ticket.id} className={`transition-colors ${rowBg}`}>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-500">
                      #{String(ticket.id).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{ticket.title}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                      {CATEGORY_LABELS[ticket.category] || ticket.category || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge type={ticket.priority}>{PRIORITY_LEVELS[ticket.priority]?.label || ticket.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge type={ticket.status}>{TICKET_TYPES[ticket.status]?.label || ticket.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(ticket.created_at).toLocaleDateString('es-MX', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetailTicket(ticket)}
                        className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors"
                      >
                        Ver seguimiento
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-zinc-100 border-t border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-400 dark:text-zinc-600">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTickets
