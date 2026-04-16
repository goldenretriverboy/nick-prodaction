import { Link, useParams } from 'react-router-dom'
import { useWorkDetails } from '@/shared/api'
import { routes } from '@/shared/config/routes'
import './WorkDetailsPage.css'

export function WorkDetailsPage() {
  const { workId = '' } = useParams()
  const workDetailsQuery = useWorkDetails(workId)

  return (
    <main className="page work-details-page">
      <header className="work-details-header section card">
        <Link to={routes.works} className="work-details-back-link">
          К списку работ
        </Link>
      </header>

      {workDetailsQuery.isLoading && (
        <section className="section">
          <div className="state-block">Загружаем детали кейса...</div>
        </section>
      )}

      {workDetailsQuery.isError && (
        <section className="section">
          <div className="state-block state-error">
            Кейс не найден или временно недоступен.
          </div>
        </section>
      )}

      {!workDetailsQuery.isLoading && !workDetailsQuery.isError && workDetailsQuery.data && (
        <article className="work-details-card section card">
          <p className="work-details-kicker">Кейс ученика</p>
          <h1>{workDetailsQuery.data.title}</h1>
          <p className="work-details-result">{workDetailsQuery.data.result}</p>

          <section>
            <h2>Задача</h2>
            <p>{workDetailsQuery.data.challenge ?? workDetailsQuery.data.summary}</p>
          </section>

          <section>
            <h2>Решение</h2>
            <p>{workDetailsQuery.data.solution ?? 'Описание решения пока не опубликовано.'}</p>
          </section>

          <section>
            <h2>Итог</h2>
            <p>{workDetailsQuery.data.outcome ?? workDetailsQuery.data.result}</p>
          </section>

          <section>
            <h2>Стек</h2>
            {workDetailsQuery.data.tech_stack && workDetailsQuery.data.tech_stack.length > 0 ? (
              <ul>
                {workDetailsQuery.data.tech_stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Not found in repo.</p>
            )}
          </section>
        </article>
      )}
    </main>
  )
}
