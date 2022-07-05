import React from 'react'
import { InputNumber, Flex, Select, Option } from '@gmfe/react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { EDITING_INPUT, inputFocus } from '../util'

/**
 * 锁价规格:
 * rule_type(curSelected): 固定(0) | 加法(1) | 乘法(2)
 * yx_price(curValue):     > 0    | 任何数  | > 0
 */
class SelectInputEdit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isFocus: false,
    }
  }

  handleChange = (value) => {
    this.props.onInputChange(value)
  }

  handleSelect = (selected) => {
    this.props.onSelect(selected)
    inputFocus(this.props.id)
  }

  handleFocus = () => {
    this.setState({ isFocus: true })
  }

  handleBlur = () => {
    this.setState({ isFocus: false })
  }

  render() {
    const {
      suffixText,
      inputValue,
      options,
      selected,
      isWarning,
      id,
    } = this.props
    const { isFocus } = this.state
    const isShowSuf = selected !== 2

    let isInvalid
    if (isWarning || (selected !== 1 && inputValue < 0 && inputValue !== '')) {
      isInvalid = true
    } else if (isFocus) {
      isInvalid = false
      // 空着不填,或者填个'-'
    } else if ((inputValue === '-' || inputValue === '') && !isFocus) {
      isInvalid = true
    }

    return (
      <Flex alignCenter>
        <Select onChange={this.handleSelect} value={selected}>
          {_.map(options, (o) => (
            <Option key={o.value} value={o.value}>
              {o.name}
            </Option>
          ))}
        </Select>

        <InputNumber
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          className={classNames('form-control', { 'gm-bg-invalid': isInvalid })}
          id={EDITING_INPUT + id}
          style={{ width: '80px' }}
          max={9999}
          min={-9999}
          precision={isShowSuf ? 2 : 4}
          value={inputValue}
          minus
          onChange={this.handleChange}
        />

        {isShowSuf && suffixText}
      </Flex>
    )
  }
}

SelectInputEdit.propTypes = {
  suffixText: PropTypes.string,
  inputValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  selected: PropTypes.number.isRequired,
  options: PropTypes.array.isRequired,
  id: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  isWarning: PropTypes.bool,
}

export default SelectInputEdit
