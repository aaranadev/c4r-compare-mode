import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { bboxToViewState } from '@/utils/deckglUtils'

export default function useBboxToViewState() {
  const width = useSelector((state: RootState) => state.carto.viewState.width)
  const height = useSelector((state: RootState) => state.carto.viewState.height)

  return useCallback(
    (bbox, options) => bboxToViewState({ width, height }, bbox, options),
    [width, height],
  )
}
