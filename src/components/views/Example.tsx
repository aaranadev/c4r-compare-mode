import { makeStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { POI_LAYER_ID } from '@/components/layers/PoiLayer'
import { TILESET_LAYER_ID } from '../layers/TilesetLayer'
import { addLayer, removeLayer, removeSource } from '@carto/react-redux'

import { addSource } from '@carto/react-redux'
import poiSource, { POI_SOURCE_ID } from '@/data/sources/poiSource'
import tileSource, { TILESET_SOURCE_ID_2 } from '@/data/sources/tilesetSource'
import { CategoryWidget } from '@carto/react-widgets'
import { AggregationTypes } from '@carto/react-core'
import FormulaWidget from '../widgets/FormulaWidget/FormulaWidget'
import { useAppHook } from '@/contexts/AppContext'

const useStyles = makeStyles(() => ({
  example: {},
}))

export default function Example() {
  const dispatch = useDispatch()
  const {
    state: { selectedFeatures },
    addFilterToTileset
  } = useAppHook()
  const classes = useStyles()

  useEffect(() => {
    dispatch(addSource(poiSource))
    dispatch(
      addLayer({
        id: POI_LAYER_ID,
        source: poiSource.id,
      }),
    )
    return () => {
      dispatch(removeLayer(POI_LAYER_ID))
      dispatch(removeSource(poiSource.id))
    }
  }, [dispatch])

  useEffect(() => {
    if (selectedFeatures.length) {
      const _tileSource = {
        ...tileSource,
        data: tileSource.data,
      }
      dispatch(addSource(_tileSource))
      dispatch(
        addLayer({
          id: TILESET_LAYER_ID,
          source: tileSource.id,
        }),
      )
      selectedFeatures.forEach((feature) => {
        addFilterToTileset(feature)
      })
    } else {
      dispatch(removeLayer(TILESET_LAYER_ID))
      dispatch(removeSource(tileSource.id))
    }

    return () => {
      dispatch(removeLayer(TILESET_LAYER_ID))
      dispatch(removeSource(tileSource.id))
    }
  }, [dispatch, addFilterToTileset, selectedFeatures])

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
              column='id'
              operation={AggregationTypes.COUNT}
            />
          </Grid>
          <Grid item>
            <CategoryWidget
              id='example21'
              title='OSM 2'
              dataSource={TILESET_SOURCE_ID_2}
              column='name'
              operationColumn='id'
              operation={AggregationTypes.AVG}
            />
          </Grid>
        </>
      )}
    </Grid>
  )
}
