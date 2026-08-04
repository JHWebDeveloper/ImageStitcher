export * from '../../shared/constants'

const IMAGE = 'Image'
const CLEAR = 'CLEAR'

export const LABEL = {
  ABOVE: 'Above',
  ALIGN_TO: 'Align to',
  BELOW: 'Below',
  BOTH_IMAGES: `Both ${IMAGE}s`,
  BOTTOM: 'Bottom',
  CENTER: 'Center',
  CLEAR: 'Clear',
  CLEAR_BOTH: 'Clear Both',
  CONTAIN: 'Contain',
  COVER: 'Cover',
  DELETE: 'Delete',
  DOWNSCALE: 'Downscale Largest',
  FLIP: 'Flip',
  FLOP: 'Flop',
  IMAGE,
  INSERT: 'Insert',
  JPEG: 'JPEG',
  LANDSCAPE: 'Landscape',
  LEFT: 'Left',
  LINK_CROP_SLIDERS: 'Link Crop Sliders',
  LOAD_RESULT: 'Load Result',
  NEW_FILE: 'New File',
  NONE: 'None',
  ORIGINAL: 'Original',
  PNG: 'PNG',
  PORTRAIT: 'Portrait',
  RELOAD: 'Reload',
  REPLACE: 'Replace',
  REMOVE: 'Remove',
  RIGHT: 'Right',
  ROTATE: 'Rotate',
  SAVE_IMAGE: `Save ${IMAGE}`,
  SAVE_ON_DROP: 'Save on Drop',
  SWAP_IMAGES: `Swap ${IMAGE}s`,
  SWITCH_TO: 'Switch to',
  TIFF: 'TIFF',
  TOP: 'Top',
  UNLINK_CROP_SLIDERS: 'Unlink Crop Sliders',
  UPLOAD: 'Upload',
  UPSCALE: 'Upscale Smallest',
  WEBP: 'WEBP'
} as const

export const LABEL_LR_VALUES = [ LABEL.LEFT, LABEL.RIGHT ] as const
export const LABEL_TB_VALUES = [ LABEL.TOP, LABEL.BOTTOM ] as const
