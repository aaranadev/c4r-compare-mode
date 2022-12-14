import React, { useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { addFilter, removeFilter } from '@carto/react-redux'
import { WrapperWidgetUI } from '@carto/react-ui'
import { _FilterTypes as FilterTypes } from '@carto/react-core'
import { getCategories } from './CategoryModel'
import { useWidgetFilterValues } from '../common/useWidgetFilterValues'
import useWidgetFetch from '../common/useWidgetFetch'
import WidgetWithAlert from '../common/WidgetWithAlert'
import CategoryWidgetUI from './CategoryWidgetUI'

const EMPTY_ARRAY: any[] = []

/**
 * Renders a <CategoryWidget /> component
 * @param  {object} props
 * @param  {string} props.id - ID for the widget instance.
 * @param  {string} props.title - Title to show in the widget header.
 * @param  {string} props.dataSource - ID of the data source to get the data from.
 * @param  {string} props.column - Name of the data source's column to get the data from.
 * @param  {string | string[]} [props.operationColumn] - Name of the data source's column to operate with. If not defined it will default to the one defined in `column`. If multiples are provided, they will be merged into a single one using joinOperation property.
 * @param  {AggregationTypes} [props.joinOperation] - Operation applied to aggregate multiple operation columns into a single one.
 * @param  {string} props.operation - Operation to apply to the operationColumn. Must be one of those defined in `AggregationTypes` object.
 * @param  {Function} [props.formatter] - Function to format each value returned.
 * @param  {Object} [props.labels] - Overwrite category labels.
 * @param  {boolean} [props.animation] - Enable/disable widget animations on data updates. Enabled by default.
 * @param  {boolean} [props.filterable] - Enable/disable widget filtering capabilities. Enabled by default.
 * @param  {boolean} [props.searchable] - Enable/disable widget searching capabilities. Enabled by default.
 * @param  {boolean} [props.global] - Enable/disable the viewport filtering in the data fetching.
 * @param  {Function} [props.onError] - Function to handle error messages from the widget.
 * @param  {Object} [props.wrapperProps] - Extra props to pass to [WrapperWidgetUI](https://storybook-react.carto.com/?path=/docs/widgets-wrapperwidgetui--default)
 * @param  {Object} [props.noDataAlertProps] - Extra props to pass to [NoDataAlert]()
 * @param  {Object} [props.droppingFeaturesAlertProps] - Extra props to pass to [NoDataAlert]() when dropping feature
 */
export default function CategoryWidget(props: any) {
  const {
    id,
    title,
    dataSource,
    column,
    operationColumn,
    joinOperation,
    operation,
    formatter,
    labels,
    animation = false,
    filterable = true,
    searchable = true,
    global = false,
    onError,
    wrapperProps = {},
    noDataAlertProps = {},
    droppingFeaturesAlertProps,
  } = props
  const dispatch = useDispatch()

  const selectedCategories =
    useWidgetFilterValues({ dataSource, id, column, type: FilterTypes.IN }) ||
    EMPTY_ARRAY

  const {
    data = EMPTY_ARRAY,
    isLoading,
    warning,
  } = useWidgetFetch(getCategories, {
    id,
    dataSource,
    params: {
      column,
      operationColumn,
      joinOperation,
      operation,
    },
    global,
    onError,
  })

  const handleSelectedCategoriesChange = useCallback(
    (categories) => {
      if (categories && categories.length) {
        dispatch(
          addFilter({
            id: dataSource,
            column,
            type: FilterTypes.IN,
            values: categories,
            owner: id,
          }),
        )
      } else {
        dispatch(
          removeFilter({
            id: dataSource,
            column,
          }),
        )
      }
    },
    [column, dataSource, id, dispatch],
  )

  const _data: any = useMemo(() => (data?.length ? data : null), [data.length])

  return (
    <>
      <WrapperWidgetUI title={title} isLoading={isLoading} {...wrapperProps}>
        {/* <WidgetWithAlert
        dataSource={dataSource}
        warning={warning}
        global={global}
        droppingFeaturesAlertProps={droppingFeaturesAlertProps}
        noDataAlertProps={noDataAlertProps}
      > */}
        {(!!_data || isLoading) && (
          <CategoryWidgetUI
            data={_data}
            formatter={formatter}
            labels={labels}
            selectedCategories={selectedCategories}
            onSelectedCategoriesChange={handleSelectedCategoriesChange}
            animation={animation}
            filterable={filterable}
            searchable={searchable}
          />
        )}
        {/* </WidgetWithAlert> */}
      </WrapperWidgetUI>
    </>
  )
}
