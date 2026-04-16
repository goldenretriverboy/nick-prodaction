# Project Guide

## Назначение

Лендинг-проект на `React + TypeScript + Vite` с фокусом на mobile-first UX, производительность и поэтапное развитие по FSD-подходу.

## Технологический стек

- React 19 + TypeScript (strict)
- Vite
- React Router
- TanStack Query
- React Hook Form + Zod
- Tailwind CSS
- ESLint + Prettier
- Vitest + Testing Library + Playwright

## Требования

- Node.js LTS (рекомендуется 20+)
- npm 10+ (или совместимая версия)

## Установка

```bash
npm install
```

## Локальный запуск

```bash
npm run dev
```

По умолчанию Vite поднимает dev-сервер на `http://localhost:5173`.

## Сборка

```bash
npm run build
```

## Проверка качества

```bash
npm run lint
```

## Текущие npm-скрипты

- `npm run dev` — запуск dev-сервера.
- `npm run build` — typecheck + production build.
- `npm run lint` — проверка линтером.
- `npm run preview` — просмотр production-сборки.
