import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { Link, useSearchParams } from 'react-router-dom'
import { useWorksPages } from '@/shared/api'
import { routes } from '@/shared/config/routes'
import {
  captureWorkCardTransition,
  clearWorkCardReturnTransition,
  getWorkCardReturnTransition,
} from '@/shared/lib/work-card-transition'
import './WorksPage.css'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 6
const MAX_PAGE = 50
const MAX_LIMIT = 24
const LIMIT_OPTIONS = [6, 12, 24] as const

gsap.registerPlugin(useGSAP, Flip)

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
  const pageRef = useRef<HTMLElement | null>(null)
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

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (
        reduceMotion ||
        worksPages.isLoading ||
        worksPages.isError ||
        worksPages.items.length === 0
      ) {
        return
      }

      const transitionPayload = getWorkCardReturnTransition()
      if (!transitionPayload) {
        return
      }

      const targetCard = pageRef.current?.querySelector<HTMLElement>(
        `.work-line[data-work-id="${transitionPayload.workId}"]`,
      )

      if (!targetCard) {
        return
      }

      clearWorkCardReturnTransition()

      const ghost = document.createElement('div')
      ghost.className = 'works-return-transition-ghost'
      ghost.style.position = 'fixed'
      ghost.style.top = `${transitionPayload.rect.top}px`
      ghost.style.left = `${transitionPayload.rect.left}px`
      ghost.style.width = `${transitionPayload.rect.width}px`
      ghost.style.height = `${transitionPayload.rect.height}px`
      ghost.style.borderRadius = transitionPayload.style.borderRadius
      ghost.style.background = transitionPayload.style.background
      ghost.style.border = transitionPayload.style.border
      ghost.style.boxShadow = transitionPayload.style.boxShadow
      ghost.style.pointerEvents = 'none'
      ghost.style.margin = '0'
      ghost.style.zIndex = '80'
      ghost.style.willChange = 'transform, width, height, border-radius, opacity'

      document.body.appendChild(ghost)
      gsap.set(targetCard, { autoAlpha: 0, y: 22 })

      const ghostStart = Flip.getState(ghost)
      Flip.fit(ghost, targetCard, { scale: true })

      const flipTween = Flip.from(ghostStart, {
        targets: ghost,
        ease: 'power3.inOut',
        duration: 0.7,
        absolute: true,
      })

      const cardTween = gsap.to(targetCard, {
        autoAlpha: 1,
        y: 0,
        ease: 'power2.out',
        duration: 0.4,
        delay: 0.14,
      })

      return () => {
        flipTween.kill()
        cardTween.kill()
        ghost.remove()
        gsap.set(targetCard, { clearProps: 'opacity,visibility,transform' })
      }
    },
    {
      scope: pageRef,
      dependencies: [
        worksPages.isLoading,
        worksPages.isError,
        worksPages.items.map((item) => item.id).join('|'),
      ],
      revertOnUpdate: true,
    },
  )

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

  const handleWorkLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    workId: string,
  ) => {
    const cardElement = event.currentTarget.closest<HTMLElement>('.work-line')

    if (!cardElement) {
      return
    }

    captureWorkCardTransition(cardElement, workId)
  }

  return (
    <main className="page works-page" ref={pageRef}>
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
                  <article
                    key={work.id}
                    className="work-line card"
                    data-work-id={work.id}
                  >
                    <h2>{work.title}</h2>
                    <p>{work.summary}</p>
                    <p className="work-line-result">{work.result}</p>
                    <Link
                      to={routes.workDetails(work.id)}
                      onClick={(event) => handleWorkLinkClick(event, work.id)}
                    >
                      Открыть кейс
                    </Link>
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
