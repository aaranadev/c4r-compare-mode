import { useSelector } from 'react-redux'
// @ts-ignore
import { CartoLayer } from '@deck.gl/carto'
import { selectSourceById } from '@carto/react-redux'
import { useCartoLayerProps } from '@carto/react-api'
import { htmlForFeature } from '@/utils/htmlForFeatureUtils'
import { RootState } from '@/store/store'
import { useAppHook } from '@/contexts/AppContext'

export const EXAMPLE_LAYER_ID = 'exampleLayer'

export default function ExampleLayer() {
  const { exampleLayer } = useSelector((state: RootState) => state.carto.layers)
  const source = useSelector((state) =>
    // @ts-ignore
    selectSourceById(state, exampleLayer?.source),
  )
  const {
    state: { selectedFeatures },
    addFeature,
  } = useAppHook()
  const cartoLayerProps = useCartoLayerProps({ source })

  if (exampleLayer && source) {
    return new CartoLayer({
      ...cartoLayerProps,
      id: EXAMPLE_LAYER_ID,
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
          addFeature(info.object.properties.osm_id)
        }
      },
    })
  }
}
