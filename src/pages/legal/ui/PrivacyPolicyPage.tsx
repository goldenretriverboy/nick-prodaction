import { Link } from 'react-router-dom'
import { routes } from '@/shared/config/routes'
import './LegalPage.css'

export function PrivacyPolicyPage() {
  return (
    <main className="page legal-page">
      <article className="legal-card card">
        <h1>Политика конфиденциальности</h1>
        <p className="legal-meta">Версия от 2026-04-17</p>

        <section>
          <h2>1. Какие данные собираем</h2>
          <ul>
            <li>Имя и контакт из формы заявки.</li>
            <li>Технические данные браузера для стабильной работы сайта.</li>
            <li>События взаимодействия с интерфейсом для улучшения UX.</li>
          </ul>
        </section>

        <section>
          <h2>2. Зачем используем данные</h2>
          <ul>
            <li>Обработка заявки и обратная связь по выбранному тарифу.</li>
            <li>Улучшение контента, навигации и скорости сайта.</li>
            <li>Диагностика ошибок и предотвращение злоупотреблений.</li>
          </ul>
        </section>

        <section>
          <h2>3. Передача третьим лицам</h2>
          <p>
            Данные передаются только подрядчикам, которые обеспечивают работу
            сервиса (hosting, аналитика, коммуникации), и только в объеме,
            необходимом для их функций.
          </p>
        </section>

        <section>
          <h2>4. Хранение и удаление</h2>
          <p>
            Данные хранятся ограниченное время и удаляются по запросу
            пользователя, если это не противоречит законодательству.
          </p>
        </section>

        <section>
          <h2>5. Контакты</h2>
          <p>
            Для запроса на удаление или уточнение персональных данных напишите в
            поддержку: <strong>Not found in repo</strong>.
          </p>
        </section>

        <div className="legal-actions">
          <Link to={routes.home}>Вернуться на главную</Link>
          <Link to={routes.offer}>Смотреть оферту</Link>
        </div>
      </article>
    </main>
  )
}
