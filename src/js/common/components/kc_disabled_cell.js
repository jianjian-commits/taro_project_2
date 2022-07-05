import React, { useRef } from 'react'
import { KC } from '@gmfe/keyboard'

const KCDisabledCell = (props) => {
  const cellRef = useRef(null)

  const handleFocus = () => {}
  const handleScroll = () => {}

  return (
    <KC ref={cellRef} onFocus={handleFocus} onScroll={handleScroll} disabled>
      {props.children}
    </KC>
  )
}

export default KCDisabledCell
