import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { Link, useParams } from 'react-router-dom'
import { useWorkDetails } from '@/shared/api'
import { routes } from '@/shared/config/routes'
import {
  captureWorkCardReturnTransition,
  consumeWorkCardTransition,
} from '@/shared/lib/work-card-transition'
import './WorkDetailsPage.css'

gsap.registerPlugin(useGSAP, Flip)

export function WorkDetailsPage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const detailsCardRef = useRef<HTMLElement | null>(null)
  const { workId = '' } = useParams()
  const workDetailsQuery = useWorkDetails(workId)

  const handleBackClick = () => {
    const detailsCard = detailsCardRef.current

    if (!detailsCard || !workId) {
      return
    }

    captureWorkCardReturnTransition(detailsCard, workId)
  }

  useGSAP(
    () => {
      if (!workDetailsQuery.data) {
        return
      }

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      const detailsCard = detailsCardRef.current

      if (reduceMotion || !detailsCard) {
        return
      }

      const transitionPayload = consumeWorkCardTransition(workId)
      if (!transitionPayload) {
        return
      }

      const ghost = document.createElement('div')
      ghost.className = 'work-details-transition-ghost'
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
      gsap.set(detailsCard, { autoAlpha: 0, y: 24 })

      const ghostStart = Flip.getState(ghost)
      Flip.fit(ghost, detailsCard, { scale: true })

      const flipTween = Flip.from(ghostStart, {
        targets: ghost,
        ease: 'power3.inOut',
        duration: 0.74,
        absolute: true,
      })

      const detailsTween = gsap.to(detailsCard, {
        autoAlpha: 1,
        y: 0,
        ease: 'power2.out',
        duration: 0.45,
        delay: 0.16,
      })

      return () => {
        flipTween.kill()
        detailsTween.kill()
        ghost.remove()
        gsap.set(detailsCard, { clearProps: 'opacity,visibility,transform' })
      }
    },
    {
      scope: pageRef,
      dependencies: [workId, Boolean(workDetailsQuery.data)],
      revertOnUpdate: true,
    },
  )

  return (
    <main className="page work-details-page" ref={pageRef}>
      <header className="work-details-header section card">
        <Link
          to={routes.works}
          className="work-details-back-link"
          onClick={handleBackClick}
        >
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
        <article className="work-details-card section card" ref={detailsCardRef}>
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
