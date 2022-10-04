import { addSpatialFilter } from '@carto/react-redux'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  useReducer,
  useCallback,
  useContext,
} from 'react'
import { useDispatch } from 'react-redux'
import buffer from '@turf/buffer'
import { TILESET_SOURCE_ID_2 } from '@/data/sources/tilesetSource'

export enum ActionType {
  AddFeature = 'AddFeature',
  RemoveFeature = 'RemoveFeature',
  ClearFeatures = 'ClearFeatures',
}

type SelectedFeatures = {
  id: string | number
  geometry: {
    type: string
    coordinates: [number, number]
  }
}

type AppState = {
  selectedFeatures: SelectedFeatures[]
}

type Action = {
  type: ActionType
  payload?: SelectedFeatures | string
}

const DEFAULT_VALUE: AppState = {
  selectedFeatures: [],
}

export const AppContext = createContext<
  [state: AppState, dispatch: Dispatch<Action>]
>([DEFAULT_VALUE, () => null])

function stateReducer(state: AppState, { type, payload }: Action): AppState {
  const actions = {
    [ActionType.AddFeature]: () => {
      state.selectedFeatures = [
        ...state.selectedFeatures,
        payload as SelectedFeatures,
      ]
    },
    [ActionType.RemoveFeature]: () => {
      state.selectedFeatures = state.selectedFeatures.filter(
        (feature) => feature.id !== payload,
      )
    },
    [ActionType.ClearFeatures]: () => {
      state.selectedFeatures = []
    },
  }

  actions[type]?.()

  return {
    ...state,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(stateReducer, DEFAULT_VALUE)
  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppHook() {
  const _dispatch = useDispatch()
  const [state, dispatch] = useContext(AppContext)

  const addFilterToTileset = useCallback(
    (feature) => {
      const data = buffer(feature.geometry, 1, {
        units: 'kilometers',
      })
      _dispatch(
        addSpatialFilter({
          sourceId: TILESET_SOURCE_ID_2,
          geometry: data,
        }),
      )
    },
    [_dispatch],
  )

  const addFeature = useCallback(
    (payload) => {
      const { id } = payload
      if (
        state.selectedFeatures.some((feature) => feature.id === id) ||
        state.selectedFeatures.length >= 3
      ) {
        return
      }
      return dispatch({ type: ActionType.AddFeature, payload })
    },
    [dispatch, state.selectedFeatures],
  )
  const removeFeature = useCallback(
    (payload) => dispatch({ type: ActionType.RemoveFeature, payload }),
    [dispatch],
  )
  const clearFeatures = useCallback(
    () => dispatch({ type: ActionType.ClearFeatures }),
    [dispatch],
  )
  return { state, addFeature, removeFeature, clearFeatures, addFilterToTileset }
}
