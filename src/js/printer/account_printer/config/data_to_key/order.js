import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { MULTI_SUFFIX } from 'gm-printer'
import { coverDigit2Uppercase, price } from './util'

const SETTLE_WAY = {
  1: '先货后款',
  2: '先款后货',
}

const PAY_METHOD = {
  1: '日结',
  2: '周结',
  3: '月结',
  4: '自定义结算',
}

/**
 * 生成双栏商品展示数据
 * @param list
 * @param categoryTotal
 * @return {Array}
 */
function generateMultiData(list, categoryTotal) {
  const multiList = []
  // 假设skuGroup = [{a: 1}, {a:2}, {a: 3}, {a: 4}], 转化为 [{a:1, a#2:3}, {a:2, a#2: 4}]
  const skuGroup = list

  let index = 0
  const len = skuGroup.length

  while (index < len) {
    const sku1 = skuGroup[index]
    const sku2 = {}
    _.each(skuGroup[1 + index], (val, key) => {
      sku2[key + MULTI_SUFFIX] = val
    })

    multiList.push({
      ...sku1,
      ...sku2,
    })

    index += 2
  }

  if (categoryTotal) {
    multiList.push(categoryTotal)
  }

  return multiList
}

function generateMultiData2(list, categoryTotal) {
  const multiList = []
  // 假设skuGroup = [{a: 1}, {a:2}, {a: 3}, {a: 4}], 转化为 [{a:1, a#2:3}, {a:2, a#2: 4}]
  const skuGroup = list

  let index = 0
  const len = skuGroup.length
  const middle = Math.ceil(len / 2)

  while (index < middle) {
    const sku1 = skuGroup[index]
    const sku2 = {}
    _.each(skuGroup[middle + index], (val, key) => {
      sku2[key + MULTI_SUFFIX] = val
    })

    multiList.push({
      ...sku1,
      ...sku2,
    })

    index += 1
  }

  if (categoryTotal) {
    multiList.push(categoryTotal)
  }

  return multiList
}

// 非表格数据
function generateCommon(data) {
  return {
    账户名: data.user_name,
    手机号: data.telephone,
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    当前时间_日期: moment().format('YYYY-MM-DD'),
    当前时间_时间: moment().format('HH:mm:ss'),
    当前时间_无年份: moment().format('MM-DD HH:mm:ss'),
    当前时间_日期_无年份: moment().format('MM-DD'),
    结款人: data.payment_name,
    结款电话: data.payment_telephone,
    结算方式: SETTLE_WAY[data.settle_way],
    结款周期: PAY_METHOD[data.pay_method.pay_method] || '',
    授信额度: price(data.credit_limit),

    下单金额: price(data.total_price),
    出库金额: price(data.real_price),
    运费: price(data.freight),
    异常金额: price(data.abnormal_money),
    销售额_含运税: price(data.total_pay),
    优惠金额: price(data.coupon_amount),
  }
}

// 大写金额数据
function generateUpperPrice(data) {
  return {
    下单金额_大写: coverDigit2Uppercase(data.total_kid_price),
    出库金额_大写: coverDigit2Uppercase(data.real_kid_price),
    运费_大写: coverDigit2Uppercase(data.freight),
    异常金额_大写: coverDigit2Uppercase(data.abnormal_money),
    销售额_含运税_大写: coverDigit2Uppercase(data.total_pay),
  }
}

// 普通订单数据
function generateOrderData(list, data) {
  let index = 1
  return _.map(list, (v) => {
    return {
      序号: index++,
      商品名: v.name,
      商户名: v?.sid_name,
      类别: v.category_title_1,
      规格:
        v.std_unit_name === v.sale_unit_name && v.sale_ratio === 1
          ? `按${v.sale_unit_name}`
          : `${v.sale_ratio}${v.std_unit_name}/${v.sale_unit_name}`,

      // 数量
      下单数: v.quantity,
      出库数_基本单位: v.sku_std_outstock_quantity,
      出库数_销售单位: v.sku_std_outstock_quantity_forsale,

      // 金额
      单价_基本单位: v.sku_std_outstock_price,
      单价_销售单位: v.sku_std_outstock_price_forsale,
      出库金额: v.real_item_price,
      销售单位: v.sale_unit_name,
      基本单位: v.std_unit_name,

      明细: v.address_detail.reduce((all, sku) => {
        return all + `${sku.address_name}*${sku.quantity}<br/>`
      }, ''),
      _origin: v,
    }
  })
}

/**
 * 处理订单数据
 * @param data
 * @returns {{_table: {orders_category: [], reward: *, orders_category_multi: [], abnormal: ([]|[]|*), orders_category_multi_vertical: [], orders: *, orders_multi_vertical: [], orders_multi: Array}, common: {结款周期, 自提点联系方式: *, 下单时间_无年份: string, 销售额_含运税_大写: string|*, 下单时间_日期_无年份: string, 收货时间_日期_无年份: string, 当前时间: string, 收货时间: string, 当前时间_日期: string, 商品税额_大写: string|*, 原总金额: string, 收货时间_时间: string, 配送时间_日期_无年份: string, 销售经理电话, barcode: *, 线路, 收货地址: *, 收货时间_无年份: string, 配送时间: string, 收货人: *, 城区, 打印人: *, 满载框数, 优惠金额_大写: string|*, 收货人电话: *, 当前时间_日期_无年份: string, 当前时间_无年份: string, 订单溯源码, 当前时间_时间: string, 承运商: *, 下单时间_时间: string, 司机电话, 商户ID: string, 运费_大写: string|*, 收货时间_日期: string, 收货商户: *, 出库金额: string, 授信额度: string, 税额: string, 配送时间_日期: string, 下单员: *, 账户名: *, 商户公司: *, 自提点负责人: *, 结款方式: *, qrcode: string, 优惠金额: string, 异常金额: string, 收货方式: *, 商户自定义编码: *, 订单备注: *, 配送时间_无年份: string, 街道, 销售经理, 箱数: *, 原总金额_大写: string|*, 下单时间_日期: string, 下单金额: string, 下单时间: string, 自提点名称: *, 支付状态: *, 订单类型: string, 销售额_含运税: string, 下单金额_大写: string|*, 分拣序号: string, 配送时间_时间: string, 出库总数_销售单位: number, 异常金额_大写: string|*, 订单号: *, 车型, 下单总数_销售单位: number, 车牌号码, 运费: string, 出库金额_大写: string|*, 司机名称, 城市, 下单账号: *}, _origin: *, _counter: []}}
 */
function order(data) {
  // 商品列表
  const skuList = data.detail
  /* ----------- 普通  ------------ */
  const kOrders = generateOrderData(skuList, data)
  /* ----------- 双栏 -------------- */
  const kOrdersMulti = generateMultiData(kOrders)
  /* ----------- 双栏 (纵向)-------------- */
  const kOrdersMultiVertical = generateMultiData2(kOrders)

  // 按一级分类分组
  const groupByCategory1 = _.groupBy(kOrders, (v) => v._origin.category_title_1)

  /* -------- 分类 和 双栏 + 分类 ------- */
  let kCategory = []
  let kCategoryMulti = []
  let kCategoryMultiVertical = []
  const kCounter = [] // 分类汇总

  let index = 1
  _.forEach(groupByCategory1, (value, key) => {
    // 分类小计
    let subtotal = Big(0)
    const list = _.map(value, (sku) => {
      subtotal = subtotal.plus(sku._origin.real_item_price)
      return {
        ...sku,
        序号: index++,
      }
    })
    subtotal = subtotal.toFixed(2)
    const categoryTotal = {
      _special: {
        text: `${key}小计：${subtotal}`,
        upperCaseText: `${key}小计：${subtotal}&nbsp;&nbsp;&nbsp;大写：${coverDigit2Uppercase(
          subtotal,
        )}`,
      },
    }

    // 商品分类汇总数组
    kCounter.push({ text: key, len: value.length, subtotal })

    /* -------- 分类  ------------- */
    kCategory = kCategory.concat(list, categoryTotal)
    /* -------- 双栏 + 分类 ------- */
    kCategoryMulti = kCategoryMulti.concat(
      generateMultiData(list, categoryTotal),
    )
    /* -------- 双栏 + 分类（纵向） ------- */
    kCategoryMultiVertical = kCategoryMultiVertical.concat(
      generateMultiData2(list, categoryTotal),
    )
  })

  // const totalOrgItemPrice = getOrgItemPrice(skuList)
  return {
    common: {
      ...generateCommon(data),
      // ...generateSummary(skuList),
      ...generateUpperPrice(data),
      // 原总金额: price(totalOrgItemPrice),
    },
    _counter: kCounter, // 分类商品统计
    _table: {
      orders: kOrders, // 普通
      orders_multi: kOrdersMulti, // 双栏
      orders_multi_vertical: kOrdersMultiVertical, // 双栏（纵向）
    },
    _origin: data,
  }
}

export default order
