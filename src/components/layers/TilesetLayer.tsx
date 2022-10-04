import { useSelector, useDispatch } from 'react-redux'
// @ts-ignore
import { colorBins, CartoLayer } from '@deck.gl/carto'
import { selectSourceById, updateLayer } from '@carto/react-redux'
import { htmlForFeature } from '@/utils/htmlForFeatureUtils'
import { LEGEND_TYPES } from '@carto/react-ui'
import useCartoLayerProps from '../widgets/common/useCartoLayerProps'

export const TILESET_LAYER_ID = 'tilesetLayer'

const COLORS = [
  [0, 147, 146],
  [57, 177, 133],
  [156, 203, 134],
  [233, 226, 156],
  [238, 180, 121],
  [232, 132, 113],
  [207, 89, 126],
]

const LABELS = [10, 100, 1e3, 1e4, 1e5, 1e6]

const layerConfig = {
  title: 'OSM Buildings',
  visible: true,
  legend: {
    attr: 'aggregated_total',
    type: LEGEND_TYPES.BINS,
    labels: LABELS,
    colors: COLORS,
  },
}

export default function TilesetLayer() {
  const dispatch = useDispatch()
  // @ts-ignore
  const { tilesetLayer } = useSelector((state) => state.carto.layers)
  const source = useSelector((state) =>
    selectSourceById(state, tilesetLayer?.source),
  )
  const cartoLayerProps = useCartoLayerProps({ source })
  if (tilesetLayer && source) {
    return new CartoLayer({
      ...cartoLayerProps,
      id: TILESET_LAYER_ID,
      // stroked: false,
      // pointRadiusUnits: 'pixels',
      // lineWidthUnits: 'pixels',
      pickable: true,
      // visible: tilesetLayer.visible,
      getFillColor: [128, 10, 210, 200],
      // getFillColor: colorBins({
      //   attr: layerConfig.legend.attr,
      //   domain: LABELS,
      //   colors: COLORS,
      // }),
      // pointRadiusMinPixels: 2,
      // onDataLoad: (data: any) => {
      //   dispatch(
      //     updateLayer({
      //       id: TILESET_LAYER_ID,
      //       layerAttributes: { ...layerConfig },
      //     }),
      //   )
      //   cartoLayerProps.onDataLoad && cartoLayerProps.onDataLoad(data)
      // },
    })
  }
}
