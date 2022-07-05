// 暂时保留老代码，即将废弃
import DetailOld from '../../../order/order_detail_old/detail_old'
import Detail from '../../../order/detail'
import { isOld } from '../../../order/util'
export default isOld() ? DetailOld : Detail
