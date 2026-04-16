import { useMutation } from '@tanstack/react-query'
import { createLead } from '../create-lead'

export function useCreateLead() {
  return useMutation({
    mutationFn: createLead,
  })
}
