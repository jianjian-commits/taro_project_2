import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_with_data_hoc'
import PropTypes from 'prop-types'
import Big from 'big.js'
import { Price } from '@gmfe/react'

// 新添加的商品，没有ref_price和plan_amount，值为采购数「基本单位」*参考成本
// 老商品，值为plan_amount * ref_price
const CellPlanMoney = observer((props) => {
  const { data, referencePriceFlag } = props
  const { purchase_amount, plan_amount, ref_price } = data
  const costPrice = ref_price || data[referencePriceFlag]
  const num = plan_amount || purchase_amount

  if (!num || !costPrice) return 0 + Price.getUnit()

  return (
    Big(num || 0)
      .times(costPrice || 0)
      .div(100)
      .toFixed(2) + Price.getUnit()
  )
})

CellPlanMoney.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  referencePriceFlag: PropTypes.string,
}

export default memoComponentWithDataHoc(CellPlanMoney)
