import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import SelectModuleList from './index'

class SelectBox extends React.Component {
  handleClick = () => {
    const { onClick, disabled } = this.props
    if (disabled) return
    const index = onClick()
    if (index !== undefined) {
      // index !== undefined 高度变化 需要计算底部padding
      SelectModuleList.externalSetGap(index)
    }
  }

  render() {
    const { selected, children, style, disabled } = this.props
    return (
      <Flex
        column
        className={classNames('b-select-box-wrap', {
          'b-select-box-active': selected,
          'b-select-box-disable': disabled,
        })}
        onClick={this.handleClick}
        style={style}
      >
        {children}
        {selected && <i className='xfont xfont-ok icon-ok' />}
      </Flex>
    )
  }
}
SelectBox.propType = {
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}

export default SelectBox
