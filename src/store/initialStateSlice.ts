import { VOYAGER } from '@carto/react-basemaps'
// @ts-ignore
import { API_VERSIONS } from '@deck.gl/carto'

export const DEFAULT_VIEW_STATE = {
  latitude: 31.802892,
  longitude: -103.007813,
  zoom: 2,
  pitch: 0,
  bearing: 0,
  minZoom: 2,
}

export const initialState = {
  viewState: {
    ...DEFAULT_VIEW_STATE,
    dragRotate: false,
  },
  basemap: VOYAGER,
  credentials: {
    apiVersion: API_VERSIONS.V3,
    apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
  },
  googleApiKey: '', // only required when using a Google Basemap,
  oauth: {
    domain: 'auth.carto.com',
    // Type here your application client id
    clientId: import.meta.env.VITE_CLIENT_ID as string,
    scopes: [
      'read:current_user',
      'update:current_user',
      'read:connections',
      'write:connections',
      'read:maps',
      'write:maps',
      'read:account',
      'admin:account',
    ],
    audience: 'carto-cloud-native-api',
    authorizeEndPoint: 'https://carto.com/oauth2/authorize', // only valid if keeping https://localhost:3000/oauthCallback
  },
}
