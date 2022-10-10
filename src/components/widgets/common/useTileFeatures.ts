import { useEffect, useCallback, useState } from 'react'
import { debounce, SpatialIndex } from '@carto/react-core'
import { Methods, executeTask } from '@carto/react-workers'
// @ts-ignore
import { setIsDroppingFeatures } from '@carto/react-redux'
import { parse } from '@loaders.gl/core'
// @ts-ignore
import { Layer } from '@deck.gl/core'
// @ts-ignore
import { TILE_FORMATS } from '@deck.gl/carto'
import useFeaturesCommons from './useFeaturesCommons'
import { useDispatch } from 'react-redux'
// import { executeTask } from '@/components/workers/workerPool'

export default function useTileFeatures({
  source,
  viewport,
  spatialFilter,
  uniqueIdProperty,
  debounceTimeout = 250,
}: any) {
  const dispatch = useDispatch()
  const [
    debounceIdRef,
    isTilesetLoaded,
    setTilesetLoaded,
    clearDebounce,
    stopAnyCompute,
    setSourceFeaturesReady,
  ] = useFeaturesCommons({ source })

  const [tileFormat, setTileFormat] = useState('')
  const [spatialIndex, setSpatialIndex] = useState()
  const [geoColumName, setGeoColumName] = useState()

  const sourceId = source?.id

  const computeFeatures = useCallback(
    ({ viewport, spatialFilter, uniqueIdProperty }) => {
      if (!tileFormat) {
        return null
      }

      // @ts-ignore
      setSourceFeaturesReady(false)

      executeTask(sourceId, Methods.TILE_FEATURES, {
        viewport,
        geometry: spatialFilter,
        uniqueIdProperty,
        tileFormat,
        geoColumName,
        spatialIndex,
      })
        .then(() => {
          // @ts-ignore
          setSourceFeaturesReady(true)
        })
        // .catch(throwError)
        // @ts-ignore
        .finally(clearDebounce)
    },
    [
      tileFormat,
      setSourceFeaturesReady,
      sourceId,
      geoColumName,
      spatialIndex,
      clearDebounce,
    ],
  )

  const loadTiles = useCallback(
    (tiles) => {
      // @ts-ignore
      const cleanedTiles = tiles.reduce((acc, { data, isVisible, bbox }) => {
        if (isVisible && data) {
          acc.push({
            data,
            bbox,
          })
        }
        return acc
      }, [])

      const isDroppingFeatures = tiles?.some(
        (tile: any) => tile.content?.isDroppingFeatures,
      )
      dispatch(setIsDroppingFeatures({ id: sourceId, isDroppingFeatures }))

      // @ts-ignore
      executeTask(sourceId, Methods.LOAD_TILES, { tiles: cleanedTiles })
        // @ts-ignore
        .then(() => setTilesetLoaded(true))
      // .catch(throwError)
    },
    [sourceId, setTilesetLoaded, dispatch],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedComputeFeatures = useCallback(
    debounce(computeFeatures, debounceTimeout),
    [computeFeatures],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedLoadTiles = useCallback(debounce(loadTiles, debounceTimeout), [
    loadTiles,
  ])

  useEffect(() => {
    if (sourceId && isTilesetLoaded) {
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
    debouncedComputeFeatures,
    sourceId,
    isTilesetLoaded,
    setSourceFeaturesReady,
    clearDebounce,
    debounceIdRef,
  ])

  const onViewportLoad = useCallback(
    (tiles) => {
      // @ts-ignore
      stopAnyCompute()
      // @ts-ignore
      setSourceFeaturesReady(false)
      // @ts-ignore
      debounceIdRef.current = debouncedLoadTiles(tiles)
    },
    [stopAnyCompute, setSourceFeaturesReady, debouncedLoadTiles, debounceIdRef],
  )

  const fetch = useCallback(
    (...args) => {
      // @ts-ignore
      stopAnyCompute()

      if (spatialIndex) {
        // @ts-ignore
        return Layer.defaultProps.fetch.value(...args)
      }
      // @ts-ignore
      return customFetch(...args)
    },
    [stopAnyCompute, spatialIndex],
  )

  const onDataLoad = useCallback(({ tiles: [tile], scheme }) => {
    const url = new URL(tile)
    const tilesFormat = url.searchParams.get('formatTiles')
    setTileFormat(tilesFormat || TILE_FORMATS.MVT)
    const geoColum = url.searchParams.get('geo_column')

    if (geoColum) {
      setGeoColumName(getColumnNameFromGeoColumn(geoColum))
    }
    setSpatialIndex(
      Object.values(SpatialIndex).includes(scheme) ? scheme : undefined,
    )
  }, [])

  return [onDataLoad, onViewportLoad, fetch]
}

// WORKAROUND: To read headers and know if the tile is dropping features.
// Remove when the new loader is ready => https://github.com/visgl/loaders.gl/pull/2128
const customFetch = async (
  url: any,
  { layer, loaders, loadOptions, signal }: any,
) => {
  loadOptions = loadOptions || layer.getLoadOptions()
  loaders = loaders || layer.props.loaders

  const response = await fetch(url, { signal })
  const isDroppingFeatures =
    response.headers.get('Features-Dropped-From-Tile') === 'true'
  const result = await parse(response, loaders, loadOptions)
  return result ? { ...result, isDroppingFeatures } : null
}

const getColumnNameFromGeoColumn = (geoColumn: any) => {
  const parts = geoColumn.split(':')
  return parts.length === 1 ? parts[0] : parts.length === 2 ? parts[1] : null
}
