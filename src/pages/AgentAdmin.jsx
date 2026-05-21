import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import api from '../services/api.js'
import { formatDate } from '../utils/formatDate.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import Badge from '../components/Badge.jsx'
import Table from '../components/Table.jsx'

const QDRANT_LABELS = {
  company_knowledge: 'Conocimiento',
  qa_entries: 'QA',
  client_profiles: 'Perfiles',
}

// ---------------------------------------------------------------------------
// Column definitions for each data section
// ---------------------------------------------------------------------------
const qaCols = [
  {
    key: 'id',
    label: 'ID',
    render: (row) => <span className="font-mono text-xs text-zinc-400">{row.id}</span>,
  },
  {
    key: 'tic_area',
    label: 'Área',
    render: (row) => row.tic_area
      ? <Badge type="status">{String(row.tic_area).replace(/_/g, ' ')}</Badge>
      : <span className="text-zinc-400">—</span>,
  },
  {
    key: 'problem',
    label: 'Problema',
    render: (row) => {
      const s = String(row.problem ?? '')
      return (
        <span className="text-zinc-600 dark:text-zinc-300 text-xs">
          {s.slice(0, 120)}{s.length > 120 ? '...' : ''}
        </span>
      )
    },
  },
  {
    key: 'solution',
    label: 'Solución',
    render: (row) => {
      const s = String(row.solution ?? '')
      return (
        <span className="text-zinc-600 dark:text-zinc-300 text-xs">
          {s.slice(0, 120)}{s.length > 120 ? '...' : ''}
        </span>
      )
    },
  },
  {
    key: 'source_ticket_id',
    label: 'Ticket',
    render: (row) => row.source_ticket_id
      ? <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">#{row.source_ticket_id}</span>
      : <span className="text-zinc-400">—</span>,
  },
  {
    key: 'created_at',
    label: 'Fecha',
    render: (row) => <span className="text-xs text-zinc-400 whitespace-nowrap">{formatDate(row.created_at)}</span>,
  },
]

const memoryCols = [
  {
    key: 'client_id',
    label: 'Cliente',
    render: (row) => <span className="font-mono text-xs text-zinc-500">#{row.client_id}</span>,
  },
  {
    key: 'tic_area',
    label: 'Área',
    render: (row) => row.tic_area
      ? <Badge type="status">{String(row.tic_area).replace(/_/g, ' ')}</Badge>
      : <span className="text-zinc-400">—</span>,
  },
  {
    key: 'frequency',
    label: 'Frec.',
    render: (row) => <span className="font-bold text-zinc-800 dark:text-zinc-200">{row.frequency}x</span>,
  },
  {
    key: 'problem_summary',
    label: 'Problema recurrente',
    render: (row) => {
      const s = String(row.problem_summary ?? '')
      return (
        <span className="text-zinc-600 dark:text-zinc-300 text-xs">
          {s.slice(0, 160)}{s.length > 160 ? '...' : ''}
        </span>
      )
    },
  },
  {
    key: 'last_seen',
    label: 'Última vez',
    render: (row) => <span className="text-xs text-zinc-400 whitespace-nowrap">{formatDate(row.last_seen)}</span>,
  },
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function AgentAdmin() {
  const [activeTab, setActiveTab] = useState('data')
  const [expanded, setExpanded] = useState(null) // 'knowledge' | 'qa' | 'memory' | null

  // ── Data queries ─────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/agent/admin/stats')).data,
    enabled: activeTab === 'data',
    staleTime: 30000,
  })

  const { data: qaEntries = [], isLoading: qaLoading } = useQuery({
    queryKey: ['admin-qa'],
    queryFn: async () => (await api.get('/agent/qa')).data || [],
    enabled: expanded === 'qa',
    staleTime: 60000,
  })

  const { data: memories = [], isLoading: memoriesLoading } = useQuery({
    queryKey: ['admin-memory'],
    queryFn: async () => (await api.get('/agent/admin/memory')).data || [],
    enabled: expanded === 'memory',
    staleTime: 60000,
  })

  // ── Chat state ────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  const sendMessage = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return

    const userMsg = { role: 'user', content: text }
    const updated = [...chatMessages, userMsg]
    setChatMessages(updated)
    setChatInput('')
    setChatLoading(true)
    try {
      const resp = await api.post(
        '/agent/admin/chat',
        { message: text, history: chatMessages },
        { timeout: 90000 },
      )
      setChatMessages([...updated, { role: 'assistant', content: resp.data.reply }])
    } catch {
      setChatMessages([
        ...updated,
        { role: 'assistant', content: 'Error al comunicarse con TICBot. Intenta de nuevo.' },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggle = (key) => setExpanded(expanded === key ? null : key)

  // ── Accordion sections config ─────────────────────────────────────────────
  const sections = [
    {
      key: 'qa',
      label: 'Entradas QA',
      count: stats?.qa_count,
      cols: qaCols,
      data: qaEntries,
      loading: qaLoading,
    },
    {
      key: 'memory',
      label: 'Memorias de Clientes',
      count: stats?.memory_count,
      cols: memoryCols,
      data: memories,
      loading: memoriesLoading,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">TICBot Admin</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Estado del agente inteligente y chat directo con acceso al sistema
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: 'data', label: 'Bases de datos' },
          { id: 'chat', label: 'Chat privilegiado' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Bases de datos ─────────────────────────────────────────────── */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Entradas QA', value: stats?.qa_count, sub: 'pares problema / solución de tickets resueltos' },
                  { label: 'Memorias de Clientes', value: stats?.memory_count, sub: 'patrones de comportamiento por cliente' },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5"
                  >
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {card.label}
                    </p>
                    <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
                      {card.value ?? '—'}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Qdrant collection status */}
              {stats?.qdrant && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Qdrant — colecciones vectoriales
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {stats.qdrant.map((col) => {
                      const dotColor =
                        col.status === 'green'
                          ? 'bg-emerald-500'
                          : col.status === 'yellow'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      return (
                        <div
                          key={col.name}
                          className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {QDRANT_LABELS[col.name] || col.name}
                          </span>
                          <span className="font-mono text-xs text-zinc-400">
                            {col.vectors_count} vec.
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Accordion data sections */}
          {sections.map((section) => (
            <div key={section.key} className="border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => toggle(section.key)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {section.label}
                  </span>
                  {section.count != null && (
                    <span className="text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                      {section.count}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    expanded === section.key ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expanded === section.key && (
                <div>
                  {section.loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <Table columns={section.cols} data={section.data} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Chat privilegiado ──────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 290px)', minHeight: '400px' }}>
          {/* Info banner */}
          <div className="flex items-start gap-3 px-4 py-3 mb-4 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-sm text-cyan-700 dark:text-cyan-300">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Chat directo con TICBot — puede consultar sus bases de datos en tiempo real.{' '}
              Prueba:{' '}
              <button
                className="italic underline hover:no-underline"
                onClick={() => { setChatInput('¿Cuál es el estado de tus bases de datos?') }}
              >
                "¿Cuál es el estado de tus bases de datos?"
              </button>
            </span>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
            {chatMessages.length === 0 && !chatLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400">
                <div className="w-12 h-12 bg-cyan-400 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm">Ningún mensaje aún. Escribe algo para comenzar.</p>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="mr-2 mt-1 shrink-0 w-7 h-7 bg-cyan-400 flex items-center justify-center text-zinc-900 font-bold text-xs select-none">
                    T
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed prose-p:my-2 prose-li:my-1 prose-headings:my-2 prose-pre:bg-zinc-200 dark:prose-pre:bg-zinc-700 prose-pre:text-xs">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="mr-2 mt-1 shrink-0 w-7 h-7 bg-cyan-400 flex items-center justify-center text-zinc-900 font-bold text-xs">
                  T
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-3.5 flex items-center gap-1.5">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input row */}
          <div className="flex gap-2 mt-4">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
              rows={2}
              disabled={chatLoading}
              className="flex-1 resize-none bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading || !chatInput.trim()}
              className="px-6 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 font-semibold text-sm transition-colors self-stretch"
            >
              {chatLoading ? <LoadingSpinner /> : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentAdmin
