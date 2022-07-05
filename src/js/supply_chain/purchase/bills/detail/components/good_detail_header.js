import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Progress, Price } from '@gmfe/react'
import PropTypes from 'prop-types'
import Big from 'big.js'
import { getStatusLable } from '../../../util'

class GoodHeader extends React.Component {
  render() {
    const {
      task,
      settle_supplier_name,
      progressUnit,
      operator,
      id,
    } = this.props
    const {
      already_purchased_amount,
      std_unit_name,
      ratio,
      purchase_unit_name,
      status,
      plan_amount,
      spec_name,
      // suggest_purchase_num,
      ref_price,
      name,
      stock,
    } = task
    const alreadyPurchase =
      progressUnit === 0
        ? `${already_purchased_amount}${std_unit_name}`
        : `${Big(already_purchased_amount).div(ratio)}${std_unit_name}`
    const planPurchase =
      progressUnit === 0
        ? `/${plan_amount}${std_unit_name}`
        : `/${Big(already_purchased_amount).div(ratio)}${purchase_unit_name}`
    let suggestPurchaseNum = ''
    let percentage = plan_amount
      ? Number(Big(already_purchased_amount).div(plan_amount).times(100))
      : 0 // 补货说明 计划采购不存在
    const label = getStatusLable(status || 1) // 补货 status 不存在
    // 实际采购可能超出计划采购 百分比如果超出了100 则显示100
    percentage = percentage <= 100 ? percentage : 100
    if (Number(stock) < 0) {
      suggestPurchaseNum = `${Big(plan_amount).toFixed(2)}${std_unit_name}`
    } else {
      if (!id) {
        suggestPurchaseNum = '-'
      } else {
        const suggestPurchasing = Big(plan_amount).minus(stock).toFixed(2)
        Number(stock) >= 0 && suggestPurchasing < 0
          ? (suggestPurchaseNum = i18next.t('库存充足'))
          : (suggestPurchaseNum = `${suggestPurchasing}${std_unit_name}`)
      }
    }

    return (
      <Flex column className='gm-padding-tb-10 gm-back-bg'>
        <Flex>
          <div
            style={{
              padding: '0 5px',
              color: 'white',
              fontSize: '12px',
              lineHeight: '20px',
              height: '20px',
              background: label.bgColor,
            }}
          >
            {label.statusName}
          </div>
          <strong className='gm-margin-lr-10'>
            {spec_name || name}({`${ratio}/${std_unit_name}`})
          </strong>
          <div style={{ width: '250px' }} className='gm-position-relative'>
            <Progress
              percentage={percentage}
              strokeWidth={14}
              textInside
              style={{ paddingRight: '110px' }}
              text={`${Big(percentage).toFixed(0)}%`}
            />
            {plan_amount ? (
              <Flex
                className='gm-position-absolute gm-text-12'
                style={{ left: '100px', top: '3px' }}
              >
                <span className='text-primary'>{alreadyPurchase}</span>
                <span>{planPurchase}</span>
              </Flex>
            ) : (
              <div
                className='gm-position-absolute gm-text-12'
                style={{ left: '100px', top: '3px' }}
              >
                -
              </div>
            )}
          </div>
        </Flex>
        <Flex row className='gm-padding-top-15 gm-text-12'>
          <Flex className='gm-padding-right-15'>
            {i18next.t('供应商')}：{settle_supplier_name || '-'}
          </Flex>

          <div className='gm-margin-right-15'>
            {i18next.t('参考成本')}：
            {+ref_price
              ? `${Big(ref_price || 0)
                  .div(100)
                  .toFixed(2)}${Price.getUnit() + '/'}${std_unit_name}`
              : '-'}
          </div>

          <div className='gm-margin-right-15'>
            {i18next.t('采购员')}：{operator || '-'}
          </div>
          <div className='gm-margin-right-15'>
            {i18next.t('建议采购')}：{suggestPurchaseNum}
          </div>
        </Flex>
      </Flex>
    )
  }
}

GoodHeader.propTypes = {
  task: PropTypes.object.isRequired,
  settle_supplier_name: PropTypes.string.isRequired,
  operator: PropTypes.string.isRequired,
  progressUnit: PropTypes.number.isRequired,
  id: PropTypes.string,
}

export default GoodHeader
