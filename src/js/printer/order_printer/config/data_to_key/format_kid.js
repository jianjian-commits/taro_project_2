import _ from 'lodash'
import Big from 'big.js'
import { coverDigit2Uppercase, price } from './util'
import { getChangeRate } from 'common/filter'
import moment from 'moment'

// 非表格数据
function generateCommon(data) {
  return {
    账户名: data.username,
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    下单金额: price(data.total_price),
    出库金额: price(data.real_price),
    运费: price(data.freight),
    异常金额: price(Big(data.abnormal_money).plus(data.refund_money)),
    销售额_含运税: price(data.total_pay),
    原销售额: price(data.before_change_total_pay),
  }
}

// 普通订单数据
function generateOrderData(list) {
  return _.map(list, (v, index) => {
    return {
      序号: index + 1,
      商品ID: v.id,
      商品名: v.name,
      类别: v.category_title_1,
      规格:
        v.std_unit_name_forsale === v.sale_unit_name && v.sale_ratio === 1
          ? `按${v.sale_unit_name}`
          : `${v.sale_ratio}${v.std_unit_name_forsale}/${v.sale_unit_name}`,
      基本单位: v.std_unit_name_forsale,
      销售单位: v.sale_unit_name,

      /* ----下面4个[数量]字段: 如果是0,那么显示为空 --- */
      下单数: v.quantity || '',
      出库数_基本单位: v.real_weight || '',
      出库金额: price(v.real_item_price),
      变化率: getChangeRate(
        v.before_change_price_forsale,
        v.sale_price,
        v.yx_price,
        v.rule_object_type,
      ),
      __details: v.merchandise.map((o) => {
        return {
          收货商户: o.resname || '-',
          商户_出库数_基本单位: o.sid_real_weight || '-',
          商户_基本单位: o.sid_std_unit_name_forsale || '-',
        }
      }),
      _origin: v,
    }
  })
}

function formarKid(data) {
  // 商品列表
  const skuList = data.details
  /* ----------- 普通  ------------ */
  const kOrders = generateOrderData(skuList, data)
  // 按一级分类分组
  const groupByCategory1 = _.groupBy(kOrders, (v) => v._origin.category_title_1)

  /* -------- 分类 ------- */
  let kCategory = []
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
  })

  return {
    common: {
      ...generateCommon(data),
    },
    _counter: kCounter, // 分类商品统计
    _table: {
      orders_category: kCategory, // 分类
    },
    _origin: data,
  }
}

export default formarKid
