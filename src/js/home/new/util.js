import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'

import { changeDomainName } from 'common/service'
import globalStore from 'stores/global'
import { colors, icons } from 'common/dashboard/sale/theme'

// 一些通用定义
const isCStation = globalStore.otherInfo.isCStation

export const getCustomerName = (today) => {
  if (isCStation) {
    return today ? t('今日新增客户数（个）') : t('昨日新增客户数')
  }
  return today ? t('今日新增商户数（个）') : t('昨日新增商户数')
}

export const bulletinConfig = (key) => {
  switch (key) {
    case 'unreleased_purchase_task':
      return {
        name: t('采购任务待发布'),
        icon: icons.Bell,
        color: colors.Blue,
      }
    case 'waiting_for_sort_orders':
      return {
        name: t('等待分拣订单'),
        color: colors.Cyan,
        icon: icons.Order,
      }
    case 'sorting_orders':
      return {
        name: t('分拣中订单'),
        yName: '昨日客单价',
        icon: icons.Order,
        color: colors.Sunrise_Yellow,
      }

    case 'to_distribute_driver_task':
      return {
        name: t('待分配司机任务'),
        icon: icons.Person,
        color: colors.Daybreak_Blue,
      }
    case 'unpaid_orders':
      return {
        name: t('未支付订单'),
        icon: icons.Order,
        color: colors.Dust_Red,
      }
    case 'unpaid_settlement_sheet':
      return {
        name: t('待支付结款单'),
        icon: icons.Order,
        color: colors.Blue,
      }
    case '?_1':
      return {
        name: t('周转物未归还'),
        icon: icons.Merchant,
        color: colors.Daybreak_Blue,
      }
    case '?_2':
      return {
        name: t('未下单商户数（近7日）'),
        icon: icons.Merchant,
        color: colors.Daybreak_Blue,
      }
    case '?_3':
      return {
        name: t('未下单商户数（近30日）'),
        icon: icons.Merchant,
        color: colors.Daybreak_Blue,
      }

    default:
      return null
  }
}

export const notifyNavgation = (type, key) => {
  // 1:商户注册；2.新品需求; 3.改单审核; 4.积分兑换; 5.优惠卷退卷;
  switch (type) {
    case 1:
      return {
        link:
          changeDomainName('station', 'manage') +
          '/#/customer_manage/customer/manage',
      }
    case 2:
      return {
        link: '/#/merchandise/manage/demand',
      }
    case 3:
      return {
        link: `/#/order_manage/order_review/details?id=${key}`,
      }
    case 4:
      return {
        link: '/#/marketing/points/exchange_detail',
      }
    case 5:
      return {
        link: `/#/order_manage/order/list/detail?id=${key}`,
      }
  }
}

export const getQueryParams = (initQuery, orderType) => {
  if (orderType === '0') {
    return initQuery
  }
  return {
    ...initQuery,
    order_process_type_id: orderType,
  }
}

export const fetchData = (url, data) => {
  return Request(url)
    .data(data)
    .get()
    .then((json) => {
      return json.data.map((d) => {
        Object.keys(d).forEach((k) => {
          const n = Number(d[k])
          if (!isNaN(n)) {
            d[k] = n
          }
        })
        return d
      })
    })
}

export const analyseMerchanname = () => {
  if (isCStation) {
    return t('客户销量分布')
  }
  return t('商户销量分布')
}
