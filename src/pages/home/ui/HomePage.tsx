import { useEffect, useMemo, useRef, useState } from 'react'
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
import { mockEarningsTotal } from '@/shared/config/content'
import { routes } from '@/shared/config/routes'
import { formatCurrency } from '@/shared/lib/format-currency'
import { captureWorkCardTransition } from '@/shared/lib/work-card-transition'
import { leadFormSchema, type LeadFormValues } from '../model/lead-form'
import './HomePage.css'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

export function HomePage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const formRef = useRef<HTMLElement | null>(null)
  const animatedValueRef = useRef(0)

  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [activeTariff, setActiveTariff] = useState<string | null>(null)

  const earningsQuery = useEarningsTotal()
  const worksQuery = useWorksList({ page: 1, limit: 6 })
  const tariffsQuery = useTariffsList()
  const createLeadMutation = useCreateLead()

  const targetTotal = earningsQuery.data?.total_usd ?? mockEarningsTotal.total_usd

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

  useGSAP(
    () => {
      const splitInstances: SplitText[] = []
      const heroKicker = pageRef.current?.querySelector<HTMLElement>('.hero-kicker')

      if (heroKicker) {
        const normalizedText = heroKicker.textContent?.replace(/\s+/g, ' ').trim()
        if (normalizedText) {
          heroKicker.textContent = normalizedText
        }
        heroKicker.removeAttribute('style')
      }

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

      if (heroKicker) {
        heroTimeline.from(
          heroKicker,
          {
            y: 12,
            autoAlpha: 0,
            duration: 0.55,
            ease: 'power2.out',
          },
          0,
        )
      }

      heroTimeline
        .from(
          '.hero-total',
          {
            y: 40,
            scale: 0.97,
            autoAlpha: 0,
            duration: 0.95,
          },
          0.05,
        )
        .from(
          '.hero-note, .hero-live',
          {
            y: 14,
            autoAlpha: 0,
            duration: 0.62,
            stagger: 0.08,
          },
          0.24,
        )
        .from(
          '.hero-scroll',
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
        '.section-subtitle, .works-grid, .tariffs-grid, .lead-form, .btn-inline',
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

  const totalLabel = useMemo(
    () => `${formatCurrency(animatedTotal)} $`,
    [animatedTotal],
  )

  const onSelectTariff = (tariffTitle: string) => {
    setActiveTariff(tariffTitle)
    setValue('selectedTariff', tariffTitle, { shouldValidate: true })
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onSubmit = async (values: LeadFormValues) => {
    setSubmitError(null)

    try {
      await createLeadMutation.mutateAsync({
        name: values.name,
        contact: values.contact,
        goal: values.goal || undefined,
        selected_tariff: values.selectedTariff || undefined,
      })

      setIsSubmitted(true)
      setActiveTariff(values.selectedTariff ?? null)
      reset({
        name: '',
        contact: '',
        goal: '',
        selectedTariff: values.selectedTariff,
        consent: false,
      })
    } catch {
      setIsSubmitted(false)
      setSubmitError('Не удалось отправить заявку. Попробуйте еще раз.')
    }
  }

  const handleWorkLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    workId: string,
  ) => {
    const cardElement = event.currentTarget.closest<HTMLElement>(
      '.work-card, .work-line',
    )

    if (!cardElement) {
      return
    }

    captureWorkCardTransition(cardElement, workId)
  }

  return (
    <main className="page home-page" ref={pageRef}>
      <section className="hero card" id="hero">
        <div className="hero-layout">
          <p className="hero-topic">Курсы по AI-разработке</p>
          <p className="hero-kicker">Ученики уже зарабатывают с AI</p>
          <div className="hero-counter">
            <div className="hero-total-stage">
              <p className="hero-total-depth" aria-hidden="true">
                {totalLabel}
              </p>
              <p className="hero-total" aria-live="polite">
                {totalLabel}
              </p>
            </div>
          </div>
          <div className="hero-meta">
            <p className="hero-note">Подтвержденный реальный заработок учеников</p>
            <p className="hero-live" role="status" aria-live="polite">
              <span className="hero-live-dot" aria-hidden="true" />
              Трекинг обновляется в реальном времени
            </p>
          </div>
        </div>
        <a
          className="hero-scroll"
          href="#works-preview"
          aria-label="Прокрутить к блоку работ"
        >
          <span className="hero-scroll-icon" aria-hidden="true" />
        </a>
      </section>

      <section className="section" id="works-preview">
        <div className="section-head">
          <p className="section-eyebrow">Кейсы выпускников</p>
          <h2 className="section-title">Работы учеников</h2>
          <p className="section-subtitle">
            Показываем превью 6 кейсов и отдельную страницу полного списка.
          </p>
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
                {worksQuery.data.items.map((work) => (
                  <article className="work-card card" key={work.id}>
                    <div className="work-card-head">
                      <span className="work-card-tag">Кейс ученика</span>
                    </div>
                    <h3 className="work-card-title">{work.title}</h3>
                    <p className="work-card-summary">{work.summary}</p>
                    <div className="work-card-result-wrap">
                      <p className="work-card-result-label">Результат</p>
                      <p className="work-result">{work.result}</p>
                    </div>
                    <Link
                      to={routes.workDetails(work.id)}
                      className="work-card-link"
                      onClick={(event) => handleWorkLinkClick(event, work.id)}
                    >
                      Открыть кейс
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        <Link className="btn btn-inline" to={routes.works}>
          Смотреть еще
        </Link>
      </section>

      <section className="section" id="tariffs">
        <div className="section-head">
          <p className="section-eyebrow">Пакеты обучения</p>
          <h2 className="section-title">Тарифы</h2>
          <p className="section-subtitle">
            Выберите тариф и сразу заполните заявку.
          </p>
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
            {tariffsQuery.data.items.length === 0 ? (
              <div className="state-block">Активные тарифы пока не опубликованы.</div>
            ) : (
              <div className="tariffs-grid">
                {tariffsQuery.data.items.map((tariff) => (
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
                    <p className="tariff-audience">{tariff.audience}</p>
                    <ul className="tariff-includes">
                      {tariff.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <div className="tariff-foot">
                      <p className="tariff-format">{tariff.format}</p>
                      <p className="tariff-price">{tariff.price}</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary tariff-cta"
                      onClick={() => onSelectTariff(tariff.title)}
                    >
                      Выбрать тариф
                    </button>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="section" id="lead-form" ref={formRef}>
        <div className="section-head">
          <p className="section-eyebrow">Быстрый старт</p>
          <h2 className="section-title">Оставьте заявку</h2>
          <p className="section-subtitle">
            Подберем подходящий формат обучения и маршрут старта.
          </p>
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
          <input type="hidden" {...register('selectedTariff')} />

          <div className="lead-form-grid">
            <label className="lead-field">
              <span className="lead-label">Имя</span>
              <input type="text" placeholder="Ваше имя" {...register('name')} />
              {errors.name && (
                <span className="field-error">{errors.name.message}</span>
              )}
            </label>

            <label className="lead-field">
              <span className="lead-label">Telegram или WhatsApp</span>
              <input
                type="text"
                placeholder="@username или +7..."
                {...register('contact')}
              />
              {errors.contact && (
                <span className="field-error">{errors.contact.message}</span>
              )}
            </label>

            <label className="lead-field lead-field-wide">
              <span className="lead-label">Цель обучения (опционально)</span>
              <textarea
                rows={4}
                maxLength={300}
                placeholder="Что хотите получить в результате?"
                {...register('goal')}
              />
              {errors.goal && (
                <span className="field-error">{errors.goal.message}</span>
              )}
            </label>
          </div>

          <p className="selected-tariff">
            Выбранный тариф: <strong>{activeTariff ?? 'не выбран'}</strong>
          </p>

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
            className="btn btn-primary lead-submit"
            disabled={isSubmitting || createLeadMutation.isPending}
          >
            {isSubmitting || createLeadMutation.isPending
              ? 'Отправляем...'
              : 'Отправить заявку'}
          </button>
          <p className="lead-disclaimer">
            Обычно отвечаем в Telegram/WhatsApp в течение одного рабочего дня.
          </p>
        </form>
      </section>
    </main>
  )
}
