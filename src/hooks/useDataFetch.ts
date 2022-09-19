import { useEffect } from 'react'
import {
  QueryFnParams,
  useQueryFetch,
  QueryFetchOptions,
} from '@carto/ps-react-hooks'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setError } from '@/store/appSlice'
import { RootState } from '@/store/store'
import { Credentials } from '@carto/react-api'
interface DataFetchParams extends QueryFnParams {
  abortController: AbortSignal
  credentials?: Credentials
}

interface UseDataFetchOptions<TQueryFnData, TError>
  extends QueryFetchOptions<TQueryFnData, TError> {
  use404?: boolean
  errorMsg?: string
}

/**
 * hook for declarative data fetching
 *
 * @param queryFn - function to fetch data
 * @param dependencies - dependencies for queryFn
 * @param {UseDataFetchOptions} options - options for fetching
 *
 * @example
 *
 * ```ts
 * useDataFetch(({ credentials, abortController }) => {
 *  // your logic function that returns a promise
 * }, [dep1, dep2, dep3])
 * ```
 */
export default function useDataFetch<T = unknown, E extends Error = Error>(
  queryFn: (params: DataFetchParams) => Promise<T>,
  dependencies: ReadonlyArray<unknown> = [],
  {
    use404 = false,
    errorMsg = 'Error in data fetch',
    ...options
  }: UseDataFetchOptions<T, E> = {},
) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const credentials = useSelector((state: RootState) => state.carto.credentials)

  const { error, ...res } = useQueryFetch<T, E>(
    (params) =>
      queryFn({
        ...params,
        credentials,
      }),
    dependencies,
    options,
  )

  useEffect(() => {
    if (error) {
      if (use404) {
        navigate('/404', { replace: true })
      } else if (error.message !== 'The user aborted a request.') {
        dispatch(setError(`${errorMsg}: ${error.message}`))
      }
    }
  }, [dispatch, errorMsg, navigate, error, use404])

  return {
    error,
    ...res,
  }
}
