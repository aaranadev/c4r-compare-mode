import { InvalidColumnError } from '@carto/react-core'
import { selectAreFeaturesReadyForSource } from '@carto/react-redux'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import useWidgetSource from './useWidgetSource'

const DEFAULT_INVALID_COLUMN_ERR =
  'One or more columns used in this widget are not available in the data source.'

export default function useWidgetFetch(
  modelFn: any,
  { id, dataSource, params, global, onError, enabled = true }: any,
) {
  // State
  const [data, setData] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [warning, setWarning] = useState('')

  const isSourceReady = useSelector(
    (state) => global || selectAreFeaturesReadyForSource(state, dataSource),
  )
  const source = useWidgetSource({ dataSource, id })

  useEffect(() => {
    setIsLoading(true)
    setWarning('')

    if (source && isSourceReady && enabled) {
      modelFn({
        source,
        ...params,
        global,
      })
        .then((data: any) => {
          if (data !== null && data !== undefined) {
            setData(data)
          }
        })
        .catch((error: any) => {
          if (InvalidColumnError.is(error)) {
            setWarning(DEFAULT_INVALID_COLUMN_ERR)
          } else if (onError) {
            onError(error)
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, source, onError, isSourceReady, global, enabled])

  return { data, isLoading, isSourceReady, source, warning }
}
