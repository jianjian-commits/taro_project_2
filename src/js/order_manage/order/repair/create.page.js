// 暂时保留老代码，即将废弃
import CreateOld from '../../../order/order_detail_old/add_old'
import Create from '../../../order/add'
import { isOld } from '../../../order/util'

import { connect } from 'react-redux'

// 进入补录订单页面需带上repair字段
export default isOld()
  ? connect(() => ({ repair: true }))(CreateOld)
  : connect(() => ({ repair: true }))(Create)
