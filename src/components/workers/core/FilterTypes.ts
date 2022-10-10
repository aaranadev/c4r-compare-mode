import { makeIntervalComplete } from './makeIntervalComplete'

export const FilterTypes = Object.freeze({
  IN: 'in',
  BETWEEN: 'between', // [a, b] both are included
  CLOSED_OPEN: 'closed_open', // [a, b) a is included, b is not
  TIME: 'time',
  STRING_SEARCH: 'stringSearch',
})

export const filterFunctions = {
  [FilterTypes.IN](filterValues: any, featureValue: any) {
    return filterValues.includes(featureValue)
  },
  [FilterTypes.BETWEEN]: between,
  [FilterTypes.TIME](filterValues: any, featureValue: any) {
    const featureValueAsTimestamp = new Date(featureValue).getTime()
    if (isFinite(featureValueAsTimestamp)) {
      return between(filterValues, featureValueAsTimestamp)
    } else {
      throw new Error(`Column used to filter by time isn't well formatted.`)
    }
  },
  [FilterTypes.CLOSED_OPEN]: closedOpen,
  [FilterTypes.STRING_SEARCH]: stringSearch,
}

// FilterTypes.BETWEEN
function between(filterValues: any, featureValue: any) {
  const checkRange = (range: any) => {
    const [lowerBound, upperBound] = range
    return featureValue >= lowerBound && featureValue <= upperBound
  }

  return makeIntervalComplete(filterValues).some(checkRange)
}

// FilterTypes.CLOSED_OPEN
function closedOpen(filterValues: any, featureValue: any) {
  const checkRange = (range: any) => {
    const [lowerBound, upperBound] = range
    return featureValue >= lowerBound && featureValue < upperBound
  }

  return makeIntervalComplete(filterValues).some(checkRange)
}

// FilterTypes.STRING_SEARCH
function stringSearch(filterValues: any, featureValue: any, params: any = {}) {
  const normalizedFeatureValue = normalize(featureValue, params)
  const stringRegExp = params.useRegExp
    ? filterValues
    : filterValues.map((filterValue: any) => {
        let stringRegExp = escapeRegExp(normalize(filterValue, params))

        if (params.mustStart) stringRegExp = `^${stringRegExp}`
        if (params.mustEnd) stringRegExp = `${stringRegExp}$`

        return stringRegExp
      })

  const regex = new RegExp(
    stringRegExp.join('|'),
    params.caseSensitive ? 'g' : 'gi',
  )
  return !!normalizedFeatureValue.match(regex)
}

// Aux
const specialCharRegExp = /[.*+?^${}()|[\]\\]/g
const normalizeRegExp = /\p{Diacritic}/gu

function escapeRegExp(value: any) {
  return value.replace(specialCharRegExp, '\\$&')
}

function normalize(data: any, params: any) {
  let normalizedData = String(data)
  if (!params.keepSpecialCharacters)
    normalizedData = normalizedData
      .normalize('NFD')
      .replace(normalizeRegExp, '')

  return normalizedData
}
