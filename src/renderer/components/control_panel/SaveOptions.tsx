import React, { use } from 'react'

import { FORMAT, LABEL, POST_SAVE_ACTION, SAVE_TYPE } from '../../constants'

import { ElectronAPI } from '../../context/ElectronAPIContext'
import { LayoutContext } from '../../context/LayoutContext'
import { ResponseContext } from '../../context/ResponseContext'
import { SaveContext } from '../../context/SaveContext'

import ToggleComponent from '../utility_components/ToggleComponent'
import RadioSet from '../utility_components/RadioSet'
import Select from '../utility_components/Select'
import IconButton from '../utility_components/IconButton'
import Checkbox from '../utility_components/Checkbox'

export default function SaveOptions() {
  const { flattenImage, saveImage } = use(ElectronAPI)
  const { labelA, labelB } = use(LayoutContext)
  const { isImageALoaded, imageAHasOriginal, imageBHasOriginal } = use(ResponseContext)
  const { getSaveOptions, format, saveType, ...saveCtx }= use(SaveContext)

  const isNewFile = saveType === SAVE_TYPE.NEW_FILE

  const saveTypeLabels = {
    [SAVE_TYPE.REPLACE_A]: `${LABEL.REPLACE_ORIGINAL} ${labelA} ${LABEL.IMAGE}`,
    [SAVE_TYPE.REPLACE_B]: `${LABEL.REPLACE_ORIGINAL} ${labelB} ${LABEL.IMAGE}`,
    [SAVE_TYPE.NEW_FILE]: LABEL.SAVE_NEW_IMAGE
  }

  const saveTypeValues = {
    ...imageAHasOriginal ? { [SAVE_TYPE.REPLACE_A]: SAVE_TYPE.REPLACE_A } : {},
    ...imageBHasOriginal ? { [SAVE_TYPE.REPLACE_B]: SAVE_TYPE.REPLACE_B } : {},
    [SAVE_TYPE.NEW_FILE]: SAVE_TYPE.NEW_FILE
  }

  const postSaveActionLabels = {
    [POST_SAVE_ACTION.CLEAR_BOTH]: LABEL.CLEAR_BOTH,
    [POST_SAVE_ACTION.LOAD_RESULT]: LABEL.LOAD_RESULT,
    [POST_SAVE_ACTION.NONE]: LABEL.KEEP_BOTH,
    [POST_SAVE_ACTION.CLEAR_A]: `${LABEL.KEEP} ${labelB} ${LABEL.IMAGE}`,
    [POST_SAVE_ACTION.CLEAR_B]: `${LABEL.KEEP} ${labelA} ${LABEL.IMAGE}`
  }

  return (
    <div className="save-options">
      <Select
        label={LABEL.SAVE_FORMAT}
        value={format}
        onChange={saveCtx.setFormat}
        optionLabels={LABEL}
        optionValues={FORMAT} />
      <RadioSet
        name="save-type"
        label={"Save Actions"}
        value={saveType}
        onChange={saveCtx.setSaveType}
        optionLabels={saveTypeLabels}
        optionValues={saveTypeValues}>
        <ToggleComponent shouldShow={imageAHasOriginal && (isNewFile || saveType === SAVE_TYPE.REPLACE_B)}>
          <Checkbox
            label={`${LABEL.DELETE_ORIGINAL} ${labelA} ${LABEL.IMAGE}`}
            checked={saveCtx.deleteA}
            onChange={() => saveCtx.toggleDeleteA()} />
        </ToggleComponent>
        <ToggleComponent shouldShow={imageBHasOriginal && (isNewFile || saveType === SAVE_TYPE.REPLACE_A)}>
          <Checkbox
            label={`${LABEL.DELETE_ORIGINAL} ${labelB} ${LABEL.IMAGE}`}
            checked={saveCtx.deleteB}
            onChange={() => saveCtx.toggleDeleteB()} />
        </ToggleComponent>
      </RadioSet>
      <Select
        label={LABEL.POST_SAVE_ACTION}
        value={saveCtx.postSaveAction}
        onChange={saveCtx.setPostSaveAction}
        optionLabels={postSaveActionLabels}
        optionValues={POST_SAVE_ACTION} />
      <fieldset>
        <Checkbox
          label={LABEL.SAVE_ON_DROP}
          checked={saveCtx.saveOnDrop}
          onChange={saveCtx.toggleSaveOnDrop} />
        <Checkbox
          label={LABEL.WARN}
          checked={saveCtx.shouldWarn}
          onChange={saveCtx.toggleShouldWarn} />
      </fieldset>
      <div className="save-buttons">
        <IconButton
          icon="cell_merge"
          title={LABEL.FLATTEN}
          onClick={() => flattenImage(format)}
          disabled={!isImageALoaded} />
        <IconButton
          icon="save"
          title={LABEL.SAVE_IMAGE}
          onClick={() => saveImage(getSaveOptions())}
          disabled={!isImageALoaded} />
      </div>
    </div>
  )
}
