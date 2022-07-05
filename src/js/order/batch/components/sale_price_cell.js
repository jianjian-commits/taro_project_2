import React from 'react'
import { i18next, t } from 'gm-i18n'
import { Flex, InputNumber, Price } from '@gmfe/react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

const SalePriceCell = observer(({ sku, onChange }) => {
  const handleEdit = () => {
    onChange({ key: 'is_price_timing', value: false })
  }

  if (sku.isCombineGoodsTop) {
    return (
      sku.sale_price +
      Price.getUnit(sku.fee_type) +
      sku.sale_unit_name +
      `(${t('参考价格')})`
    )
  }

  if (sku.is_price_timing) {
    return (
      <div
        className='gm-inline-block'
        style={{ cursor: 'pointer' }}
        onClick={handleEdit}
      >
        <span className=' gm-margin-right-5'>{i18next.t('时价')}</span>
        <i className='glyphicon glyphicon-pencil text-primary' />
      </div>
    )
  }
  return (
    <Flex>
      <InputNumber
        value={sku.sale_price}
        max={999999}
        onChange={(value) => onChange({ key: 'sale_price', value })}
        className={classNames('form-control input-sm b-order-quantity-input', {
          'b-bg-warning': !sku.sale_price,
        })}
        style={{ width: '70px' }}
        placeholder={i18next.t('含税单价')}
      />
      <span className='gm-padding-5'>{`${Price.getUnit(sku.fee_type)}/${
        sku.sale_unit_name || sku.default_sale_unit_name
      }`}</span>
    </Flex>
  )
})

SalePriceCell.propTypes = {
  sku: PropTypes.object,
  onChange: PropTypes.func,
}

export default SalePriceCell
