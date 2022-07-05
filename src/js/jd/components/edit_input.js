import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
/**
 * 可编辑的Input文本
 */
class EditInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      disabled: true,
      value: props.value,
    }

    this.handleClickTheInput = ::this.handleClickTheInput
    this.handleBlurTheInput = ::this.handleBlurTheInput
    this.handleOnChange = ::this.handleOnChange
  }

  handleClickTheInput(e) {
    const tg = e.target
    this.setState(
      {
        disabled: false,
      },
      () => {
        tg.focus()
      }
    )
  }

  handleOnChange(e) {
    const { expr } = this.props
    let pass = false
    if (expr === '') {
      this.setState({
        value: e.target.value,
      })
    } else {
      const et = e.target.value

      if (expr === 'preCode') {
        // 数字验证
        pass = /^[0-9]*$/.test(et)
      } else if (expr === 'validDay') {
        if (et === '') {
          pass = true
        } else {
          // 正整数验证
          pass = /^[1-9]\d*$/.test(et)
        }
      }

      if (pass) {
        this.setState({
          value: et,
        })
      }
    }
  }

  handleBlurTheInput() {
    const { handleChangeInput, data, index } = this.props
    this.setState(
      {
        disabled: true,
      },
      () => {
        handleChangeInput(this.state.value, data.id, index, data.state)
      }
    )
  }

  render() {
    return (
      <div className='jd-edit-input-module'>
        <input
          onClick={this.handleClickTheInput}
          value={this.state.value === null ? '' : this.state.value}
          className={classNames('jd-input', {
            'jd-input-disabled': this.state.disabled,
          })}
          onBlur={this.handleBlurTheInput}
          style={{ width: '100%', paddingRight: '24px' }}
          onChange={this.handleOnChange}
        />
        <span className='glyphicon glyphicon-edit jd-edit-icon' />
      </div>
    )
  }
}

EditInput.defaultProps = {
  value: '',
  handleChangeInput: function (value) {
    console.info('It will be better to pass the handleChangeInput function')
    console.info('value:', value)
  },
  expr: '',
}

EditInput.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.string.isRequired,
  ]),
  handleChangeInput: PropTypes.func,
  expr: PropTypes.string,
}

export default EditInput
