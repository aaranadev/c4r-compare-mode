import { createSlice } from '@reduxjs/toolkit'
import { WebMercatorViewport } from '@deck.gl/core'
import { debounce } from '@carto/react-core'
import { removeWorker } from '@carto/react-workers'
import { setDefaultCredentials } from '@deck.gl/carto'
import {
  FEATURE_SELECTION_MODES,
  FiltersLogicalOperators,
} from '@carto/react-core'

/**
 *
 * A function that accepts an initialState, setup the state and creates
 * the CARTO reducers that support CARTO for React achitecture.
 *
 *  export const initialState = {
 *    viewState: {
 *      latitude: 31.802892,
 *      longitude: -103.007813,
 *      zoom: 2,
 *      pitch: 0,
 *      bearing: 0,
 *      dragRotate: false,
 *    },
 *    basemap: POSITRON,
 *    credentials: {
 *      username: 'public',
 *      apiKey: 'default_public',
 *      serverUrlTemplate: 'https://{user}.carto.com',
 *    },
 *    googleApiKey: '', // only required when using a Google Basemap
 *  }
 * @param  {object} initialState - the initial state of the state
 */
export const createCartoSlice = (initialState: any) => {
  const slice = createSlice({
    name: 'carto',
    initialState: {
      viewState: {
        ...initialState.viewState,
        latitude: 0,
        longitude: 0,
        zoom: 0,
      },
      viewport: undefined,
      geocoderResult: null,
      error: null,
      basemap: 'positron',
      layers: {
        // Auto import layers
      },
      dataSources: {
        // Auto import dataSources
      },
      spatialFilter: [],
      featureSelectionMode: FEATURE_SELECTION_MODES.POLYGON,
      featureSelectionEnabled: false,
      featuresReady: {},
      ...initialState,
    },
    reducers: {
      addSource: (state, action) => {
        action.payload.credentials =
          action.payload.credentials || state.credentials
        state.dataSources[action.payload.id] = action.payload
      },
      setIsDroppingFeatures: (state, action) => {
        const source = state.dataSources[action.payload.id]
        source.isDroppingFeatures = action.payload.isDroppingFeatures
        state.dataSources[action.payload.id] = source
      },
      removeSource: (state, action) => {
        delete state.dataSources[action.payload]
        removeWorker(action.payload)
      },
      addLayer: (state, action) => {
        state.layers[action.payload.id] = action.payload
      },
      setFeaturesReady: (state, action) => {
        const { sourceId, ready } = action.payload

        state.featuresReady = {
          ...state.featuresReady,
          [sourceId]: ready,
        }
      },
      updateLayer: (state, action) => {
        const layer = state.layers[action.payload.id]
        if (layer) {
          const newLayer = { ...layer, ...action.payload.layerAttributes }

          // TODO: Study if we should use a deepmerge fn
          state.layers[action.payload.id] = {
            ...newLayer,
            ...(layer.legend &&
              newLayer.legend && {
                legend: { ...layer.legend, ...newLayer.legend },
              }),
          }
        }
      },
      removeLayer: (state, action) => {
        delete state.layers[action.payload]
      },
      setBasemap: (state, action) => {
        state.basemap = action.payload
      },
      setViewState: (state, action) => {
        const viewState = action.payload
        state.viewState = { ...state.viewState, ...viewState }
      },
      setViewPort: (state) => {
        // @ts-ignore
        state.viewport = new WebMercatorViewport(state.viewState).getBounds()
      },
      addSpatialFilter: (state, action) => {
        const { sourceId, geometry } = action.payload
        let data = geometry

        if (!Array.isArray(geometry)) {
          data = [geometry]
        }

        if (sourceId) {
          const source = state.dataSources[sourceId]
          if (source) {
            source.spatialFilter = [...(source.spatialFilter || []), ...data]
          }
        } else {
          state.spatialFilter = [...state.spatialFilter, ...data]
        }
      },
      removeSpatialFilter: (state, action) => {
        const sourceId = action.payload
        if (sourceId) {
          const source = state.dataSources[sourceId]

          if (source) {
            source.spatialFilter = []
          }
        } else {
          state.spatialFilter = []
        }
      },
      addFilter: (state, action) => {
        const { id, column, type, values, owner, params } = action.payload
        const source = state.dataSources[id]

        if (source) {
          if (!source.filters) {
            source.filters = {}
          }

          if (!source.filters[column]) {
            source.filters[column] = {}
          }

          source.filters[column][type] = { values, owner, params }
        }
      },
      removeFilter: (state, action) => {
        const { id, column } = action.payload
        const source = state.dataSources[id]

        if (source && source.filters && source.filters[column]) {
          delete source.filters[column]
        }
      },
      clearFilters: (state, action) => {
        const { id } = action.payload
        const source = state.dataSources[id]

        if (source && source.filters) {
          delete source.filters
        }
      },
      setGeocoderResult: (state, action) => {
        state.geocoderResult = action.payload
      },
      setCredentials: (state, action) => {
        state.credentials = {
          ...state.credentials,
          ...action.payload,
        }
        setDefaultCredentials(state.credentials)
      },
      setFeatureSelectionMode: (state, action) => {
        state.featureSelectionMode = action.payload
      },
      setFeatureSelectionEnabled: (state, action) => {
        state.featureSelectionEnabled = action.payload
      },
    },
  })

  return slice.reducer
}
/**
 * Action to add a source to the store
 *
 * @param {string} id - unique id for the source
 * @param {string} data - data definition for the source. Query for SQL dataset or the name of the tileset for BigQuery Tileset
 * @param {string} type - type of source. Posible values are sql or bigquery
 * @param {Object} credentials - (optional) Custom credentials to be used in the source
 * @param {string} connection - connection name for carto 3 source
 * @param {FiltersLogicalOperators} filtersLogicalOperator - logical operator that defines how filters for different columns are joined together
 * @param {import('@deck.gl/carto').QueryParameters} queryParameters - SQL query parameters
 */
export const addSource = ({
  id,
  data,
  type,
  credentials,
  connection,
  filtersLogicalOperator = FiltersLogicalOperators.AND,
  queryParameters = [],
}: any) => ({
  type: 'carto/addSource',
  payload: {
    id,
    data,
    type,
    credentials,
    connection,
    filtersLogicalOperator,
    queryParameters,
  },
})

/**
 * Action to set the `isDroppingFeature` flag
 * @param {string} id - unique id for the source
 * @param {boolean} isDroppingFeatures - flag that indicate if tiles are generated using a dropping feature strategy
 */
export const setIsDroppingFeatures = ({ id, isDroppingFeatures }: any) => ({
  type: 'carto/setIsDroppingFeatures',
  payload: { id, isDroppingFeatures },
})

/**
 * Action to remove a source from the store
 * @param {string} sourceId - id of the source to remove
 */
export const removeSource = (sourceId: any) => ({
  type: 'carto/removeSource',
  payload: sourceId,
})

/**
 * Action to add a Layer to the store
 * @param {string} id - unique id for the layer
 * @param {string} source - id of the source of the layer
 * @param {object} layerAttributes - custom attributes to pass to the layer
 */
export const addLayer = ({ id, source, layerAttributes = {} }: any) => ({
  type: 'carto/addLayer',
  payload: { id, source, visible: true, ...layerAttributes },
})

/**
 * Action to update a Layer in the store
 * @param {string} id - id of the layer to update
 * @param {object} layerAttributes - layer attributes to update (source, or other custom attributes)
 */
export const updateLayer = ({ id, layerAttributes }: any) => ({
  type: 'carto/updateLayer',
  payload: { id, layerAttributes },
})

/**
 * Action to remove a layer from the store
 * @param {string} id - id of the layer to remove
 */
export const removeLayer = (id: any) => ({
  type: 'carto/removeLayer',
  payload: id,
})

/**
 * Action to set a basemap
 * @param {String} basemap - the new basemap to add
 */
export const setBasemap = (basemap: any) => ({
  type: 'carto/setBasemap',
  payload: basemap,
})

/**
 * Action to add a spatial filter
 * @param {object} params
 * @param {string} [params.sourceId] - If indicated, mask is applied to that source. If not, it's applied to every source
 * @param {GeoJSON} params.geometry - valid geojson object
 */
export const addSpatialFilter = ({ sourceId, geometry }: any) => ({
  type: 'carto/addSpatialFilter',
  payload: { sourceId, geometry },
})

/**
 * Action to remove a spatial filter on a given source
 * @param {string} [sourceId] - sourceId of the source to apply the filter on. If missing, root spatial filter is removed
 */
export const removeSpatialFilter = (sourceId: any) => ({
  type: 'carto/removeSpatialFilter',
  payload: sourceId,
})

/**
 * Action to add a filter on a given source and column
 * @param {string} id - sourceId of the source to apply the filter on
 * @param {string} column - column to use by the filter at the source
 * @param {FilterTypes} type - FilterTypes.IN, FilterTypes.BETWEEN, FilterTypes.CLOSED_OPEN and FilterTypes.TIME
 * @param {array} values -  Values for the filter (eg: ['a', 'b'] for IN or [10, 20] for BETWEEN)
 * @param {string} owner - (optional) id of the widget triggering the filter (to be excluded)
 */
export const addFilter = ({
  id,
  column,
  type,
  values,
  owner,
  params,
}: any) => ({
  type: 'carto/addFilter',
  payload: { id, column, type, values, owner, params },
})

/**
 * Action to remove a column filter from a source
 * @param {id} - sourceId of the filter to remove
 * @param {column} - column of the filter to remove
 */
export const removeFilter = ({ id, column }: any) => ({
  type: 'carto/removeFilter',
  payload: { id, column },
})

/**
 * Action to remove all filters from a source
 * @param {id} - sourceId
 */
export const clearFilters = (id: any) => ({
  type: 'carto/clearFilters',
  payload: { id },
})

const _setViewState = (payload: any) => ({
  type: 'carto/setViewState',
  payload,
})
const _setViewPort = (payload: any) => ({ type: 'carto/setViewPort', payload })
/**
 * Redux selector to get a source by ID
 */
export const selectSourceById = (state: any, id: any) =>
  state.carto.dataSources[id]
export const checkIfSourceIsDroppingFeature = (state: any, id: any) =>
  state.carto.dataSources[id]?.isDroppingFeatures

/**
 * Redux selector to select the spatial filter of a given sourceId or the root one
 */
export const selectSpatialFilter = (state: any, sourceId: any) => {
  let spatialFilterGeometry = state.carto.spatialFilter[0] || null
  if (spatialFilterGeometry?.properties?.disabled) {
    spatialFilterGeometry = null
  }
  let response = spatialFilterGeometry
  if (sourceId) {
    response =
      state.carto.dataSources[sourceId]?.spatialFilter?.[0] ??
      spatialFilterGeometry
  }

  return response
}

/**
 * Redux selector to select the feature selection mode based on if it's enabled
 */
export const selectFeatureSelectionMode = (state: any) =>
  (state.carto.featureSelectionEnabled && state.carto.featureSelectionMode) ||
  null

/**
 * Redux selector to know if features from a certain source are ready
 */
export const selectAreFeaturesReadyForSource = (state: any, id: any) =>
  !!state.carto.featuresReady[id]

const debouncedSetViewPort = debounce((dispatch: any, setViewPort: any) => {
  dispatch(setViewPort())
}, 200)

const NOT_ALLOWED_DECK_PROPS = [
  'transitionDuration',
  'transitionEasing',
  'transitionInterpolator',
  'transitionInterruption',
]

/**
 * Action to set the current ViewState
 * @param {Object} viewState
 */
export const setViewState = (viewState: any) => {
  return (dispatch: any) => {
    /**
     * "transition" deck props contain non-serializable values, like:
     *  - transitionInterpolator: instance of LinearInterpolator
     *  - transitionEasing: function
     * To prevent the Redux checker from failing: removing all "transition" properties in the state
     * If need it, transitions should be handled in layer components
     */
    for (const viewProp of NOT_ALLOWED_DECK_PROPS) {
      delete viewState[viewProp]
    }

    dispatch(_setViewState(viewState))
    debouncedSetViewPort(dispatch, _setViewPort)
  }
}

/**
 * Action to set the ready features state of a layer
 * @param {object} sourceId - the id of the source
 * @param {object} ready - Viewport features have been calculated
 */
export const setFeaturesReady = (data: any) => ({
  type: 'carto/setFeaturesReady',
  payload: data,
})

/**
 * Action to set credentials
 * @param {object} credentials - credentials props to ovewrite
 */
export const setCredentials = (data: any) => ({
  type: 'carto/setCredentials',
  payload: data,
})

/**
 * Action to set feature selection mode
 * @param {boolean} mode
 */
export const setFeatureSelectionMode = (mode: any) => ({
  type: 'carto/setFeatureSelectionMode',
  payload: mode,
})

/**
 * Action to set if feature selection tool is enabled
 * @param {boolean} enabled
 */
export const setFeatureSelectionEnabled = (enabled: any) => ({
  type: 'carto/setFeatureSelectionEnabled',
  payload: enabled,
})
