import React from 'react'
import { observer } from 'mobx-react'
import Big from 'big.js'
import memoComponentWithDataHoc from './memo_hoc'
import PropTypes from 'prop-types'
import { Flex, Popover, Price } from '@gmfe/react'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import { SvgSupplier } from 'gm-svg'
import { saleReferencePrice } from '../../../../../common/enum'

const EditCellRule = observer((props) => {
  const { data, refPriceType } = props
  const {
    latest_quote_from_supplier,
    quoted_from_supplier,
    fee_type,
    std_unit_name_forsale,
  } = data
  const { flag: refPriceTypeFlag } = _.find(
    saleReferencePrice,
    (v) => v.type === refPriceType,
  )

  let isSupplierPrice = false
  if (refPriceTypeFlag === 'latest_quote_price' && latest_quote_from_supplier) {
    isSupplierPrice = true
  } else if (refPriceTypeFlag === 'last_quote_price' && quoted_from_supplier) {
    isSupplierPrice = true
  }

  const price = _.isNil(data[refPriceTypeFlag]) ? '-' : data[refPriceTypeFlag]
  return price === '-' ? (
    '-'
  ) : (
    <Flex alignCenter>
      <div>
        {Big(price).div(100).toFixed(2) +
          Price.getUnit(fee_type) +
          '/' +
          std_unit_name_forsale}
      </div>
      {isSupplierPrice && (
        <Popover
          top
          showArrow
          type='hover'
          popup={<div>{i18next.t('供应商报价')}</div>}
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
})

EditCellRule.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(EditCellRule)
