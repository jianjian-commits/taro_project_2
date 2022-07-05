import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
class SliderLess extends React.Component {
  constructor() {
    super()
    this.state = {
      currentIndex: 0,
      show: false,
      animaTime: '0.5s',
    }
    this.timer = null
  }

  componentDidMount() {
    const { size, delay } = this.props
    if (size > 1) {
      this.timer = setTimeout(this.handleSlider, delay)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  componentWillReceiveProps(e) {
    if (e.size > 1) {
      if (this.props.size !== e.size && !this.timer) {
        this.timer = setTimeout(this.handleSlider, this.props.delay)
      }
    } else {
      clearTimeout(this.timer)
      this.setState({ animaTime: '0s', currentIndex: 0 })
    }
  }

  handleSlider = () => {
    let { size, delay } = this.props
    if (this.state.currentIndex >= size) {
      // 取消动画，趁别人不注意切换到第一个
      this.setState({ animaTime: '0s' }, () => {
        this.setState({ currentIndex: 0 })
      })
      delay = 0
    } else {
      this.setState((preState) => ({
        animaTime: '0.5s',
        currentIndex: ++preState.currentIndex,
      }))
    }
    this.timer = setTimeout(this.handleSlider, delay)
  }

  render() {
    const { currentIndex, animaTime } = this.state
    const { renderItem, size, width } = this.props
    return (
      <div style={{ overflow: 'hidden', width }}>
        <div
          style={{
            transition: `all ${animaTime}`,
            transform: `translate3d(${-currentIndex * width}px, 0, 0)`,
            whiteSpace: 'nowrap',
          }}
        >
          {_.map(_.range(size), (v, i) => {
            return (
              <div key={i} style={{ width, display: 'inline-block' }}>
                {renderItem(v)}
              </div>
            )
          })}
          {size > 1 && (
            <div style={{ width, display: 'inline-block' }}>
              {renderItem(0)}
            </div>
          )}
        </div>
      </div>
    )
  }
}

SliderLess.propTypes = {
  size: PropTypes.number,
  delay: PropTypes.number,
  renderItem: PropTypes.func,
  width: PropTypes.number,
}

export default SliderLess
