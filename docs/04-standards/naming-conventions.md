# Документация: Naming Conventions

Документ фиксирует правила именования для `React + TypeScript + FSD` проекта.

## 1. Общие правила

- Файлы и папки: `kebab-case`.
- React-компоненты: `PascalCase`.
- Функции, переменные, хуки: `camelCase`.
- Константы: `UPPER_SNAKE_CASE`.
- Типы и интерфейсы: `PascalCase`.

## 2. API функции

Паттерн:

`verb + Entity + [Details]`

Разрешенные глаголы:

- `get` — получение одной сущности
- `list` — получение списка
- `create` — создание
- `update` — полное обновление
- `patch` — частичное обновление
- `delete` — удаление

Примеры:

```ts
getWork(workId: string)
listWorks(params: ListWorksParams)
createLead(payload: CreateLeadPayload)
updateTariff(tariffId: string, payload: UpdateTariffPayload)
```

Антипаттерны:

```ts
fetchWorks()        // listWorks
getWorkInfo()       // getWork
postCreateLead()    // createLead
```

## 3. React компоненты

- Компоненты: `PascalCase.tsx`
- Страницы: `HomePage.tsx`, `WorksPage.tsx`
- UI-примитивы: `UiButton.tsx`, `UiInput.tsx`
- Композитные блоки: `HeroEarnings.tsx`, `WorksGrid.tsx`, `LeadForm.tsx`

Примеры:

```text
src/pages/home/ui/HomePage.tsx
src/widgets/hero-earnings/ui/HeroEarnings.tsx
src/shared/ui/UiButton/UiButton.tsx
```

## 4. Hooks и бизнес-логика

- Кастомные хуки всегда с префиксом `use`:
  - `useEarningsTotal`
  - `useWorksList`
  - `useLeadForm`
- Обработчики событий: `handle + Action`
  - `handleSubmit`
  - `handleTariffSelect`

## 5. Типы, схемы и DTO

- Типы: `EntityType` или предметное имя без суффикса, если контекст очевиден.
- Zod-схемы: суффикс `Schema`.
- DTO: суффиксы `RequestDto` / `ResponseDto`.

Примеры:

```ts
type WorkCard
type LeadFormValues
const leadFormSchema = z.object({ ... })
type CreateLeadRequestDto
```

## 6. FSD нейминг слоев и слайсов

- Слайсы в `kebab-case`:
  - `hero-earnings`
  - `works-grid`
  - `select-tariff`
- Public API каждого слайса: `index.ts`.
- Импорты во внешний код только через `index.ts`.

## 7. Чек-лист перед созданием файла

- Имя отражает предметную роль.
- Регистр соответствует типу сущности.
- Нет лишних слов (`info`, `data`, `new`, `final`, `v2`).
- Для API использован разрешенный глагол.
- Для хуков есть префикс `use`.
