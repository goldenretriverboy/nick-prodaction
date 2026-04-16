import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useWorksPages } from '@/shared/api'
import { routes } from '@/shared/config/routes'
import './WorksPage.css'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 6
const MAX_PAGE = 50
const MAX_LIMIT = 24
const LIMIT_OPTIONS = [6, 12, 24] as const

function parseNumberParam(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    return fallback
  }

  return parsed
}

export function WorksPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseNumberParam(
    searchParams.get('page'),
    DEFAULT_PAGE,
    DEFAULT_PAGE,
    MAX_PAGE,
  )

  const limit = parseNumberParam(
    searchParams.get('limit'),
    DEFAULT_LIMIT,
    1,
    MAX_LIMIT,
  )

  useEffect(() => {
    const currentPage = searchParams.get('page')
    const currentLimit = searchParams.get('limit')

    if (currentPage === String(page) && currentLimit === String(limit)) {
      return
    }

    const normalized = new URLSearchParams(searchParams)
    normalized.set('page', String(page))
    normalized.set('limit', String(limit))
    setSearchParams(normalized, { replace: true })
  }, [limit, page, searchParams, setSearchParams])

  const worksPages = useWorksPages({ page, limit })

  const handleShowMore = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(page + 1))
    nextParams.set('limit', String(limit))
    setSearchParams(nextParams)
  }

  const handleLimitChange = (nextLimit: number) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(DEFAULT_PAGE))
    nextParams.set('limit', String(nextLimit))
    setSearchParams(nextParams)
  }

  return (
    <main className="page works-page">
      <header className="works-header section card">
        <p className="works-kicker">Каталог работ</p>
        <h1 className="section-title">Реальные проекты учеников</h1>
        <p className="section-subtitle">
          Параметры пагинации синхронизированы с URL: page={page}, limit={limit}.
        </p>
        <div className="works-controls">
          <label htmlFor="works-limit">На страницу</label>
          <select
            id="works-limit"
            value={limit}
            onChange={(event) => handleLimitChange(Number(event.target.value))}
          >
            {LIMIT_OPTIONS.map((limitOption) => (
              <option key={limitOption} value={limitOption}>
                {limitOption}
              </option>
            ))}
          </select>
          <p>
            Показано: {worksPages.items.length}
            {worksPages.total > 0 ? ` из ${worksPages.total}` : ''}
          </p>
        </div>
        <Link to={routes.home} className="works-back-link">
          На главную
        </Link>
      </header>

      <section className="works-list section">
        {worksPages.isLoading && (
          <div className="state-block">Загружаем список кейсов...</div>
        )}

        {worksPages.isError && (
          <div className="state-block state-error">
            Ошибка загрузки работ: {worksPages.error?.message ?? 'unknown error'}.
          </div>
        )}

        {!worksPages.isLoading && !worksPages.isError && (
          <>
            {worksPages.items.length === 0 ? (
              <div className="state-block">Новые работы скоро появятся.</div>
            ) : (
              <>
                {worksPages.items.map((work) => (
                  <article key={work.id} className="work-line card">
                    <h2>{work.title}</h2>
                    <p>{work.summary}</p>
                    <p className="work-line-result">{work.result}</p>
                    <Link to={routes.workDetails(work.id)}>Открыть кейс</Link>
                  </article>
                ))}
              </>
            )}
          </>
        )}

        {!worksPages.isError && worksPages.hasNextPage && (
          <button
            type="button"
            className="works-more-button"
            onClick={handleShowMore}
            disabled={worksPages.isLoadingMore}
          >
            {worksPages.isLoadingMore ? 'Загружаем...' : 'Показать еще'}
          </button>
        )}
      </section>
    </main>
  )
}
