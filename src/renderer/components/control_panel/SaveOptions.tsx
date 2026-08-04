import React, { use } from 'react'

import { FORMAT, LABEL, POST_SAVE_ACTION, SAVE_TYPE } from '../../constants'

import { ElectronAPI } from '../../context/ElectronAPIContext'
import { LabelContext } from '../../context/LabelContext'
import { SaveContext } from '../../context/SaveContext'

import ToggleComponent from '../utility_components/ToggleComponent'
import Select from '../utility_components/Select'
import IconButton from '../utility_components/IconButton'
import Checkbox from '../utility_components/Checkbox'

interface Props {
  isImageALoaded: boolean
}

export default function SaveOptions({ isImageALoaded }: Props) {
  const { saveImage } = use(ElectronAPI)
  const { getSaveOptions, saveType, ...saveCtx }= use(SaveContext)
  const [ labelA, labelB ] = use(LabelContext)

  const isNewFile = saveType === SAVE_TYPE.NEW_FILE

  const saveTypeLabels = {
    [SAVE_TYPE.REPLACE_A]: `${LABEL.REPLACE} ${labelA}`,
    [SAVE_TYPE.REPLACE_B]: `${LABEL.REPLACE} ${labelB}`,
    [SAVE_TYPE.NEW_FILE]: LABEL.NEW_FILE
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
      <Checkbox
        label={LABEL.SAVE_ON_DROP}
        checked={saveCtx.saveOnDrop}
        onChange={saveCtx.toggleSaveOnDrop} />
      <Select
        value={saveCtx.format}
        onChange={saveCtx.setFormat}
        optionLabels={LABEL}
        optionValues={FORMAT} />
      <Select
        value={saveType}
        onChange={saveCtx.setSaveType}
        optionLabels={saveTypeLabels}
        optionValues={SAVE_TYPE} />
      <fieldset name="delete-options">
        <ToggleComponent shouldShow={isNewFile || saveType === SAVE_TYPE.REPLACE_B}>
          <Checkbox
            label={`${LABEL.DELETE} ${labelA}`}
            checked={saveCtx.deleteA}
            onChange={() => saveCtx.toggleDeleteA()} />
        </ToggleComponent>
        <ToggleComponent shouldShow={isNewFile || saveType === SAVE_TYPE.REPLACE_A}>
          <Checkbox
            label={`${LABEL.DELETE} ${labelB}`}
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
        icon="save"
        title={LABEL.SAVE_IMAGE}
        onClick={() => saveImage(getSaveOptions())}
        disabled={!isImageALoaded} />
    </div>
  )
}
