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
- `npm run build` — сборка проекта
- `npm run lint` — проверка качества кода
- `npm run preview` — локальный preview production build

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
