import { Link } from 'react-router-dom'
import { routes } from '@/shared/config/routes'
import './LegalPage.css'

export function OfferPage() {
  return (
    <main className="page legal-page">
      <article className="legal-card card">
        <h1>Публичная оферта</h1>
        <p className="legal-meta">Версия от 2026-04-17</p>

        <section>
          <h2>1. Предмет оферты</h2>
          <p>
            Исполнитель предоставляет доступ к образовательному продукту по
            выбранному тарифу, а пользователь принимает условия и оплачивает
            услугу.
          </p>
        </section>

        <section>
          <h2>2. Порядок оформления</h2>
          <ul>
            <li>Пользователь оставляет заявку через форму сайта.</li>
            <li>Стороны уточняют формат и условия участия.</li>
            <li>После оплаты пользователь получает доступ к программе.</li>
          </ul>
        </section>

        <section>
          <h2>3. Стоимость и оплата</h2>
          <p>
            Актуальная стоимость публикуется в блоке тарифов. Отдельные условия
            рассрочки и скидок: <strong>Not found in repo</strong>.
          </p>
        </section>

        <section>
          <h2>4. Возвраты и отмена</h2>
          <p>
            Условия возврата зависят от факта оказания услуги и фиксируются при
            подтверждении заявки. Детальные правила: <strong>Not found in repo</strong>.
          </p>
        </section>

        <section>
          <h2>5. Ограничение ответственности</h2>
          <p>
            Результаты обучения зависят от вовлеченности пользователя и не
            являются гарантированным финансовым результатом.
          </p>
        </section>

        <div className="legal-actions">
          <Link to={routes.home}>Вернуться на главную</Link>
          <Link to={routes.privacy}>Смотреть политику</Link>
        </div>
      </article>
    </main>
  )
}
