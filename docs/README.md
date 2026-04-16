# Документация проекта

`docs/` организован по сценариям: от запуска к архитектуре, фичам, стандартам и tooling.

## Структура

1. [`01-getting-started/`](./01-getting-started/README.md) — онбординг, установка, базовые команды.
2. [`02-architecture/`](./02-architecture/README.md) — архитектура и FSD-правила.
3. [`03-features/`](./03-features/README.md) — прикладная документация по фичам и страницам.
4. [`04-standards/`](./04-standards/README.md) — инженерные стандарты и quality gates.
5. [`05-tooling/`](./05-tooling/README.md) — инструменты и локальные skills.
6. `superpowers/plans/` — рабочие планы и черновики (не нормативная документация).

## Быстрые маршруты

- Полный гайд по проекту: [`01-getting-started/project-guide.md`](./01-getting-started/project-guide.md)
- Архитектура и импорт-правила: [`02-architecture/fsd-architecture.md`](./02-architecture/fsd-architecture.md)
- Нейминг: [`04-standards/naming-conventions.md`](./04-standards/naming-conventions.md)
- Локальные skills и сценарии использования: [`05-tooling/skills.md`](./05-tooling/skills.md)
- Корневой обзор проекта: [`README.md`](../README.md)

## Принципы поддержания docs

- Новый документ добавляется в профильный раздел, а не в корень `docs/` (кроме индекса `docs/README.md`).
- Каждый раздел содержит свой `README.md` как точку входа.
- При переименовании или переносе файлов обновляйте ссылки в соответствующих индексах.
