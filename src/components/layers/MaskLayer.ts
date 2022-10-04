import { useSelector } from 'react-redux'
// @ts-ignore
import { OPERATION } from '@deck.gl/core'
// @ts-ignore
import { SolidPolygonLayer } from '@deck.gl/layers'
import { MASK_ID } from '@carto/react-core/'
import { selectSpatialFilter } from '@/store/cartoSlice'
import { TILESET_SOURCE_ID_2 } from '@/data/sources/tilesetSource'

export default function MaskLayer() {
  const _spatialFilterGeometry = useSelector((state) =>
    // @ts-ignore
    selectSpatialFilter(state, TILESET_SOURCE_ID_2),
  )

  const spatialFilterGeometry = _spatialFilterGeometry[0]

  const maskData = spatialFilterGeometry
    ? // @ts-ignore
      [{ polygon: spatialFilterGeometry?.geometry?.coordinates }]
    : []

  return new SolidPolygonLayer({
    id: MASK_ID,
    operation: OPERATION.MASK,
    data: maskData,
    getFillColor: [255, 255, 255, 255],
  })
}
