import React from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import { Popover } from '@gmfe/react'

let timer = null
let selectTimer = null

class RemarkInput extends React.Component {
  constructor(props) {
    super(props)
    this.handleSelect = ::this.handleSelect
    this.refCom = null
    this.state = {
      popupWidth: 0,
    }
  }

  componentDidMount() {
    timer = setTimeout(() => {
      this.refCom &&
        this.setState({
          popupWidth: findDOMNode(this.refCom).clientWidth,
        })
    }, 100)
  }

  componentWillUnmount() {
    timer && clearTimeout(timer)
    selectTimer && clearTimeout(selectTimer)
  }

  handleSelect() {
    const { spu_remark, onSelect } = this.props
    onSelect(spu_remark)
    selectTimer = setTimeout(() => {
      this.refCom.click()
    }, 0)
  }

  render() {
    const { spu_remark, children } = this.props
    const { popupWidth } = this.state
    if (!spu_remark) {
      return children
    }

    return (
      <Popover
        type='click'
        popup={
          <div
            className='gm-border gm-bg gm-padding-5'
            style={{ width: popupWidth ? `${popupWidth}px` : 'auto' }}
            onClick={this.handleSelect}
          >
            {spu_remark}
          </div>
        }
      >
        <div
          ref={(ref) => {
            this.refCom = ref
          }}
          className='b-order-remark-input'
        >
          {children}
        </div>
      </Popover>
    )
  }
}

RemarkInput.propTypes = {
  spu_remark: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
}

export default RemarkInput
