// @ts-ignore
import { MAP_TYPES } from '@deck.gl/carto'

export const EXAMPLE_SOURCE_ID = 'exampleSource'

const source = {
  id: EXAMPLE_SOURCE_ID,
  type: MAP_TYPES.TABLE,
  connection: 'carto-ps-bq-css-demo-us',
  data: 'carto-ps-bq-css-demo-us.carto_site_selection_data.osm_pois_usa',
}

export default source
