import { t } from 'gm-i18n'
import React from 'react'
import { Flex, Popover, Price } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import Big from 'big.js'
import SVGPriority from '../../../svg/priority.svg'
import { SvgSupplier } from 'gm-svg'

const priceFlagEnum = [
  // 最近询价
  'latest_quote_price',
  // 最近入库价
  'latest_in_stock_price',
  // 库存均价
  'stock_avg_price',
  // 最近采购价
  'latest_purchase_price',
  // 供应商周期报价
  'supplier_cycle_quote',
]
class ReferencePriceDetail extends React.Component {
  render() {
    const {
      reference_price,
      referencePriceFlag,
      sequshList,
      currentIndex,
      feeType, // 多币种， 默认不传
      unit_name, // 单位，默认为销售计量单位，但是采购模块，用基本单位
    } = this.props
    // 参考成本是否选择了供应商最近询价
    const isLastQuotePrice = referencePriceFlag === 'last_quote_price'
    const currentReferencePriceFun = (reference_price, i, feeType = null) => {
      return _.isNil(reference_price)
        ? '-'
        : Big(reference_price || 0)
            .div(100)
            .toFixed(2) +
            Price.getUnit(feeType) +
            '/' +
            (unit_name || sequshList[i].std_unit_name_forsale)
    }
    const currentReferencePrice = currentReferencePriceFun(
      reference_price,
      currentIndex,
      feeType,
    )
    // 当前供应商参考价是否存在
    const isCurrentReferencePrice = currentReferencePrice !== '-'
    // 获取当前供应商
    const newest = sequshList[currentIndex][`${referencePriceFlag}_newest`]
    // 其他供应商
    let earlierList = sequshList[currentIndex][`${referencePriceFlag}_earlier`]
    // popover 要过滤掉无效值
    earlierList = _.filter(earlierList, (sup) => {
      return !_.isNil(sup.price)
    })
    if (
      priceFlagEnum.includes(referencePriceFlag) ||
      (!isCurrentReferencePrice && !earlierList.length)
    ) {
      return (
        <Flex alignCenter>
          <span>{currentReferencePrice}</span>
          {isCurrentReferencePrice &&
            referencePriceFlag === 'latest_quote_price' &&
            sequshList[currentIndex].latest_quote_from_supplier && (
              <Popover
                top
                showArrow
                type='hover'
                popup={<div>{t('供应商报价')}</div>}
              >
                <SvgSupplier
                  className='gm-text-14'
                  style={{
                    color: 'green',
                    marginLeft: '2px',
                  }}
                />
              </Popover>
            )}
        </Flex>
      )
    } else {
      return (
        <Popover
          showArrow
          type='hover'
          popup={
            <div className='gm-padding-tb-10 gm-padding-lr-15'>
              {isCurrentReferencePrice || earlierList.length > 0 ? (
                <div key='newest' className='gm-margin-bottom-5'>
                  <strong>{t('当前供应商')}</strong>
                  <Flex justifyBetween>
                    <div className='gm-padding-right-15'>
                      {newest?.is_priority ? (
                        <SVGPriority className='text-primary gm-text-14' />
                      ) : null}
                      {newest?.purchase_supplier_name || '-'}
                    </div>
                    <div className='gm-padding-left-15'>
                      {currentReferencePrice}
                      {isLastQuotePrice && newest?.quoted_from_supplier && (
                        <Popover
                          top
                          showArrow
                          type='hover'
                          popup={<div>{t('供应商报价')}</div>}
                        >
                          <SvgSupplier
                            className='gm-text-14'
                            style={{
                              color: 'green',
                              marginLeft: '2px',
                            }}
                          />
                        </Popover>
                      )}
                    </div>
                  </Flex>
                </div>
              ) : null}
              {earlierList.length > 0 ? (
                <div className='gm-margin-bottom-5 gm-padding-bottom-5'>
                  <strong>{t('其他供应商')}</strong>
                  {_.map(earlierList, (item, i) => (
                    <Flex justifyBetween key={i}>
                      <div className='gm-padding-right-15'>
                        {item.is_priority ? (
                          <SVGPriority className='text-primary gm-text-14' />
                        ) : null}
                        {item.purchase_supplier_name || '-'}
                      </div>
                      <div className='gm-padding-left-15'>
                        {currentReferencePriceFun(
                          item.price,
                          currentIndex,
                          feeType,
                        )}
                        {isLastQuotePrice && item.quoted_from_supplier && (
                          <Popover
                            top
                            showArrow
                            type='hover'
                            popup={<div>{t('供应商报价')}</div>}
                          >
                            <SvgSupplier
                              className='gm-text-14'
                              style={{
                                color: 'green',
                                marginLeft: '2px',
                              }}
                            />
                          </Popover>
                        )}
                      </div>
                    </Flex>
                  ))}
                </div>
              ) : null}
            </div>
          }
        >
          <Flex alignCenter>
            <span>{currentReferencePrice}</span>
            {isCurrentReferencePrice &&
              isLastQuotePrice &&
              newest.quoted_from_supplier && (
                <Popover
                  top
                  showArrow
                  type='hover'
                  popup={<div>{t('供应商报价')}</div>}
                >
                  <SvgSupplier
                    className='gm-text-14'
                    style={{
                      color: 'green',
                      marginLeft: '2px',
                    }}
                  />
                </Popover>
              )}
          </Flex>
        </Popover>
      )
    }
  }
}

ReferencePriceDetail.propTypes = {
  reference_price: PropTypes.number,
  referencePriceFlag: PropTypes.string,
  sequshList: PropTypes.array,
  currentIndex: PropTypes.number,
  feeType: PropTypes.string,
  unit_name: PropTypes.string,
}

export default ReferencePriceDetail
