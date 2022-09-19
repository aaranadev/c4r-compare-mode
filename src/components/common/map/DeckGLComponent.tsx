// @ts-ignore
import DeckGL from '@deck.gl/react'
import { useSelector } from 'react-redux'
import { Map } from 'react-map-gl'
import { useTheme, useMediaQuery } from '@material-ui/core'
import { BASEMAPS } from '@carto/react-basemaps'
import { useMapHooks } from './useMapHooks'
import { RootState } from '@/store/store'
import maplibregl from 'maplibre-gl'

export default function DeckGLComponent({ layers }: { layers: any[] }) {
  const viewState = useSelector((state: RootState) => state.carto.viewState)
  const basemap = useSelector(
    // @ts-ignore
    (state: RootState) => BASEMAPS[state.carto.basemap],
  )
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'))
  const {
    handleCursor,
    handleHover,
    handleSizeChange,
    handleTooltip,
    handleViewStateChange,
  } = useMapHooks()

  return (
    <DeckGL
      viewState={{ ...viewState }}
      controller={true}
      layers={layers}
      onViewStateChange={handleViewStateChange}
      onResize={handleSizeChange}
      onHover={handleHover}
      getCursor={handleCursor}
      // @ts-ignore
      getTooltip={handleTooltip}
      pickingRadius={isMobile ? 10 : 0}
    >
      <Map reuseMaps mapStyle={basemap.options.mapStyle} mapLib={maplibregl} />
    </DeckGL>
  )
}
