import {
  createContext,
  type Dispatch,
  type ReactNode,
  useReducer,
  useCallback,
  useContext,
} from 'react'

export enum ActionType {
  AddFeature = 'AddFeature',
  RemoveFeature = 'RemoveFeature',
  ClearFeatures = 'ClearFeatures',
}

type AppState = {
  selectedFeatures: string[]
}

type Action = {
  type: ActionType
  payload?: string | undefined | string[]
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
      const data = payload as string
      state.selectedFeatures = [...state.selectedFeatures, data]
    },
    [ActionType.RemoveFeature]: () => {
      state.selectedFeatures = state.selectedFeatures.filter(
        (feature) => feature !== payload,
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
  const [state, dispatch] = useContext(AppContext)
  const addFeature = useCallback(
    (payload) => {
      const data = payload as string
      if (
        state.selectedFeatures.includes(data) ||
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
  return { state, addFeature, removeFeature, clearFeatures }
}
