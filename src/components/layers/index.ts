import TilesetLayer from './TilesetLayer';
import PoiLayer from './PoiLayer';
// [hygen] Import layers

export const getLayers = () => {
  return [
    TilesetLayer(),
    PoiLayer(),
    // [hygen] Add layer
  ]
}
