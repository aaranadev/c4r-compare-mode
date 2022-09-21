// @ts-ignore
import { MAP_TYPES } from '@deck.gl/carto'

export const TILESET_SOURCE_ID_2 = 'tilesetSource2'

const source = {
  id: TILESET_SOURCE_ID_2,
  type: MAP_TYPES.QUERY,
  connection: 'carto-ps-bq-css-demo-us',
  data: (coordinates) =>
    `SELECT id, ST_INTERSECTION(geom, ST_BUFFER(
      ST_GEOGPOINT(${coordinates[0]}, ${coordinates[1]})
    , 100)) as geom, name from \`carto-ps-bq-css-demo-us.carto_site_selection_data.boundaries\` WHERE ST_INTERSECTS(geom, ST_BUFFER(
      ST_GEOGPOINT(${coordinates[0]}, ${coordinates[1]})
    , 100))`,
}

export default source
