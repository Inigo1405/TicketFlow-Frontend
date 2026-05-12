import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import Table from '../components/Table.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import Toast from '../components/Toast.jsx'
import { TicketDetailModal, ConfirmCloseModal } from '../components/TicketModal.jsx'

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

function Dashboard() {
  const { user } = useAuth()
  const [filters, setFilters] = useState({ status: '', priority: '' })
  const [toast, setToast] = useState(null)
  // id of the ticket currently fading out (closing animation)
  const [closingId, setClosingId] = useState(null)
  // modal state
  const [detailTicket, setDetailTicket] = useState(null)   // ticket to show in detail modal
  const [confirmTicket, setConfirmTicket] = useState(null) // ticket pending confirmation to close

  const queryClient = useQueryClient()

  const { data: tickets, isLoading, error, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets')
      return response.data || []
    },
    refetchInterval: 30000,
  })

  const closeTicketMutation = useMutation({
    mutationFn: async (ticketId) => {
      await api.patch(`/tickets/${ticketId}/close`)
      return ticketId
    },
    onMutate: (ticketId) => {
      setClosingId(ticketId)
    },
    onSuccess: (ticketId) => {
      // Wait for fade animation then invalidate
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tickets'] })
        setClosingId(null)
        setConfirmTicket(null)
        setDetailTicket(null)
        setToast({ type: 'success', message: 'Ticket cerrado correctamente' })
      }, 450)
    },
    onError: () => {
      setClosingId(null)
      setToast({ type: 'error', message: 'No se pudo cerrar el ticket. Intenta de nuevo.' })
    },
  })

  const resolveTicketMutation = useMutation({
    mutationFn: async (ticketId) => {
      await api.patch(`/tickets/${ticketId}/resolve`)
      return ticketId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setDetailTicket(null)
      setToast({ type: 'success', message: 'Ticket marcado como resuelto' })
    },
    onError: () => {
      setToast({ type: 'error', message: 'No se pudo resolver el ticket. Intenta de nuevo.' })
    },
  })

  const editTicketMutation = useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const response = await api.patch(`/tickets/${id}`, fields)
      return response.data
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setDetailTicket((prev) => prev ? { ...prev, ...updated } : prev)
      setToast({ type: 'success', message: 'Cambios guardados' })
    },
    onError: () => {
      setToast({ type: 'error', message: 'No se pudieron guardar los cambios.' })
    },
  })

  const addReplyMutation = useMutation({
    mutationFn: async ({ ticketId, text }) => {
      const response = await api.post(`/tickets/${ticketId}/replies`, { text })
      return { ticketId, reply: response.data }
    },
    onSuccess: ({ ticketId, reply }) => {
      // Update detailTicket replies in-place so the thread updates immediately
      setDetailTicket((prev) =>
        prev?.id === ticketId ? { ...prev, replies: [...(prev.replies || []), reply] } : prev
      )
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: () => {
      setToast({ type: 'error', message: 'No se pudo enviar el mensaje.' })
    },
  })

  const handleCloseTicket = (ticket) => {
    setDetailTicket(null)
    setConfirmTicket(ticket)
  }

  const handleConfirmClose = () => {
    if (confirmTicket) closeTicketMutation.mutate(confirmTicket.id)
  }

  const filteredTickets = tickets?.filter((ticket) => {
    // Agente: only show tickets matching their area
    if (user?.role === 'Agente' && user?.area && ticket.category !== user.area) return false
    if (filters.status && ticket.status !== filters.status) return false
    if (filters.priority && ticket.priority !== filters.priority) return false
    return true
  })

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (ticket) => (
        <span className="font-mono text-xs text-zinc-500">#{String(ticket.id).padStart(4, '0')}</span>
      ),
    },
    {
      key: 'title',
      label: 'Título',
      render: (ticket) => (
        <div className="max-w-xs truncate">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{ticket.title}</span>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Prioridad',
      render: (ticket) => (
        <Badge type={ticket.priority}>{PRIORITY_LEVELS[ticket.priority]?.label || ticket.priority}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (ticket) => {
        const isBeingClosed = closingId === ticket.id
        return (
          <Badge type={isBeingClosed ? 'closed' : ticket.status}>
            {isBeingClosed ? 'Cerrando...' : (TICKET_TYPES[ticket.status]?.label || ticket.status)}
          </Badge>
        )
      },
    },
    {
      key: 'created_at',
      label: 'Fecha',
      render: (ticket) => (
        <span className="text-zinc-500 text-xs">
          {new Date(ticket.created_at).toLocaleDateString('es-MX', {
            day: '2-digit', month: '2-digit', year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (ticket) => {
        const isBeingClosed = closingId === ticket.id
        return (
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDetailTicket(ticket)}
            >
              Ver
            </Button>
            {ticket.status !== 'closed' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleCloseTicket(ticket)}
                disabled={isBeingClosed || closeTicketMutation.isPending}
              >
                {isBeingClosed ? <LoadingSpinner size="sm" /> : 'Cerrar'}
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const kpis = tickets?.reduce(
    (acc, ticket) => {
      acc.total++
      if (ticket.status === 'open') acc.open++
      if (ticket.status === 'resolved') acc.resolved++
      if (ticket.sla_breached) acc.sla_breached++
      return acc
    },
    { total: 0, open: 0, resolved: 0, sla_breached: 0 }
  ) || { total: 0, open: 0, resolved: 0, sla_breached: 0 }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Modales */}
      <TicketDetailModal
        ticket={detailTicket}
        onClose={() => setDetailTicket(null)}
        onCloseTicket={handleCloseTicket}
        isClosing={closeTicketMutation.isPending}
        onResolveTicket={(ticket) => resolveTicketMutation.mutate(ticket.id)}
        isResolving={resolveTicketMutation.isPending}
        onEditTicket={(fields) => editTicketMutation.mutate({ id: detailTicket.id, ...fields })}
        isEditing={editTicketMutation.isPending}
        onAddReply={(text) => addReplyMutation.mutate({ ticketId: detailTicket.id, text })}
        isAddingReply={addReplyMutation.isPending}
        currentUser={user}
      />
      <ConfirmCloseModal
        ticket={confirmTicket}
        onConfirm={handleConfirmClose}
        onCancel={() => setConfirmTicket(null)}
        isClosing={closeTicketMutation.isPending}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-100 border border-zinc-200 border-l-4 border-l-cyan-500 dark:bg-zinc-900 dark:border-zinc-800 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</p>
          <p className="text-4xl font-black text-cyan-600 dark:text-cyan-400 mt-2 leading-none">{kpis.total}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-2">tickets en el sistema</p>
        </div>
        <div className="bg-zinc-100 border border-zinc-200 border-l-4 border-l-sky-500 dark:bg-zinc-900 dark:border-zinc-800 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Abiertos</p>
          <p className="text-4xl font-black text-sky-600 dark:text-sky-400 mt-2 leading-none">{kpis.open}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-2">requieren atención</p>
        </div>
        <div className="bg-zinc-100 border border-zinc-200 border-l-4 border-l-emerald-500 dark:bg-zinc-900 dark:border-zinc-800 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Resueltos</p>
          <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2 leading-none">{kpis.resolved}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-2">completados</p>
        </div>
        <div className="bg-zinc-100 border border-zinc-200 border-l-4 border-l-red-500 dark:bg-zinc-900 dark:border-zinc-800 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">SLA Incumplido</p>
          <p className="text-4xl font-black text-red-600 dark:text-red-400 mt-2 leading-none">{kpis.sla_breached}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-2">fuera de plazo</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="status-filter" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Estado
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="open">Abierto</option>
            <option value="pending">Pendiente</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="priority-filter" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Prioridad
          </label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          >
            <option value="">Todas las prioridades</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : 'Actualizar'}
          </Button>
          <Link to="/create-ticket">
            <Button>
              + Nuevo Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Tickets</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-300 dark:bg-red-950/50 dark:border-red-800 p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 12c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-700 dark:text-red-300">Error al cargar tickets</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error.message}</p>
                <button onClick={() => refetch()} className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:text-red-800 dark:hover:text-red-300">
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <TicketTable
            columns={columns}
            data={filteredTickets}
            closingId={closingId}
          />
        )}
      </div>
    </div>
  )
}

// Table wrapper that applies per-row closing animation
function TicketTable({ columns, data, closingId }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <svg className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">No hay tickets</h3>
        <p className="mt-1 text-sm text-zinc-500">No se encontraron resultados con los filtros actuales.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-zinc-300 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-100 dark:bg-zinc-950">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
          {data.map((row, index) => {
            const isClosing = closingId === row.id
            const rowBg = isClosing
              ? 'opacity-40 bg-zinc-200 dark:bg-zinc-800'
              : row.status === 'closed'
                ? 'bg-red-50 dark:bg-red-950/20'
                : row.status === 'resolved'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            return (
              <tr
                key={row.id || index}
                className={`transition-all duration-400 ${rowBg}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 whitespace-nowrap text-sm text-zinc-300">
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Dashboard
