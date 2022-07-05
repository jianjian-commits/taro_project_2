import React, { useState, useEffect, useRef } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Flex, Select, Option, InputNumberV2 } from '@gmfe/react'
import _ from 'lodash'

import { RULE_TYPE } from 'common/enum'

const EditRuleInput = ({
  id,
  selected,
  inputValue,
  isWarning,

  closePopup,
  onSave,
  suffixText,
  ...rest
}) => {
  const [value, setValue] = useState(inputValue)
  const [select, setSelect] = useState(selected)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current && inputRef.current.apiDoFocus()
  }, [])

  const handleSave = () => {
    onSave(select, value)
    closePopup()
  }

  const handleCancel = () => {
    closePopup()
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      onSave(select, value)
      closePopup()
    }
  }

  // 迁移
  const handleSelect = (selected) => {
    if (selected !== 2 && value) {
      setValue(value.toFixed(2))
    }
    setSelect(selected)
  }

  const handleChange = (value) => {
    setValue(value)
  }

  return (
    <Flex alignCenter className='gm-padding-tb-10 gm-padding-lr-5'>
      <Flex alignCenter>
        <Flex alignCenter>
          <Select isInPopup onChange={handleSelect} value={select}>
            {_.map(RULE_TYPE, (o) => (
              <Option key={o.value} value={o.value}>
                {o.name}
              </Option>
            ))}
          </Select>
          <InputNumberV2
            ref={inputRef}
            className={classnames('form-control')}
            id={id}
            style={{ width: '80px' }}
            max={9999}
            min={0}
            precision={select === 2 ? 4 : 2}
            value={value}
            onKeyDown={handleInputKeyDown}
            onChange={handleChange}
          />

          {selected !== 2 && suffixText}
        </Flex>
        <div className='gm-gap-5' />
      </Flex>
      <span
        className='gm-text-primary gm-margin-left-10 gm-cursor'
        onClick={handleCancel}
      >
        {t('取消')}
      </span>
      <span className='gm-padding-lr-10 gm-text-desc'>|</span>
      <span className='gm-text-primary gm-cursor' onClick={handleSave}>
        {t('保存')}
      </span>
    </Flex>
  )
}

EditRuleInput.propTypes = {
  inputValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  selected: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  isWarning: PropTypes.bool,

  closePopup: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  suffixText: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  initialVal: PropTypes.string,
}

EditRuleInput.defaultProps = {
  initialVal: '',
}

export default EditRuleInput
