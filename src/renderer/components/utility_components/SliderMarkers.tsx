import React, { useId } from 'react'

interface Props {
  markers: number[]
  min: number
  range: number
}

export default function SliderMarkers({
  markers,
  min,
  range
}: Props) {
  const id = useId()

  return (
    <span className="slider-markers">
      <span>
        {markers.map((point, i) => (
          <span
            key={`${id}_pt${i}`}
            className="slider-marker"
            style={{
              left: `${(point - min) / range * 100}%`
            }}></span>
        ))}
      </span>
    </span>
  )
}
