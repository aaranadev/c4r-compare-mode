import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as nebulaModes from '@nebula.gl/edit-modes'
import {
  addSpatialFilter,
  setFeatureSelectionEnabled,
  selectFeatureSelectionMode,
} from '@carto/react-redux'
import { EDIT_MODES } from '@carto/react-core'
import { hexToRgb, useTheme } from '@material-ui/core'
import EditableCartoGeoJsonLayer from './EditableCartoGeoJsonLayer'
import useEventManager from './useEventManager'
import MaskLayer from './MaskLayer'
import { selectSpatialFilter } from '@/store/cartoSlice'
import { TILESET_SOURCE_ID_2 } from '@/data/sources/tilesetSource'

const { ViewMode, TranslateMode, ModifyMode, CompositeMode } = nebulaModes

const EditMode = new CompositeMode([new TranslateMode(), new ModifyMode()])

export default function FeatureSelectionLayer(
  { eventManager, mask } = { eventManager: null, mask: true },
) {
  const dispatch = useDispatch()
  const theme = useTheme()
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(null)
  const selectedMode = useSelector((state) => selectFeatureSelectionMode(state))
  const spatialFilterGeometry = useSelector((state) =>
    // @ts-ignore
    selectSpatialFilter(state, TILESET_SOURCE_ID_2),
  )

  const isEdit = isEditMode(selectedMode)
  const hasGeometry = !!spatialFilterGeometry.length
  const isSelected = selectedFeatureIndex !== null

  const customEventManager = useEventManager({
    eventManager,
    isEdit,
    isSelected,
    selectedMode,
  })

  useEffect(() => {
    // When the user changes mode or finishes drawing a geometry, remove selected feature
    if (!isEdit && isSelected) {
      setSelectedFeatureIndex(null)
    }
  }, [isEdit, spatialFilterGeometry, isSelected])

  const mode = useMemo(() => {
    if (selectedMode) {
      if (isEdit && isSelected) {
        return EditMode
      } else if (!isEdit && !isSelected) {
        // @ts-ignore
        return nebulaModes[selectedMode]
      }
    }

    return ViewMode
  }, [isSelected, isEdit, selectedMode])

  const primaryAsRgba = formatRGBA(hexToRgb(theme.palette.primary.main))
  const secondaryAsRgba = formatRGBA(hexToRgb(theme.palette.secondary.main))

  const mainColor = hasGeometry && !isSelected ? secondaryAsRgba : primaryAsRgba

  return [
    mask && MaskLayer(),
    // @ts-ignore
    new EditableCartoGeoJsonLayer({
      eventManager: customEventManager,
      id: 'FeatureSelectionLayer',
      // billboard need to be false to be compatible with Google Satellite
      billboard: false,
      pickable: !!selectedMode,
      data: {
        type: 'FeatureCollection',
        features: spatialFilterGeometry ?? [],
      },
      mode,
      // @ts-ignore
      selectedFeatureIndexes: isFinite(selectedFeatureIndex)
        ? [selectedFeatureIndex]
        : [],
      // @ts-ignore
      onEdit: ({ updatedData, editType }) => {
        // Once the geometry is drawed, disable the tool
        if (editType === 'addFeature') {
          dispatch(setFeatureSelectionEnabled(false))
        }

        // Do not update spatial filter if
        //     1. updatedData is empty
        //     2. editType includes tentative, that means it's being drawn
        if (
          updatedData.features.length !== 0 &&
          !editType.includes('Tentative')
        ) {
          const [lastFeature] = updatedData.features.slice(-1)
          if (lastFeature) {
            dispatch(
              addSpatialFilter({
                geometry: lastFeature,
              }),
            )
          }
        }
      },
      // @ts-ignore
      onClick: ({ index, object }) => {
        if (isEdit && object?.geometry.type === 'Polygon') {
          setSelectedFeatureIndex(index)
        }
      },
      // Styles once geometry is created or it's being edited
      getLineColor: mainColor,
      getFillColor: isEdit
        ? [...mainColor.slice(0, 3), 255 * 0.08]
        : [0, 0, 0, 0],
      // Styles while drawing geometry
      getTentativeFillColor: [...primaryAsRgba.slice(0, 3), 255 * 0.08],
      getTentativeLineColor: primaryAsRgba,
      // Point styles while drawing
      getEditHandlePointColor: [0xff, 0xff, 0xff],
      getEditHandlePointOutlineColor: primaryAsRgba,
      editHandlePointStrokeWidth: 5,
      getEditHandlePointRadius: 2,
      getLineWidth: 4,
    }),
  ]
}

// Aux
function isEditMode(mode: any) {
  return Object.values(EDIT_MODES).indexOf(mode) !== -1
}

function formatRGBA(cssRgba: any) {
  const [r, g, b, alpha] = cssRgba.replace(/[rgba() ]/g, '').split(',')

  return [r, g, b, alpha ? alpha * 255 : 255].map(Number)
}
