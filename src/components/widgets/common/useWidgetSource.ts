// @ts-ignore
import { _getApplicableFilters as getApplicableFilters } from '@carto/react-core/'
import { selectSourceById } from '@carto/react-redux/'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { dequal as deepEqual } from 'dequal'
import useCustomCompareMemo from './useCompareMemo'

/**
 * Hook to obtain widget's source excluding the filters like in useSourceFilters
 * @param  {object} props
 * @param  {string} props.dataSource - ID of the source to get the filters from.
 * @param  {string} props.id - ID of the widget that apply the filter you want to exclude.
 */
export default function useWidgetSource({ dataSource, id }: any) {
  const rawSource = useSelector((state) => selectSourceById(state, dataSource))

  const applicableFilters = useMemo(
    () => getApplicableFilters(rawSource?.filters, id),
    [rawSource?.filters, id],
  )

  return useCustomCompareMemo(
    rawSource && {
      ...rawSource,
      filters: applicableFilters,
    },
    deepEqual,
  )
}
