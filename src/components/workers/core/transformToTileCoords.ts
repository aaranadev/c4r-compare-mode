import { lngLatToWorld } from '@math.gl/web-mercator'

/**
 * Transform WGS84 coordinates to tile coords.
 * It's the inverse of deck.gl coordinate-transform (https://github.com/visgl/deck.gl/blob/master/modules/geo-layers/src/mvt-layer/coordinate-transform.js)
 *
 * @param {object} geometry - any valid geojson geometry
 * @param {{ west: number, east: number, north: number, south: number }} bbox - tile bbox as used in deck.gl
 * @returns {GeoJSON}
 */
export default function transformToTileCoords(geometry: any, bbox: any) {
  const nw = projectFlat([bbox.west, bbox.north])
  const se = projectFlat([bbox.east, bbox.south])
  const projectedBbox = [nw, se]

  const transformFn = availableTransformations[geometry.type]
  if (!transformFn) {
    throw new Error(`Unrecognized geometry type ${geometry.type}`)
  }

  return {
    ...geometry,
    coordinates: transformFn(geometry.coordinates, projectedBbox),
  }
}

const availableTransformations: any = {
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
}

function Point([pointX, pointY]: any, [nw, se]: any) {
  const x = inverseLerp(nw[0], se[0], pointX)
  const y = inverseLerp(nw[1], se[1], pointY)

  return [x, y]
}

function getPoints(geometry: any, bbox: any) {
  return geometry.map((g: any) => Point(projectFlat(g), bbox))
}

function MultiPoint(multiPoint: any, bbox: any) {
  return getPoints(multiPoint, bbox)
}

function LineString(line: any, bbox: any) {
  return getPoints(line, bbox)
}

function MultiLineString(multiLineString: any, bbox: any) {
  return multiLineString.map((lineString: any) => LineString(lineString, bbox))
}

function Polygon(polygon: any, bbox: any) {
  return polygon.map((polygonRing: any) => getPoints(polygonRing, bbox))
}

function MultiPolygon(multiPolygon: any, bbox: any) {
  return multiPolygon.map((polygon: any) => Polygon(polygon, bbox))
}

function projectFlat(xyz: any) {
  return lngLatToWorld(xyz)
}

function inverseLerp(a: any, b: any, x: any) {
  return (x - a) / (b - a)
}
