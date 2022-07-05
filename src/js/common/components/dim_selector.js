import React from 'react'
import { Button, Flex, Popover } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import classnames from 'classnames'

// 不同维度的查看方式筛选 单选
class DimSelector extends React.Component {
  clickTimes = 0

  handleClick(...args) {
    this.clickTimes++
    this.props.onChange(...args)
  }

  render() {
    const { data, name, selected, width, autoHide } = this.props
    const keyProps = {}
    if (autoHide) {
      keyProps.key = this.clickTimes
    }
    return (
      <Popover
        {...keyProps}
        type='click'
        right
        showArrow
        popup={
          <Flex
            column
            className='gm-padding-10 gm-bg'
            style={{ width: width || 110 }}
          >
            {_.map(data, (vt, i) => {
              return (
                <Flex alignCenter key={i}>
                  <i
                    className={classnames(
                      'xfont xfont-success-circle',
                      vt.value === selected ? 'text-primary' : 'gm-text-desc'
                    )}
                  />
                  <div
                    className={classnames(
                      'gm-padding-tb-5 gm-margin-left-5 gm-cursor',
                      vt.value === selected && 'text-primary'
                    )}
                    onClick={() => this.handleClick(vt.value)}
                  >
                    {vt.name}
                  </div>
                </Flex>
              )
            })}
          </Flex>
        }
      >
        <Button type='primary'>{name}</Button>
      </Popover>
    )
  }
}

DimSelector.propTypes = {
  selected: PropTypes.any.isRequired,
  width: PropTypes.number,
  name: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  autoHide: PropTypes.bool.isRequired,
}
DimSelector.defaultProps = {
  autoHide: true,
}

export default DimSelector
