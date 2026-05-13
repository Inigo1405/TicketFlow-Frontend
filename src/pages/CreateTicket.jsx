import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api.js'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import Badge from '../components/Badge.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import Toast from '../components/Toast.jsx'

// Opciones de categoría
const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General', color: 'blue' },
  { value: 'technical', label: 'Técnico', color: 'indigo' },
  { value: 'billing', label: 'Facturación', color: 'emerald' },
  { value: 'access', label: 'Acceso', color: 'purple' },
  { value: 'other', label: 'Otro', color: 'slate' },
]

function CreateTicket() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    status: 'open',
  })
  
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio'
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria'
    } else if (formData.description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Mutación para crear ticket
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData) => {
      const response = await api.post('/tickets', ticketData)
      return response.data
    },
    onSuccess: () => {
      // Refetch para actualizar la lista en dashboard
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      // Mostrar toast de éxito
      setToast({ type: 'success', message: 'Ticket creado exitosamente' })
      // Resetear formulario
      setFormData({
        title: '',
        description: '',
        category: 'general',
        status: 'open',
      })
      // Redirigir después de mostrar el toast
      setTimeout(() => {
        navigate('/dashboard')
      }, 2500)
    },
    onError: (error) => {
      // El error ya fue manejado en el interceptor global
      setToast({ 
        type: 'error', 
        message: error.response?.data?.message || error.message || 'Error al crear el ticket' 
      })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    createTicketMutation.mutate(formData)
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Toast notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        {/* Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Crear Nuevo Ticket</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Rellena el formulario para crear un nuevo ticket de soporte
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </Button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
              <label htmlFor="title" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Título <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ej: No puedo acceder a mi cuenta"
              error={errors.title}
              disabled={createTicketMutation.isPending}
              required
            />
          </div>

          {/* Descripción */}
          <div>
              <label htmlFor="description" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Descripción <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <textarea
              id="description"
              rows={5}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe el problema en detalle..."
              className={`
                w-full px-3 py-2 border
                text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
                bg-white dark:bg-zinc-950
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                disabled:bg-zinc-100 dark:disabled:bg-zinc-900 disabled:text-zinc-400 dark:disabled:text-zinc-600
                transition-colors
                resize-none
                ${errors.description ? 'border-red-500 dark:border-red-700 focus:ring-red-500 dark:focus:ring-red-600' : 'border-zinc-300 dark:border-zinc-700'}
              `}
              disabled={createTicketMutation.isPending}
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Categoría
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-900 disabled:text-zinc-400 dark:disabled:text-zinc-600 text-sm"
              disabled={createTicketMutation.isPending}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botones de acción */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              disabled={createTicketMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createTicketMutation.isPending}
            >
              {createTicketMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Creando...
                </span>
              ) : (
                'Crear Ticket'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Ayuda */}
      <div className="mt-6 bg-sky-50 border border-sky-200 dark:bg-sky-950/40 dark:border-sky-800 p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-sky-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-sky-700 dark:text-sky-300">Consejos</h3>
            <ul className="mt-2 text-sm text-sky-600/80 dark:text-sky-400/70 space-y-1 list-disc list-inside">
              <li>Sé específico en el título para facilitar la clasificación</li>
              <li>Proporciona todos los detalles en la descripción</li>
              <li>Selecciona la prioridad adecuada según la urgencia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTicket
