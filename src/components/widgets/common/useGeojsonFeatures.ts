import { useEffect, useCallback } from 'react'
import { debounce } from '@carto/react-core'
import { Methods } from '@carto/react-workers'
import useFeaturesCommons from './useFeaturesCommons'
import { executeTask } from '@/components/workers/workerPool'

export default function useGeojsonFeatures({
  source,
  viewport,
  spatialFilter,
  uniqueIdProperty,
  debounceTimeout = 250,
}: any) {
  const [
    debounceIdRef,
    isGeoJsonLoaded,
    setGeoJsonLoaded,
    clearDebounce,
    stopAnyCompute,
    setSourceFeaturesReady,
  ] = useFeaturesCommons({ source })

  const sourceId = source?.id

  const computeFeatures = useCallback(
    ({ viewport, spatialFilter, uniqueIdProperty }) => {
      // @ts-ignore
      executeTask(sourceId, Methods.GEOJSON_FEATURES, {
        viewport,
        geometry: spatialFilter,
        uniqueIdProperty,
      }).then(() => {
        // @ts-ignore
        setSourceFeaturesReady(true)
      })
      // .catch(throwError)
    },
    [setSourceFeaturesReady, sourceId],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedComputeFeatures = useCallback(
    debounce(computeFeatures, debounceTimeout),
    [computeFeatures],
  )

  useEffect(() => {
    if (sourceId && isGeoJsonLoaded) {
      // @ts-ignore
      clearDebounce()
      // @ts-ignore
      setSourceFeaturesReady(false)
      // @ts-ignore
      debounceIdRef.current = debouncedComputeFeatures({
        viewport,
        spatialFilter,
        uniqueIdProperty,
      })
    }
  }, [
    viewport,
    spatialFilter,
    uniqueIdProperty,
    sourceId,
    isGeoJsonLoaded,
    debouncedComputeFeatures,
    setSourceFeaturesReady,
    clearDebounce,
    debounceIdRef,
  ])

  const onDataLoad = useCallback(
    (geojson) => {
      // @ts-ignore
      stopAnyCompute()
      // @ts-ignore
      setSourceFeaturesReady(false)
      // @ts-ignore
      executeTask(sourceId, Methods.LOAD_GEOJSON_FEATURES, { geojson })
        // @ts-ignore
        .then(() => setGeoJsonLoaded(true))
      // .catch(throwError)
    },
    [sourceId, setSourceFeaturesReady, stopAnyCompute, setGeoJsonLoaded],
  )

  return [onDataLoad]
}
