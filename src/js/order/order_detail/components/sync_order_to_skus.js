import { t } from 'gm-i18n'
import React, { useState } from 'react'
import { Flex, RadioGroup, Radio, Button, Modal, Price } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import Big from 'big.js'

import orderDetailStore from '../../store'

const SalePricesSelect = ({ order_id, salePriceList }) => {
  // 过滤有多个价格的商品
  const list = _.filter(
    salePriceList,
    (item) => item.sale_price_list.length > 1,
  )
  const [priceList, setPriceList] = useState(list)

  const handleSkuPriceSelect = (value, index) => {
    const list = priceList.slice()
    list[index].selected = value
    setPriceList(list)
  }

  const handleSubmit = () => {
    // 相同sku存在多个销售价需要传选择的销售价给后台
    const list = _.map(priceList, (item) => {
      const select_std_sale_price_forsale = _.find(
        item.sale_price_list,
        (v) => v.detail_id === item.selected,
      ).std_sale_price_forsale
      return {
        sku_id: item.id,
        std_sale_price_forsale: Big(select_std_sale_price_forsale)
          .div(100)
          .toFixed(2),
      }
    })
    orderDetailStore.orderSyncToSku({
      order_id,
      sku_infos: JSON.stringify(list),
    })
    Modal.hide()
  }

  return (
    <Flex column className='gm-padding-left-10 gm-padding-right-0'>
      <span className='gm-padding-tb-10'>
        {t('以下商品存在多个价格，请选择其中一个价格进行同步:')}
      </span>
      <Flex column style={{ maxHeight: '520px', overflowY: 'auto' }}>
        {_.map(priceList, (item, index) => (
          <Flex
            alignStart
            justifyStart
            key={item.id}
            className='gm-margin-bottom-5'
          >
            <Flex
              none
              style={{ width: '150px' }}
            >{`${item.name}/${item.id}`}</Flex>
            <RadioGroup
              inline
              name={item.id}
              value={item.selected}
              onChange={(value) => handleSkuPriceSelect(value, index)}
            >
              {_.map(item.sale_price_list, (v) => (
                <Radio
                  value={v.detail_id}
                  key={v.detail_id}
                  style={{ width: '120px' }}
                  className='gm-margin-bottom-5'
                >
                  {`${v.sale_price}
                  ${Price.getUnit(v.fee_type) + '/'}
                  ${v.sale_unit_name}`}
                </Radio>
              ))}
            </RadioGroup>
          </Flex>
        ))}
      </Flex>
      <Flex justifyEnd>
        <Button
          type='primary'
          className='gm-margin-top-10'
          onClick={handleSubmit}
        >
          {t('确定同步')}
        </Button>
      </Flex>
    </Flex>
  )
}

SalePricesSelect.propTypes = {
  salePriceList: PropTypes.array,
  order_id: PropTypes.string,
}

export default SalePricesSelect
