import { useEffect, useState, useRef } from 'react'
import Badge from './Badge.jsx'
import Button from './Button.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'

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

// ---------------------------------------------------------------------------
// TicketDetailModal — shows full ticket info
// ---------------------------------------------------------------------------
export function TicketDetailModal({
  ticket, onClose, onCloseTicket, isClosing,
  onResolveTicket, isResolving,
  onEditTicket, isEditing,
  onAddReply, isAddingReply,
  currentUser,
}) {
  const [replyText, setReplyText] = useState('')
  const [editPriority, setEditPriority] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editDirty, setEditDirty] = useState(false)
  const repliesEndRef = useRef(null)

  // Sync edit fields when ticket changes
  useEffect(() => {
    if (ticket) {
      setEditPriority(ticket.priority || 'medium')
      setEditNotes(ticket.notes || '')
      setEditDirty(false)
    }
  }, [ticket?.id])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Scroll replies to bottom when new reply added
  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.replies?.length])

  if (!ticket) return null

  const canClose = ticket.status !== 'closed'
  const canResolve = ticket.status !== 'resolved' && ticket.status !== 'closed'
  const isAgent = currentUser?.role === 'Admin' || currentUser?.role === 'Agente'
  const isAdmin = currentUser?.role === 'Admin'

  const handleSendReply = () => {
    const trimmed = replyText.trim()
    if (!trimmed || isAddingReply) return
    onAddReply(trimmed)
    setReplyText('')
  }

  const handleSaveEdit = () => {
    if (!editDirty || isEditing) return
    const payload = { notes: editNotes }
    if (isAdmin) payload.priority = editPriority
    onEditTicket(payload)
    setEditDirty(false)
  }

  const row = (label, value) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
      <span className="w-36 shrink-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-zinc-700 dark:text-zinc-200">{value}</span>
    </div>
  )

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white dark:bg-zinc-900 shadow-2xl shadow-black/60 w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shrink-0">
          <div>
            <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600 mb-1">
              #{String(ticket.id).padStart(4, '0')}
            </p>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-snug pr-6">
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mt-0.5 shrink-0"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-2">
          {/* Info rows */}
          {row('Estado',    <Badge type={ticket.status}>{TICKET_TYPES[ticket.status]?.label || ticket.status}</Badge>)}
          {row('Prioridad', <Badge type={ticket.priority}>{PRIORITY_LEVELS[ticket.priority]?.label || ticket.priority}</Badge>)}
          {row('Categoría', CATEGORY_LABELS[ticket.category] || ticket.category || '—')}
          {row('Fecha',     new Date(ticket.created_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }))}
          {ticket.description && row('Descripción', ticket.description)}
          {isAgent && ticket.notes && row('Notas internas', <span className="italic text-zinc-400">{ticket.notes}</span>)}
          {ticket.sla_breached && row(
            'SLA',
            <span className="inline-flex items-center gap-1 text-red-400 font-medium text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              Incompleto
            </span>
          )}

          {/* Edit panel — Admin/Agente only */}
          {isAgent && (
            <div className="mt-4 mb-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/40 p-4 space-y-3">
              <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">Editar ticket</p>
              {isAdmin && (
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Prioridad</label>
                  <select
                    value={editPriority}
                    onChange={(e) => { setEditPriority(e.target.value); setEditDirty(true) }}
                    className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Notas internas</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => { setEditNotes(e.target.value); setEditDirty(true) }}
                  rows={3}
                  placeholder="Observaciones internas (no visibles para el cliente)..."
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editDirty || isEditing}
                >
                  {isEditing ? (
                    <span className="flex items-center gap-2"><LoadingSpinner size="sm" />Guardando...</span>
                  ) : 'Guardar cambios'}
                </Button>
              </div>
            </div>
          )}

          {/* Comment thread — Admin/Agente only */}
          {isAgent && (
            <div className="mt-4 mb-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Seguimiento</p>

              {/* Replies list */}
              <div className="bg-zinc-100 dark:bg-zinc-950/60 p-3 space-y-3 max-h-52 overflow-y-auto">
                {(!ticket.replies || ticket.replies.length === 0) ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-2">Sin mensajes aún.</p>
                ) : (
                  ticket.replies.map((reply) => (
                    <div key={reply.id} className="bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">{reply.author_name}</span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-600 shrink-0">
                          {new Date(reply.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{reply.text}</p>
                    </div>
                  ))
                )}
                <div ref={repliesEndRef} />
              </div>

              {/* Reply input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply() } }}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isAddingReply}
                >
                  {isAddingReply ? <LoadingSpinner size="sm" /> : 'Enviar'}
                </Button>
              </div>
            </div>
          )}

          {/* Replies — read-only for Cliente */}
          {!isAgent && ticket.replies?.length > 0 && (
            <div className="mt-4 mb-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Respuestas del equipo</p>
              <div className="bg-zinc-100 dark:bg-zinc-950/60 p-3 space-y-3 max-h-52 overflow-y-auto">
                {ticket.replies.map((reply) => (
                  <div key={reply.id} className="bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">{reply.author_name}</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-600 shrink-0">
                        {new Date(reply.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{reply.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!isAgent && (!ticket.replies || ticket.replies.length === 0) && (
            <div className="mt-4 mb-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Respuestas del equipo</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-950/60 px-3 py-4 text-center">
                Aún no hay respuestas para este ticket.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <Button variant="secondary" onClick={onClose}>
            Cerrar panel
          </Button>
          {canResolve && isAgent && (
            <Button
              variant="ghost"
              onClick={() => onResolveTicket(ticket)}
              disabled={isResolving || isClosing}
              className="text-emerald-400 hover:bg-emerald-950 border border-emerald-800"
            >
              {isResolving ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" /> Resolviendo...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Marcar resuelto
                </span>
              )}
            </Button>
          )}
          {canClose && isAgent && (
            <Button
              variant="danger"
              onClick={() => onCloseTicket(ticket)}
              disabled={isClosing || isResolving}
            >
              {isClosing ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" /> Cerrando...
                </span>
              ) : (
                'Cerrar ticket'
              )}
            </Button>
          )}
        </div>
      </div>
    </Overlay>
  )
}

// ---------------------------------------------------------------------------
// ConfirmCloseModal — styled confirmation dialog
// ---------------------------------------------------------------------------
export function ConfirmCloseModal({ ticket, onConfirm, onCancel, isClosing }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  if (!ticket) return null

  return (
    <Overlay onClose={onCancel}>
      <div className="bg-white dark:bg-zinc-900 shadow-2xl shadow-black/60 w-full max-w-sm mx-4 overflow-hidden">
        {/* Icon + title */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 bg-red-100 border border-red-200 dark:bg-red-950 dark:border-red-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">¿Cerrar este ticket?</h2>
          <p className="text-sm text-zinc-500 mt-2">
            El ticket{' '}
            <span className="font-mono font-medium text-zinc-600 dark:text-zinc-300">
              #{String(ticket.id).padStart(4, '0')}
            </span>{' '}
            será marcado como <strong className="text-zinc-700 dark:text-zinc-200">Cerrado</strong> y no podrá reabrirse desde aquí.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-6 pb-6">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={isClosing}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} disabled={isClosing}>
            {isClosing ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" /> Cerrando...
              </span>
            ) : (
              'Sí, cerrar'
            )}
          </Button>
        </div>
      </div>
    </Overlay>
  )
}

// ---------------------------------------------------------------------------
// Shared overlay backdrop
// ---------------------------------------------------------------------------
function Overlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}
