# FSD Architecture (React)

## Цель

Поддерживать предсказуемую структуру кода и контролируемую переиспользуемость модулей.

## Базовый подход (pages-first)

На старте достаточно слоев:

- `app`
- `pages`
- `shared`

Слои `widgets`, `features`, `entities` добавляются только когда логика реально переиспользуется в 2+ местах.

## Направление импортов

Импорты направлены сверху вниз:

`app -> pages -> widgets -> features -> entities -> shared`

Правила:

- Нельзя импортировать вверх по слоям.
- Нельзя делать cross-import между слайсами одного слоя.
- Внешний импорт из слайса только через public API (`index.ts`).
- Бизнес-логика не размещается в `shared`.

## Рекомендуемая структура

```text
src/
  app/
    providers/
    router/
    styles/
  pages/
    home/
      ui/
      model/
      api/
      index.ts
    works/
      ui/
      model/
      api/
      index.ts
  widgets/
  features/
  entities/
  shared/
    api/
    lib/
    ui/
    config/
```

## Архитектурные проверки

- Ручная проверка архитектуры:

```bash
npx steiger src
```

- Проверка включается в CI как quality gate.
