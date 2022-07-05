import { i18next } from 'gm-i18n'
import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import TextTip from '../text_tip'
import { Flex, InputNumber } from '@gmfe/react'
import ModifyTip from './modify_tip'

class Modify extends React.Component {
  render() {
    const {
      unitName,
      disabled,
      outOfStock,
      realIsWeight,
      isWeight,
      printed,
      value,
      isExc,
      isEdit,
      inputValue,
      onChange,
    } = this.props
    return (
      <>
        <Flex
          alignCenter
          className={classNames('gm-order-modify gm-inline-block')}
        >
          {!disabled && isEdit ? (
            <div className='gm-inline-block'>
              <InputNumber
                min={0}
                name='b-comp-modify'
                className='gm-inline-block form-control'
                style={{ minWidth: 60 }}
                value={inputValue}
                onChange={onChange}
              />
              <span className='gm-padding-lr-5'>{unitName}</span>
              <ModifyTip
                realIsWeight={realIsWeight}
                outOfStock={outOfStock}
                printed={printed}
                isWeight={isWeight}
              />
            </div>
          ) : outOfStock ? (
            <span onClick={this.handleEdit} className='gm-text-red'>
              {i18next.t('缺货')}
              <ModifyTip
                realIsWeight={realIsWeight}
                outOfStock={outOfStock}
                printed={printed}
                isWeight={isWeight}
                isSellout
              />
            </span>
          ) : (
            <div onClick={this.handleEdit} className='gm-inline-block'>
              <span
                className={classNames({
                  'text-primary': realIsWeight && isWeight,
                })}
              >{`${value} ${unitName}`}</span>
              <ModifyTip
                realIsWeight={realIsWeight}
                outOfStock={outOfStock}
                printed={printed}
                isWeight={isWeight}
              />
            </div>
          )}
        </Flex>
        {isExc ? (
          <TextTip
            content={
              <div className='gm-inline-block gm-bg'>
                {i18next.t('当前商品存在售后异常，无法进行修改')}
              </div>
            }
            style={{
              marginLeft: '-2px',
              marginTop: '2px',
              fontSize: '12px',
            }}
          >
            <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
          </TextTip>
        ) : (
          ''
        )}
      </>
    )
  }
}

Modify.propTypes = {
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  value: PropTypes.any,
  unitName: PropTypes.string,
  isExc: PropTypes.number,
  realIsWeight: PropTypes.number,
  printed: PropTypes.bool,
  isWeight: PropTypes.number,
  outOfStock: PropTypes.bool,
  isSellout: PropTypes.bool,
  isEdit: PropTypes.bool,
  inputValue: PropTypes.any,
}

export default Modify
