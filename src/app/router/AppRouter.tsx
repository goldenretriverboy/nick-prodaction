import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { routes } from '@/shared/config/routes'

const HomePage = lazy(() =>
  import('@/pages/home').then((module) => ({ default: module.HomePage })),
)

const WorksPage = lazy(() =>
  import('@/pages/works').then((module) => ({ default: module.WorksPage })),
)

const WorkDetailsPage = lazy(() =>
  import('@/pages/work-details').then((module) => ({
    default: module.WorkDetailsPage,
  })),
)

const PrivacyPolicyPage = lazy(() =>
  import('@/pages/legal').then((module) => ({
    default: module.PrivacyPolicyPage,
  })),
)

const OfferPage = lazy(() =>
  import('@/pages/legal').then((module) => ({ default: module.OfferPage })),
)

export function AppRouter() {
  return (
    <Suspense fallback={<div className="page">Загружаем страницу...</div>}>
      <Routes>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.works} element={<WorksPage />} />
        <Route
          path={routes.workDetailsPattern}
          element={<WorkDetailsPage />}
        />
        <Route path={routes.privacy} element={<PrivacyPolicyPage />} />
        <Route path={routes.offer} element={<OfferPage />} />
        <Route path="*" element={<Navigate to={routes.home} replace />} />
      </Routes>
    </Suspense>
  )
}
