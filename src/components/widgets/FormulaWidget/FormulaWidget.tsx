import React from 'react'
import { WrapperWidgetUI, FormulaWidgetUI } from '@carto/react-ui'
import { getFormula } from './FormulaModel'
import useWidgetFetch from '../common/useWidgetFetch'

/**
 * Renders a <FormulaWidget /> component
 * @param  {object} props
 * @param  {string} props.id - ID for the widget instance.
 * @param  {string} props.title - Title to show in the widget header.
 * @param  {string} props.dataSource - ID of the data source to get the data from.
 * @param  {string | string[]} props.column - Name of the data source's column(s) to get the data from. If multiples are provided, they will be merged into a single one using joinOperation property.
 * @param  {AggregationTypes} [props.joinOperation] - Operation applied to aggregate multiple columns into a single one.
 * @param  {AggregationTypes} props.operation - Operation to apply to the operationColumn. Must be one of those defined in `AggregationTypes` object.
 * @param  {Function} [props.formatter] - Function to format each value returned.
 * @param  {boolean} [props.animation] - Enable/disable widget animations on data updates. Enabled by default.
 * @param  {boolean} [props.global] - Enable/disable the viewport filtering in the data fetching.
 * @param  {Function} [props.onError] - Function to handle error messages from the widget.
 * @param  {Object} [props.wrapperProps] - Extra props to pass to [WrapperWidgetUI](https://storybook-react.carto.com/?path=/docs/widgets-wrapperwidgetui--default)
 * @param  {Object} [props.droppingFeaturesAlertProps] - Extra props to pass to [NoDataAlert]() when dropping feature
 */
export default function FormulaWidget({
  id,
  title,
  dataSource,
  column,
  operation,
  joinOperation,
  formatter,
  animation,
  global,
  onError,
  wrapperProps,
  droppingFeaturesAlertProps,
}: any) {
  const {
    data = { value: undefined },
    isLoading,
    warning,
  } = useWidgetFetch(getFormula, {
    id,
    dataSource,
    params: {
      operation,
      column,
      joinOperation,
    },
    global,
    onError,
  })

  let _data = data

  if (Array.isArray(data.value)) {
    _data = {
      ...data,
      value: data.value[0],
    }
  }

  return (
    <WrapperWidgetUI title={title} isLoading={isLoading} {...wrapperProps}>
      {/* <WidgetWithAlert
        dataSource={dataSource}
        warning={warning}
        global={global}
        droppingFeaturesAlertProps={droppingFeaturesAlertProps}
      > */}
      <FormulaWidgetUI
        data={Number.isFinite(_data?.value) ? _data.value : undefined}
        formatter={formatter}
        unitBefore={true}
        animation={animation}
      />
      {/* </WidgetWithAlert> */}
    </WrapperWidgetUI>
  )
}
