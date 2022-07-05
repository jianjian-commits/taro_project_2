// 暂时保留老代码，即将废弃
import { t } from 'gm-i18n'
import CreateOld from '../../../order/order_detail_old/add_old'
import Create from '../../../order/add'
import { isOld } from '../../../order/util'

import { connect } from 'react-redux'
import { withBreadcrumbs } from 'common/service'

// 进入补录订单页面需带上repair字段
export default isOld()
  ? withBreadcrumbs([t('订单补录')])(
      connect(() => ({ repair: true }))(CreateOld)
    )
  : withBreadcrumbs([t('订单补录')])(connect(() => ({ repair: true }))(Create))
