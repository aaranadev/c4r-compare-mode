import TilesetLayer from './TilesetLayer'
import PoiLayer from './PoiLayer'
import FeatureSelectionLayer from './FeatureSelectionLayer'
// [hygen] Import layers

export const getLayers = () => {
  return [
    TilesetLayer(),
    PoiLayer(),
    FeatureSelectionLayer(),
    // [hygen] Add layer
  ]
}
