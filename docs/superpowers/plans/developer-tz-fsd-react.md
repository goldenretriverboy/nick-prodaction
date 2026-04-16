# ТЗ для разработчика: Лендинг (React + TS + Tailwind + FSD)

Версия: v1.1
Дата: 16 апреля 2026

Источник: `/Users/ignat.yaskevich/Development/Garage/nick/landing-mobile-first-tz.md`

## 20. Блок 2: Техническая спецификация для разработчика

### 20.1 Рекомендуемый стек (MVP)
1. Frontend: React + TypeScript (strict mode).
2. Сборка: Vite + SWC.
3. Стили: Tailwind CSS + clsx + tailwind-merge + class-variance-authority.
4. Роутинг: React Router.
5. Данные/API: TanStack Query (query + cache + retry + background refresh).
6. Формы: React Hook Form + Zod.
7. HTTP-клиент: native fetch + typed API layer.
8. Иконки: Lucide React (или аналогичный легковесный набор).
9. Пакетный менеджер: pnpm.
10. Node.js: LTS-версия.

### 20.2 Инструменты анимации (мощные, production-ready)
1. Motion for React (бывш. Framer Motion): основной инструмент для UI-анимаций, reveal и интерактивных состояний.
2. GSAP + ScrollTrigger: для сложных hero-сценариев и таймлайнов с точным контролем.
3. CountUp.js (или react-countup): для анимации денежных значений и дельта-обновлений.
4. Lenis (опционально): для контролируемого smooth-scroll, только после проверки mobile performance.
5. Lottie (опционально): для легких векторных анимаций без тяжелого видео.

### 20.3 Рекомендация по выбору анимационного стека
1. MVP: Motion for React + CountUp.js.
2. Расширенный hero (если нужен сильнее wow): точечно добавить GSAP только в первый экран.
3. Не смешивать одновременно несколько библиотек для одного и того же эффекта.
4. Учитывать prefers-reduced-motion на уровне глобальных motion-утилит.

### 20.4 Архитектура frontend (FSD v2.1, pages-first)
1. Базовый старт проекта: `app + pages + shared`; слои `widgets/features/entities` добавляются только при реальной переиспользуемости.
2. Правило направления импортов: `app -> pages -> widgets -> features -> entities -> shared`.
3. Запрещены cross-import между слайсами одного слоя.
4. Внешний импорт из слайса только через Public API (`index.ts`).
5. Если логика используется в одной странице, она остается в `pages/*` (не выносить преждевременно).

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
    hero-earnings/
      ui/
      model/
      index.ts
    works-grid/
      ui/
      index.ts
    tariffs/
      ui/
      index.ts
    lead-form/
      ui/
      model/
      index.ts
  features/
    select-tariff/
      model/
      ui/
      index.ts
  entities/
    work/
      model/
      ui/
      index.ts
    tariff/
      model/
      index.ts
    earnings/
      model/
      index.ts
  shared/
    api/
    lib/
    ui/
    config/
```

### 20.5 Типизация и качество кода
1. TypeScript strict: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
2. Единый контракт API через DTO-типы и runtime-валидацию ответов (Zod).
3. ESLint + Prettier + lint-staged + Husky.
4. Запрет `any` без обоснования.
5. Критичные UI-компоненты покрывать story/example-кейсами.

### 20.6 API интеграция (frontend requirements)
1. `GET /api/public/earnings/total`:
   - Обновление: polling 60s.
   - Поддержка push (SSE/WebSocket) как enhancement.
2. `GET /api/public/works`:
   - Поддержка пагинации (`page`, `limit`) и сортировки по дате.
3. `GET /api/public/tariffs`:
   - Возвращает список активных тарифов.
4. `POST /api/public/leads`:
   - Идемпотентность по клиентскому request-id.
   - Нормальная обработка ошибок 4xx/5xx с UI-месседжами.

### 20.7 Состояния и отказоустойчивость
1. Для каждого асинхронного блока: loading, success, empty, error.
2. Hero-сумма должна иметь fallback-значение при недоступности API.
3. При сбое отправки формы данные в полях не теряются.
4. Ретраи для чтения данных ограничены и не должны блокировать UI.

### 20.8 Performance budget (mobile-first)
1. JS initial bundle: целевой бюджет до 220KB gzip для критического пути.
2. Hero-анимации не должны создавать layout thrashing.
3. Изображения кейсов: AVIF/WebP + lazy loading + responsive srcset.
4. Отложенная загрузка тяжелых animation dependencies (dynamic import).
5. Lighthouse mobile target: Perf >= 80, A11y >= 90, BP >= 90, SEO >= 90.

### 20.9 Тестирование
1. Unit: Vitest + Testing Library (утилиты форматирования суммы, валидация формы, ui-state).
2. Component/Integration: проверка hero-counter, тариф->форма, ошибки API.
3. E2E: Playwright (основной пользовательский путь от Hero до успешной отправки формы).
4. Отдельный e2e для prefers-reduced-motion сценария.
5. Smoke-test на 390px viewport перед релизом.

### 20.10 Observability и аналитика
1. Event tracking через GA4/PostHog (или выбранную платформу).
2. Логирование клиентских ошибок через Sentry (или аналог).
3. Отслеживать:
   - start/end hero animation;
   - click по CTA;
   - submit success/error;
   - переходы в /works и клики по работам.

### 20.11 CI/CD и окружения
1. Environments: dev, stage, prod.
2. CI pipeline:
   - install;
   - typecheck;
   - lint;
   - test;
   - build;
   - e2e smoke (для stage/prod predeploy).
3. Deploy: Vercel/Netlify/Cloudflare Pages (любой из approved вариантов).
4. Конфиги через env-переменные, без хардкода URL и ключей.

### 20.12 Стартовый набор зависимостей (пример)
```bash
pnpm add react react-dom react-router-dom @tanstack/react-query react-hook-form zod @hookform/resolvers clsx tailwind-merge class-variance-authority lucide-react countup.js motion
pnpm add -D typescript vite @vitejs/plugin-react tailwindcss eslint prettier vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright @feature-sliced/steiger
```

### 20.13 FSD quality gates (обязательно)
1. Импорты только через `index.ts` каждого слайса.
2. Нет импортов вверх по слоям и между слайсами одного слоя.
3. Бизнес-логика не размещается в `shared/`.
4. Новые `entities/features/widgets` добавлять только при использовании в 2+ местах.
5. Проверка архитектуры в CI:
```bash
npx steiger src
```

## 21. Поэтапный план реализации (A-Z)

### 21.1 Формат работы
1. Работа короткими этапами с демо после каждого этапа.
2. Каждый этап заканчивается измеримым результатом и check-list приемки.
3. После этапа обязательно: код-ревью, smoke-test, фиксация рисков.
4. Параллельная разработка допустима только при независимых задачах.

### 21.2 Роли и зоны ответственности
1. Product/Owner: финализирует контент, тарифы, юридические тексты, приоритеты.
2. UI/UX Designer: финальные макеты mobile-first + interaction states.
3. Frontend Engineer: React/FSD реализация и интеграции.
4. Backend Engineer: API, БД, Telegram-бот, модерация отчетов по суммам.
5. QA Engineer: e2e/regression, мобильные сценарии, accessibility-проверка.
6. DevOps: окружения, CI/CD, секреты, мониторинг.

### 21.3 Основные артефакты проекта
1. ТЗ (этот документ).
2. UI-kit/token спецификация (spacing, typography, motion tokens).
3. OpenAPI/контракты API.
4. Схема БД + миграции.
5. Тест-план (unit/integration/e2e).
6. Release checklist и rollback-план.

### 21.4 Definition of Ready (до старта разработки)
1. Утверждены референсы: Raycast/Stripe/CountUp.
2. Утвержден контент hero, работ, тарифов и формы.
3. Определены API-контракты и поля форм.
4. Есть доступы к аналитике, логированию, прод-окружению.
5. Назначены ответственные по каждому этапу.

## 22. Этап 0: Discovery и технический prep

### 22.1 Цель
1. Снять неопределенности до начала кодинга.

### 22.2 Задачи
1. Зафиксировать окончательные тексты всех секций.
2. Утвердить UX-flow и edge-cases формы.
3. Подготовить API-контракты и payload-примеры.
4. Утвердить схему событий аналитики.
5. Подготовить backlog задач по этапам 1-8.

### 22.3 Результат этапа
1. Подписанный scope MVP без "серых зон".

### 22.4 Приемка этапа
1. Все открытые вопросы переведены в решения.
2. Команда может начать этап 1 без блокеров.

### 22.5 Оценка
1. 1-2 рабочих дня.

## 23. Этап 1: Bootstrap проекта и базовая инфраструктура

### 23.1 Цель
1. Подготовить рабочий каркас проекта под FSD и CI.

### 23.2 Задачи Frontend
1. Инициализировать Vite + React + TS + Tailwind.
2. Настроить FSD-структуру и path aliases.
3. Подключить ESLint, Prettier, Husky, lint-staged.
4. Подключить TanStack Query, Router, базовый layout.
5. Настроить базовые env-конфиги (dev/stage/prod).

### 23.3 Задачи DevOps
1. Настроить CI pipeline: install -> typecheck -> lint -> test -> build.
2. Настроить preview deploy для pull request.

### 23.4 Результат этапа
1. Запускаемый проект с чистой архитектурой и quality gates.

### 23.5 Приемка этапа
1. `pnpm lint && pnpm test && pnpm build` проходят.
2. `npx steiger src` проходит без критичных нарушений.

### 23.6 Оценка
1. 1-2 рабочих дня.

## 24. Этап 2: Design foundation и UI primitives

### 24.1 Цель
1. Подготовить визуальный фундамент современного живого интерфейса.

### 24.2 Задачи
1. Реализовать дизайн-токены (typography, spacing, radius, shadows, motion).
2. Создать базовые компоненты: `Button`, `Section`, `Card`, `Input`, `FieldError`.
3. Добавить states: default/hover/active/focus/disabled/loading.
4. Настроить prefers-reduced-motion policy.

### 24.3 Результат этапа
1. Готовые переиспользуемые primitives для всех секций.

### 24.4 Приемка этапа
1. Все базовые компоненты консистентны на mobile/tablet/desktop.
2. Accessibility states визуально и функционально корректны.

### 24.5 Оценка
1. 1-2 рабочих дня.

## 25. Этап 3: Hero + анимированная сумма (wow-блок)

### 25.1 Цель
1. Реализовать ключевой экран с count-up анимацией и надежным fallback.

### 25.2 Задачи Frontend
1. Сверстать hero на `100dvh` mobile-first.
2. Интегрировать CountUp.js сценарий:
   - initial count-up;
   - pulse/glow акцент;
   - micro-update при новых значениях.
3. Добавить CTA-переходы в работы и тарифы.
4. Реализовать loading/error/fallback состояния суммы.

### 25.3 Задачи Backend
1. Подготовить endpoint `GET /api/public/earnings/total`.
2. Вернуть поля: `total_usd`, `reports_count`, `updated_at`.

### 25.4 Результат этапа
1. Hero полностью рабочий, производительный, готов к демо.

### 25.5 Приемка этапа
1. На 390px нет лагов и горизонтального скролла.
2. prefers-reduced-motion корректно упрощает motion.
3. При недоступности API UI не ломается.

### 25.6 Оценка
1. 2-3 рабочих дня.

## 26. Этап 4: Работы учеников (главная + /works)

### 26.1 Цель
1. Показать кейсы и обеспечить переход на отдельную страницу работ.

### 26.2 Задачи Frontend
1. Реализовать превью-гриду на главной (до 6 карточек).
2. Реализовать страницу `/works` с пагинацией/дозагрузкой.
3. Добавить карточку работы:
   - название;
   - что сделано;
   - результат;
   - ссылка на работу.
4. Реализовать empty/error/loading states.

### 26.3 Задачи Backend
1. Подготовить `GET /api/public/works?page=&limit=`.
2. Добавить сортировку по дате/релевантности.

### 26.4 Результат этапа
1. Полный пользовательский путь просмотра кейсов готов.

### 26.5 Приемка этапа
1. Кнопка "Смотреть еще" стабильно ведет на `/works`.
2. Карточки адаптивны и единообразны.

### 26.6 Оценка
1. 2-3 рабочих дня.

## 27. Этап 5: Тарифы + форма заявки

### 27.1 Цель
1. Реализовать конверсионный блок с выбором тарифа и отправкой заявки.

### 27.2 Задачи Frontend
1. Сверстать блок тарифов (stack на mobile).
2. Реализовать логику `Выбрать тариф` -> автоподстановка в форму.
3. Реализовать форму через RHF + Zod:
   - name;
   - contact;
   - goal (optional);
   - consent checkbox.
4. Отобразить success/error и сохранить введенные данные при ошибке.

### 27.3 Задачи Backend
1. Подготовить `GET /api/public/tariffs`.
2. Подготовить `POST /api/public/leads` с anti-spam (honeypot + rate limit).

### 27.4 Результат этапа
1. Конверсионный контур "тариф -> форма -> лид" готов.

### 27.5 Приемка этапа
1. Валидации работают корректно.
2. Ошибки и успех отображаются понятным текстом.

### 27.6 Оценка
1. 2-3 рабочих дня.

## 28. Этап 6: Telegram-бот и модерация сумм

### 28.1 Цель
1. Запустить поток данных от отчетов учеников в публичный счетчик.

### 28.2 Рекомендуемый backend stack
1. Node.js + TypeScript.
2. Fastify/NestJS (любой один).
3. PostgreSQL + Prisma.
4. Redis (rate limit, кеш).
5. Telegram Bot API через grammY/Telegraf.

### 28.3 Задачи
1. Реализовать `POST /api/internal/bot/report`.
2. Реализовать таблицу `earnings_reports` + статусы `pending/approved/rejected`.
3. Реализовать модерацию (минимум admin endpoint/UI).
4. Реализовать агрегатор `total_earnings` только по approved данным.
5. Добавить аудит-лог изменений статусов.

### 28.4 Результат этапа
1. Счетчик на сайте питается реальными модерируемыми данными.

### 28.5 Приемка этапа
1. Неподтвержденные суммы не попадают в total.
2. Все изменения статусов трассируются.

### 28.6 Оценка
1. 3-5 рабочих дней.

## 29. Этап 7: Аналитика, SEO, A11y, Performance hardening

### 29.1 Цель
1. Довести проект до прод-качества по метрикам и доступности.

### 29.2 Задачи
1. Подключить аналитику событий (hero, works, tariffs, form).
2. Подключить error monitoring (Sentry или аналог).
3. Реализовать SEO-мета, OpenGraph, sitemap/robots при необходимости.
4. Оптимизировать LCP/CLS/INP.
5. Провести accessibility проход по WCAG AA.

### 29.3 Результат этапа
1. Прод-готовый лендинг с наблюдаемостью.

### 29.4 Приемка этапа
1. Lighthouse и KPI соответствуют целям из разделов выше.

### 29.5 Оценка
1. 2-3 рабочих дня.

## 30. Этап 8: QA, релиз и стабилизация

### 30.1 Цель
1. Безопасный релиз и короткий цикл стабилизации после запуска.

### 30.2 Задачи QA
1. Полный regression ключевых сценариев.
2. E2E smoke на 390px/768px/1440px.
3. Проверка браузеров: Safari iOS, Chrome Android, Chrome Desktop.

### 30.3 Задачи релиза
1. Feature freeze.
2. Backup/rollback plan.
3. Production deploy.
4. Post-release мониторинг 24-72 часа.

### 30.4 Результат этапа
1. Стабильный production запуск.

### 30.5 Приемка этапа
1. Нет блокирующих дефектов P0/P1.
2. Воронка событий корректно собирается.

### 30.6 Оценка
1. 1-2 рабочих дня + окно наблюдения.

## 31. Итоговый roadmap по времени
1. Этап 0: 1-2 дня.
2. Этап 1: 1-2 дня.
3. Этап 2: 1-2 дня.
4. Этап 3: 2-3 дня.
5. Этап 4: 2-3 дня.
6. Этап 5: 2-3 дня.
7. Этап 6: 3-5 дней.
8. Этап 7: 2-3 дня.
9. Этап 8: 1-2 дня.
10. Итого MVP: ориентир 15-25 рабочих дней (в зависимости от размера команды и параллельности).

## 32. Риски и меры снижения
1. Риск: задержка контента и кейсов.
   Мера: отдельный контент-дедлайн перед этапом 4.
2. Риск: тяжелые анимации на mobile.
   Мера: performance budget + упрощенный режим motion.
3. Риск: грязные данные из бота.
   Мера: обязательная модерация + аудит-лог.
4. Риск: просадка конверсии после релиза.
   Мера: A/B гипотезы hero и формы в итерации v1.2+.

## 33. Что делаем первым (практический старт)
1. Запускаем Этап 0 и Этап 1.
2. После успешного демо Этапа 1 начинаем Этап 3 (Hero) как главный value-block.
3. Параллельно готовим контент и данные для Этапов 4-5.

