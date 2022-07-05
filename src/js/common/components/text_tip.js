import React from 'react'
import { Popover } from '@gmfe/react'

class TextTip extends React.Component {
  render() {
    const { children, content, style, ...rest } = this.props
    return (
      <Popover
        showArrow
        type='hover'
        component={<div className='gm-inline-block' />}
        style={style}
        popup={
          <div
            className='gm-inline-block gm-padding-10'
            style={Object.assign({
              fontSize: '12px',
              backgroundColor: '#FFF',
              minWidth: '150px',
            })}
          >
            {content}
          </div>
        }
        {...rest}
      >
        {children}
      </Popover>
    )
  }
}

export default TextTip
