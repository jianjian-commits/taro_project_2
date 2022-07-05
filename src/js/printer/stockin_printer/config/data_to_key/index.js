import _ from 'lodash'
import Big from 'big.js'
import { MULTI_SUFFIX } from 'gm-printer'
import moment from 'moment'
import { i18next } from 'gm-i18n'
import { coverDigit2Uppercase } from '../../../../common/filter'

const typeEnum = {
  normal: 'normal',
  multi: 'multi',
  multi_quantity: 'multi_quantity',
  multi_money: 'multi_money',
  multi_quantity_money: 'multi_quantity_money',
  multi_vertical: 'multi_vertical',
  multi_vertical_quantity: 'multi_vertical_quantity',
  multi_vertical_money: 'multi_vertical_money',
  multi_vertical_quantity_money: 'multi_vertical_quantity_money',
  quantity: 'quantity',
  money: 'money',
  quantity_money: 'quantity_money',
}

// 非表格数据
function generateCommon(data) {
  return {
    往来单位: data.supplier_name,
    单据日期: data.submit_time_new,
    单据日期_日期: data.submit_time,
    单据日期_时间: data.submit_time_new?.slice(11),
    单据编号: data.id,
    单据备注: data.remark,
    打单人: data.print_operator,
    建单人: data.creator,
    打印时间: moment(data.print_time).format('YYYY-MM-DD HH:mm:ss'),
    打印时间_时间: moment(data.print_time).format('HH:mm:ss'),
    打印时间_日期: moment(data.print_time).format('YYYY-MM-DD'),
    折让金额: data.delta_money || 0,
    商品金额: data.sku_money || 0,
    整单金额: Big(data.delta_money || 0)
      .plus(data.sku_money || 0)
      .toFixed(2),
  }
}

/**
 * 生成双栏商品展示数据
 * @param list
 * @param categoryTotal
 * @return {Array}
 */
function generateMultiData(list) {
  const multiList = [] // 假设skuGroup=[{a:1},{a:2},{a:3},{a:4}],转化为[{a:1,a#2:3},{a:2,a#2:4}]
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

  return multiList
}

function generateMultiData2(list) {
  const multiList = [] // 假设skuGroup = [{a:1},{a:2},{a:3},{a:4}],转化为[{a:1,a#2:3},{a:2,a#2:4}]
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

  return multiList
}

function getNormal(data) {
  return _.map(data.details, (item, index) => {
    const purchase_unit_quantity = Big(item.quantity || 0).div(item.ratio)
    return {
      批次号: index + 1,
      规格ID: item.id,
      商品名称: item.name,
      商品分类: item.category,
      一级分类: item.category_name_1,
      入库单位_基本单位: item.std_unit,
      入库单位_包装单位: item.purchase_unit,
      入库数_基本单位: item.quantity,
      入库单价_基本单位:
        item.unit_price !== null ? Big(item.unit_price).toFixed(2) : '',
      入库金额: item.money !== null ? Big(item.money).toFixed(2) : '',
      商品备注: item.remark,
      商品ID: item.spu_id,
      最高入库单价:
        item.max_stock_unit_price !== null
          ? Big(item.max_stock_unit_price).toFixed(2)
          : '',
      入库数_包装单位: purchase_unit_quantity.toFixed(2),
      入库单价_包装单位:
        +purchase_unit_quantity.toFixed() === 0
          ? ''
          : Big(item.money || 0)
              .div(purchase_unit_quantity)
              .toFixed(2),
      入库金额_不含税: _.isNil(item.instock_money_no_tax)
        ? '-'
        : item.instock_money_no_tax,
      进项税率: _.isNil(item.tax_rate)
        ? '-'
        : `${Big(item.tax_rate).div(100).toFixed(2)}%`,
      进项税额: _.isNil(item.tax_money) ? '-' : item.tax_money,
      操作人: item.operator,
      存放货位: item.shelf_name,
      保质期: item.life_time,
      生产日期: item.production_time,
      补差金额:
        item.different_price !== null
          ? Big(item.different_price).toFixed(2)
          : '',
      采购描述: item.description,
      _origin: item,
    }
  })
}

function getCategory(data) {
  const groupByCategory = _.groupBy(data, (v) => v._origin.category)
  let kCategory = []
  let kOrdersMulti = []
  let kOrdersMultiVertical = []
  _.forEach(groupByCategory, (value, key) => {
    // 分类小计
    const list = [...value]
    // 分类金额统计
    const categoryTotal = [
      {
        _special: {
          text:
            key +
            '：' +
            list
              .reduce(
                (preValue, currentValue) =>
                  Big(parseFloat(currentValue['入库金额'], 0)).add(preValue),
                0,
              )
              .toFixed(2),
        },
        __details: [],
      },
    ]
    kOrdersMulti = kOrdersMulti.concat(generateMultiData([...value]))
    kOrdersMultiVertical = kOrdersMultiVertical.concat(
      generateMultiData2([...value]),
    )
    /* -------- 分类  ------------- */
    kCategory = kCategory.concat(list, categoryTotal)
    kOrdersMulti = kOrdersMulti.concat(categoryTotal)
    kOrdersMultiVertical = kOrdersMultiVertical.concat(categoryTotal)
  })
  return [kCategory, kOrdersMulti, kOrdersMultiVertical]
}

const getTableData = (data, type, isCategory = false) => {
  let ordinary, kOrdersMulti, kOrdersMultiVertical
  const normal = getNormal(data)
  if (isCategory) {
    const [_ordinary, _kOrdersMulti, _kOrdersMultiVertical] = getCategory(
      normal,
    )
    ordinary = _ordinary
    kOrdersMulti = _kOrdersMulti
    kOrdersMultiVertical = _kOrdersMultiVertical
  } else {
    ordinary = normal
    kOrdersMulti = generateMultiData(ordinary)
    kOrdersMultiVertical = generateMultiData2(ordinary)
  }
  const sumMoney = Big(
    _.reduce(data.details, (a, b) => a + parseFloat(b.money), 0),
  ).toFixed(2)
  const sumQuantity = Big(
    _.reduce(data.details, (a, b) => a + b.quantity, 0),
  ).toFixed(2)
  const skuTotalObj = {
    _special: {
      text: `${i18next.t('入库数小计')}：${sumQuantity}`,
    },
  }
  const sumMoneyObj = {
    _special: {
      text: `${i18next.t('入库金额小计')}：${sumMoney}`,
      upperCaseText: `${i18next.t('入库金额小计')}：${sumMoney}${i18next.t(
        '大写',
      )}:${coverDigit2Uppercase(sumMoney)}`,
    },
  }
  switch (type) {
    case typeEnum.normal:
      return ordinary
    case typeEnum.multi:
      return kOrdersMulti
    case typeEnum.multi_quantity:
      kOrdersMulti.push({
        ...sumMoneyObj,
      })
      return kOrdersMulti
    case typeEnum.multi_money:
      kOrdersMulti.push({
        ...skuTotalObj,
      })
      return kOrdersMulti
    case typeEnum.multi_quantity_money:
      kOrdersMulti.push(
        {
          ...skuTotalObj,
        },
        {
          ...sumMoneyObj,
        },
      )
      return kOrdersMulti
    case typeEnum.multi_vertical:
      return kOrdersMultiVertical
    case typeEnum.multi_vertical_quantity:
      kOrdersMultiVertical.push({
        ...sumMoneyObj,
      })
      return kOrdersMultiVertical
    case typeEnum.multi_vertical_money:
      kOrdersMultiVertical.push({
        ...skuTotalObj,
      })
      return kOrdersMultiVertical
    case typeEnum.multi_vertical_quantity_money:
      kOrdersMultiVertical.push(
        {
          ...skuTotalObj,
        },
        {
          ...sumMoneyObj,
        },
      )
      return kOrdersMultiVertical
    case typeEnum.quantity:
      ordinary.push({
        ...skuTotalObj,
      })
      return ordinary
    case typeEnum.money:
      ordinary.push({
        ...sumMoneyObj,
      })
      return ordinary
    case typeEnum.quantity_money:
      ordinary.push(
        {
          ...skuTotalObj,
        },
        {
          ...sumMoneyObj,
        },
      )
      return ordinary
  }
}

const generateUpperPrice = (data) => {
  return {
    折让金额_大写: coverDigit2Uppercase(data.delta_money || 0),
    商品金额_大写: coverDigit2Uppercase(data.sku_money || 0),
    整单金额_大写: coverDigit2Uppercase(
      Big(data.delta_money || 0)
        .plus(data.sku_money || 0)
        .toFixed(2),
    ),
  }
}

const formatData = (data) => {
  return {
    common: {
      ...generateCommon(data),
      ...generateUpperPrice(data),
    },
    _table: {
      orders: getTableData(data, 'normal'), // 普通
      category_orders: getTableData(data, 'normal', true),
      orders_multi: getTableData(data, 'multi'), // 双栏
      category_orders_multi: getTableData(data, 'multi', true),
      orders_multi_quantity: getTableData(data, 'multi_quantity'), // 双栏 + 入库数
      category_orders_multi_quantity: getTableData(
        data,
        'multi_quantity',
        true,
      ), // 双栏 + 入库数
      orders_multi_money: getTableData(data, 'multi_money'), // 双栏 + 入库金额
      category_orders_multi_money: getTableData(data, 'multi_money', true), // 双栏 + 入库金额
      orders_multi_quantity_money: getTableData(data, 'multi_quantity_money'), // 双栏 + 入库金额 + 入库数
      category_orders_multi_quantity_money: getTableData(
        data,
        'multi_quantity_money',
        true,
      ), // 双栏 + 入库金额 + 入库数
      orders_multi_vertical: getTableData(data, 'multi_vertical'), // 双栏（纵向）
      category_orders_multi_vertical: getTableData(
        data,
        'multi_vertical',
        true,
      ), // 双栏（纵向）
      orders_multi_quantity_vertical: getTableData(
        data,
        'multi_vertical_quantity',
      ), // 双栏（纵向） + 入库数
      category_orders_multi_quantity_vertical: getTableData(
        data,
        'multi_vertical_quantity',
        true,
      ), // 双栏（纵向） + 入库数
      orders_multi_money_vertical: getTableData(data, 'multi_vertical_money'), // 双栏（纵向） + 入库金额
      category_orders_multi_money_vertical: getTableData(
        data,
        'multi_vertical_money',
        true,
      ), // 双栏（纵向） + 入库金额
      orders_multi_quantity_money_vertical: getTableData(
        data,
        'multi_vertical_quantity_money',
      ), // 双栏（纵向） + 入库金额 + 入库数
      category_orders_multi_quantity_money_vertical: getTableData(
        data,
        'multi_vertical_quantity_money',
        true,
      ), // 双栏（纵向） + 入库金额 + 入库数
      orders_quantity: getTableData(data, 'quantity'),
      category_orders_quantity: getTableData(data, 'quantity', true),
      orders_money: getTableData(data, 'money'),
      category_orders_money: getTableData(data, 'money', true),
      orders_quantity_money: getTableData(data, 'quantity_money'),
      category_orders_quantity_money: getTableData(
        data,
        'quantity_money',
        true,
      ),
    },
    _origin: data,
  }
}

export default formatData
