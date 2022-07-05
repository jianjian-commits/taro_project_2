import { Request as _Request } from '@gm-common/request'
import { enhanceRequest } from 'common/dashboard/sale/enhance_request'
import Big from 'big.js'
const Request = enhanceRequest(_Request)

/** ****************************************** 工作台 ********************************* */

// 工作台 -- 待处理事项
export const requestTodoData = (data, time_range) => {
  return Promise.all([
    Request('station_statistics/address_count') // 总商户数
      .common({ ...data, time_range: [] }) // 参数传空
      .post(),
    Request('station_statistics/order')
      .common({ ...data, time_range })
      .post(),
    Request('station_statistics/order').common(data).post(),
    Request('station_statistics/order/count') // 待分配司机任务（个）
      .common(data)
      .filter({
        query_type: 5,
        query_argument: 0,
      })
      .post(),
    Request('station_statistics/order/count')
      .common(data)
      .filter({
        query_type: 1,
        query_argument: 5,
      })
      .post(), // 分拣中订单
    Request('station_statistics/order/count')
      .common(data)
      .filter({
        query_type: 4,
        query_argument: 1,
      })
      .post(), // 未支付订单
    Request('station_statistics/order/count')
      .common(data)
      .filter({
        query_type: 1,
        query_argument: 1,
      })
      .post(), // 等待分拣订单
    // _Request('/home_page/data_analyse/ready_bills_count').get(), // 旧接口获取部分数据
  ]).then((responses) => {
    const [
      shopAllCount,
      allData_7,
      allData_30,
      UnDistributeDriverTask,
      orderSorting,
      orderUnPay,
      orderWaitSort,
      oldData = {
        wait_pay_num: 0,
      },
    ] = responses

    // TODO: 1.旧接口数据
    const { restaurant } = shopAllCount
    const { wait_pay_num } = oldData

    return {
      ...orderSorting,
      ...orderUnPay,
      ...orderWaitSort,
      wait_pay_num: { value: wait_pay_num }, // 待支付结款单

      uncount_shops_7_day: {
        value: +Big(restaurant).minus(allData_7.shopId.value),
      },
      uncount_shops_30_day: {
        value: +Big(restaurant).minus(allData_30.shopId.value),
      },
      ...UnDistributeDriverTask,
    }
  })
}

// 工作台 -- 今日简报
export const requestBriefData = (data) => {
  return Promise.all([
    Request('station_statistics/order/account_price') // 销售额
      .common(data)
      .group_by_fields([0])
      .order_by_fields([0])
      .post(),
    Request('station_statistics/order/sale_profit') // 销售毛利
      .common(data)
      .group_by_fields([0])
      .order_by_fields([0])
      .post(),
    Request('station_statistics/order/count') // 订单数
      .common(data)
      .group_by_fields([0])
      .order_by_fields([0])
      .post(),

    Request('station_statistics/order/avg_customer_price') // 客单价
      .common(data)
      .group_by_fields([0])
      .order_by_fields([0])
      .post(),

    Request('station_statistics/new_address') // 新增商户数
      .common(data)
      .group_by_fields([0])
      .order_by_fields([0])
      .post(),
    Request('station_statistics/charge') // 余额充值
      .common(data)
      .group_by_fields([0])
      .order_by_fields([0])
      .post(),
    Request('station_statistics/charge_user') // 新增充值商户数
      .common(data)
      .group_by_fields([0])
      .order_by_fields([0])
      .post(),
    Request('station_statistics/order/has_after_sale') // 售后订单数
      .common(data)
      .group_by_fields([0])
      .order_by_fields([0])
      .post(),
    Request('station_statistics/order_detail/after_sale_times') // 售后商品数
      .common(data)
      .filter({ query_type: 6, query_argument: '>0' })
      .group_by_fields([0])
      .order_by_fields([0])
      .post(),
    Request('station_statistics/order/after_sale_money') // 售后金额
      .common(data)
      .group_by_fields([0])
      .order_by_fields([0])
      .post(),
    Request('station_statistics/order/margin') // 应收账款
      .common(data)
      .group_by_fields([0])
      .order_by_fields([0])
      .post(),
  ]).then((responses) => responses)
}
