import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import {
  useCreateLead,
  useEarningsTotal,
  useTariffsList,
  useWorksList,
} from '@/shared/api'
import { routes } from '@/shared/config/routes'
import { leadFormSchema, type LeadFormValues } from '../model/lead-form'
import './HomePage.css'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

const HERO_GOAL_TOTAL = 25_000_000

function formatDotSeparatedNumber(value: number): string {
  return Math.max(0, Math.floor(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function normalizeAmount(value: number | null | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.floor(value))
}

function getYouTubeVideoId(url: string): string | null {
  const match =
    url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/) ??
    url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/) ??
    url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/)

  return match?.[1] ?? null
}

function getYouTubePoster(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

function getYouTubeEmbedUrl(
  videoId: string,
  mode: 'modal' | 'hover' = 'modal',
): string {
  const query = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })

  if (mode === 'hover') {
    query.set('controls', '0')
    query.set('loop', '1')
    query.set('playlist', videoId)
  } else {
    query.set('controls', '1')
  }

  return `https://www.youtube.com/embed/${videoId}?${query.toString()}`
}

type ActiveVideoModal = {
  title: string
  videoId: string
  link: string
}

export function HomePage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const formRef = useRef<HTMLElement | null>(null)
  const animatedValueRef = useRef(0)

  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hoveredWorkId, setHoveredWorkId] = useState<string | null>(null)
  const [hasFinePointer, setHasFinePointer] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isLeadFormVisible, setIsLeadFormVisible] = useState(false)
  const [activeVideoModal, setActiveVideoModal] = useState<ActiveVideoModal | null>(
    null,
  )

  const earningsQuery = useEarningsTotal()
  const worksQuery = useWorksList({ page: 1, limit: 6 })
  const tariffsQuery = useTariffsList()
  const createLeadMutation = useCreateLead()

  const targetTotal = normalizeAmount(earningsQuery.data?.total_usd)

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      contact: '',
      goal: '',
      selectedTariff: '',
      consent: false,
    },
  })

  useEffect(() => {
    const durationMs = 900
    const startAt = performance.now()
    const initialValue = animatedValueRef.current
    const delta = targetTotal - initialValue

    const tick = (time: number) => {
      const progress = Math.min((time - startAt) / durationMs, 1)
      const eased = 1 - (1 - progress) ** 3
      const nextValue = Math.floor(initialValue + delta * eased)
      animatedValueRef.current = nextValue
      setAnimatedTotal(nextValue)

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [targetTotal])

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)')
    const updatePointerType = () => {
      const nextValue = media.matches
      setHasFinePointer(nextValue)
      if (!nextValue) {
        setHoveredWorkId(null)
      }
    }

    updatePointerType()
    media.addEventListener('change', updatePointerType)

    return () => {
      media.removeEventListener('change', updatePointerType)
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateReducedMotion = () => {
      const nextValue = media.matches
      setPrefersReducedMotion(nextValue)
      if (nextValue) {
        setHoveredWorkId(null)
      }
    }

    updateReducedMotion()
    media.addEventListener('change', updateReducedMotion)

    return () => {
      media.removeEventListener('change', updateReducedMotion)
    }
  }, [])

  useEffect(() => {
    if (!activeVideoModal) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveVideoModal(null)
      }
    }

    window.addEventListener('keydown', onEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onEscape)
    }
  }, [activeVideoModal])

  useEffect(() => {
    const updateLeadFormVisibility = () => {
      const formElement = formRef.current
      if (!formElement) {
        setIsLeadFormVisible(false)
        return
      }

      const rect = formElement.getBoundingClientRect()
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight

      const isOnLeadForm =
        rect.top <= viewportHeight * 0.55 &&
        rect.bottom >= viewportHeight * 0.25

      setIsLeadFormVisible((previous) =>
        previous === isOnLeadForm ? previous : isOnLeadForm,
      )
    }

    const rafId = window.requestAnimationFrame(updateLeadFormVisibility)

    window.addEventListener('scroll', updateLeadFormVisibility, { passive: true })
    window.addEventListener('resize', updateLeadFormVisibility)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', updateLeadFormVisibility)
      window.removeEventListener('resize', updateLeadFormVisibility)
    }
  }, [])

  useGSAP(
    () => {
      const splitInstances: SplitText[] = []

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (reduceMotion) {
        return
      }

      const heroTimeline = gsap.timeline({
        defaults: {
          duration: 0.8,
          ease: 'power3.out',
        },
      })

      heroTimeline
        .from(
          '.hero-title',
          {
            y: 24,
            autoAlpha: 0,
            duration: 0.82,
          },
          0,
        )
        .from(
          '.hero-earnings-card',
          {
            y: 20,
            scale: 0.98,
            autoAlpha: 0,
            duration: 0.75,
          },
          0.18,
        )
        .from(
          '.hero-progress-wrap',
          {
            y: 18,
            autoAlpha: 0,
            duration: 0.72,
          },
          0.28,
        )
        .from(
          '.hero-scroll, .hero-float-cta',
          {
            y: 16,
            autoAlpha: 0,
            duration: 0.62,
          },
          0.28,
        )

      const sectionTitles = gsap.utils.toArray<HTMLElement>('.section-title')
      sectionTitles.forEach((title) => {
        const split = SplitText.create(title, {
          type: 'lines,words',
          linesClass: 'section-split-line',
          wordsClass: 'section-split-word',
        })
        splitInstances.push(split)

        gsap.from(split.words, {
          yPercent: 108,
          autoAlpha: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.024,
          scrollTrigger: {
            trigger: title,
            start: 'top 86%',
            once: true,
          },
        })
      })

      const revealTargets = gsap.utils.toArray<HTMLElement>(
        '.section-subtitle, .works-grid, .tariffs-grid, .lead-form',
      )

      revealTargets.forEach((element) => {
        gsap.from(element, {
          y: 26,
          autoAlpha: 0,
          duration: 0.72,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            once: true,
          },
        })
      })

      return () => {
        splitInstances.forEach((split) => split.revert())
      }
    },
    {
      scope: pageRef,
      revertOnUpdate: true,
      dependencies: [
        worksQuery.data?.items.length ?? 0,
        tariffsQuery.data?.items.length ?? 0,
      ],
    },
  )

  const displayedTotal = normalizeAmount(animatedTotal)
  const totalLabel = `${formatDotSeparatedNumber(displayedTotal)} ₸`
  const goalLabel = `${formatDotSeparatedNumber(HERO_GOAL_TOTAL)} тенге`
  const heroProgressPercent = Math.min(
    100,
    Math.max(0, (displayedTotal / HERO_GOAL_TOTAL) * 100),
  )
  const heroProgressPercentLabel = Math.round(heroProgressPercent)
  const heroProgressStyle = {
    '--hero-progress': heroProgressPercent.toFixed(2),
  } as React.CSSProperties
  const displayedTariffs = tariffsQuery.data?.items ?? []
  const tariffOptions = tariffsQuery.data?.items ?? []

  const onSelectTariff = (tariffTitle: string) => {
    setValue('selectedTariff', tariffTitle, {
      shouldValidate: true,
      shouldDirty: true,
    })
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onSubmit = async (values: LeadFormValues) => {
    setSubmitError(null)

    try {
      const goal = values.goal || undefined
      const selectedTariff = values.selectedTariff || undefined

      await createLeadMutation.mutateAsync({
        name: values.name,
        contact: values.contact,
        goal,
        selected_tariff: selectedTariff,
      })

      setIsSubmitted(true)
      reset({
        name: '',
        contact: '',
        goal: '',
        selectedTariff,
        consent: false,
      })
    } catch (error: unknown) {
      setIsSubmitted(false)
      const message = error instanceof Error ? error.message : ''

      if (message.includes('429')) {
        setSubmitError(
          'Слишком много попыток отправки. Подождите пару минут и попробуйте снова.',
        )
        return
      }

      if (message.includes('400')) {
        setSubmitError('Проверьте заполнение полей формы и попробуйте снова.')
        return
      }

      if (message.toLowerCase().includes('failed to fetch')) {
        setSubmitError(
          'Не удалось отправить в EmailJS. Проверьте интернет и настройки EmailJS.',
        )
        return
      }

      if (message.includes('EmailJS config is missing')) {
        setSubmitError(
          'Не настроен EmailJS. Заполните VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID и VITE_EMAILJS_PUBLIC_KEY.',
        )
        return
      }

      setSubmitError('Не удалось отправить заявку. Попробуйте еще раз.')
    }
  }

  const openVideoModal = (
    event: React.MouseEvent<HTMLAnchorElement>,
    title: string,
    link: string,
    videoId: string | null,
  ) => {
    if (!videoId) {
      return
    }

    event.preventDefault()
    setActiveVideoModal({
      title,
      videoId,
      link,
    })
  }

  return (
    <main className="page home-page" ref={pageRef}>
      <section className="hero card" id="hero">
        <div className="hero-layout">
          <h1
            className="hero-title"
            aria-label="AI-КОНТЕНТ, КОТОРЫЙ ПРИНОСИТ ДЕНЬГИ"
          >
            AI-КОНТЕНТ, КОТОРЫЙ ПРИНОСИТ ДЕНЬГИ
          </h1>

          <div className="hero-earnings-card">
            <p className="hero-earnings-label">Заработок учеников</p>
            <p className="hero-earnings-total" aria-live="polite">
              {totalLabel}
            </p>
            <p className="hero-earnings-goal">цель {goalLabel}</p>
            <p className="hero-live" role="status" aria-live="polite">
              <span className="hero-live-dot" aria-hidden="true" />
              Обновляется в реальном времени
            </p>
          </div>

          <div className="hero-progress-wrap">
            <div
              className="hero-progress"
              style={heroProgressStyle}
              role="img"
              aria-label={`Прогресс ${heroProgressPercentLabel}%`}
            >
              <span className="hero-progress-value">{heroProgressPercentLabel}%</span>
            </div>
          </div>
        </div>
        <a
          className={`hero-float-cta ${
            isLeadFormVisible ? 'hero-float-cta-hidden' : ''
          }`}
          href="#lead-form"
          aria-label="Перейти к форме заявки"
          tabIndex={isLeadFormVisible ? -1 : 0}
        >
          Оставить заявку
        </a>
        <a
          className="hero-scroll"
          href="#works-preview"
          aria-label="Прокрутить к блоку работ"
        >
          <span className="hero-scroll-icon" aria-hidden="true" />
        </a>
      </section>

      <section className="section" id="works-preview">
        <div className="section-head section-head-centered">
          <h2 className="section-title section-title-center section-title-prominent section-title-match-lead">
            Примеры работ
          </h2>
        </div>

        {worksQuery.isLoading && (
          <div className="state-block">Загружаем список работ...</div>
        )}

        {worksQuery.isError && (
          <div className="state-block state-error">
            Не удалось загрузить работы. Проверьте API или включите mock-режим.
          </div>
        )}

        {!worksQuery.isLoading && !worksQuery.isError && worksQuery.data && (
          <>
            {worksQuery.data.items.length === 0 ? (
              <div className="state-block">Новые работы скоро появятся.</div>
            ) : (
              <div className="works-grid" aria-label="Список работ учеников">
                {worksQuery.data.items.map((work) => {
                  const videoId = getYouTubeVideoId(work.link)
                  const poster = work.preview_image ?? (videoId ? getYouTubePoster(videoId) : '')
                  const isHoverPreviewActive =
                    Boolean(videoId) &&
                    hasFinePointer &&
                    !prefersReducedMotion &&
                    hoveredWorkId === work.id &&
                    !activeVideoModal
                  const resultLines = work.result
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                  const displayLines = resultLines.length > 0
                    ? resultLines
                    : [work.summary]

                  return (
                    <article className="work-card card" key={work.id}>
                      <a
                        className="work-card-media work-card-media-portrait"
                        href={work.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Открыть видео: ${work.title}`}
                        onMouseEnter={() => {
                          if (
                            !hasFinePointer ||
                            prefersReducedMotion ||
                            !videoId
                          ) {
                            return
                          }
                          setHoveredWorkId(work.id)
                        }}
                        onMouseLeave={() => {
                          if (!hasFinePointer) {
                            return
                          }
                          setHoveredWorkId((current) =>
                            current === work.id ? null : current,
                          )
                        }}
                        onClick={(event) =>
                          openVideoModal(event, work.title, work.link, videoId)
                        }
                      >
                        {poster && (
                          <span
                            className="work-card-media-blur"
                            style={{ backgroundImage: `url(${poster})` }}
                            aria-hidden="true"
                          />
                        )}
                        {poster && (
                          <img
                            className="work-card-media-image"
                            src={poster}
                            alt={`${work.title} — обложка видео`}
                            loading="lazy"
                          />
                        )}
                        {isHoverPreviewActive && videoId && (
                          <iframe
                            className="work-card-media-hover-preview"
                            src={getYouTubeEmbedUrl(videoId, 'hover')}
                            title={`Превью ${work.title}`}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            tabIndex={-1}
                          />
                        )}
                        {!poster && (
                          <span className="work-card-media-fallback">
                            Видео недоступно
                          </span>
                        )}
                        <span className="work-card-media-frame" aria-hidden="true" />
                        <span className="work-card-media-gradient" aria-hidden="true" />
                        <span className="work-card-metrics" role="list">
                          {displayLines.map((line, index) => (
                            <span className="work-card-metric" role="listitem" key={`${work.id}-${index}`}>
                              <span className="work-card-metric-icon" aria-hidden="true">
                                {index === 0 ? '◉' : index === 1 ? '♡' : '↗'}
                              </span>
                              {line}
                            </span>
                          ))}
                        </span>
                      </a>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>

      <section className="section" id="tariffs">
        <div className="section-head section-head-centered">
          <h2 className="section-title section-title-center section-title-prominent section-title-match-lead">
            Тарифы
          </h2>
        </div>

        {tariffsQuery.isLoading && (
          <div className="state-block">Загружаем тарифы...</div>
        )}

        {tariffsQuery.isError && (
          <div className="state-block state-error">
            Не удалось загрузить тарифы. Проверьте API или включите mock-режим.
          </div>
        )}

        {!tariffsQuery.isLoading && !tariffsQuery.isError && tariffsQuery.data && (
          <>
            {displayedTariffs.length === 0 ? (
              <div className="state-block">Активные тарифы пока не опубликованы.</div>
            ) : (
              <div className="tariffs-grid">
                {displayedTariffs.map((tariff) => (
                  <article
                    key={tariff.id}
                    className={`tariff-card card ${
                      tariff.recommended ? 'tariff-recommended' : ''
                    }`}
                  >
                    <div className="tariff-head">
                      <h3 className="tariff-title">{tariff.title}</h3>
                      {tariff.recommended && (
                        <span className="tariff-badge">Рекомендуемый</span>
                      )}
                    </div>
                    <p className="tariff-price-pill">{tariff.price}</p>
                    <ul className="tariff-includes">
                      {tariff.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    {tariff.format.trim().length > 0 && (
                      <p className="tariff-format">{tariff.format}</p>
                    )}
                    <button
                      type="button"
                      className="btn tariff-cta"
                      onClick={() => onSelectTariff(tariff.title)}
                    >
                      Выбрать
                    </button>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="section" id="lead-form" ref={formRef}>
        <div className="section-head section-head-centered">
          <h2 className="section-title section-title-center section-title-caps section-title-prominent">
            Оставьте заявку
          </h2>
        </div>

        {isSubmitted && (
          <div className="form-success" role="status">
            Заявка отправлена. Свяжемся с вами в течение 24 часов.
          </div>
        )}

        {submitError && (
          <div className="form-submit-error" role="alert">
            {submitError}
          </div>
        )}

        <form className="lead-form card" onSubmit={handleSubmit(onSubmit)}>
          <div className="lead-form-grid">
            <label className="lead-field">
              <input type="text" placeholder="Имя" aria-label="Имя" {...register('name')} />
              {errors.name && (
                <span className="field-error">{errors.name.message}</span>
              )}
            </label>

            <label className="lead-field">
              <input
                type="text"
                placeholder="Telegram или WhatsApp"
                aria-label="Telegram или WhatsApp"
                {...register('contact')}
              />
              {errors.contact && (
                <span className="field-error">{errors.contact.message}</span>
              )}
            </label>

            <label className="lead-field lead-field-wide">
              <input
                type="text"
                maxLength={300}
                placeholder="Цель обучения (опционально)"
                aria-label="Цель обучения (опционально)"
                {...register('goal')}
              />
              {errors.goal && (
                <span className="field-error">{errors.goal.message}</span>
              )}
            </label>

            <label className="lead-field lead-field-wide">
              <select
                aria-label="Тариф"
                {...register('selectedTariff')}
                disabled={tariffsQuery.isLoading || tariffOptions.length === 0}
                defaultValue=""
              >
                <option value="" disabled>
                  {tariffsQuery.isLoading ? 'Загружаем тарифы...' : 'Выберите тариф'}
                </option>
                {tariffOptions.map((tariff) => (
                  <option key={tariff.id} value={tariff.title}>
                    {tariff.title}
                  </option>
                ))}
              </select>
              {errors.selectedTariff && (
                <span className="field-error">{errors.selectedTariff.message}</span>
              )}
            </label>
          </div>

          <label className="consent-row">
            <input type="checkbox" {...register('consent')} />
            <span>
              Согласен с <Link to={routes.privacy}>политикой</Link> и{' '}
              <Link to={routes.offer}>офертой</Link>
            </span>
          </label>
          {errors.consent && (
            <span className="field-error">{errors.consent.message}</span>
          )}

          <button
            type="submit"
            className="btn lead-submit"
            disabled={isSubmitting || createLeadMutation.isPending}
          >
            {isSubmitting || createLeadMutation.isPending
              ? 'Отправляем...'
              : 'ОТПРАВИТЬ ЗАЯВКУ'}
          </button>
          <p className="lead-disclaimer">
            Обычно отвечаем в Telegram/WhatsApp в течение одного рабочего дня.
          </p>
        </form>
      </section>

      {activeVideoModal && (
        <div
          className="video-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Видео: ${activeVideoModal.title}`}
          onClick={() => setActiveVideoModal(null)}
        >
          <div className="video-modal" onClick={(event) => event.stopPropagation()}>
            <div className="video-modal-player">
              <button
                type="button"
                className="video-modal-close"
                aria-label="Закрыть видео"
                onClick={() => setActiveVideoModal(null)}
              >
                ×
              </button>
              <iframe
                className="video-modal-iframe"
                src={getYouTubeEmbedUrl(activeVideoModal.videoId, 'modal')}
                title={`Видео: ${activeVideoModal.title}`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <a
              href={activeVideoModal.link}
              target="_blank"
              rel="noopener noreferrer"
              className="video-modal-link"
            >
              Открыть на YouTube
            </a>
          </div>
        </div>
      )}
    </main>
  )
}
