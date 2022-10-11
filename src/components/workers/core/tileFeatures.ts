import tileFeaturesGeometries, {
  getGeometryToIntersect,
} from './tileFeaturesGeometries'
import tileFeaturesSpatialIndex from './tileFeaturesSpatialIndex'

// export function getGeometryToIntersect(viewport: any, geometry: any) {
//   return geometry.length
//     ? intersect(bboxPolygon(viewport), geometry[0])
//     : bboxPolygon(viewport)
// }

export function tileFeatures({
  tiles,
  viewport,
  geometry,
  uniqueIdProperty,
  tileFormat,
  geoColumName,
  spatialIndex,
}: any) {
  const geometryToIntersect = getGeometryToIntersect(viewport, geometry)

  if (!geometryToIntersect) {
    return []
  }

  if (spatialIndex) {
    return tileFeaturesSpatialIndex({
      tiles,
      geometryToIntersect,
      geoColumName,
      spatialIndex,
    })
  }
  return geometryToIntersect.map((d: any) =>
    tileFeaturesGeometries({
      tiles,
      tileFormat,
      geometryToIntersect: d,
      uniqueIdProperty,
    }),
  )
}
