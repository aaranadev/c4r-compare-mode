import { useEffect, useRef, useState } from 'react'
import { Box, makeStyles } from '@material-ui/core'

// @ts-ignore
const useStyles = makeStyles((theme) => ({
  root: {
    ...theme.typography.h5,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
  },
  unit: {
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(0.5),

    '&$before': {
      marginLeft: 0,
      marginRight: theme.spacing(0.5),
    },
  },
  before: {},
}))

function usePrevious(value: any) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export default function FormulaWidgetUI({
  data = '-',
  formatter = (v: any) => v,
  unitBefore = false,
  animation = true,
}: any) {
  const classes = useStyles()
  const [value, setValue] = useState('-')
  const requestRef: any = useRef()
  const prevValue = usePrevious(value)
  const referencedPrevValue: any = useRef(prevValue)

  useEffect(() => {
    if (typeof data === 'number') {
      // @ts-ignore
      setValue(data)
    } else if (
      typeof data === 'object' &&
      data &&
      referencedPrevValue.current &&
      data.value !== null &&
      data.value !== undefined
    ) {
      // @ts-ignore
      setValue({ value: data.value, unit: data.prefix })
    } else {
      setValue(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => cancelAnimationFrame(requestRef.current)
  }, [animation, data, setValue])

  const formattedValue = formatter(value)

  return (
    // @ts-ignore
    <Box className={classes.root}>
      {typeof formattedValue === 'object' && formattedValue !== null ? (
        <span>
          {/* @ts-ignore */}
          <span className={`${classes.unit} ${classes.before}`}>
            {formattedValue.prefix}
          </span>
          {formattedValue.value}
          {/* @ts-ignore */}
          <span className={classes.suffix}>{formattedValue.suffix}</span>
        </span>
      ) : (
        <span>{formattedValue}</span>
      )}
    </Box>
  )
}
