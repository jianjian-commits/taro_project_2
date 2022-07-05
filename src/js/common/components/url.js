import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Copy from './copy'
import SVGCopy from '../../../svg/copy.svg'
import SVGCopyHover from '../../../svg/copy_active.svg'
import { ToolTip, Popover } from '@gmfe/react'

const Url = (props) => {
  const [active, setActive] = useState(false)
  const { href, target, children, toolTip, ...rest } = props

  if (target === '_blank') {
    rest.rel = 'noopener noreferrer'
  }

  return (
    <span className='b-url'>
      <a {...rest} target={target} href={href} className='gm-padding-right-5'>
        {children || href}
      </a>
      <Copy text={href}>
        <Popover
          type='hover'
          center={true}
          showArrow={true}
          popup={<p className='gm-padding-lr-5 gm-padding-top-5'>复制</p>}
        >
          <a
            onClick={(e) => e.preventDefault()}
            onMouseMove={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
          >
            {active ? <SVGCopyHover /> : <SVGCopy />}
          </a>
        </Popover>
      </Copy>
      <div className='gm-gap-5' />
      {toolTip && <ToolTip popup={toolTip} />}
    </span>
  )
}

Url.propTypes = {
  href: PropTypes.string.isRequired,
  target: PropTypes.string,
  toolTip: PropTypes.element,
}

export default Url
