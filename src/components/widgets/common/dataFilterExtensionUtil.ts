// @ts-ignore
import { DataFilterExtension } from '@deck.gl/extensions'
// @ts-ignore
import { _buildFeatureFilter, _FilterTypes } from '@carto/react-core/'

// Don't change this value to maintain compatibility with builder
export const MAX_GPU_FILTERS = 4
const dataFilterExtension = new DataFilterExtension({
  filterSize: MAX_GPU_FILTERS,
})

function getFiltersByType(filters: any) {
  const filtersWithoutTimeType = {}
  let timeFilter = null

  Object.entries(filters).forEach(([column, columnData]) => {
    // @ts-ignore
    Object.entries(columnData).forEach(([type, typeData]) => {
      if (type !== _FilterTypes.TIME) {
        // @ts-ignore
        filtersWithoutTimeType[column] = { [type]: typeData }
      } else {
        timeFilter = {
          column,
          // @ts-ignore
          values: typeData.values,
          type,
        }
      }
    })
  })
  return {
    filtersWithoutTimeType,
    timeFilter,
  }
}

function getFilterRange(timeFilter: any) {
  const result = Array(MAX_GPU_FILTERS).fill([0, 0])
  // According to getFilterValue all filters are resolved as 0 or 1 in the first position of the array
  // except the time filter value that is resolved with the real value of the feature in the second position of the array
  result[0] = [1, 1]
  if (timeFilter) {
    result[1] = timeFilter.values[0]
  }
  return result
}

function getUpdateTriggers(filtersWithoutTimeType: any, timeFilter: any) {
  const result = { ...filtersWithoutTimeType }

  // We don't want to change the layer UpdateTriggers every time that the time filter changes
  // because this filter is changed by the time series widget during its animation
  // so we remove the time filter value from the `updateTriggers`
  if (timeFilter) {
    result[timeFilter.column] = {
      ...result[timeFilter.column],
      [timeFilter.type]: {}, // this allows working with other filters, without an impact on performance
    }
  }
  return {
    getFilterValue: JSON.stringify(result),
  }
}

function getFilterValue(
  filtersWithoutTimeType: any,
  timeFilter: any,
  filtersLogicalOperator: any,
) {
  const result = Array(MAX_GPU_FILTERS).fill(0)
  const featureFilter = _buildFeatureFilter({
    filters: filtersWithoutTimeType,
    type: 'number',
    filtersLogicalOperator,
  })
  // We evaluate all filters except the time filter using _buildFeatureFilter function.
  // For the time filter, we return the value of the feature and we will change the getFilterRange result
  // every time this filter changes
  return (feature: any) => {
    result[0] = featureFilter(feature)

    if (timeFilter) {
      const f = feature.properties || feature
      result[1] = f[timeFilter.column]
    }
    return result
  }
}

// The deck.gl DataFilterExtension accepts up to 4 values to filter.
// We're going to use the first value for all filter except the time filter
// that will be managed by the second value of the DataFilterExtension
export function getDataFilterExtensionProps(
  filters = {},
  filtersLogicalOperator: any,
) {
  const { filtersWithoutTimeType, timeFilter } = getFiltersByType(filters)
  return {
    filterRange: getFilterRange(timeFilter),
    updateTriggers: getUpdateTriggers(filtersWithoutTimeType, timeFilter),
    getFilterValue: getFilterValue(
      filtersWithoutTimeType,
      timeFilter,
      filtersLogicalOperator,
    ),
    extensions: [dataFilterExtension],
  }
}
