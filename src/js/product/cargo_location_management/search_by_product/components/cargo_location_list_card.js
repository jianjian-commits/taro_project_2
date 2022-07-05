import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import { createRightModal } from '../../utils'
import StockDetailsModal from './modals/stock_details_modal'

export default function CargoLocationListCard(props) {
  const { data } = props
  const {
    shelf_name,
    batch_count,
    stock_money,
    stock_num,
    is_distribution,
  } = data

  return (
    <div
      className='gm-margin-bottom-20 stock-list-card'
      onClick={() =>
        createRightModal(t('货位信息'), <StockDetailsModal shelf={data} />)
      }
    >
      <header className='stock-list-card-header'>{`${shelf_name}${
        is_distribution ? t('（未分配子级货位）') : ''
      }`}</header>
      <Flex
        column
        justifyAround
        className='gm-padding-lr-20 stock-list-card-content'
      >
        <div>
          {t('批次数量')}
          <div className='gm-gap-10' />
          <span className='stock-list-card-content-value'>{batch_count}</span>
        </div>
        <div>
          {t('库存数量')}
          <div className='gm-gap-10' />
          <span className='stock-list-card-content-value'>{stock_num}</span>
        </div>
        <div>
          {t('库存货值')}
          <div className='gm-gap-10' />
          <span className='stock-list-card-content-value'>{stock_money}</span>
        </div>
      </Flex>
    </div>
  )
}

CargoLocationListCard.propTypes = {
  data: PropTypes.object.isRequired,
}
