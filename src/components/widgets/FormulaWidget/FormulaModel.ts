// @ts-ignore
import { _executeModel } from '@carto/react-api'
import { Methods, executeTask } from '@carto/react-workers'
import { normalizeObjectKeys, wrapModelCall } from '../common/utils'

export function getFormula(props: any) {
  return wrapModelCall(props, fromLocal, fromRemote)
}

// From local
function fromLocal(props: any) {
  const { source, operation, column, joinOperation } = props

  return executeTask(source.id, Methods.FEATURES_FORMULA, {
    // @ts-ignore
    filters: source.filters,
    filtersLogicalOperator: source.filtersLogicalOperator,
    operation,
    joinOperation,
    column,
  })
}

// From remote
function fromRemote(props: any) {
  const { source, abortController, ...params } = props
  const { column, operation } = params

  return _executeModel({
    model: 'formula',
    source,
    params: { column: column || '*', operation },
    opts: { abortController },
  }).then((res: any) => normalizeObjectKeys(res.rows[0]))
}
