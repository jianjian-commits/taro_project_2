import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'

class Modify extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      active: false,
      value: props.value,
    }
    this.handleChange = ::this.handleChange
    this.handleKeyUp = ::this.handleKeyUp
    this.handleEdit = ::this.handleEdit
    this.handleOK = ::this.handleOK
    this.handleBlur = ::this.handleBlur

    this.refInput = null
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps && this.state.active === false) {
      this.setState({
        value: nextProps.value,
      })
    }
  }

  handleChange(e) {
    this.setState({
      value: e.target.value,
    })
  }

  handleKeyUp(e) {
    if (e.keyCode === 13) {
      this.handleOK()
      this.setState({
        active: false,
      })
    }
  }

  handleEdit() {
    this.setState({
      value: this.props.value,
      active: true,
    })

    setTimeout(() => {
      this.refInput.focus()
    }, 0)
  }

  handleBlur() {
    // 异步下吧，先执行 handleOK。 100 ms 似乎不够，弄到 500 ms了
    setTimeout(() => {
      this.setState({
        active: false,
        value: this.props.value,
      })
    }, 500)
  }

  handleOK() {
    const { onChange } = this.props
    const { value } = this.state
    if (onChange(value)) {
      this.setState({
        active: false,
      })
    }
  }

  render() {
    const { children, disabled } = this.props
    const { active, value } = this.state

    return (
      <Flex alignCenter className='b-merchandise-list-modify'>
        <div>
          {active ? (
            <input
              ref={(ref) => {
                this.refInput = ref
              }}
              type='text'
              value={value}
              onChange={this.handleChange}
              onKeyUp={this.handleKeyUp}
              onBlur={this.handleBlur}
            />
          ) : children ? (
            <span onClick={this.handleEdit}>{children}</span>
          ) : (
            value
          )}
        </div>
        {disabled ? (
          ''
        ) : active ? (
          <div className='modify-edit' onClick={this.handleOK}>
            <i key='1' className='glyphicon glyphicon-ok text-primary' />
          </div>
        ) : (
          <div className='modify-edit' onClick={this.handleEdit}>
            <i key='2' className='glyphicon glyphicon-pencil text-primary' />
          </div>
        )}
      </Flex>
    )
  }
}

Modify.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
}

export default Modify
