import { _executeModel } from '@carto/react-api/'
import { Methods, executeTask } from '@carto/react-workers'
import { normalizeObjectKeys, wrapModelCall } from '../common/utils'

export function getCategories(props: any) {
  return wrapModelCall(props, fromLocal, fromRemote)
}

// From local
function fromLocal(props: any) {
  const { source, column, operationColumn, operation, joinOperation } = props

  return executeTask(source.id, Methods.FEATURES_CATEGORY, {
    // @ts-ignore
    filters: source.filters,
    filtersLogicalOperator: source.filtersLogicalOperator,
    operation,
    joinOperation,
    column,
    operationColumn: operationColumn || column,
  })
}

// From remote
function fromRemote(props: any) {
  const { source, abortController, ...params } = props
  const { column, operation, operationColumn } = params

  return _executeModel({
    model: 'category',
    source,
    params: {
      column,
      operation,
      operationColumn: operationColumn || column,
    },
    opts: { abortController },
  }).then((res: any) => normalizeObjectKeys(res.rows))
}
