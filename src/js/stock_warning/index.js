import { i18next } from 'gm-i18n'
import { history } from '../common/service'
import { Tip } from '@gmfe/react'
import { Request } from '@gm-common/request'
import globalStore from '../stores/global'

// 安全库存
const init = function () {
  if (!globalStore.hasPermission('get_stock_threshold_warning')) {
    return
  }

  // 库存报警
  Request(`/stock/warning`)
    .get()
    .then((json) => {
      const type = json.data.type
      if (type === 1) {
        Tip.warning({
          children: i18next.t('当前存在库存小于安全库存的商品，请及时补货'),
          time: 0,
        })
      }
    })

  // 安全库存监听
  let stockWarningTipDom = null
  let isSendWarningFlag = false
  let isWarningPath = false

  history.listen(({ pathname }) => {
    isWarningPath = pathname.indexOf('/supply_chain') > -1

    if (isWarningPath && !isSendWarningFlag) {
      isSendWarningFlag = true
      // 库存报警
      Request(`/stock/warning`)
        .get()
        .then((json) => {
          const type = json.data.type
          stockWarningTipDom && Tip.clear(stockWarningTipDom)
          if (type === 1) {
            stockWarningTipDom = Tip.warning({
              children: i18next.t('当前存在库存小于安全库存的商品，请及时补货'),
              time: 0,
            })
          }
        })
    } else {
      isSendWarningFlag = isWarningPath
    }
  })
}

export default init
