import emailjs from '@emailjs/browser'
import { env } from '@/shared/config/env'

const KZ_TIMEZONE = 'Asia/Almaty'

type SendLeadEmailPayload = {
  name: string
  contact: string
  goal?: string
  selectedTariff?: string
  consent: boolean
}

function normalizeText(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()
  if (!trimmed) {
    return fallback
  }

  return trimmed
}

function formatSendTime(date: Date): string {
  return new Intl.DateTimeFormat('ru-KZ', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: false,
    timeZone: KZ_TIMEZONE,
  }).format(date)
}

function resolveEmailJsConfig() {
  const serviceId = env.emailJsServiceId.trim()
  if (!serviceId) {
    throw new Error('EMAILJS_SERVICE_ID_MISSING')
  }

  const templateId = env.emailJsTemplateId.trim()
  if (!templateId) {
    throw new Error('EMAILJS_TEMPLATE_ID_MISSING')
  }

  const publicKey = env.emailJsPublicKey.trim()
  if (!publicKey) {
    throw new Error('EMAILJS_PUBLIC_KEY_MISSING')
  }

  return {
    serviceId,
    templateId,
    publicKey,
  }
}

export async function sendLeadEmail(payload: SendLeadEmailPayload): Promise<void> {
  const { serviceId, templateId, publicKey } = resolveEmailJsConfig()

  await emailjs.send(
    serviceId,
    templateId,
    {
      name: normalizeText(payload.name, 'Не указано'),
      time: formatSendTime(new Date()),
      contact: normalizeText(payload.contact, 'Не указано'),
      goal: normalizeText(payload.goal, 'Не указана'),
      tariff: normalizeText(payload.selectedTariff, 'Не выбран'),
      consent: payload.consent ? 'Да' : 'Нет',
    },
    {
      publicKey,
    },
  )
}
