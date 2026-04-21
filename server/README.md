# Telegram Earnings Backend

## Что делает сервис

- Принимает суммы заработка в тенге (KZT) через Telegram-бота.
- Принимает отправки без лимита по количеству записей.
- Работает по whitelist через env `ALLOWED_TELEGRAM_IDS`.
- Отдает агрегированную сумму в API для фронтенда.
- Принимает лиды через `POST /api/public/leads` с базовой защитой от abuse.

## Переменные окружения

Скопируйте `.env.server.example` в `.env.server` и заполните:

- `SERVER_PORT` - порт HTTP сервера.
- `APP_TIMEZONE` - timezone для отображения дат и времени (по умолчанию `Asia/Almaty`).
- `DATA_FILE_PATH` - путь к JSON-файлу хранилища.
- `CORS_ORIGINS` - разрешенные источники через запятую.
- `TELEGRAM_BOT_TOKEN` - токен бота.
- `ADMIN_TELEGRAM_IDS` - ID администраторов через запятую.
- `ALLOWED_TELEGRAM_IDS` - ID пользователей с правом отправки сумм через запятую.
- `API_SECRET` - секрет для private endpoint (опционально).
- `EMAILJS_SERVICE_ID` - EmailJS service id (опционально, для серверной отправки лидов).
- `EMAILJS_TEMPLATE_ID` - EmailJS template id (опционально).
- `EMAILJS_PUBLIC_KEY` - EmailJS public key (опционально).

## Команды бота

- `/id` - показать ваш `telegram_user_id` и текущий доступ.
- `/add <amount>` - добавить сумму в тенге.
- `120.50` (просто текстом) - добавить сумму.
- `/total` - общая сумма (admin).
- `/last [n]` - последние записи (admin).
- `/entries` или `/all` - все пополнения с `id` (admin).
- `/edit <entry_id> <amount>` - редактировать запись (admin).
- `/delete <entry_id>` - удалить запись (admin).

## Как узнать telegram_user_id пользователя

1. Пользователь открывает бота и отправляет `/id`.
2. Бот возвращает строку вида `Ваш telegram_user_id: 123456789`.
3. Админ добавляет доступ через env сервиса:
   - `ALLOWED_TELEGRAM_IDS=123456789,987654321`
4. Перезапускает деплой сервиса.

## API

- `GET /health`
- `GET /api/public/earnings/total`
- `POST /api/public/leads`
- `GET /api/private/earnings/entries?limit=20` (требует `x-api-secret`)

## Deploy на Render (Blueprint)

В репозитории добавлен [`render.yaml`](/Users/ignat.yaskevich/Ndevelopment/render.yaml), поэтому можно деплоить как Blueprint:

1. В Render: `New +` -> `Blueprint`.
2. Выберите этот репозиторий.
3. Render создаст сервис `telegram-earnings-backend` с persistent disk.
4. После первого деплоя заполните env в Render:
   - `CORS_ORIGINS=https://<your-vercel-domain>`
   - `TELEGRAM_BOT_TOKEN=<bot-token>`
   - `ADMIN_TELEGRAM_IDS=<your-telegram-id>`
   - `ALLOWED_TELEGRAM_IDS=<comma-separated-user-ids>`
   - `API_SECRET=<strong-secret>` (опционально, но рекомендовано)
   - `EMAILJS_SERVICE_ID=<service_id>` (опционально)
   - `EMAILJS_TEMPLATE_ID=<template_id>` (опционально)
   - `EMAILJS_PUBLIC_KEY=<public_key>` (опционально)
5. Убедитесь, что health отвечает:
   - `https://<render-service-domain>/health`
6. На Vercel добавьте:
   - `VITE_API_BASE_URL=https://<render-service-domain>`
   - `VITE_USE_LOCAL_MOCKS=false`
