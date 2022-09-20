import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { WrapperWidgetUI, FormulaWidgetUI } from '@carto/react-ui'
import { selectAreFeaturesReadyForSource } from '@carto/react-redux'
import { getFormula, useSourceFilters } from '@carto/react-widgets'

/**
 * Renders a <FormulaWidget /> component
 * @param  {object} props
 * @param  {string} props.id - ID for the widget instance.
 * @param  {string} props.title - Title to show in the widget header.
 * @param  {string} props.dataSource - ID of the data source to get the data from.
 * @param  {string} props.column - Name of the data source's column to get the data from.
 * @param  {string} props.operation - Operation to apply to the operationColumn. Must be one of those defined in `AggregationTypes` object.
 * @param  {Function} [props.formatter] - Function to format each value returned.
 * @param  {boolean} [props.animation] - Enable/disable widget animations on data updates. Enabled by default.
 * @param  {Function} [props.onError] - Function to handle error messages from the widget.
 * @param  {Object} [props.wrapperProps] - Extra props to pass to [WrapperWidgetUI](https://storybook-react.carto.com/?path=/docs/widgets-wrapperwidgetui--default)
 */
export default function FormulaWidget(props: any) {
  const {
    id,
    title,
    dataSource,
    column,
    operation,
    formatter,
    animation,
    onError,
    wrapperProps,
  } = props
  const isSourceReady = useSelector((state) =>
    selectAreFeaturesReadyForSource(state, dataSource),
  )
  const filters = useSourceFilters({ dataSource, id })

  const [formulaData, setFormulaData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    if (isSourceReady) {
      getFormula({
        operation,
        column,
        filters,
        dataSource,
      })
        .then((data: any) => {
          if (data && data[0]) {
            setIsLoading(false)
            setFormulaData(data[0].value)
          }
        })
        .catch((error: any) => {
          setIsLoading(false)
          if (onError) onError(error)
        })
    }
  }, [
    operation,
    column,
    filters,
    dataSource,
    setIsLoading,
    onError,
    isSourceReady,
  ])

  return (
    <WrapperWidgetUI title={title} isLoading={isLoading} {...wrapperProps}>
      <FormulaWidgetUI
        data={formulaData}
        formatter={formatter}
        unitBefore={true}
        animation={animation}
      />
    </WrapperWidgetUI>
  )
}
