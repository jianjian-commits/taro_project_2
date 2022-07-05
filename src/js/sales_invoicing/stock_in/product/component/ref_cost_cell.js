import { observer } from 'mobx-react'
import Big from 'big.js'
import { Flex, Popover, Price } from '@gmfe/react'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import { referenceCosts } from '../../util'
import _ from 'lodash'
import store from '../store/receipt_store'
import React from 'react'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'

const staticPrice = [
  'latest_quote_price',
  'latest_in_stock_price',
  'stock_avg_price',
  'max_stock_unit_price',
  'latest_purchase_price',
  // 供应商周期报价
  'supplier_cycle_quote',
]

const PriceAndName = (props) => {
  const { price, name } = props

  return _.isNil(price)
    ? '-'
    : Big(price || 0).toFixed(2) + Price.getUnit() + '/' + (name || '-')
}

const PopoverValue = ({ newest, earlierList, unitName }) => {
  const currentReferencePrice = newest.price || 0

  return (
    <Popover
      showArrow
      type='hover'
      popup={
        <div className='gm-padding-tb-10 gm-padding-lr-15'>
          {!(currentReferencePrice === '-') || earlierList.length > 0 ? (
            <div className='gm-margin-bottom-5'>
              <strong>{i18next.t('当前供应商')}</strong>
              <Flex justifyBetween>
                <div className='gm-padding-right-15'>
                  {newest.purchase_supplier_name || '-'}
                </div>
                <div className='gm-padding-left-15'>
                  <PriceAndName price={currentReferencePrice} name={unitName} />
                </div>
              </Flex>
            </div>
          ) : null}
          {earlierList.length > 0 ? (
            <div className='gm-margin-bottom-5 gm-padding-bottom-5'>
              <strong>{i18next.t('其他供应商12312312')}</strong>
              {_.map(earlierList, (item, i) => (
                <Flex justifyBetween key={i}>
                  <div className='gm-padding-right-15'>
                    {item.purchase_supplier_name || '-'}
                  </div>
                  <div className='gm-padding-left-15'>
                    <PriceAndName price={item.price} name={unitName} />
                  </div>
                </Flex>
              ))}
            </div>
          ) : null}
        </div>
      }
    >
      <span>
        <PriceAndName price={currentReferencePrice} name={unitName} />
      </span>
    </Popover>
  )
}

PopoverValue.propTypes = {
  newest: PropTypes.object.isRequired,
  earlierList: PropTypes.array.isRequired,
  unitName: PropTypes.string.isRequired,
}

const RefCostCell = observer(({ data }) => {
  const { std_unit } = data
  const { showRefCostType } = store

  const { key: showType } =
    _.find(referenceCosts, (v) => v.value === showRefCostType) || {}

  const priceData = data[showType]

  const earlierList = priceData
    ? _.filter(priceData.earlier, (item) => {
        return !_.isNil(item.price)
      })
    : []
  const newest = priceData ? priceData.newest : {}

  return (
    <>
      {_.includes(staticPrice, showType) ? (
        <PriceAndName price={priceData} name={std_unit || '-'} />
      ) : (
        <PopoverValue
          unitName={std_unit || '-'}
          earlierList={earlierList}
          newest={newest}
        />
      )}
    </>
  )
})

export default memoComponentWithDataHoc(RefCostCell)
