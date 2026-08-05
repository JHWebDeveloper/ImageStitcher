import React, { use } from 'react'

import { FORMAT, LABEL, POST_SAVE_ACTION, SAVE_TYPE } from '../../constants'

import { ElectronAPI } from '../../context/ElectronAPIContext'
import { LabelContext } from '../../context/LabelContext'
import { ResponseContext } from '../../context/ResponseContext'
import { SaveContext } from '../../context/SaveContext'

import ToggleComponent from '../utility_components/ToggleComponent'
import Select from '../utility_components/Select'
import IconButton from '../utility_components/IconButton'
import Checkbox from '../utility_components/Checkbox'

export default function SaveOptions() {
  const { flattenImage, saveImage } = use(ElectronAPI)
  const [ labelA, labelB ] = use(LabelContext)
  const { isImageALoaded, imageAHasOriginal, imageBHasOriginal } = use(ResponseContext)
  const { getSaveOptions, format, saveType, ...saveCtx }= use(SaveContext)

  const isNewFile = saveType === SAVE_TYPE.NEW_FILE

  const saveTypeLabels = {
    [SAVE_TYPE.REPLACE_A]: `${LABEL.REPLACE_ORIGINAL} ${labelA}`,
    [SAVE_TYPE.REPLACE_B]: `${LABEL.REPLACE_ORIGINAL} ${labelB}`,
    [SAVE_TYPE.NEW_FILE]: LABEL.NEW_FILE
  }

  const saveTypeValues = {
    ...imageAHasOriginal ? { [SAVE_TYPE.REPLACE_A]: SAVE_TYPE.REPLACE_A } : {},
    ...imageBHasOriginal ? { [SAVE_TYPE.REPLACE_B]: SAVE_TYPE.REPLACE_B } : {},
    [SAVE_TYPE.NEW_FILE]: SAVE_TYPE.NEW_FILE
  }

  const postSaveActionLabels = {
    [POST_SAVE_ACTION.NONE]: LABEL.NONE,
    [POST_SAVE_ACTION.LOAD_RESULT]: LABEL.LOAD_RESULT,
    [POST_SAVE_ACTION.CLEAR_BOTH]: LABEL.CLEAR_BOTH,
    [POST_SAVE_ACTION.CLEAR_A]: `${LABEL.CLEAR} ${labelA}`,
    [POST_SAVE_ACTION.CLEAR_B]: `${LABEL.CLEAR} ${labelB}`
  }

  return (
    <div className="save-options">
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
      <Select
        value={format}
        onChange={saveCtx.setFormat}
        optionLabels={LABEL}
        optionValues={FORMAT} />
      <Select
        value={saveType}
        onChange={saveCtx.setSaveType}
        optionLabels={saveTypeLabels}
        optionValues={saveTypeValues} />
      <fieldset name="delete-options">
        <ToggleComponent shouldShow={imageAHasOriginal && (isNewFile || saveType === SAVE_TYPE.REPLACE_B)}>
          <Checkbox
            label={`${LABEL.DELETE_ORIGINAL} ${labelA}`}
            checked={saveCtx.deleteA}
            onChange={() => saveCtx.toggleDeleteA()} />
        </ToggleComponent>
        <ToggleComponent shouldShow={imageBHasOriginal && (isNewFile || saveType === SAVE_TYPE.REPLACE_A)}>
          <Checkbox
            label={`${LABEL.DELETE_ORIGINAL} ${labelB}`}
            checked={saveCtx.deleteB}
            onChange={() => saveCtx.toggleDeleteB()} />
        </ToggleComponent>
      </fieldset>
      <Select
        value={saveCtx.postSaveAction}
        onChange={saveCtx.setPostSaveAction}
        optionLabels={postSaveActionLabels}
        optionValues={POST_SAVE_ACTION} />
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
  )
}
