// 暂时保留老代码，即将废弃
import { t } from 'gm-i18n'
import CreateOld from '../../order/order_detail_old/add_old'
import Create from '../../order/add'
import { isOld } from '../../order/util'
import { withBreadcrumbs } from 'common/service'

export default isOld()
  ? withBreadcrumbs([t('订单创建')])(CreateOld)
  : withBreadcrumbs([t('订单创建')])(Create)
