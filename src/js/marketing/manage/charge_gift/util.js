import Big from 'big.js'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Tip } from '@gmfe/react'

const STATUS = {
  0: t('无效'),
  1: t('有效'),
}

const ALL_STATUS = {
  10: t('全部状态'),
  ...STATUS,
}

const GIFT_TYPE = {
  1: t('余额'),
  2: t('积分'),
}

const money = (val) => {
  return Big(val).div(100)
}

const checkSection = (arr) => {
  return _.reduce(
    arr,
    (res, { start, end, gift }, index) => {
      if (start === null || end === null || gift === null) {
        Tip.warning(t('赠送数额不能为空，且必须为不小于零的整数'))
        return false
      } else if (end <= start) {
        Tip.warning(t('充值数额末尾值小于或等于起始值'))
        return false
      } else {
        return res
      }
    },
    true
  )
}

export { ALL_STATUS, STATUS, GIFT_TYPE, money, checkSection }
