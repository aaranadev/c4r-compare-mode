import { useSelector } from 'react-redux'
// @ts-ignore
import { CartoLayer } from '@deck.gl/carto'
import { selectSourceById } from '@carto/react-redux'
import { htmlForFeature } from '@/utils/htmlForFeatureUtils'
import { RootState } from '@/store/store'
import { useAppHook } from '@/contexts/AppContext'
import useCartoLayerProps from '../widgets/common/useCartoLayerProps'

export const POI_LAYER_ID = 'poiLayer'

export default function PoiLayer() {
  const { poiLayer } = useSelector((state: RootState) => state.carto.layers)
  const source = useSelector((state) =>
    // @ts-ignore
    selectSourceById(state, poiLayer?.source),
  )
  const {
    state: { selectedFeatures },
    addFeature,
  } = useAppHook()
  const cartoLayerProps = useCartoLayerProps({ source })

  if (poiLayer && source) {
    return new CartoLayer({
      ...cartoLayerProps,
      id: POI_LAYER_ID,
      getFillColor: (d: any) => {
        if (selectedFeatures.includes(d.properties.osm_id)) {
          return [120, 20, 255]
        }
        return [241, 109, 122]
      },
      pointRadiusMinPixels: 2,
      pickable: true,
      onHover: (info: any) => {
        if (info?.object) {
          info.object = {
            // @ts-ignore
            html: htmlForFeature({
              feature: info.object,
              includeColumns: ['name'],
            }),
            style: {},
          }
        }
      },
      onClick: (info: any) => {
        if (info?.object) {
          addFeature({
            id: info.object.properties.osm_id,
            geometry: {
              type: 'Point',
              coordinates: info.coordinate,
            },
          })
        }
      },
    })
  }
}
