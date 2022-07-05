import React from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Flex, Price } from '@gmfe/react'
import FieldBlock from './components/field_block'
import DashedLine from './components/dashed_line'
import PropTypes from 'prop-types'
import Big from 'big.js'
import { price } from '../util'

const CURRENCY = Price.getCurrency()

function PrintSkuGroup({ data }) {
  return _.map(data, (list, groupName) => {
    return (
      <div key={groupName}>
        <FieldBlock
          left={groupName}
          right={list.length}
          className='gm-text-20 gm-text-bold'
        />
        <DashedLine />

        {_.map(list, (v, index) => (
          <div key={index}>
            <div>
              {v.name}（{v.sale_ratio}
              {v.std_unit_name_forsale}/{v.sale_unit_name}）
            </div>
            <div className='gm-padding-left-10'>
              <FieldBlock
                left={t('下单')}
                right={
                  parseFloat(Big(v.quantity || 0).toFixed(2)) + v.sale_unit_name
                }
              />

              <Flex justifyBetween className='gm-padding-right-15'>
                <FieldBlock
                  left={t('配送')}
                  right={`${v.real_weight}${
                    v.std_unit_name_forsale
                  } X ${CURRENCY}${price(v.std_sale_price_forsale)}`}
                />
                <div>
                  {CURRENCY}
                  {price(v.real_item_price)}
                </div>
              </Flex>
              <DashedLine />
            </div>
          </div>
        ))}
      </div>
    )
  })
}

PrintSkuGroup.propTypes = {
  data: PropTypes.object.isRequired,
}

export default PrintSkuGroup
