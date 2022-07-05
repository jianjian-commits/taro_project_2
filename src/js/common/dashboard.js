import React from 'react'
import _ from 'lodash'
import moment from 'moment'

import SvgDashboardBell from 'svg/dashboard_bell.svg'
import SvgDashboardChat from 'svg/dashboard_chat.svg'
import SvgDashboardGarbage from 'svg/dashboard_garbage.svg'
import SvgDashboardGoods from 'svg/dashboard_goods.svg'
import SvgDashboardMerchant from 'svg/dashboard_merchant.svg'
import SvgDashboardMoney from 'svg/dashboard_money.svg'
import SvgDashboardMoney2 from 'svg/dashboard_money2.svg'
import SvgDashboardOrder from 'svg/dashboard_order.svg'
import SvgDashboardPerson from 'svg/dashboard_person.svg'
import SvgDashboardRate from 'svg/dashboard_rate.svg'
import SvgDashboardTask from 'svg/dashboard_task.svg'

export const icons = {
  Bell: <SvgDashboardBell />,
  Chat: <SvgDashboardChat />,
  Garbage: <SvgDashboardGarbage />,
  Goods: <SvgDashboardGoods />,
  Merchant: <SvgDashboardMerchant />,
  Money: <SvgDashboardMoney />,
  Money2: <SvgDashboardMoney2 />,
  Order: <SvgDashboardOrder />,
  Person: <SvgDashboardPerson />,
  Rate: <SvgDashboardRate />,
  Task: <SvgDashboardTask />,
}

/**
 * Geek Blue 极客蓝 #5B8FF9
 * Cyan 翡翠绿 #5AD8A6
 * Grey 商务灰 #5D7092
 * Sunrise Yellow 旭日黄 #F6BD16
 * Dust Red 薄暮红 #E86452
 * Daybreak Blue 破晓蓝 #6DC8EC
 * Golden Purple 罗兰紫 #945FB9
 * Sunset Orange 落日橘 #FF9845
 * Dark Green 天水青 #1E9493
 * Magenta 桃花粉 #FF99C3
 */
export const colors = {
  Blue: '#5B8FF9',
  Cyan: '#5AD8A6',
  Grey: '#5D7092',
  Sunrise_Yellow: '#F6BD16',
  Dust_Red: '#E86452',
  Daybreak_Blue: '#6DC8EC',
  Golden_Purple: '#945FB9',
  Sunset_Orange: '#FF9845',
  Dark_Green: '#1E9493',
  Magenta: '#FF99C3',
}

const stringifyParamsAndFormatDate = (params) => {
  return _.reduce(
    params,
    (t, v, k) => {
      if (k === 'time_range') {
        v = v.map((i) => ({
          ...i,
          begin_time: moment(i.begin_time).format('YYYY-MM-DD hh:mm'),
          end_time: moment(i.end_time).format('YYYY-MM-DD hh:mm'),
        }))
      }
      return { ...t, [k]: JSON.stringify(v) }
    },
    {},
  )
}

// 数据面板的接口使用新架构模式，接口参数太杂，参数容易变成一坨一坨的大对象
// 所以增加Request的能力
export const enhanceRequest = (fn) => {
  function chainFn(requestInstance) {
    return {
      /**
       * 通用参数
       * @param {objet} params
       */
      common(params) {
        this.params = params
        return this
      },
      /**
       *
       * @param {object} v
       */
      time_range(v) {
        if (!this.params?.time_range)
          _.setWith(this.params, '[time_range]', [v])
        else this.params.time_range.push(v)
        return this
      },
      query_type(v) {
        this.params = _.merge(this.params, {
          query_expr: {
            filter: [{ query_type: v }],
          },
        })
        return this
      },
      query_argument(v) {
        this.params = _.merge(this.params, {
          query_expr: {
            filter: [{ query_argument: v }],
          },
        })
        return this
      },
      group_by_fields(v) {
        _.setWith(this.params, '[query_expr][group_by_fields]', v)
        return this
      },
      order_by_fields(v) {
        _.setWith(this.params, '[query_expr][order_by_fields]', v)
        return this
      },

      data(params) {
        if (!this.params) this.params = {}
        requestInstance.data(
          stringifyParamsAndFormatDate(_.merge(this.params, params)),
        )
        this.isSetData = true
        return this
      },
      post() {
        if (!this.isSetData)
          requestInstance.data(stringifyParamsAndFormatDate(this.params))
        return requestInstance.post()
      },
      get() {
        if (!this.isSetData)
          requestInstance.data(stringifyParamsAndFormatDate(this.params))
        return requestInstance.get()
      },
    }
  }
  return function (url) {
    const requestInstance = fn(url)
    return chainFn(requestInstance)
  }
}
