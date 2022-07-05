import { t } from 'gm-i18n'
import React from 'react'
import qs from 'query-string'
import { Popover } from '@gmfe/react'
import PropTypes from 'prop-types'

import { isAbnormalOrder } from '../../../../order/util'
import store from './store'

const OrderId = props => {
  const { sku, index } = props
  const { orders } = store
  const { filter } = orders
  const { sortType } = filter

  const isAbnormal = isAbnormalOrder(sku)
  return (
    <div style={{ width: '130px' }}>
      <a
        href={`#/c_retail/order/list/detail?${qs.stringify({
          id: sku.id,
          offset: orders.pagination.offset + index,
          search: qs.stringify({
            ...store.searchData,
            sort_type: sortType === '' ? null : sortType,
            retail: 1
          })
        })}`}
        style={{ textDecoration: 'underline' }}
        rel='noopener noreferrer'
        target='_blank'
      >
        {sku.id}
      </a>
      {isAbnormal ? (
        <Popover
          showArrow
          type='hover'
          left
          bottom
          style={{
            marginLeft: '-3px',
            marginTop: '3px',
            fontSize: '12px'
          }}
          popup={
            <div style={{ minWidth: '130px' }} className='gm-padding-10 gm-bg'>
              {t('该订单存在售后异常')}
            </div>
          }
        >
          <span style={{ cursor: 'pointer' }}>
            <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
          </span>
        </Popover>
      ) : null}
    </div>
  )
}

OrderId.propTypes = {
  sku: PropTypes.object,
  index: PropTypes.number
}

export default OrderId
