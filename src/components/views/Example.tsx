import { makeStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { EXAMPLE_LAYER_ID } from '@/components/layers/ExampleLayer'
import { addLayer, removeLayer, removeSource } from '@carto/react-redux'

import { addSource } from '@carto/react-redux'
import exampleSource, { EXAMPLE_SOURCE_ID } from '@/data/sources/exampleSource'
import { CategoryWidget, FormulaWidget } from '@carto/react-widgets'
import { AggregationTypes } from '@carto/react-core'

const useStyles = makeStyles(() => ({
  example: {},
}))

export default function Example() {
  const dispatch = useDispatch()
  const classes = useStyles()

  useEffect(() => {
    dispatch(addSource(exampleSource))
    dispatch(
      addLayer({
        id: EXAMPLE_LAYER_ID,
        source: exampleSource.id,
      }),
    )
    return () => {
      dispatch(removeLayer(EXAMPLE_LAYER_ID))
      dispatch(removeSource(exampleSource.id))
    }
  }, [dispatch])

  // [hygen] Add useEffect

  return (
    <Grid container direction='column' className={classes.example}>
      <Grid item>
        <FormulaWidget
          id='example0'
          title='Example 0 '
          dataSource={EXAMPLE_SOURCE_ID}
          column='osm_id'
          operation={AggregationTypes.COUNT}
        />
      </Grid>
      <Grid item>
        <CategoryWidget
          id='example1'
          title='Example 1'
          dataSource={EXAMPLE_SOURCE_ID}
          column='name'
          operationColumn='osm_id'
          operation={AggregationTypes.AVG}
        />
      </Grid>
    </Grid>
  )
}
