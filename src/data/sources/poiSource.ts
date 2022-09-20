// @ts-ignore
import { MAP_TYPES } from '@deck.gl/carto'

export const POI_SOURCE_ID = 'poiSource'

const source = {
  id: POI_SOURCE_ID,
  type: MAP_TYPES.TABLE,
  connection: 'carto-ps-bq-css-demo-us',
  data: 'carto-ps-bq-css-demo-us.carto_site_selection_data.osm_pois_usa',
}

export default source
