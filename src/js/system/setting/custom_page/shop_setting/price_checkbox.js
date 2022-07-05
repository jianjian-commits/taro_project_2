import React, { useMemo } from 'react'
import { CheckboxGroup, Checkbox } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'

/**
 * value 1 销售价格 / 基本价格
 * value 0 销售价格
 * value 2 基本价格
 */
const priceUnitMap = {
  1: [0, 2],
  0: [0],
  2: [2],
}

const PriceCheckBox = ({ value, onChange, tip }) => {
  const priceUnitArr = useMemo(() => {
    return priceUnitMap[value]
  }, [value])

  const handleCheckBoxChange = (values) => {
    const v = values.length > 1 ? 1 : ~~values[0]
    onChange && onChange(v)
  }

  return (
    <>
      <CheckboxGroup
        name='shopTypeList'
        inline
        value={priceUnitArr}
        onChange={handleCheckBoxChange}
      >
        <Checkbox value={0}>{i18next.t('销售单位')}</Checkbox>
        <Checkbox value={2}>{i18next.t('基本单位')}</Checkbox>
      </CheckboxGroup>
      {tip && (
        <div className='gm-text-desc gm-margin-top-5'>{tip}</div>
      )}
    </>
  )
}

PriceCheckBox.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  tip: PropTypes.element,
}
export default PriceCheckBox
