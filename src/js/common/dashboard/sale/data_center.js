import _ from 'lodash'
import * as Adaptor from './adaptor'
import Big from 'big.js'
class DataCenter {
  adaptor(cfg) {}
  /**
   * 针对数据进行统一处理
   * @param {} data
   */
  process(data) {
    switch (this.url) {
      /** ********************************* 订单数 ********************************* */

      case 'station_statistics/order/count':
        if (_.isEqual(this._group_by_fields, [0])) {
          data = Adaptor.groupByApt(data, {
            text: '订单数',
            field: 'orderData',
            yAxis: 'old_order_id',
            xAxis: this._time_field,
          })
        } else if (_.isEqual(this._group_by_fields, [1])) {
          data = Adaptor.groupByApt(data, {
            text: '订单数',
            field: 'orderData',
            yAxis: 'old_order_id',
            xAxis: 'shop_id', // 店铺id
          })
        } else if (_.isEqual(this._group_by_fields, [2])) {
          data = Adaptor.groupByApt(data, {
            text: '订单数',
            field: 'orderData',
            yAxis: 'old_order_id',
            xAxis: 'sales_emp_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [3]) // 一级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'saleData',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (_.isEqual(this._group_by_fields, [4])) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'saleData',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (this._time_range) {
          data = Adaptor.orderAptAvg(data, 'orderData', 'old_order_id')
        } else {
          const filter = this._filter[0] || {}
          if (
            _.isEqual(filter.query_type, 1) &&
            _.isEqual(filter.query_argument, 1)
          ) {
            data = Adaptor.orderAptAvg(data, 'orderWaitSort', 'old_order_id')
          } else if (
            _.isEqual(filter.query_type, 1) &&
            _.isEqual(filter.query_argument, 5)
          ) {
            data = Adaptor.orderAptAvg(data, 'orderSorting', 'old_order_id')
          } else if (
            _.isEqual(filter.query_type, 4) &&
            _.isEqual(filter.query_argument, 1)
          ) {
            data = Adaptor.orderAptAvg(data, 'orderUnPay', 'old_order_id')
          } else if (
            _.isEqual(filter.query_type, 5) &&
            _.isEqual(filter.query_argument, 0)
          ) {
            data = Adaptor.orderAptAvg(
              data,
              'UnDistributeDriverTask',
              'old_order_id',
            )
          } else {
            data = Adaptor.orderAptAvg(data, 'orderData', 'old_order_id')
          }
        }
        break

      /** ********************************* 销售额 ********************************* */

      case 'station_statistics/order/account_price':
        if (
          _.isEqual(this._group_by_fields, [0]) // 工作台-今日简报/趋势-销售额,
        ) {
          data = Adaptor.groupByApt(data, {
            text: '销售额',
            field: 'saleData',
            yAxis: 'account_price',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [1]) // 销售驾驶舱-销售趋势-商户销量排行-销售额
        ) {
          data = Adaptor.groupByApt(
            data,
            {
              text: '销售额',
              field: 'saleData',
              yAxis: 'account_price',
              xAxis: 'shop_id', // 店铺id
            },
            3,
          )
        } else if (
          _.isEqual(this._group_by_fields, [2]) // 销售驾驶舱-销售趋势-销售经理业绩-销售额
        ) {
          data = Adaptor.groupByApt(
            data,
            {
              text: '销售额',
              field: 'saleData',
              yAxis: 'account_price',
              xAxis: 'sales_emp_id', // 销售经理id
            },
            2,
          )
        } else if (
          _.isEqual(this._group_by_fields, [6]) // 一级地理
        ) {
          data = Adaptor.groupByApt(
            data,
            {
              text: '地区分布',
              field: 'saleData',
              yAxis: 'account_price',
              xAxis: 'district_code', // 店铺id
            },
            6,
          )
        } else if (
          _.isEqual(this._group_by_fields, [3]) // 二级地理
        ) {
          data = Adaptor.groupByApt(
            data,
            {
              text: '地区分布',
              field: 'saleData',
              yAxis: 'account_price',
              xAxis: 'area_id', // 店铺id
            },
            3,
          )
        } else if (this._time_range) {
          // 销售驾驶舱-销售数据-销售额
          data = Adaptor.orderAptAvg(data, 'saleData', 'account_price')
        } else if (_.isEqual(this._group_by_fields, [5])) {
          data = Adaptor.groupByApt(
            data,
            {
              text: '线路分布',
              field: 'route_id',
              yAxis: 'account_price',
              xAxis: 'route_id',
            },
            this._group_by_fields[0],
          )
        } else {
          const filter = this._filter[0] || {}
          if (
            _.isEqual(filter.query_type, 1) &&
            _.isEqual(filter.query_argument, 1)
          ) {
            data = Adaptor.orderAptAvg(data, 'orderSorting', 'old_order_id')
          } else if (
            _.isEqual(filter.query_type, 1) &&
            _.isEqual(filter.query_argument, 5)
          ) {
            data = Adaptor.orderAptAvg(data, 'orderWaitSort', 'old_order_id')
          } else {
            data = Adaptor.orderAptAvg(data, 'saleData', 'account_price')
          }
        }
        break

      /** ********************************* 下单金额 ********************************* */

      case 'station_statistics/order/order_price':
        if (
          _.isEqual(this._group_by_fields, [0]) // 工作台-今日简报/趋势-销售额,
        ) {
          data = Adaptor.groupByApt(data, {
            text: '下单金额',
            field: 'orderPrice',
            yAxis: 'order_price',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [1]) // 销售驾驶舱-销售趋势-商户销量排行-下单金额
        ) {
          data = Adaptor.groupByApt(data, {
            text: '下单金额',
            field: 'orderPrice',
            yAxis: 'order_price',
            xAxis: 'shop_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [2]) // 销售驾驶舱-销售趋势-销售经理业绩-下单金额
        ) {
          data = Adaptor.groupByApt(data, {
            text: '下单金额',
            field: 'orderPrice',
            yAxis: 'order_price',
            xAxis: 'sales_emp_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [3]) // 一级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'orderPrice',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [4]) // 二级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'orderPrice',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (this._time_range) {
          // 销售驾驶舱-销售数据-下单金额

          data = Adaptor.orderAptAvg(data, 'orderPrice', 'order_price')
        } else {
          data = Adaptor.orderAptAvg(data, 'orderPrice', 'order_price')
        }
        break

      /** ********************************* 客单价 ********************************* */

      case 'station_statistics/order/avg_customer_price':
        if (
          _.isEqual(this._group_by_fields, [0]) // 工作台-今日简报/趋势-销售额,
        ) {
          data = Adaptor.groupByApt(data, {
            text: '客单价',
            field: 'customerPrice',
            yAxis: 'order_price/shop_id',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [1]) // 销售驾驶舱-销售趋势-商户销量排行-客单价
        ) {
          data = Adaptor.groupByApt(data, {
            text: '客单价',
            field: 'customerPrice',
            yAxis: 'order_price',
            xAxis: 'shop_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [2]) // 销售驾驶舱-销售趋势-销售经理业绩-客单价
        ) {
          data = Adaptor.groupByApt(data, {
            text: '客单价',
            field: 'customerPrice',
            yAxis: 'order_price',
            xAxis: 'sales_emp_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [3]) // 一级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'customerPrice',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [4]) // 二级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'customerPrice',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (this._time_range) {
          // 销售驾驶舱-销售数据-客单价

          data = Adaptor.orderAptAvg(
            data,
            'customerPrice',
            'order_price/shop_id',
          )
        } else {
          // data = data.data.data[0].modelValues[0].kv
          data = Adaptor.formatDataForCustomerPrice(data)
        }
        break

      /** ********************************* 笔单价 ********************************* */

      case 'station_statistics/order/avg_order_price':
        if (
          _.isEqual(this._group_by_fields, [0]) // 工作台-今日简报/趋势-销售额,
        ) {
          data = Adaptor.groupByApt(data, {
            text: '笔单价',
            field: 'orderPriceAvg',
            yAxis: 'order_price/old_order_id',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [1]) // 销售驾驶舱-销售趋势-商户销量排行-笔单价
        ) {
          data = Adaptor.groupByApt(data, {
            text: '笔单价',
            field: 'orderPriceAvg',
            yAxis: 'order_price',
            xAxis: 'shop_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [2]) // 销售驾驶舱-销售趋势-销售经理业绩-笔单价
        ) {
          data = Adaptor.groupByApt(data, {
            text: '笔单价',
            field: 'orderPriceAvg',
            yAxis: 'order_price',
            xAxis: 'sales_emp_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [3]) // 一级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'orderPriceAvg',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [4]) // 二级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'orderPriceAvg',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (this._time_range) {
          // 销售驾驶舱-销售数据-笔单价

          data = Adaptor.orderAptAvg(data, 'orderPriceAvg', 'order_price')
        } else {
          data = Adaptor.orderAptAvg(
            data,
            'orderPriceAvg',
            'order_price/old_order_id',
          )
        }
        break

      /** ********************************* 下单商户数 ********************************* */

      case 'station_statistics/order/shop_id':
        if (
          _.isEqual(this._group_by_fields, [0]) // 工作台-今日简报/趋势-销售额,
        ) {
          data = Adaptor.groupByApt(data, {
            text: '下单商户数',
            field: 'shopId',
            yAxis: 'shop_id',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [1]) // 销售驾驶舱-销售趋势-商户销量排行-下单商户数
        ) {
          data = Adaptor.groupByApt(data, {
            text: '下单商户数',
            field: 'shopId',
            yAxis: 'order_price',
            xAxis: 'shop_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [2]) // 销售驾驶舱-销售趋势-销售经理业绩-下单商户数
        ) {
          data = Adaptor.groupByApt(data, {
            text: '下单商户数',
            field: 'shopId',
            yAxis: 'order_price',
            xAxis: 'sales_emp_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [3]) // 一级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'shopId',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [4]) // 二级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'shopId',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (this._time_range) {
          // 销售驾驶舱-销售数据-下单商户数

          data = Adaptor.orderAptAvg(data, 'shopId', 'shop_id')
        } else {
          data = Adaptor.orderAptAvg(data, 'shopId', 'order_price/old_order_id')
        }
        break

      /** ********************************* 销售毛利 ********************************* */

      case 'station_statistics/order/sale_profit':
        if (
          _.isEqual(this._group_by_fields, [0]) // 工作台-今日简报/趋势-销售额,
        ) {
          data = Adaptor.groupByApt(data, {
            text: '销售毛利',
            field: 'saleProfit',
            yAxis: 'account_price - (out_stock_cost - refund_cost)',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [1]) // 销售驾驶舱-销售趋势-商户销量排行-销售毛利
        ) {
          data = Adaptor.groupByApt(data, {
            text: '销售毛利',
            field: 'saleProfit',
            yAxis: 'account_price - (out_stock_cost - refund_cost)',
            xAxis: 'shop_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [2]) // 销售驾驶舱-销售趋势-销售经理业绩-销售毛利
        ) {
          data = Adaptor.groupByApt(data, {
            text: '销售毛利',
            field: 'saleProfit',
            yAxis: 'account_price - (out_stock_cost - refund_cost)',
            xAxis: 'sales_emp_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [3]) // 一级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'saleProfit',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [4]) // 二级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'saleProfit',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (this._time_range) {
          // 销售驾驶舱-销售数据-销售毛利

          data = Adaptor.orderAptAvg(
            data,
            'saleProfit',
            'account_price - (out_stock_cost - refund_cost)',
          )
        } else {
          if (this.params.rate) {
            data = Adaptor.orderAptAvg(
              data,
              'saleProfitRate',
              '(account_price - (out_stock_cost - refund_cost)) / account_price * 100',
            )
          } else {
            data = Adaptor.orderAptAvg(
              data,
              'saleProfit',
              'account_price - (out_stock_cost - refund_cost)',
            )
          }
        }
        break

      /** ********************************* 售后订单数 ********************************* */

      case 'station_statistics/order/has_after_sale':
        if (
          _.isEqual(this._group_by_fields, [0]) // 工作台-今日简报/趋势-销售额,
        ) {
          data = Adaptor.groupByApt(data, {
            text: '售后订单数',
            field: 'afterSaleOrder',
            yAxis: 'has_after_sale',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [1]) // 销售驾驶舱-销售趋势-商户销量排行-售后订单数
        ) {
          data = Adaptor.groupByApt(data, {
            text: '售后订单数',
            field: 'afterSaleOrder',
            yAxis: 'account_price - (out_stock_cost - refund_cost)',
            xAxis: 'shop_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [2]) // 销售驾驶舱-销售趋势-销售经理业绩-售后订单数
        ) {
          data = Adaptor.groupByApt(data, {
            text: '售后订单数',
            field: 'afterSaleOrder',
            yAxis: 'account_price - (out_stock_cost - refund_cost)',
            xAxis: 'sales_emp_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [3]) // 一级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'afterSaleOrder',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [4]) // 二级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'afterSaleOrder',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (this._time_range) {
          // 销售驾驶舱-销售数据-售后订单数

          data = Adaptor.orderAptAvg(
            data,
            'afterSaleOrder',
            'account_price - (out_stock_cost - refund_cost)',
          )
        } else {
          // debugger
          data = Adaptor.orderAptAvg(data, 'afterSaleOrder', 'has_after_sale')
        }
        break

      /** ********************************* 售后金额 ********************************* */

      case 'station_statistics/order/after_sale_money':
        if (
          _.isEqual(this._group_by_fields, [0]) // 工作台-今日简报/趋势-销售额,
        ) {
          data = Adaptor.groupByApt(data, {
            text: '售后金额',
            field: 'afterSaleMoney',
            yAxis: 'abnormal_price - should_refund_money',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [1]) // 销售驾驶舱-销售趋势-商户销量排行-售后金额
        ) {
          data = Adaptor.groupByApt(data, {
            text: '售后金额',
            field: 'afterSaleMoney',
            yAxis: 'account_price - (out_stock_cost - refund_cost)',
            xAxis: 'shop_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [2]) // 销售驾驶舱-销售趋势-销售经理业绩-售后金额
        ) {
          data = Adaptor.groupByApt(data, {
            text: '售后金额',
            field: 'afterSaleMoney',
            yAxis: 'account_price - (out_stock_cost - refund_cost)',
            xAxis: 'sales_emp_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [3]) // 一级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'afterSaleMoney',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [4]) // 二级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'afterSaleMoney',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (this._time_range) {
          // 销售驾驶舱-销售数据-售后金额

          data = Adaptor.orderAptAvg(
            data,
            'afterSaleMoney',
            'account_price - (out_stock_cost - refund_cost)',
          )
        } else {
          data = Adaptor.orderAptAvg(data, 'afterSaleMoney', 'has_after_sale')
        }
        break

      /** ********************************* 应收账款 ********************************* */

      case 'station_statistics/order/margin':
        if (
          _.isEqual(this._group_by_fields, [0]) // 工作台-今日简报/趋势-销售额,
        ) {
          data = Adaptor.groupByApt(data, {
            text: '应收账款',
            field: 'orderMargin',
            yAxis: 'account_price - actual_amount',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [1]) // 销售驾驶舱-销售趋势-商户销量排行-应收账款
        ) {
          data = Adaptor.groupByApt(data, {
            text: '应收账款',
            field: 'orderMargin',
            yAxis: 'account_price - (out_stock_cost - refund_cost)',
            xAxis: 'shop_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [2]) // 销售驾驶舱-销售趋势-销售经理业绩-应收账款
        ) {
          data = Adaptor.groupByApt(data, {
            text: '应收账款',
            field: 'orderMargin',
            yAxis: 'account_price - (out_stock_cost - refund_cost)',
            xAxis: 'sales_emp_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [3]) // 一级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'orderMargin',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [4]) // 二级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'orderMargin',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (this._time_range) {
          // 销售驾驶舱-销售数据-应收账款

          data = Adaptor.orderAptAvg(
            data,
            'orderMargin',
            'account_price - (out_stock_cost - refund_cost)',
          )
        } else {
          data = Adaptor.orderAptAvg(data, 'orderMargin', 'has_after_sale')
        }
        break

      /** ********************************* 客户复购率 ********************************* */

      case 'station_statistics/order/repeat_customers':
        if (
          _.isEqual(this._group_by_fields, [0]) // 工作台-今日简报/趋势-销售额,
        ) {
          data = Adaptor.groupByApt(data, {
            text: '客户复购率',
            field: 'repeatCustomers',
            yAxis: 'sum_account_price - sum_actual_amount',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [1]) // 销售驾驶舱-销售趋势-商户销量排行-客户复购率
        ) {
          data = Adaptor.formatDataForRepeatCustomers(data)
        } else if (
          _.isEqual(this._group_by_fields, [2]) // 销售驾驶舱-销售趋势-销售经理业绩-客户复购率
        ) {
          data = Adaptor.groupByApt(data, {
            text: '客户复购率',
            field: 'repeatCustomers',
            yAxis: 'account_price - (out_stock_cost - refund_cost)',
            xAxis: 'sales_emp_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [3]) // 一级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'repeatCustomers',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [4]) // 二级地理
        ) {
          data = Adaptor.groupByApt(data, {
            text: '地区分布',
            field: 'repeatCustomers',
            yAxis: 'value',
            xAxis: 'area_id', // 店铺id
          })
        } else if (this._time_range) {
          // 销售驾驶舱-销售数据-客户复购率

          data = Adaptor.orderAptAvg(
            data,
            'repeatCustomers',
            'account_price - (out_stock_cost - refund_cost)',
          )
        } else {
          data = Adaptor.orderAptAvg(data, 'repeatCustomers', 'has_after_sale')
        }
        break

      /** ********************************* 商品 - 销售额 ********************************* */

      case 'station_statistics/order_detail/account_price':
        if (_.isEqual(this._group_by_fields, [0])) {
          data = Adaptor.groupByApt(data, {
            text: '商品销售额趋势',
            field: 'saleDataTrend',
            yAxis: 'account_price',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [1]) ||
          _.isEqual(this._group_by_fields, [2])
        ) {
          // 热销分类

          const xAxis = _.isEqual(this._group_by_fields, [1])
            ? 'category_id_1'
            : 'category_id_2'

          data = Adaptor.groupByApt(
            data,
            {
              text: '热销分类',
              field: 'hotCategory',
              yAxis: 'account_price',
              xAxis,
            },
            this._group_by_fields[0],
          )
        } else if (
          _.isEqual(this._group_by_fields, [3]) //
        ) {
          data = Adaptor.groupByApt(data, {
            text: '商品销售排行',
            field: 'goodsRankSale',
            yAxis: 'account_price',
            xAxis: 'sku_id', // 店铺id
          })
        } else if (
          _.isEqual(this._group_by_fields, [4]) //
        ) {
          data = Adaptor.groupByApt(data, {
            text: '购买商户排行',
            field: 'shopRank',
            yAxis: 'account_price',
            xAxis: 'shop_id', // 店铺id
          })
        } else if (this._time_range) {
          // 销售驾驶舱-销售数据-客户复购率

          data = Adaptor.orderAptAvg(
            data,
            'repeatCustomers',
            'account_price - (out_stock_cost - refund_cost)',
          )
        } else {
          data = Adaptor.orderAptAvg(data, 'saleData', 'account_price')
        }
        break

      /** ********************************* 商品 - 毛利 ********************************* */

      case 'station_statistics/order_detail/sale_profit':
        if (this?.params.rate) {
          // 销售毛利 = 销售额 - (出库成本 - 退货成本)
          // 销售毛利润 = 销售毛利 / 销售额
          data = Adaptor.orderAptAvg(
            data,
            'saleProfitRate',
            '(account_price - (out_stock_cost - refund_cost)) / account_price * 100',
          )
        } else {
          // 销售毛利 = 销售额 - (出库成本 - 退货成本)
          // 销售毛利润 = 销售毛利 / 销售额
          data = Adaptor.orderAptAvg(
            data,
            'saleProfit',
            'account_price - (out_stock_cost - refund_cost)',
          )
        }
        break
      /** ********************************* 商品 - 销售商品总数 ********************************* */

      case 'station_statistics/order_detail/sku':
        data = Adaptor.groupByApt(data, {
          text: '商品销售额排行',
          field: 'orderTimes',
          yAxis: 'account_price',
          xAxis: 'sku_name', // 商品名称
        })
        break

      /** ********************************* 商品 - 下单频次 ********************************* */

      case 'station_statistics/order_detail/order':
        if (
          _.isEqual(this._group_by_fields, [3]) //
        ) {
          data = Adaptor.groupByApt(data, {
            text: '商品销售排行下单频次',
            field: 'orderTimes',
            yAxis: 'order_id',
            xAxis: 'sku_id', // 店铺id
          })
        } else {
          data = Adaptor.orderAptAvg(data, 'orderTimes', 'old_order_id')
        }
        break

      /** ********************************* 商品 - 售后数 ********************************* */

      case 'station_statistics/order_detail/after_sale_times':
        if (
          _.isEqual(this._group_by_fields, [0]) // 工作台-今日简报/趋势-销售额,
        ) {
          data = Adaptor.groupByApt(data, {
            text: '售后商品数',
            field: 'afterSaleGoods',
            yAxis: 'sku_id',
            xAxis: this._time_field,
          })
        } else if (
          _.isEqual(this._group_by_fields, [3]) //
        ) {
          data = Adaptor.groupByApt(data, {
            text: '售后商品排行',
            field: 'goodsAfterSale',
            yAxis: 'after_sale_times',
            xAxis: 'sku_id', // 店铺id
          })
        } else {
          data = Adaptor.orderAptAvg(data, 'afterSaleGoods', 'sku_id')
        }
        break

      /** ********************************* 商品 - 销售均价 ********************************* */

      case 'station_statistics/order_detail/order_info':
        // eslint-disable-next-line no-case-declarations
        const config = {
          salePrice: 'order_price',
          saleQuantity: 'quantity',
          saleAvg: 'order_price/quantity',
        }
        if (_.isEqual(this._group_by_fields, [0])) {
          data = Adaptor.groupByApt(data, {
            text: '价格信息',
            field: 'orderInfo',
            yAxis: config[this.params.field || 'salePrice'],
            xAxis: this._time_field, // 店铺id
          })
        } else {
          data = Adaptor.orderAptAvg(
            data,
            [this.params.field || 'salePrice'],
            config[this.params.field || 'salePrice'],
          )
        }
        break

      /** ********************************* 明细表 ********************************* */

      case 'station_statistics/order/customers_analysis':
      case 'station_statistics/order/single_customer_analysis':
      case 'station_statistics/order_detail/products_analysis':
      case 'station_statistics/order_detail/single_product_analysis':
      case 'station_statistics/order_detail/pinlei_products_analysis':
      case 'station_statistics/order/summary_analysis':
        // 需要一个pagination
        data = Adaptor.tableApt(data, (model_values) => {
          const item = model_values.kv
          // 销售毛利 = 销售额 - (出库成本 - 退货成本)
          // 销售毛利润 = 销售毛利 / 销售额
          const saleProfit = Big(
            Number(
              item.account_price - (item.out_stock_cost - item.refund_cost),
            ),
          ).toFixed(2)
          const saleProfitRate = Number(item.account_price)
            ? Big(saleProfit)
                .div(Number(item.account_price) || 1)
                .times(100)
                .toFixed(2)
            : 0

          return {
            // 销售毛利
            saleProfit,
            // 销售毛利率
            saleProfitRate,
          }
        })

        break

      /** ********************************* 新增商户数 ********************************* */

      case 'station_statistics/new_address':
        if (_.isEqual(this._group_by_fields, [0])) {
          data = Adaptor.groupByApt(data, {
            text: '新增商户数',
            field: 'addShopCount',
            yAxis: 'restaurant_salemenu',
            xAxis: 'date',
          })
        } else {
          data = Adaptor.orderAptAvg(data, 'newAddress', 'restaurant_salemenu')
        }

        break
      // 新增充值商户数
      case 'station_statistics/charge_user':
        if (_.isEqual(this._group_by_fields, [0])) {
          data = Adaptor.groupByApt(data, {
            text: '新增充值商户数',
            field: 'addShopRechargeShop',
            yAxis: 'uid',
            xAxis: 'date',
          })
        }
        break
      // 余额充值
      case 'station_statistics/charge':
        if (_.isEqual(this._group_by_fields, [0])) {
          data = Adaptor.groupByApt(data, {
            text: '余额充值',
            field: 'remainingSumRecharge',
            yAxis: 'balance',
            xAxis: 'date',
          })
        }
        break

      // 短信发送条数
      case 'station_statistics/sms_record':
        if (_.isEqual(this._group_by_fields, [0])) {
          data = Adaptor.groupByApt(data, {
            text: '短信发送数',
            field: 'messageSendCount',
            yAxis: 'old_order_id',
            xAxis: this._time_field,
          })
        }
        break
      case 'station_statistics/order':
        if (_.isEqual(this._group_by_fields, [0])) {
        } else {
          data = data?.data?.data[0]?.modelValues
            ? Adaptor.formatAllData(data?.data?.data[0]?.modelValues[0].kv)
            : []
        }

        break

      case 'station_statistics/order_detail':
        break
      // 获取总商户数
      case 'station_statistics/address_count':
        data = data?.data?.data[0]?.modelValues[0]?.kv || {}
        break
      default:
        break
    }
    return Promise.resolve(data)
  }
}

export default DataCenter
