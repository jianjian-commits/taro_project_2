import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import store from './store'
import _ from 'lodash'

const WarningText = observer(() => {
  return _.toNumber(store.saleAmount) < 0 ? (
    <div className='gm-padding-10 b-warning-tips'>
      <i className='ifont xfont-warning-circle' />
      {t(
        '当前销售额已小于0，保存订单后优惠券将被返还至用户账户，订单按原价计算',
      )}
    </div>
  ) : null
})

export default WarningText
