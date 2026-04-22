import emailjs from '@emailjs/browser'
import { env } from '@/shared/config/env'
import type { CreateLeadRequestDto } from './types'

export async function createLead(
  payload: CreateLeadRequestDto,
): Promise<void> {
  if (!env.emailJsServiceId || !env.emailJsTemplateId || !env.emailJsPublicKey) {
    throw new Error(
      'EmailJS config is missing. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY.',
    )
  }

  await emailjs.send(
    env.emailJsServiceId,
    env.emailJsTemplateId,
    {
      name: payload.name,
      contact: payload.contact,
      goal: payload.goal ?? '',
      selected_tariff: payload.selected_tariff ?? '',
      selectedTariff: payload.selected_tariff ?? '',
      submitted_at: new Date().toISOString(),
    },
    {
      publicKey: env.emailJsPublicKey,
    },
  )
}
