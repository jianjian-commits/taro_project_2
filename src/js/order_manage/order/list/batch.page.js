// 暂时保留老代码，即将废弃
import BatchOld from '../../../order/order_detail_old/batch_old'
import Batch from '../../../order/batch'
import { isOld } from '../../../order/util'

export default isOld() ? BatchOld : Batch
