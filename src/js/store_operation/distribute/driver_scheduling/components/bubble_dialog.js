import React, { Component } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

class BubbleDialog extends Component {
  static propTypes = {
    pointColor: PropTypes.string.isRequired,
    active: PropTypes.bool,
    children: PropTypes.node.isRequired,
    isDark: PropTypes.bool,
  }

  static defaultProps = {
    active: false,
    isDark: false,
  }

  render() {
    const { pointColor, active, children, isDark, onClick } = this.props
    return (
      <div
        className='b-driver-map-marker-point'
        style={{ backgroundColor: pointColor }}
        onClick={onClick}
      >
        <div
          className={classNames('b-driver-map-marker-box', {
            active: active,
            dark: isDark,
          })}
        >
          {children}
        </div>
      </div>
    )
  }
}

export default BubbleDialog
