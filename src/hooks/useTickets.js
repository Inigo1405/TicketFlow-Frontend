import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api.js'

export function useTickets(filters = {}) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const response = await api.get('/tickets', { params: filters })
      return response.data || []
    },
    refetchInterval: 30000,
  })
}

export function useCloseTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ticketId) => {
      await api.patch(`/tickets/${ticketId}/close`)
      return ticketId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ticketData) => {
      const response = await api.post('/tickets', ticketData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
