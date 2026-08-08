import React from 'react'

import FitOptions from './FitOptions'

import SaveOptions from './SaveOptions'

export default function SideBar() {
  return (
    <div className="sidebar">
      <FitOptions />
      <SaveOptions />
    </div>
  )
}
