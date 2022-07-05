import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import { i18next, t } from 'gm-i18n'
import { observer } from 'mobx-react'

const Summary = observer((props) => {
  const { type, data } = props

  return (
    <Flex row justifyAround className='gm-margin-bottom-20'>
      <div className='summary-statistics'>
        <h3>{type === 'stock' ? t('商品总数') : t('货位总数')}</h3>
        <p>{type === 'stock' ? data.spu_sum : data.shelf_sum}</p>
      </div>
      <div className='summary-statistics'>
        <h3>{i18next.t('库存总数')}</h3>
        <p>{data.stock_sum}</p>
      </div>
      <div className='summary-statistics'>
        <h3>{i18next.t('库存总货值')}</h3>
        <p>{data.stock_sum_money}</p>
      </div>
    </Flex>
  )
})

export default Summary

Summary.propTypes = {
  type: PropTypes.oneOf(['stock', 'product']),
  data: PropTypes.shape({
    spu_sum: PropTypes.number,
    shelf_sum: PropTypes.number,
    stock_sum: PropTypes.number,
    stock_sum_money: PropTypes.string,
  }),
}
