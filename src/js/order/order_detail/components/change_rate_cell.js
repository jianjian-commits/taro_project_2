import globalStore from 'stores/global'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import Big from 'big.js'

// 变化率
// 当没有选择商品时，变化率可随意变动 变化率 = 现价 / 原价
// 当选择了商品后，变化率由商品带出 不可变动（由于后台不存这个字段，变化率再次编辑时会有微调）
const ChangeRateCell = (props) => {
  const { rowData } = props
  const { sale_price, before_change_price_forsale, yx_price } = rowData

  // 未填写现价或原价时 返回占位符 -
  if (!yx_price && (!sale_price || !Number(before_change_price_forsale)))
    return '-'

  const change_rate = yx_price
    ? yx_price / 100
    : Number(sale_price) / Number(before_change_price_forsale)

  return globalStore?.orderInfo?.contract_rate_format === 1
    ? `${+Big(change_rate - 1)
        .times(100)
        .toFixed(2)}%`
    : +Big(change_rate).toFixed(2)
}

ChangeRateCell.propTypes = {
  rowData: PropTypes.object,
  isDetail: PropTypes.bool,
  index: PropTypes.number,
}

export default observer(ChangeRateCell)
