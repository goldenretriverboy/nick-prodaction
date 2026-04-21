# Nick Development Frontend

Frontend-проект лендинга на `React + TypeScript + Vite` с упором на mobile-first UX, строгую типизацию и архитектуру в стиле FSD.

## Технологический стек

- React 19 + TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form + Zod
- Tailwind CSS
- ESLint + Prettier
- Vitest + Testing Library + Playwright

## Требования

- Node.js LTS (20+)
- npm 10+

## Установка и запуск

### Установка зависимостей

```bash
npm install
```

### Запуск в dev-режиме

```bash
npm run dev
```

### Запуск backend + Telegram bot (dev)

```bash
cp .env.server.example .env.server
npm run dev:server
```

Сервис поднимает:

- `GET /health`
- `GET /api/public/earnings/total`

Telegram-бот включается только если задан `TELEGRAM_BOT_TOKEN`.

### Интеграция earnings с backend во frontend

Для подключения только блока заработка к backend (остальные данные могут оставаться на моках), добавьте в `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8787
VITE_USE_LIVE_EARNINGS=true
VITE_USE_LOCAL_MOCKS=true
```

Для Vercel:

- `VITE_API_BASE_URL=https://<your-backend-domain>`
- `VITE_USE_LIVE_EARNINGS=true`
- `VITE_USE_LOCAL_MOCKS=true`

### Лиды (форма заявки)

Форма отправляет данные в backend endpoint `POST /api/public/leads`.
Если нужна отправка уведомлений через EmailJS, задайте серверные env в `.env.server`:

```bash
EMAILJS_SERVICE_ID=<service_id>
EMAILJS_TEMPLATE_ID=<template_id>
EMAILJS_PUBLIC_KEY=<public_key>
```

### Сборка

```bash
npm run build
```

### Проверка линтером

```bash
npm run lint
```

### Preview production сборки

```bash
npm run preview
```

## Доступные скрипты

- `npm run dev` — локальная разработка
- `npm run dev:server` — локальный backend + Telegram bot
- `npm run build` — сборка проекта
- `npm run typecheck` — проверка TypeScript
- `npm run lint` — проверка качества кода
- `npm run preview` — локальный preview production build
- `npm run server:start` — запуск backend в обычном режиме

## Архитектура

Целевой подход: `Feature-Sliced Design (FSD)` с `pages-first` стартом:

```text
src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
```

Подробно: [docs/02-architecture/fsd-architecture.md](./docs/02-architecture/fsd-architecture.md)

## Нейминг и стандарты

- Конвенции именования: [docs/04-standards/naming-conventions.md](./docs/04-standards/naming-conventions.md)
- Индекс документации: [docs/README.md](./docs/README.md)

## Локальные skills

В проект локально установлены skills для архитектуры, UI/UX, безопасности, тестирования и best practices React.

Список: [docs/05-tooling/skills.md](./docs/05-tooling/skills.md)

## Статус документации

- `docs/superpowers/plans/` используется как рабочий раздел с планами и черновиками.
- Нормативные инженерные стандарты и гайды находятся в `docs/01-05`.
