import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useCreateLead,
  useEarningsTotal,
  useTariffsList,
  useWorksList,
} from '@/shared/api'
import { mockEarningsTotal } from '@/shared/config/content'
import { routes } from '@/shared/config/routes'
import { formatCurrency } from '@/shared/lib/format-currency'
import { leadFormSchema, type LeadFormValues } from '../model/lead-form'
import './HomePage.css'

export function HomePage() {
  const formRef = useRef<HTMLElement | null>(null)
  const animatedValueRef = useRef(0)
  const worksCarouselRef = useRef<HTMLDivElement | null>(null)
  const worksPrimaryGroupRef = useRef<HTMLDivElement | null>(null)
  const worksPausedRef = useRef(false)

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

  useEffect(() => {
    const container = worksCarouselRef.current
    const primaryGroup = worksPrimaryGroupRef.current

    if (!container || !primaryGroup) {
      return
    }

    const groupWidth = primaryGroup.scrollWidth
    if (groupWidth <= 0) {
      return
    }

    container.scrollLeft = groupWidth

    const speedPxPerSecond = 30
    let rafId = 0
    let prevTs = performance.now()

    const animate = (ts: number) => {
      const delta = ts - prevTs
      prevTs = ts

      if (!worksPausedRef.current) {
        container.scrollLeft += (speedPxPerSecond * delta) / 1000

        if (container.scrollLeft >= groupWidth * 2) {
          container.scrollLeft -= groupWidth
        }

        if (container.scrollLeft <= 0) {
          container.scrollLeft += groupWidth
        }
      }

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [worksQuery.data?.items.length])

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

  const pauseWorksCarousel = () => {
    worksPausedRef.current = true
  }

  const resumeWorksCarousel = () => {
    worksPausedRef.current = false
  }

  return (
    <main className="page home-page">
      <section className="hero card" id="hero">
        <div className="hero-copy">
          <p className="hero-kicker">Ученики уже зарабатывают с AI</p>
        </div>

        <div className="hero-counter">
          <p className="hero-total" aria-live="polite">
            {totalLabel}
          </p>
          <p className="hero-note">Общий подтвержденный заработок</p>
        </div>

        <div className="hero-actions" aria-label="Быстрые действия">
          <a href="#works-preview" className="btn btn-primary">
            Смотреть работы
          </a>
          <a href="#tariffs" className="btn btn-ghost">
            Выбрать тариф
          </a>
        </div>
      </section>

      <section className="section" id="works-preview">
        <div className="section-head">
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
              <div
                className="works-scroll"
                aria-label="Бесконечная карусель работ"
                ref={worksCarouselRef}
                onMouseEnter={pauseWorksCarousel}
                onMouseLeave={resumeWorksCarousel}
                onPointerDown={pauseWorksCarousel}
                onPointerUp={resumeWorksCarousel}
                onFocusCapture={pauseWorksCarousel}
                onBlurCapture={resumeWorksCarousel}
              >
                <div className="works-track">
                  {[0, 1, 2].map((groupIndex) => (
                    <div
                      key={groupIndex}
                      className={`works-group ${
                        groupIndex === 0 ? 'works-group-primary' : 'works-group-clone'
                      }`}
                      ref={groupIndex === 0 ? worksPrimaryGroupRef : undefined}
                      aria-hidden={groupIndex !== 0}
                    >
                      {worksQuery.data.items.map((work) => (
                        <article
                          className="work-card card"
                          key={`${work.id}-${groupIndex}`}
                        >
                          <h3>{work.title}</h3>
                          <p>{work.summary}</p>
                          <p className="work-result">{work.result}</p>
                          <Link
                            to={routes.workDetails(work.id)}
                            tabIndex={groupIndex === 0 ? undefined : -1}
                            aria-hidden={groupIndex !== 0}
                          >
                            Открыть кейс
                          </Link>
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
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
                      <h3>{tariff.title}</h3>
                      {tariff.recommended && <span>Рекомендуемый</span>}
                    </div>
                    <p>{tariff.audience}</p>
                    <ul>
                      {tariff.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="tariff-format">{tariff.format}</p>
                    <p className="tariff-price">{tariff.price}</p>
                    <button
                      type="button"
                      className="btn btn-primary"
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

          <label>
            Имя
            <input type="text" placeholder="Ваше имя" {...register('name')} />
            {errors.name && (
              <span className="field-error">{errors.name.message}</span>
            )}
          </label>

          <label>
            Telegram или WhatsApp
            <input
              type="text"
              placeholder="@username или +7..."
              {...register('contact')}
            />
            {errors.contact && (
              <span className="field-error">{errors.contact.message}</span>
            )}
          </label>

          <label>
            Цель обучения (опционально)
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
            className="btn btn-primary"
            disabled={isSubmitting || createLeadMutation.isPending}
          >
            {isSubmitting || createLeadMutation.isPending
              ? 'Отправляем...'
              : 'Отправить заявку'}
          </button>
        </form>
      </section>
    </main>
  )
}
