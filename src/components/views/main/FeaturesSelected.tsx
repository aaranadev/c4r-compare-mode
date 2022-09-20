import { useAppHook } from '@/contexts/AppContext'
import { Box, IconButton, Grid, Paper, useTheme } from '@material-ui/core'
import { Clear } from '@material-ui/icons'

export default function FeaturesSelected() {
  const {
    state: { selectedFeatures },
    removeFeature,
  } = useAppHook()
  const { spacing } = useTheme()
  return (
    <Box position='absolute' top={spacing(8)} right={spacing(2)}>
      <Paper>
        <Box padding={spacing(0.25)}>
          <Grid container direction='column'>
            {selectedFeatures.map((feature) => (
              <Grid
                key={feature}
                item
                container
                spacing={1}
                justifyContent='space-between'
                alignItems='center'
              >
                <Grid item>{feature}</Grid>
                <Grid item>
                  <IconButton
                    size='small'
                    onClick={() => removeFeature(feature)}
                  >
                    <Clear fontSize='small' />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            {!selectedFeatures.length && <Grid item>No features selected</Grid>}
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}
