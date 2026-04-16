import type {
  CreateLeadResponseDto,
  EarningsTotalResponseDto,
  TariffDto,
  WorkDetailsResponseDto,
  WorkItemDto,
} from '@/shared/api/types'

export const mockEarningsTotal: EarningsTotalResponseDto = {
  total_usd: 1_842_000,
  reports_count: 438,
  updated_at: '2026-04-16T00:00:00.000Z',
}

export const mockWorks: WorkItemDto[] = [
  {
    id: 'work-1',
    title: 'AI support widget',
    summary: 'Запуск чат-виджета для e-commerce витрины',
    result: '+18% к конверсии в диалог за 30 дней',
    link: '#',
  },
  {
    id: 'work-2',
    title: 'Sales copilot',
    summary: 'Скрипт-помощник для обработки лидов',
    result: 'Сокращение first-response time на 42%',
    link: '#',
  },
  {
    id: 'work-3',
    title: 'Content pipeline',
    summary: 'Генерация контента для лендингов и рассылок',
    result: 'Публикация в 2.1x быстрее',
    link: '#',
  },
  {
    id: 'work-4',
    title: 'Prompt QA harness',
    summary: 'Проверка prompt-наборов на регрессии',
    result: '-27% ошибок в проде',
    link: '#',
  },
  {
    id: 'work-5',
    title: 'Analytics assistant',
    summary: 'Авто-сводка weekly метрик для команды',
    result: 'Экономия 4-5 часов в неделю',
    link: '#',
  },
  {
    id: 'work-6',
    title: 'Lead scoring model',
    summary: 'Ранжирование заявок по вероятности оплаты',
    result: '+11% к оплатам в тестовой группе',
    link: '#',
  },
  {
    id: 'work-7',
    title: 'Knowledge bot',
    summary: 'Внутренний бот по базе знаний команды',
    result: 'Снижение повторяющихся вопросов на 33%',
    link: '#',
  },
  {
    id: 'work-8',
    title: 'Resume optimizer',
    summary: 'Сервис улучшения резюме под вакансии',
    result: 'Рост ответов от работодателей на 24%',
    link: '#',
  },
  {
    id: 'work-9',
    title: 'Call summary tool',
    summary: 'Автосаммари созвонов с action items',
    result: '-36% потерь задач после встреч',
    link: '#',
  },
  {
    id: 'work-10',
    title: 'Ad creative lab',
    summary: 'Генератор гипотез для рекламных креативов',
    result: '+19% CTR на лучшем варианте',
    link: '#',
  },
  {
    id: 'work-11',
    title: 'Legal draft helper',
    summary: 'Черновики договоров по шаблонам компании',
    result: 'Согласование быстрее на 2 дня',
    link: '#',
  },
  {
    id: 'work-12',
    title: 'Onboarding tutor',
    summary: 'Помощник для первых 14 дней новичка',
    result: '+22% completion rate онбординга',
    link: '#',
  },
]

export const mockTariffs: TariffDto[] = [
  {
    id: 'start',
    title: 'Start',
    audience: 'Для тех, кто хочет быстро войти в тему',
    includes: ['8 live-сессий', 'База шаблонов', 'Домашние задания с фидбеком'],
    format: '4 недели, online',
    price: '49 000 KZT',
  },
  {
    id: 'pro',
    title: 'Pro',
    audience: 'Для перехода к коммерческим проектам',
    includes: ['12 live-сессий', 'Разбор портфолио', 'Поддержка наставника'],
    format: '6 недель, online',
    price: '89 000 KZT',
    recommended: true,
  },
  {
    id: 'team',
    title: 'Team',
    audience: 'Для командного запуска AI-практик',
    includes: ['Custom программа', 'Синхронные воркшопы', 'Шаблоны под ваш процесс'],
    format: 'По запросу',
    price: 'Индивидуально',
  },
]

export const mockCreateLeadResponse: CreateLeadResponseDto = {
  id: 'local-mock-lead',
  status: 'accepted',
}

export const mockWorkDetailsById: Record<string, WorkDetailsResponseDto> =
  Object.fromEntries(
    mockWorks.map((work) => [
      work.id,
      {
        ...work,
        challenge: `Задача проекта: ${work.summary}.`,
        solution:
          'Решение: запуск MVP с фокусом на mobile-first UX, быстрый фидбек и итеративные улучшения.',
        outcome: `Результат: ${work.result}.`,
        tech_stack: ['React', 'TypeScript', 'Vite', 'TanStack Query'],
        published_at: '2026-04-17',
      },
    ]),
  )
