import { i18next } from 'gm-i18n'
import React, { useState } from 'react'
import { Popover, Flex, InputNumberV2, Button } from '@gmfe/react'
import PropTypes from 'prop-types'
import Big from 'big.js'
import CalculationSvg from 'svg/calculation.svg'
import SvgRemove from 'gm-svg/src/Remove'

const DrawCalUI = (sku, type, handleOk, handleCancel) => {
  const [refundNumber, setRefundNumber] = useState('0')
  const [inputNumber, setInputNumber] = useState('0')
  const saleUnit = sku?.sku_sale_unit_name || ''
  const saleRatio = sku?.sku_sale_ratio || ''
  const baseUnit = sku?.sku_std_unit_name || ''
  const onOk = () => {
    handleOk(refundNumber)
    handleCancel()
  }

  const handleChangePrice = (value) => {
    setInputNumber(value)
    let result = 0
    if (value) {
      result = Big(value).times(saleRatio).toFixed(2)
    }
    setRefundNumber(result)
  }

  return (
    <div className='gm-margin-20'>
      <Flex justifyBetween className='gm-margin-bottom-20'>
        <div
          style={{ borderLeft: '2px solid #5c97eb' }}
          className='gm-padding-left-5'
        >
          {i18next.t(`快速计算`)}
        </div>
        <div className='gm-popup-content-confirm-close' onClick={handleCancel}>
          <SvgRemove />
        </div>
      </Flex>
      <p className='gm-margin-bottom-10'>{`${type}数（基本单位）= ${type}数（销售单位）x 销售规格`}</p>
      <Flex
        style={{ whiteSpace: 'pre' }}
        alignCenter
        className='gm-margin-bottom-10'
      >
        <span>{refundNumber} = </span>
        <InputNumberV2
          value={inputNumber}
          onChange={handleChangePrice}
          min={0}
          style={{ width: '80px' }}
          max={99999}
        />
        <span>
          {saleUnit} x {saleRatio}
          {baseUnit}/{saleUnit}
        </span>
      </Flex>
      <p className='gm-margin-bottom-20'>
        {i18next.t(`注：录入销售单位的数量，系统自动计算基本单位的数量`)}
      </p>
      <Flex justifyEnd>
        <Button type='default' onClick={handleCancel}>
          {i18next.t('取消')}
        </Button>
        <Button type='primary' className='gm-margin-left-10' onClick={onOk}>
          {i18next.t('保存')}
        </Button>
      </Flex>
    </div>
  )
}

const Calculator = (props) => {
  const popoverRef = React.createRef()
  return (
    <Popover
      showArrow
      type='focus'
      center
      ref={popoverRef}
      popup={DrawCalUI(props.sku, props.type, props.handleOk, () => {
        popoverRef?.current && popoverRef.current.apiDoSetActive(false)
      })}
    >
      <div style={{ fontSize: '24px' }}>
        <CalculationSvg />
      </div>
    </Popover>
  )
}

Calculator.displayName = 'Calculator'
Calculator.propTypes = {
  sku: PropTypes.object,
  type: PropTypes.string,
  handleOk: PropTypes.func,
}
export default Calculator
