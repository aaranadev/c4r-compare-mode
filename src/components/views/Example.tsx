import { makeStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { POI_LAYER_ID } from '@/components/layers/PoiLayer'
import { TILESET_LAYER_ID } from '../layers/TilesetLayer'
import { addLayer, removeLayer, removeSource } from '@carto/react-redux'

import { addSource } from '@carto/react-redux'
import exampleSource, { POI_SOURCE_ID } from '@/data/sources/poiSource'
import example2Source, {
  TILESET_SOURCE_ID_2,
} from '@/data/sources/tilesetSource'
import { CategoryWidget } from '@carto/react-widgets'
import { AggregationTypes } from '@carto/react-core'
import FormulaWidget from '../widgets/FormulaWidget'
import { useAppHook } from '@/contexts/AppContext'

const useStyles = makeStyles(() => ({
  example: {},
}))

export default function Example() {
  const dispatch = useDispatch()
  const {
    state: { selectedFeatures },
  } = useAppHook()
  const classes = useStyles()

  useEffect(() => {
    dispatch(addSource(exampleSource))
    dispatch(
      addLayer({
        id: POI_LAYER_ID,
        source: exampleSource.id,
      }),
    )
    return () => {
      dispatch(removeLayer(POI_LAYER_ID))
      dispatch(removeSource(exampleSource.id))
    }
  }, [dispatch])

  useEffect(() => {
    if (selectedFeatures.length) {
      dispatch(addSource(example2Source))
      dispatch(
        addLayer({
          id: TILESET_LAYER_ID,
          source: example2Source.id,
        }),
      )
    } else {
      dispatch(removeLayer(TILESET_LAYER_ID))
      dispatch(removeSource(example2Source.id))
    }

    return () => {
      dispatch(removeLayer(TILESET_LAYER_ID))
      dispatch(removeSource(example2Source.id))
    }
  }, [dispatch, selectedFeatures])

  // [hygen] Add useEffect

  return (
    <Grid container direction='column' className={classes.example}>
      <Grid item>
        <FormulaWidget
          id='example10'
          title='Stores'
          dataSource={POI_SOURCE_ID}
          column='osm_id'
          operation={AggregationTypes.COUNT}
        />
      </Grid>
      {!!selectedFeatures.length && (
        <>
          <Grid item>
            <FormulaWidget
              id='example20'
              title='OSM 1'
              dataSource={TILESET_SOURCE_ID_2}
              column='geoid'
              operation={AggregationTypes.COUNT}
            />
          </Grid>
          <Grid item>
            <CategoryWidget
              id='example21'
              title='OSM 2'
              dataSource={TILESET_SOURCE_ID_2}
              column='BLOCKGROUP'
              operationColumn='geoid'
              operation={AggregationTypes.AVG}
            />
          </Grid>
        </>
      )}
    </Grid>
  )
}
