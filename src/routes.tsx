import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import DefaultView from '@/components/common/DefaultView'

const Main = lazy(
  () => import(/* webpackPrefetch: true */ '@/components/views/main/Main'),
)
const NotFound = lazy(() => import('@/components/views/NotFound'))
const Login = lazy(() => import('@/components/views/Login'))
const Example = lazy(() => import('@/components/views/Example'))
// [hygen] Import views

export const ROUTE_PATHS = {
  LOGIN: '/login',
  DEFAULT: '/',
  NOT_FOUND: '404',
  EXAMPLE: '',
  // [hygen] Add path routes
}

const routes = [
  {
    path: ROUTE_PATHS.DEFAULT,
    element: (
      <ProtectedRoute>
        <DefaultView>
          <Main />
        </DefaultView>
      </ProtectedRoute>
    ),
    children: [
      { path: ROUTE_PATHS.EXAMPLE, element: <Example /> },
      // [hygen] Add routes
    ],
  },
  { path: ROUTE_PATHS.LOGIN, element: <Login /> },
  {
    path: ROUTE_PATHS.NOT_FOUND,
    element: (
      <DefaultView>
        <NotFound />
      </DefaultView>
    ),
  },
  { path: '*', element: <Navigate to={ROUTE_PATHS.NOT_FOUND} /> },
]

export default routes
