export type WorkItemDto = {
  id: string
  title: string
  summary: string
  result: string
  link: string
}

export type WorkDetailsResponseDto = WorkItemDto & {
  challenge?: string
  solution?: string
  outcome?: string
  tech_stack?: string[]
  published_at?: string
}

export type TariffDto = {
  id: string
  title: string
  audience: string
  includes: string[]
  format: string
  price: string
  recommended?: boolean
}

export type EarningsTotalResponseDto = {
  total_usd: number
  reports_count: number
  updated_at: string
}

export type ListWorksParams = {
  page?: number
  limit?: number
}

export type ListWorksResponseDto = {
  items: WorkItemDto[]
  page: number
  limit: number
  total: number
}

export type ListTariffsResponseDto = {
  items: TariffDto[]
}

export type CreateLeadRequestDto = {
  name: string
  contact: string
  goal?: string
  selected_tariff?: string
}

export type CreateLeadResponseDto = {
  id: string
  status: 'accepted'
}
