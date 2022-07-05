import React, { Component } from 'react'
import { InputNumber, Flex } from '@gmfe/react'
import { SvgPassword } from 'gm-svg'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import classNames from 'classnames'
import Big from 'big.js'

@observer
class FieldLock extends Component {
  LOCK = '_lock'

  static defaultProps = {
    hasLock: true, // 真商品才会有锁
  }

  state = {
    isFocus: true,
  }

  handleBlur = () => {
    this.setState({ isFocus: false })
  }

  handleFocus = () => {
    this.setState({ isFocus: true })
  }

  handleLockToggle = () => {
    const { onLockToggle, data, field } = this.props
    const key = field + this.LOCK
    const value = Number(!data[key])
    onLockToggle({
      [key]: value,
    })
  }

  handleChange = (value) => {
    const { onInputChange, field, data } = this.props
    const lockFieldKey = field + this.LOCK

    const modify =
      data.type === 2
        ? { [field]: value } // 假商品无需锁定
        : { [field]: value, [lockFieldKey]: 1 }
    onInputChange(modify)
  }

  render() {
    const { data, field, hasLock } = this.props
    const { isFocus } = this.state
    const value = data[field]

    return (
      <Flex alignCenter>
        <InputNumber
          value={value}
          style={{ width: '70px' }}
          max={999999.99}
          onChange={this.handleChange}
          className={classNames('gm-padding-tb-5', {
            'gm-bg-invalid': !isFocus && value === '',
          })}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
        />
        {hasLock && (
          <span
            className='gm-cursor'
            title={i18next.t('锁定后，此字段不再同步订单数据')}
          >
            <SvgPassword
              onClick={this.handleLockToggle}
              fontSize='1.3em'
              style={{
                color: data[field + this.LOCK] ? '#56A3F2' : '#bfbfbf',
                verticalAlign: '-0.3em',
              }}
            />
          </span>
        )}
      </Flex>
    )
  }
}

FieldLock.propTypes = {
  onInputChange: PropTypes.func.isRequired,
  onLockToggle: PropTypes.func.isRequired,
  data: PropTypes.any.isRequired,
  field: PropTypes.string.isRequired,
  hasLock: PropTypes.bool,
}

export default FieldLock
