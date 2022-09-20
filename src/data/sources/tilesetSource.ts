// @ts-ignore
import { MAP_TYPES } from '@deck.gl/carto'

export const TILESET_SOURCE_ID_2 = 'tilesetSource2'

const source = {
  id: TILESET_SOURCE_ID_2,
  type: MAP_TYPES.TABLE,
  connection: 'carto-ps-bq-css-demo-us',
  data: 'carto-ps-bq-css-demo-us.carto_site_selection_data.demographics',
}

export default source
