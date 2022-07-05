import { Price } from '@gmfe/react'
import { t } from 'gm-i18n'
import moment from 'moment'
import { Request } from '@gm-common/request'

import { changeDomainName } from 'common/service'
import globalStore from 'stores/global'

// 一些通用定义
const isCStation = globalStore.otherInfo.isCStation
const todayBegin = moment().startOf('day')
const todayEnd = moment().endOf('day')
const yesterdayBegin = moment().subtract(1, 'day').startOf('day')
const yesterdayEnd = moment().subtract(1, 'day').endOf('day')

export const getCustomerName = (today) => {
  if (isCStation) {
    return today ? t('今日新增客户数（个）') : t('昨日新增客户数')
  }
  return today ? t('今日新增商户数（个）') : t('昨日新增商户数')
}

export const bulletinConfig = (key, tAcount, yAcount) => {
  // 处理 b 跟 c 对应不同的跳转
  let orderUrl = '/order_manage/order/list'
  let newCustomerNumUrl =
    changeDomainName('station', 'manage') + '/#/customer_manage/customer/report'
  let customerAnalyseUrl =
    changeDomainName('station', 'manage') + '/#/customer_manage/customer/report'
  let plOrderUrl =
    changeDomainName('station', 'manage') + '/#/order_manage/order/pl_order'
  let lkOrderUrl =
    changeDomainName('station', 'manage') + '/#/order_manage/order/lk_order'
  if (isCStation) {
    orderUrl = 'c_retail/order/list'
    newCustomerNumUrl = '/c_retail/basic_info/member'
    customerAnalyseUrl = null
    plOrderUrl = null
    lkOrderUrl = null
  }

  switch (key) {
    case 'order_num':
      return {
        tName: t('今日订单数（笔）'),
        yName: '昨日订单数',
        color: '#007EFF',
        tAcount: tAcount,
        yAcount: yAcount,
        tLink: {
          pathname: orderUrl,
          state: {
            begin: todayBegin,
            end: todayEnd,
          },
        },
        yLink: {
          pathname: orderUrl,
          state: {
            begin: yesterdayBegin,
            end: yesterdayEnd,
          },
        },
      }
    case 'place_order_money':
      return {
        tName: t('今日订单金额') + `（${Price.getUnit()}）`,
        yName: '昨日订单金额',
        color: '#10CE6E',
        tAcount: tAcount,
        yAcount: yAcount,
        tLink: {
          pathname: orderUrl,
          state: {
            begin: todayBegin,
            end: todayEnd,
          },
        },
        yLink: {
          pathname: orderUrl,
          state: {
            begin: yesterdayBegin,
            end: yesterdayEnd,
          },
        },
      }
    case 'customer_price':
      return {
        tName: t('今日客单价') + `（${Price.getUnit()}）`,
        yName: '昨日客单价',
        color: '#F95A59',
        tAcount: tAcount,
        yAcount: yAcount,
        tLink: customerAnalyseUrl,
        yLink: customerAnalyseUrl,
      }

    case 'new_customer_num':
      return {
        tName: getCustomerName(true),
        yName: getCustomerName(false),
        color: '#FFB822',
        tAcount: tAcount,
        yAcount: yAcount,
        tLink: isCStation
          ? {
              pathname: newCustomerNumUrl,
              state: {
                begin: todayBegin,
                end: todayEnd,
              },
            }
          : newCustomerNumUrl,
        yLink: isCStation
          ? {
              pathname: newCustomerNumUrl,
              state: {
                begin: yesterdayBegin,
                end: yesterdayEnd,
              },
            }
          : newCustomerNumUrl,
      }
    case 'order_customer_num':
      return {
        tName: isCStation
          ? t('今日下单客户数（个）')
          : t('今日下单商户数（个）'),
        yName: isCStation ? '昨日下单客户数' : '昨日下单商户数',
        color: '#0015EF',
        tAcount: tAcount,
        yAcount: yAcount,
        tLink: customerAnalyseUrl,
        yLink: customerAnalyseUrl,
      }
    case 'abnormal_count':
      return {
        tName: t('今日异常订单数（笔）'),
        yName: '昨日异常订单数',
        color: '#6C59F9',
        tAcount: tAcount,
        yAcount: yAcount,
        tLink: plOrderUrl,
        yLink: plOrderUrl,
      }
    case 'abnormal_price':
      return {
        tName: t('今日异常订单金额') + `（${Price.getUnit()}）`,
        yName: '昨日异常订单金额',
        color: '#C959F9',
        tAcount: tAcount,
        yAcount: yAcount,
        tLink: lkOrderUrl,
        yLink: lkOrderUrl,
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
    .then((json) => json.data)
}

export const analyseMerchantName = () => {
  if (isCStation) {
    return t('客户销量分布')
  }
  return t('商户销量分布')
}
