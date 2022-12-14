import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth0 } from '@auth0/auth0-react'
import { initialState } from '@/store/initialStateSlice'
import { ROUTE_PATHS } from '@/routes'
import { RootState } from '@/store/store'

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element
}) {
  const { isAuthenticated, isLoading } = useAuth0()
  const accessToken = useSelector(
    (state: RootState) => (state.carto.credentials as any).accessToken,
  )

  if (!initialState.oauth) {
    return children
  }

  const notAuthenticated = !isLoading && !isAuthenticated && !accessToken

  if (notAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} />
  }

  return accessToken ? children : null
}
