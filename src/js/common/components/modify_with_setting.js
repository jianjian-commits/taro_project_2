import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Tip, Select, Option, InputNumberV2 } from '@gmfe/react'
import _ from 'lodash'

class Modify extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      active: false,
      inputValue: props.inputValue,
      // 是否设置
      using: 0,
    }
    this.refInput = React.createRef()
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.active === false) {
      this.setState({
        inputValue: nextProps.inputValue,
        using: nextProps.inputValue === '' ? 0 : 1,
      })
    }
  }

  handleChange = (value) => {
    this.setState({
      inputValue: value,
    })
  }

  handleChangeSelect = (value) => {
    this.setState({
      using: +value,
    })
  }

  handleKeyUp = (e) => {
    if (e.keyCode === 13) {
      const isOK = this.handleOK()
      if (isOK) {
        this.setState({
          active: false,
        })
      }
    }
  }

  handleEdit = () => {
    const { disabled, inputValue } = this.props
    if (disabled) {
      return false
    }
    this.setState({
      inputValue: inputValue,
      using: inputValue === '' ? 0 : 1,
      active: true,
    })

    setTimeout(() => {
      this.refInput.current && this.refInput.current.apiDoFocus()
    }, 0)
  }

  handleOK = () => {
    const { onChange } = this.props
    const { using, inputValue } = this.state

    if (using && _.trim(inputValue) === '') {
      Tip.warning(i18next.t('不能设置为空!'))
      return false
    } else if (using && inputValue > 9999) {
      Tip.warning(i18next.t('不能超过9999!'))
      return false
    }
    if (onChange) {
      this.setState({
        inputValue: inputValue,
        using: +using,
        active: false,
      })
      onChange(+using, inputValue)
    }
    return true
  }

  render() {
    const { children, disabled, max } = this.props
    const { active, inputValue, using } = this.state
    return (
      <div>
        <div className='gm-inline-block'>
          {active ? (
            <div className='gm-inline-block'>
              <Select
                name='using'
                value={~~using}
                onChange={this.handleChangeSelect}
              >
                <Option value={0} key={0}>
                  {i18next.t('不设置')}
                </Option>
                <Option value={1} key={1}>
                  {i18next.t('设置')}
                </Option>
              </Select>
              {using ? (
                <InputNumberV2
                  ref={this.refInput}
                  name='inputValue'
                  value={inputValue}
                  max={max || 999999999}
                  onChange={this.handleChange}
                  onKeyUp={this.handleKeyUp}
                  style={{ width: '65px', height: '30px' }}
                />
              ) : null}
            </div>
          ) : children ? (
            <span className='cursor-pointer' onClick={this.handleEdit}>
              {children}
            </span>
          ) : (
            inputValue
          )}
        </div>
        {disabled ? (
          ''
        ) : active ? (
          <div className='gm-inline-block' onClick={this.handleOK}>
            <i key='1' className='xfont xfont-ok text-primary' />
          </div>
        ) : (
          <div className='gm-inline-block' onClick={this.handleEdit}>
            <i key='2' className='xfont xfont-pencil text-primary' />
          </div>
        )}
      </div>
    )
  }
}

Modify.propTypes = {
  inputValue: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  max: PropTypes.number,
}

export default Modify
