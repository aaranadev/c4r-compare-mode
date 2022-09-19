import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core'
import AddOutlinedIcon from '@material-ui/icons/AddOutlined'
import RemoveOutlinedIcon from '@material-ui/icons/RemoveOutlined'
import { setViewState } from '@carto/react-redux'
import { RootState } from '@/store/store'

const useStyles = makeStyles((theme) => ({
  zoomControl: {
    backgroundColor: theme.palette.background.paper,
    width: 'auto',
  },
}))

export default function ZoomControl({
  className,
  showCurrentZoom,
}: {
  className?: string
  showCurrentZoom?: boolean
}) {
  const dispatch = useDispatch()
  const { zoomLevel, maxZoom, minZoom } = useSelector((state: RootState) => ({
    maxZoom: (state.carto.viewState as any).maxZoom,
    minZoom: (state.carto.viewState as any).minZoom,
    zoomLevel: Math.floor(state.carto.viewState.zoom as number),
  }))
  const classes = useStyles()

  const increaseZoom = useCallback(() => {
    dispatch(setViewState({ zoom: Math.min(maxZoom, zoomLevel + 1) }))
  }, [dispatch, zoomLevel, maxZoom])

  const decreaseZoom = useCallback(() => {
    dispatch(setViewState({ zoom: Math.max(minZoom, zoomLevel - 1) }))
  }, [dispatch, zoomLevel, minZoom])

  return (
    <Grid
      container
      direction='row'
      alignItems='center'
      className={`${className} ${classes.zoomControl}`}
    >
      <IconButton onClick={decreaseZoom} aria-label='Decrease zoom'>
        <RemoveOutlinedIcon />
      </IconButton>
      <Divider orientation='vertical' flexItem />
      {showCurrentZoom && (
        <Box px={1} minWidth={36}>
          <Typography
            display='block'
            align='center'
            color='textSecondary'
            variant='overline'
          >
            {zoomLevel}
          </Typography>
        </Box>
      )}
      <Divider orientation='vertical' flexItem />
      <IconButton onClick={increaseZoom} aria-label='Increase zoom'>
        <AddOutlinedIcon />
      </IconButton>
    </Grid>
  )
}
