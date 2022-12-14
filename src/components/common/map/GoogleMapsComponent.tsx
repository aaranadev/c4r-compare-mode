import { useSelector } from 'react-redux'
import { BASEMAPS, GoogleMap } from '@carto/react-basemaps'
import { useMapHooks } from './useMapHooks'
import { RootState } from '@/store/store'

export default function GoogleMapsComponent({ layers }: { layers: any[] }) {
  const viewState = useSelector((state: RootState) => state.carto.viewState)
  const basemap = useSelector(
    // @ts-ignore
    (state: RootState) => BASEMAPS[state.carto.basemap],
  )
  const googleApiKey = useSelector(
    (state: RootState) => state.carto.googleApiKey,
  )
  const { handleSizeChange, handleTooltip, handleViewStateChange } =
    useMapHooks()

  return (
    <GoogleMap
      basemap={basemap}
      apiKey={googleApiKey}
      viewState={{ ...viewState }}
      layers={layers}
      onViewStateChange={handleViewStateChange}
      onResize={handleSizeChange}
      getTooltip={handleTooltip}
    />
  )
}
