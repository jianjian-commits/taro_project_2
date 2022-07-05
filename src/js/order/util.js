import { i18next } from 'gm-i18n'
import React from 'react'
import { Tip, Storage, Dialog } from '@gmfe/react'
import moment from 'moment'
import classnames from 'classnames'
import { isPrice, replaceWithToJSX, convertDay2Bit } from '../common/util'
import { searchDateTypes } from '../common/enum'
import _ from 'lodash'
import Big from 'big.js'
import { is } from '@gm-common/tool'
import globalStore from 'stores/global'
import CopyOrderTip, {
  getCopyOrderSyncGoodsPrice,
  isCopyOrderSyncGoodsPrice,
  setCopyOrderSyncGoodsPrice,
} from './components/copy_order_tip'

const today = moment()

const debounce = _.debounce((func) => {
  return func()
}, 300)

const keepTwoDigitPrecision = (num) => parseFloat(Big(+num || 0).toFixed(2))

/** 组合商品 */

// 相同非组合商品原料
const findSameSku = (targets, source) => {
  const sourceMap = {}
  _.each(source, (sku) => {
    if (sku.id && !sku.belongWith) {
      sourceMap[sku.id] = { ...sku }
    }
  })
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    if (sourceMap[target.id] && !target.is_combine_goods) return target
  }
  return null
}

const getSkusLength = (skus) => {
  // 多sku中相同商品也分开统计
  const { orderCanHaveDuplicateSku } = globalStore.orderInfo
  const skuData = _.map(
    _.filter(skus, (sku) => sku.id !== null && !sku.isCombineGoodsTop),
    (sku) => sku.id,
  )
  if (orderCanHaveDuplicateSku) {
    return skuData.length
  } else {
    return new Set(skuData).size
  }
}

const deleteConfirmText = (list, sku) => {
  let text = ''
  if (sku.isCombineGoodsTop) {
    text = `将一并移除订单中[${sku.name}]下的所有组合商品，确认移除？`
  } else {
    const target = _.find(list, (s) => s.id === sku.belongWith)
    const name = target ? target.name : ''
    text = `移除单条组成商品，不会移除其他组成商品但会解散订单中的组合商品[${name}]，如需请再次添加，继续移除？`
  }
  return text
}

const deleteConfirm = (list, sku) => {
  // 仅处理组合商品
  const text = deleteConfirmText(list, sku)

  return Dialog.confirm({
    title: i18next.t('警告'),
    children: text,
  })
}

// 同步商品备注, 自定义字段
const asyncSpuRemarkAndCustomize = (params, details) => {
  if (params.key !== 'spu_remark' && params.key !== 'detail_customized_field')
    return
  _.each(details, (v, i) => {
    if (v.id === params.id && i !== params.index) {
      v[params.key] = params.value
    }
  })
}

const asyncCustomizedFieldInCombineGoods = (goods, list) => {
  _.each(goods, (sku1) => {
    _.every(list, (sku2) => {
      if (sku1.id === sku2.id) {
        sku1.detail_customized_field = sku2.detail_customized_field || {}
        return false
      }
      return true
    })
  })
}

// data, details
const asyncSkuInfo = (data, list) => {
  // 搜索商品如果订单中已有该商品,则同步起数量和价格
  // 组合商品销售单价需累加
  _.every(data, (sku1) => {
    const { is_combine_goods, skus_ratio } = sku1
    if (is_combine_goods) {
      sku1.sale_price = getSalePrice(sku1.skus, skus_ratio)
      asyncCustomizedFieldInCombineGoods(sku1.skus || [], list)
    } else {
      _.every(list, (sku2) => {
        if (sku1.id === sku2.id) {
          sku1.quantity = sku2.quantity
          sku1.sale_price = sku2.sale_price
          sku1.detail_customized_field = sku2.detail_customized_field || {}
          return false
        }
        return true
      })

      // 产品改动，订单备注默认是空，提供快速选择功能，so找另外个字段存起来
      sku1._spu_remark = sku1.spu_remark
      sku1.spu_remark = ''
    }
    return true
  })
}

const toCombineGoodsIfExist = (details, map, sort = []) => {
  const list = details.slice()
  if (!map || _.values(map).length === 0) {
    return list
  } else {
    // 转成map 降低复杂度
    const skus = []
    const combineGoods = {}
    const detailsMap = {}
    _.each(details, (sku) => {
      detailsMap[sku.id] = { ...sku }
    })
    _.each(map, (item, index) => {
      const real = item.real || item.skus_ratio
      const huakang = item.huakang || {}
      combineGoods[index] = {
        ...item,
        is_combine_goods: 1,
        id: index,
        skus: _.map(real, (quantity, id) => {
          const sku = detailsMap[id]
          sku.quantity -= quantity * (item.real ? 1 : item.quantity)
          sku.fake_quantity -= item.skus_ratio[id] * item.fake_quantity
          sku.quantity = keepTwoDigitPrecision(sku.quantity)
          sku.fake_quantity = keepTwoDigitPrecision(sku.fake_quantity)
          if (globalStore.isHuaKang()) {
            sku.after_sale_outstock_quantity = keepTwoDigitPrecision(
              sku.after_sale_outstock_quantity -
                huakang[id]?.after_sale_outstock_quantity || 0,
            )

            sku.self_acquisition_quantity = keepTwoDigitPrecision(
              sku.self_acquisition_quantity -
                huakang[id]?.self_acquisition_quantity || 0,
            )
          }
          const result = {
            ...sku,
            after_sale_outstock_quantity:
              huakang[id]?.after_sale_outstock_quantity || 0,
            self_acquisition_quantity:
              huakang[id]?.self_acquisition_quantity || 0,
            quantity: keepTwoDigitPrecision(quantity),
            fake_quantity: keepTwoDigitPrecision(quantity),
          }
          return result
        }),
      }
    })
    _.each(sort, (id) => {
      skus.push(detailsMap[id] || combineGoods[id])
    })
    return dealCombineGoodsList(
      _.filter(skus, (sku) => sku && sku.quantity > 0),
      false,
    )
  }
}
/**
 * 处理组合商品列表
 * @param skus
 * @param isNewItem 是否新建的商品
 * @returns {[]}
 */
const dealCombineGoodsList = (skus, isNewItem = true) => {
  let result = []
  _.each(skus, (item) => {
    if (item.is_combine_goods) {
      const items = dealCombineGoodsData(
        item,
        item.quantity,
        isNewItem,
        item.fake_quantity,
      )
      setSalePriceIfCombineGoods(items)
      result = result.concat(items)
    } else {
      item.detail_customized_field = item.detail_customized_field || {}
      result.push(item)
    }
  })
  return result
}

const setSalePriceIfCombineGoods = (combines) => {
  if (!combines.length) return
  const item = combines[0]
  if (item.is_combine_goods) {
    item.sale_price = getSalePrice(combines.slice(1), item.skus_ratio)
  }
}

const getSalePrice = (skus, skus_ratio) => {
  let sum = 0
  _.each(skus, (sku) => {
    const quantity = skus_ratio[sku.id] || 0
    sum += +Big(quantity).times(sku.sale_price)
  })
  return keepTwoDigitPrecision(sum)
}

const getCombineGoodsMap = (skus) => {
  const map = {}
  const mapWithSkus = {}
  _.each(skus, (sku) => {
    if (sku.is_combine_goods && sku.belongWith) {
      if (!mapWithSkus[sku.belongWith]) {
        mapWithSkus[sku.belongWith] = []
      }
      mapWithSkus[sku.belongWith].push(sku)
    }
  })
  _.each(skus, (sku) => {
    if (sku.is_combine_goods && !sku.belongWith) {
      const real = {}
      _.each(mapWithSkus[sku.id], (sku) => {
        real[sku.id] = sku.quantity
      })
      map[sku.id] = {
        real,
        quantity: sku.quantity,
        fake_quantity: sku.fake_quantity || +sku.quantity,
        name: sku.name,
        imgs: sku.imgs,
        sale_unit_name: sku.sale_unit_name,
        skus_ratio: sku.skus_ratio,
        supplier_name: sku.supplier_name,
      }
      if (globalStore.isHuaKang()) {
        const huakang = {}
        _.each(mapWithSkus[sku.id], (sku) => {
          huakang[sku.id] = {
            after_sale_outstock_quantity: sku.after_sale_outstock_quantity || 0,
            self_acquisition_quantity: sku.self_acquisition_quantity || 0,
          }
        })
        map[sku.id].huakang = huakang
      }
    }
  })
  return map
}

const getPostSkus = (skus, fn) => {
  return _.map(skus, (sku) => {
    const params = {
      sku_id: sku.id,
      amount: sku.quantity,
      unit_price: sku.sale_price,
      spu_remark: sku.spu_remark,
      spu_id: sku.spu_id,
      is_price_timing: +sku.is_price_timing,
      fake_quantity: sku.fake_quantity || +sku.quantity,
      is_combine_goods: sku.is_combine_goods || false,
      combine_goods_id: sku.belongWith || null, // 原料所属如有
      salemenu_id: sku.salemenu_id,
      detail_id: sku.isNewItem ? undefined : sku.detail_id,
      sku_production_date: sku.sku_production_date,
      before_change_price_forsale: sku.before_change_price_forsale,
    }

    return fn ? fn(params, sku) : params
  })
}

// 处理下单编辑态时组合商品展示, 商品异常时，会变成普通商品
const dealCombineGoodsData = (
  item,
  quantity = 1,
  isNewItem = true,
  fake_quantity = null,
) => {
  const newItems = []
  // 组合商品对应的绘制框由isCombineGoodsTop, isCombineGoodsBottom, is_combine_goods
  const { skus_ratio, real, invalid_skus } = item
  const skus = item.skus || []
  const length = skus.length - 1
  const invalidSkusLength = invalid_skus?.length || 0
  if (invalidSkusLength) {
    Tip.info(
      skus.length === 0
        ? `${item.name}的组成商品已全部下架或者删除`
        : `${item.name}的组成商品${_.join(
            _.map(invalid_skus, (sku) => `[${sku.name}]`),
            '、',
          )}已下架或者已删除`,
    )
  }

  if (skus.length === 0) {
    return []
  }

  item.isCombineGoodsTop = true
  item.quantity = quantity
  item.fake_quantity = fake_quantity
  newItems.push(item)
  _.each(skus, (sku, i) => {
    newItems.push({
      ...sku,
      quantity: real
        ? keepTwoDigitPrecision(real[sku.id])
        : keepTwoDigitPrecision(skus_ratio[sku.id] * quantity),
      fake_quantity: keepTwoDigitPrecision(skus_ratio[sku.id] * fake_quantity),
      is_combine_goods: 1,
      isNewItem, // 是否是新添加商品
      belongWith: item.id, // 原料所属
      _spu_remark: sku.spu_remark,
      spu_remark: isNewItem ? '' : sku.spu_remark || '',
      detail_customized_field: sku.detail_customized_field || {},
      isCombineGoodsBottom: length === i,
    })
  })
  return newItems
}

// 修改销售价，同步相同商品, 及组合商品销售价
const asyncSalePrice = (params, details) => {
  const { belongWith, key, id, value } = params
  if (key !== 'sale_price') return
  let combineSku = null
  let salePrice = 0
  const combineSkuMap = {}
  _.each(details, (sku) => {
    if (sku.isCombineGoodsTop) {
      combineSkuMap[sku.id] = sku
    }
  })

  _.each(details, (v, i) => {
    if (belongWith && v.belongWith === belongWith) {
      const itemSalePrice = id === v.id ? value : v.sale_price
      combineSku = combineSkuMap[v.belongWith]
      const quantity = combineSku.skus_ratio[v.id]
      salePrice += +Big(quantity).times(itemSalePrice || 0)
    }
    if (v.id === id) {
      v[key] = value
    }
  })
  if (combineSku) combineSku.sale_price = keepTwoDigitPrecision(salePrice)
}

// 加进来商品也需要同步销售价
const asyncSalePriceInOrder = (newSkus, details) => {
  _.each(newSkus, (sku) => {
    const target = _.find(details, (s) => s.id === sku.id)
    if (target) sku.sale_price = target.sale_price
  })
}

// 更新组合商品中原料的下单数
const asyncQuantityAndFakeQuantity = (params, details) => {
  if (params.key !== 'quantity' && params.key !== 'fake_quantity') return
  const sku = details[params.index]
  if (sku.is_combine_goods && !sku.belongWith) {
    _.each(details, (v, i) => {
      if (v.belongWith === sku.id) {
        const quantity = parseFloat(
          Big(params.value * sku.skus_ratio[v.id]).toFixed(2),
        )
        if (params.key === 'quantity') {
          v.quantity = quantity
        } else {
          v.fake_quantity = quantity
        }
      }
    })
  }
}

// 组合商品删除, 删除所有or删除组合商品中的某一条
const deleteCombineGoods = (index, details) => {
  const sku = details[index]
  if (sku.isCombineGoodsTop) {
    const combineGoodsLength = sku.skus.length
    details.splice(index, combineGoodsLength + 1)
  } else {
    const headIndex = _.findIndex(details, (v) => v.id === sku.belongWith)
    let loopIndex = headIndex + details[headIndex].skus.length
    let i = headIndex + 1
    let targetIndex = index
    let targetHeaderIndex = headIndex
    while (i <= loopIndex) {
      const s = details[i]
      // 如果有相同普通商品需要汇总下单数
      const sameSkuIndex = _.findIndex(
        details,
        (v) => v.id === s.id && !v.is_combine_goods,
      )
      const sameSku = sameSkuIndex !== -1 ? details[sameSkuIndex] : null
      if (sameSku && sku.id !== sameSku.id) {
        s.quantity = keepTwoDigitPrecision(+sameSku.quantity + +s.quantity)
        s.fake_quantity = keepTwoDigitPrecision(
          +sameSku.fake_quantity + +s.fake_quantity,
        )
        details.splice(sameSkuIndex, 1)
        if (sameSkuIndex < targetHeaderIndex) {
          targetIndex--
          targetHeaderIndex--
          loopIndex--
          i-- // 相同在前面说明整体的游标都会减
        }
      }
      delete s.is_combine_goods
      delete s.belongWith
      delete s.isCombineGoodsBottom
      i++
    }
    details.splice(targetIndex, 1)
    details.splice(targetHeaderIndex, 1)
  }
}

// 组合商品框
const getCombineGoodsClass = (row, list) => {
  if (!row) {
    return {}
  }
  const sku = row.original
  const index = row.index
  const lastSku = index > 0 ? list[index - 1] : null
  // is_combine_goods 1 为组合商品
  if (sku.is_combine_goods) {
    return {
      className: classnames('b-combine-goods-lr', {
        'b-combine-goods-bottom': sku.isCombineGoodsBottom,
        'b-combine-goods-top': sku.isCombineGoodsTop,
        'b-combine-goods-top-border-none':
          sku.isCombineGoodsTop && lastSku && lastSku.isCombineGoodsBottom,
      }),
      'data-label': i18next.t('组合商品'),
    }
  } else {
    return {}
  }
}

// 过滤为空的项, 及组合商品头部信息
const filterSkusCommon = (skus) =>
  _.filter(skus, (sku) => sku.id !== null && !sku.isCombineGoodsTop)

const filterSkus = (skus) => {
  const skuData = filterSkusCommon(skus)
  // 处理为null的值
  _.each(skuData, (sku) => {
    sku.sale_price = sku.sale_price === null ? '' : String(sku.sale_price)
    sku.quantity = sku.quantity === null ? '' : sku.quantity
    // 套账字段为null时传下单数
    sku.fake_quantity =
      sku.fake_quantity === null ? sku.quantity : sku.fake_quantity
  })
  return skuData
}

/** 组合商品 end */

const getConfirmMsg = (data, remark) => {
  const { order_id, date_time } = data
  let confirmMsg = i18next.t('KEY85', { VAR1: order_id, VAR2: date_time })

  if (remark !== null && remark !== '') {
    confirmMsg += i18next.t(
      '(订单备注将被新备注覆盖；若该订单已进入采购或分拣流程，不建议合单)',
    )
  } else {
    confirmMsg += i18next.t('(若该订单已进入采购或分拣流程，不建议合单)')
  }
  return confirmMsg
}

const dialogMsgs = (msgs) => {
  return Dialog.alert({
    children: _.map(msgs, (msg, i) => (
      <div key={i} style={{ wordWrap: 'break-word' }}>
        {_.map(msg, (item, j) => (
          <div key={j}>{item}</div>
        ))}
      </div>
    )),
  })
}

const getOrderMsg = (data) => {
  const msgs = []
  if (data.not_enough_inventories.length) {
    const msg = []
    for (let i = 0; i < data.not_enough_inventories.length; i++) {
      const v = data.not_enough_inventories[i]
      msg.push(
        i18next.t('KEY86', {
          VAR1: v.name,
          VAR2: v.count,
        }) /* src:v.name + "，还剩：" + v.count => tpl:${VAR1}，还剩：${VAR2} */,
      )
    }
    msgs.push([
      i18next.t('KEY87', { VAR1: msg.join(';') }),
    ]) /* src:'存在库存不足。' + msg.join(";") => tpl:存在库存不足。${VAR1} */
  }

  if (data.error_sku_ids.length) {
    const msg = [
      i18next.t('部分商品提交失败，失败的商品：'),
      data.error_sku_ids.join('、'),
      i18next.t('请联系技术人员处理'),
    ]
    msgs.push(msg)
  }

  if (data.exceed_order_time_ids.length) {
    const msg = [
      i18next.t('商品超过下单时间，超过的商品：'),
      data.exceed_order_time_ids.join('、'),
      i18next.t('。无法购买对应供应商名称的商品，请核实可下单时间后提交订单'),
    ]
    msgs.push(msg)
  }

  return msgs
}

const getCurrentSortType = (current = '', name) => {
  if (current && current.indexOf(name) !== 0) return undefined
  if (current.indexOf('_desc') > -1) {
    return 'desc'
  } else if (current.indexOf('_asc') > -1) {
    return 'asc'
  }
  return undefined
}

function convertFlag2Date(flag, current_date) {
  return moment(current_date).add(flag, 'd').format('MM-DD')
}

function convertString2Date(m) {
  return moment(m).format('YYYY-MM-DD')
}

function convertString2DateAndTime(m) {
  return moment(m).format('YYYY-MM-DD HH:mm')
}

function isStation(str) {
  return str && (str + '').indexOf('T') === 0
}

function isLK(order_id) {
  // 新订单id规则，如果订单id中有'c'(下单)或者'd'（收货）存在，则是LK单
  return (
    order_id &&
    (order_id.indexOf('LK') === 0 ||
      order_id.indexOf('c') > -1 ||
      order_id.indexOf('d') > -1)
  )
}

function isPL(order_id) {
  // 新订单id规则，如果订单id中有'a'(下单)或者'b'（收货）存在，则是PL单
  return (
    order_id &&
    (order_id.indexOf('PL') === 0 ||
      order_id.indexOf('a') > -1 ||
      order_id.indexOf('b') > -1)
  )
}

/**
 * 开始收货时间,例如现在时间是10:52，开始的收货时间为11:00, 时间间隔为30分钟，那么修正现在时间为11:30
 * 下单周期可能是上一个的，不一定是当天为开始修复点
 * @param start
 * @param receiveTimeSpan
 * @param flagStart
 * @returns {*|moment.Moment}
 */
function fixNowMoment(start, receiveTimeSpan, flagStart = 0) {
  let nowMoment = moment()

  // 修正nowMoment
  let tempStartMoment = moment({
    hour: start.split(':')[0],
    minute: start.split(':')[1],
  }).add(flagStart, 'd')

  while (tempStartMoment < nowMoment) {
    tempStartMoment = tempStartMoment.add(receiveTimeSpan, 'm')
  }

  nowMoment = tempStartMoment
  return nowMoment
}

function taskCycleList(time_config_info) {
  if (!time_config_info) {
    return []
  }

  const {
    s_span_time,
    e_span_time,
    start,
    end,
    receiveEndSpan,
    weekdays,
    customer_weekdays,
  } = time_config_info.receive_time_limit
  const cycleList = []

  // 预售
  if (time_config_info.type === 2) {
    let s = s_span_time
    const filter = weekdays & (customer_weekdays || 127)
    while (s <= e_span_time) {
      if (convertDay2Bit(s, moment()) & filter) {
        let endFlag = s
        const startDate = moment().add(s, 'days').format('MM月DD日') + start
        let endDate = ''

        // 跨天
        if (receiveEndSpan === 1) {
          endFlag++
        }

        endDate = moment().add(endFlag, 'days').format('MM月DD日') + end
        cycleList.push({
          flag: s,
          startFlag: s,
          endFlag: endFlag,
          text: i18next.t('KEY112', {
            VAR1: startDate,
            VAR2: endDate,
          }) /* src:`${startDate}~${endDate}收货的订单` => tpl:${VAR1}~${VAR2}收货的订单 */,
        })
      }

      s++
    }
  } else {
    const startDate =
      moment().add(s_span_time, 'days').format('MM月DD日') + start
    const endDate = moment().add(e_span_time, 'days').format('MM月DD日') + end
    cycleList.push({
      flag: s_span_time,
      startFlag: s_span_time,
      endFlag: e_span_time,
      text: i18next.t('KEY112', {
        VAR1: startDate,
        VAR2: endDate,
      }) /* src:`${startDate}~${endDate}收货的订单` => tpl:${VAR1}~${VAR2}收货的订单 */,
    })
  }

  return cycleList
}

const isReceiveTimeValid = (time_config_info, date_time) => {
  const {
    s_span_time,
    e_span_time,
    weekdays,
    customer_weekdays,
  } = time_config_info.receive_time_limit
  if (time_config_info.type === 2) {
    let s = s_span_time
    const filter = weekdays & customer_weekdays
    if (filter === 127) return true
    while (s <= e_span_time) {
      if (convertDay2Bit(s, date_time) & filter) {
        return true
      }
      s++
    }
  } else {
    return true
  }
  return false
}

const isQuantityInvalid = (quantity, sale_num_least) => {
  if (quantity === null) {
    return true
  }
  return !(quantity > 0) || !isPrice(quantity) || sale_num_least > quantity
}

// 所有商品价格, type: 1 下单金额, type: 0 出库金额
const getAllSkuTotalPrice = (skus, type) => {
  let allSkuTotalPrice = 0
  _.each(skus, (v) => {
    const isTiming = v.is_price_timing
    // 非时价商品与组合商品头部
    if (!isTiming && !v.isCombineGoodsTop) {
      const quantity = v.quantity
      const salePrice = v.sale_price
      if (type) {
        allSkuTotalPrice = Big(allSkuTotalPrice).add(
          Big(quantity || 0)
            .times(salePrice || 0)
            .toFixed(2),
        )
      } else {
        let realQuantity =
          v.sorting_unit === 0
            ? +Big(v.std_real_quantity || 0).toFixed(2) || quantity
            : +Big(v.std_real_quantity || 0)
                .div(v.sale_ratio || 1)
                .toFixed(2) || quantity

        if (
          (v.out_of_stock && !v.std_real_quantity) ||
          v.std_real_quantity === '0'
        ) {
          realQuantity = 0
        }

        // const std_price = Big(salePrice || 0)
        //   .div(v.sale_ratio || 1)
        //   .toString()
        const std_price = Big(v.std_sale_price_forsale || 0)
          .div(100)
          .toString()
        const price = v.sorting_unit === 0 ? std_price : salePrice || 0

        allSkuTotalPrice = Big(allSkuTotalPrice).add(
          Big(realQuantity || 0)
            .times(price)
            .toFixed(2),
        )
      }
    }
  })
  return +Big(allSkuTotalPrice).toFixed(2)
}

/**
 * @description: 根据是配送(receive_way = 1)还是自提（receive_way = 2）获取动态运费
 * @param {object} freight 运费设置
 * @param {number} allSkuTotalPrice sku总价
 * @param {number} receive_way 收货方式 配送为1，自提为2
 * @return {number} 动态运费
 */
const getDynamicFreight = (freight, allSkuTotalPrice, receive_way = 1) => {
  if (!freight) return 0
  let type = receive_way === 1 ? freight.delivery_type : freight.pick_up_type
  if (receive_way === 2 && freight) {
    freight = freight.pick_up_freight
  }
  if (!freight) return 0
  if (
    allSkuTotalPrice < freight.min_total_price ||
    freight.delivery_type === 1
  ) {
    return 0
  }

  allSkuTotalPrice = Number(allSkuTotalPrice)

  if (type === null) {
    // 兼容旧版运费数据
    type = 2
  }
  switch (type) {
    case 2: {
      // 旧版数据 &&  收运费--->按金额计算--->按下单金额区间设置--->人工设置
      const dynamicFreight = _.find(freight.section, (item) => {
        // 最后一个section.max = 0 .所以做特殊处理
        if (item.max === 0) {
          return allSkuTotalPrice >= item.min
        } else {
          return allSkuTotalPrice >= item.min && allSkuTotalPrice < item.max
        }
      })
      return dynamicFreight?.freight || 0
    }
    case 3: {
      // 收运费--->按金额计算--->按下单金额区间设置--->自动设置价格区间
      const {
        base_charge,
        origin_fee,
        increase_fee,
        addition_fee,
        free_fee,
      } = freight.amount_auto_section
      let freight_new = origin_fee
      if (
        (free_fee && allSkuTotalPrice >= free_fee) ||
        allSkuTotalPrice < base_charge
      ) {
        freight_new = 0
      } else if (
        base_charge + increase_fee > allSkuTotalPrice &&
        allSkuTotalPrice >= base_charge
      ) {
        freight_new = origin_fee
      } else if (increase_fee > 0) {
        let bill_part = allSkuTotalPrice - base_charge - increase_fee
        while (bill_part >= 0) {
          bill_part -= increase_fee
          freight_new += addition_fee
        }
      }
      return freight_new
    }
    case 4: {
      // 收运费--->按金额计算--->按下单金额比例设置
      if (
        freight.scale_set.free_fee &&
        allSkuTotalPrice >= freight.scale_set.free_fee
      ) {
        return 0
      }
      return Big(allSkuTotalPrice || 0).times(
        freight.scale_set.percentage / 100 || 0,
      )
    }
    case 5: {
      // 按距离
      const dynamicFreight = _.find(freight.section, (item) => {
        // 最后一个section.max = 0 .所以做特殊处理
        if (item.max === 0) {
          return freight.distance >= item.min
        } else {
          return freight.distance >= item.min && freight.distance < item.max
        }
      })
      return dynamicFreight?.freight || 0
    }
    default:
      return 0
  }
}

// 信用额度内,判断商品超额
const isSkuInValid = (order) => {
  const { viewType, details, customer, freight, receive_way } = order

  // 如果还没查询uppay接口,没有商户状态,默认不超额
  if (_.isNil(customer) || _.isNil(freight)) {
    return false
  }

  const { min_total_price, pick_up_min_total_price } = freight
  const minTotalPrice =
    receive_way === 2 ? pick_up_min_total_price : min_total_price
  // 商品总价
  const allSkuTotalPrice = getAllSkuTotalPrice(details, 1)
  // 没达到起送价格,不能下单
  if (allSkuTotalPrice < minTotalPrice) {
    return i18next.t('未达到起送金额,请添加商品')
  } else {
    // 动态计算出来的运费
    const dynamicFreight = getDynamicFreight(
      freight,
      allSkuTotalPrice,
      receive_way,
    )
    // 总价 = 运费 + 商品总价
    const total = +Big(allSkuTotalPrice).add(dynamicFreight).valueOf()
    if (viewType === 'create') {
      // 如果是信用额度内客户,先判断有没有超额
      if (customer.customer_credit_type === 12) {
        if (total > +customer.customer_credit_info.available_credit) {
          return i18next.t('已超出授信额度，请联系商户结清账单！')
        }
      }
    }
  }
  return false
}

// 判定商户状态有效.
function isCustomerValid(customer) {
  //  所有商户信用状态吗码 = 0，正常；11，白名单；12，信用额度内；13，超额；14，欠款（当没授信的时候返回）; 15,冻结; 16,先款后货用户无法在此下单; 17,未审核; 100,其他
  //  以下为可下单状态码
  const validCreditType = [0, 11, 12]
  // 没有商户状态判定为false
  return customer && validCreditType.includes(customer.customer_credit_type)
}

// 判断为false的商户状态, 注意: 如果没有状态判断则返回true
const isCustomerFalse = (customer) => {
  //  所有商户信用状态码 => 0，正常；11，白名单；12，信用额度内；13，超额；14，欠款（当没授信的时候返回）; 15,冻结; 16,先款后货用户无法在此下单; 17,未审核; 100,其他
  //  以下为不可下单的状态码
  const inValidCreditType = [13, 14, 15, 16, 100, 17]
  // 没有商户状态也判定为true
  return !customer || inValidCreditType.includes(customer.customer_credit_type)
}

const isOrderInvalid = (order, skusQuantity = []) => {
  const {
    repair,
    viewType,
    time_config_info,
    currentTime,
    customer = {},
  } = order

  if (isSkuInValid(order)) {
    return true
  }

  // 当前时间是否在下单时间范围内
  let isTimeValid = true

  if (time_config_info && time_config_info.order_time_limit) {
    const {
      start,
      end,
      e_span_time,
      s_span_time,
    } = time_config_info.order_time_limit

    if (
      !repair &&
      !isOrderTimeValid(
        viewType,
        currentTime,
        start,
        end,
        e_span_time,
        s_span_time,
      )
    ) {
      isTimeValid = false
    }
  }

  if (!order.details.length || !isTimeValid) {
    return true
  }

  // 商户状态判断 所有商户信用状态码 => 0，正常；11，白名单；12，信用额度内；13，超额；14，欠款（当没授信的时候返回）; 15,冻结; 16,先款后货用户无法在此下单; 100,其他
  if (viewType === 'create') {
    if (isCustomerFalse(customer)) {
      return true
    }
  }

  const skuData = filterSkusCommon(order.details)
  // 检查是否存在输入不正确的sku，相同sku需要判断总下单数
  return _.find(skuData, (sku) => {
    const nowSku = _.find(skusQuantity, (item) => item.id === sku.id)
    const totalQuantity = (nowSku && nowSku.totalQuantity) || sku.quantity
    return (
      sku.code ||
      isQuantityInvalid(totalQuantity, sku.sale_num_least) ||
      sku?.spu_remark?.length > 100
    )
  })
}

function isOrderTimeValid(
  viewType,
  currentTime = moment(),
  start,
  end,
  e_span_time,
  s_span_time,
) {
  if (viewType === 'view' || viewType === 'edit') return true

  const currentTimeMoment = moment(currentTime, 'HH:mm')

  return (
    currentTimeMoment.isAfter(moment(start, 'HH:mm').add(s_span_time, 'd')) &&
    currentTimeMoment.isBefore(moment(end, 'HH:mm').add(e_span_time, 'd'))
  )
}

// 判断订单是否异常
const isAbnormalFun = (sku) => {
  const isAbnormal1 =
    sku.real_refund_quantity && !Big(sku.real_refund_quantity).eq(0)
  const isAbnormal2 =
    sku.request_refund_quantity && !Big(sku.request_refund_quantity).eq(0)
  const isAbnormal3 = sku.exc_quantity && !Big(sku.exc_quantity).eq(0)
  return isAbnormal1 || isAbnormal2 || isAbnormal3
}

// 判断订单是否异常
const isAbnormalOrder = (order) => {
  const isAbnormal1 =
    order.abnormal_money && !Big(order.abnormal_money || 0).eq(0)
  const isAbnormal2 = order.refund_kind && !Big(order.refund_kind || 0).eq(0)
  const isAbnormal3 = _.some(order.details, (sku) => {
    return sku.exc_quantity && !Big(sku.exc_quantity).eq(0)
  })
  // 非商品异常 had_no_sku_abnormal：true 存在非商品异常
  const isAbnormal4 = !!order.had_no_sku_abnormal
  return isAbnormal1 || isAbnormal2 || isAbnormal3 || isAbnormal4
}

// 展开询价信息
function squeshQoutePriceList(skulist) {
  const list = skulist.slice()
  const squeshList = []

  _.forEach(list, (item) => {
    if (item.id !== null) {
      const squeshIsOrNot =
        !_.isNumber(item.last_in_stock_price) &&
        !_.isNumber(item.last_purchase_price) &&
        !_.isNumber(item.last_quote_price) &&
        !item.isCombineGoodsTop &&
        item.code !== 1

      if (squeshIsOrNot) {
        squeshList.push(
          Object.assign({}, item, {
            last_in_stock_price: item.last_in_stock_price.newest.price,
            last_purchase_price: item.last_purchase_price.newest.price,
            last_quote_price: item.last_quote_price.newest.price,
            last_in_stock_price_newest: item.last_in_stock_price.newest || {},
            last_purchase_price_newest: item.last_purchase_price.newest || {},
            last_quote_price_newest: item.last_quote_price.newest || {},
            last_in_stock_price_earlier: item.last_in_stock_price.earlier || [],
            last_purchase_price_earlier: item.last_purchase_price.earlier || [],
            last_quote_price_earlier: item.last_quote_price.earlier || [],
          }),
        )
      } else {
        squeshList.push(item)
      }
    } else {
      squeshList.push(item)
    }
  })
  return squeshList
}

// 在post搜索数据前，城市选择的数据需要转换一下
const transformPostArea = (selectedList) => {
  let result = ''
  if (!selectedList) {
    return selectedList
  }
  for (let i = 0; i < 3; i++) {
    const value = selectedList[i] || 0
    if (+value === 0) {
      result += '_'
    } else {
      result += i === 0 ? value : '_' + value
    }
  }
  return result
}

function endDateRanger(type, e_span_time, begin, delay) {
  const num = delay ? 6 : 61
  const daysDelay = delay
    ? moment(begin).add(num, 'M')
    : moment(begin).add(num, 'd')

  if (
    (type === searchDateTypes.RECEIVE.type ||
      type === searchDateTypes.CYCLE.type) &&
    e_span_time
  ) {
    const daysWithSpan = moment().add(e_span_time, 'd')
    const maxTemp = daysWithSpan.isAfter(daysDelay) ? daysDelay : daysWithSpan

    return {
      min: begin,
      max: maxTemp,
    }
  }

  return {
    min: begin,
    max: daysDelay.isAfter(today) ? today : daysDelay,
  }
}

function startDateRanger(type, e_span_time) {
  if (
    (type === searchDateTypes.RECEIVE.type ||
      type === searchDateTypes.CYCLE.type) &&
    e_span_time
  ) {
    return {
      max: moment().add(e_span_time, 'd'),
    }
  }

  return {
    max: today,
  }
}

const filterIdForCategories = (list) => {
  const filterList = _.compact(_.map(list, (v) => v.id))
  return filterList.length > 0 ? JSON.stringify(filterList) : JSON.stringify([])
}

// 计算收货时间的最后一个可选时间点
const getLastReceiveEndTime = ({ start, end, receiveTimeSpan }) => {
  const _start = moment(start)
  const _end = moment(end)
  let endMax = _start
  while (endMax.isBefore(_end)) {
    endMax = endMax.add(receiveTimeSpan, 'm')
  }
  if (endMax.isAfter(_end)) {
    endMax = endMax.subtract(receiveTimeSpan, 'm')
  }
  return endMax
}

// 收货时间相关
const getServiceTime = (
  defaultTime, // 上次的收货时间
  congfigTime, // 配置的收货时间
  receive_time_limit,
  type = 0,
) => {
  const {
    s_span_time,
    e_span_time,
    start,
    end,
    weekdays,
    customer_weekdays,
    receiveTimeSpan,
    receiveEndSpan,
  } = receive_time_limit
  // 默认表示记住的上次的收货时间
  const {
    defaultEnd,
    defaultStart,
    defaultSpanEndFlag,
    defaultSpanStartFlag,
  } = defaultTime
  const filter = (weekdays || 127) & (customer_weekdays || 127)
  // 相对下单时间偏移值
  const congfigTimeStart = moment(congfigTime.timeStart, 'HH:mm').add(
    congfigTime.flagStart,
    'd',
  )
  const congfigTimeEnd = moment(congfigTime.timeEnd, 'HH:mm').add(
    congfigTime.flagEnd,
    'd',
  )

  // 使用时需要注意：endMax为计算的确定值
  const endMax = getLastReceiveEndTime({
    start: congfigTimeStart,
    end: congfigTimeEnd,
    receiveTimeSpan,
  })

  if (congfigTimeStart.isSameOrAfter(congfigTimeEnd)) {
    // 收货开始>=结束
    let s = s_span_time
    while (s <= e_span_time) {
      if (convertDay2Bit(s, moment()) & filter && s !== congfigTime.flagStart)
        break
      s++
    }
    const isCrossDay =
      receiveEndSpan >= 0 ? receiveEndSpan : e_span_time - s_span_time
    return {
      timeStart: moment(start, 'HH:mm'),
      timeEnd: moment(endMax, 'HH:mm'),
      flagStart: s,
      flagEnd: isCrossDay ? s + 1 : s,
    }
  }
  let sFlag = congfigTime.flagStart
  let eFlag = congfigTime.flagEnd
  let sTime = congfigTime.timeStart
  let eTime = endMax

  // 优先判断记住的上次的收货日期是否可用
  if (
    _.keys(defaultTime).length &&
    convertDay2Bit(defaultSpanStartFlag, moment()) & filter
  ) {
    // 上次收货开始时间
    const defaultStartTime = moment(defaultStart, 'HH:mm').add(
      defaultSpanStartFlag,
      'd',
    )
    // 上次收货结束时间
    const defaultEndTime = moment(defaultEnd, 'HH:mm').add(
      defaultSpanEndFlag,
      'd',
    )

    // 只需要eTime的时间
    const _eTime = moment(eTime).format('HH:mm')
    const timeStartLimit = moment(sTime).add(s_span_time, 'd')
    const timeEndLimit = moment(_eTime, 'HH:mm').add(e_span_time, 'd')
    let isCrossCycle = false

    // 若为预售运营时间(type为2), 可能原先运营时间设置周期有变，所以要判断下当前运营时间是否跨周期选择
    if (type === 2) {
      const { receiveEndSpan } = receive_time_limit
      // 可能是在上个周期
      const isLastCycle = _.toNumber(
        moment(start, 'HH:mm')
          .add(defaultSpanStartFlag, 'd')
          .isAfter(defaultStartTime),
      )

      const startFlag = defaultSpanStartFlag - isLastCycle
      const endFlag =
        defaultSpanStartFlag + _.toNumber(receiveEndSpan || 0) - isLastCycle
      const sameCycleStart = moment(start, 'HH:mm').add(startFlag, 'd')
      const sameCycleEnd = moment(end, 'HH:mm').add(endFlag, 'd')
      if (
        !(
          sameCycleStart.isSameOrBefore(defaultStartTime) &&
          defaultEndTime.isSameOrBefore(sameCycleEnd)
        )
      ) {
        isCrossCycle = true
      }
    }

    // 记住的上次收货时间在当前周期区间内且不跨周期，优先用上一次的收货时间
    if (
      timeStartLimit.isSameOrBefore(defaultStartTime) &&
      defaultEndTime.isSameOrBefore(timeEndLimit) &&
      !isCrossCycle
    ) {
      sTime = moment(defaultStart, 'HH:mm')
      eTime = moment(defaultEnd, 'HH:mm')
      sFlag = defaultSpanStartFlag
      eFlag = defaultSpanEndFlag
    }
  }

  // 当前时间是上一个下单周期, 更正为当前周期
  if (sFlag === -1) {
    sFlag = 0
    eFlag = 0
    sTime = fixNowMoment(start, receiveTimeSpan, -1)
  }

  return {
    timeStart: sTime,
    timeEnd: eTime,
    flagStart: sFlag,
    flagEnd: eFlag,
  }
}

const fixMoment = (start, orderTime, receiveTimeSpan) => {
  const current = moment(orderTime)
  let tempStartMoment = moment(current)
    .startOf('days')
    .add(start.split(':')[0], 'hours')
    .add(start.split(':')[1], 'minutes')
  while (tempStartMoment < current) {
    tempStartMoment = tempStartMoment.add(receiveTimeSpan, 'm')
  }
  return tempStartMoment
}

// 修改订单 -> 修正收货时间，预售，非预售
const fixReceiveTime = (serviceTime, congfigTime, orderTime) => {
  const { receive_time_limit } = serviceTime
  const {
    e_span_time,
    s_span_time,
    receiveEndSpan,
    start,
    weekdays,
    customer_weekdays,
    end,
    receiveTimeSpan,
  } = receive_time_limit
  const { flagStart, flagEnd, timeStart, timeEnd } = congfigTime
  const configStartTime = moment(timeStart, 'HH:mm').add(flagStart, 'd')
  const configEndTime = moment(timeEnd, 'HH:mm').add(flagEnd, 'd')
  let s = s_span_time
  const filter = (weekdays || 127) & (customer_weekdays || 127)
  const isCrossDay =
    receiveEndSpan >= 0 ? receiveEndSpan : e_span_time - s_span_time

  const endMax = getLastReceiveEndTime({
    start: configStartTime,
    end: configEndTime,
    receiveTimeSpan,
  })

  while (s <= e_span_time) {
    if (convertDay2Bit(s, moment(orderTime)) & filter) {
      const eFlag = isCrossDay ? s + 1 : s
      const startTime = moment(start, 'HH:mm').add(s, 'd')
      const eTime = moment(end, 'HH:mm').add(eFlag, 'd')
      if (
        startTime.isSameOrBefore(configStartTime) &&
        eTime.isSameOrAfter(configEndTime)
      ) {
        return { ...congfigTime, timeEnd: endMax }
      }
    }
    s++
  }
  const config = getFirstAvailConfigTime(serviceTime, filter)
  return {
    flagStart: config.flagStart,
    flagEnd: config.flagEnd,
    timeStart:
      config.flagStart === 0
        ? fixMoment(start, orderTime, receiveTimeSpan)
        : moment(start, 'HH:mm'),
    timeEnd: moment(end, 'HH:mm'),
  }
}

const isNoAvailReceiveTime = (time_config_info, date_time) => {
  return (
    time_config_info.type === 2 &&
    time_config_info.receive_time_limit &&
    !isReceiveTimeValid(time_config_info, date_time)
  )
}

const getFirstAvailConfigTime = (serviceTime, filter) => {
  const { receive_time_limit } = serviceTime
  const { s_span_time, e_span_time, receiveEndSpan } = receive_time_limit
  let s = s_span_time
  const isCrossDay =
    receiveEndSpan >= 0 ? receiveEndSpan : e_span_time - s_span_time
  while (s <= e_span_time) {
    if (convertDay2Bit(s, moment()) & filter) {
      return {
        flagStart: s,
        flagEnd: isCrossDay ? s + 1 : s,
      }
    }
    s++
  }

  return {
    // 无可选择的收货时间
    flagStart: s_span_time,
    flagEnd: receiveEndSpan ? s_span_time + 1 : s_span_time,
  }
}

const getReceiveTime = (orderDetail) => {
  const {
    timeStart,
    timeEnd,
    flagEnd,
    flagStart,
    dateStart,
    dateEnd,
    repair,
  } = orderDetail
  let receive_begin_time =
    moment().add(flagStart, 'd').format('YYYY-MM-DD') +
    ' ' +
    moment(timeStart).format('HH:mm')
  let receive_end_time =
    moment().add(flagEnd, 'd').format('YYYY-MM-DD') +
    ' ' +
    moment(timeEnd).format('HH:mm')
  // 与 repairServiceTimeBox 保持逻辑一致
  if (repair) {
    receive_begin_time = `${dateStart.format('YYYY-MM-DD')} ${moment(
      timeStart,
      'HH:mm',
    ).format('HH:mm')}`
    receive_end_time = `${dateEnd.format('YYYY-MM-DD')} ${moment(
      timeEnd,
      'HH:mm',
    ).format('HH:mm')}`
  }
  return {
    receive_begin_time,
    receive_end_time,
  }
}

const getSkuNameWithXinhaoIcon = (sku, search_text) => {
  let icon = null
  if (sku.frequency >= 8) {
    icon = (
      <i
        className='ifont ifont-xinhao3'
        title={i18next.t('此商户最近经常下单该商品')}
      />
    )
  } else if (sku.frequency > 1) {
    icon = (
      <span
        className='ifont-stack'
        title={i18next.t('此商户最近偶尔下单该商品')}
      >
        <i
          className='ifont ifont-stack-1x ifont ifont-xinhao3'
          style={{ color: '#DBDBDB' }}
        />
        <i className='ifont ifont-stack-1x ifont ifont-xinhao2' />
      </span>
    )
  } else if (sku.frequency === 1) {
    icon = (
      <span className='ifont-stack' title={i18next.t('此商户最近下单过该商品')}>
        <i
          className='ifont ifont-stack-1x ifont ifont-xinhao3'
          style={{ color: '#DBDBDB' }}
        />
        <i className='ifont ifont-stack-1x ifont ifont-xinhao1' />
      </span>
    )
  }

  return (
    <strong>
      {replaceWithToJSX(sku.name, search_text, (v) => (
        <strong>{v}</strong>
      ))}
      &nbsp;{icon}
    </strong>
  )
}

const inValidSkuTip = (inValidSku) => {
  if (inValidSku.sale_num_least > inValidSku.quantity) {
    Tip.warning(
      i18next.t('KEY77', {
        VAR1: inValidSku.name,
        VAR2: inValidSku.sale_num_least,
      }) /* src:`${inValidSku.name}的数量输入错误，其最小下单数为${inValidSku.sale_num_least}` => tpl:${VAR1}的数量输入错误，其最小下单数为${VAR2} */,
    )
  } else if (inValidSku.sale_price === '') {
    Tip.warning(
      i18next.t('KEY82', {
        VAR1: inValidSku.name,
      }) /* src:`${inValidSku.name}的价格不能为空` => tpl:${VAR1}的价格不能为空 */,
    )
  } else if (inValidSku?.spu_remark?.length > 100) {
    Tip.warning(
      i18next.t('REMARK_LENGTH', {
        VAR1: inValidSku.name,
      }) /* src:`${inValidSku.name}的备注不要超过30个汉字或60个英文` => tpl:${VAR1}的备注不要超过30个汉字或60个英文 */,
    )
  }
}

const getQuantityWithUnit = (value, record) => {
  const unit = record.std_unit_name_forsale
  if (value) {
    return value + unit
  } else {
    return '0' + unit
  }
}

const transformHistoryPrice = (list, priceData) => {
  return _.map(list, (item) => {
    const index = _.findIndex(priceData, (o) => o.sku_id === item.id)
    const data = priceData[index]
    const toFixed = (number) =>
      Big(number || 0)
        .div(100)
        .toFixed(2)

    const noFind = index === -1
    return {
      ...item,
      sale_price: noFind ? item.sale_price : toFixed(data?.latest_sale_price),
    }
  })
}

// 订单旧版本
const isOld = () => {
  const version = Storage.get('ORDER_DETAIL_VERSION')
  return is.phone() || version === 'old'
}

const getRoundingText = (data) => {
  if (data) {
    return (
      i18next.t('商品') +
      _.join(
        _.map(data, (v) => `${v.sku_name}(${v.sku_id})`),
        ',',
      ) +
      i18next.t('已按设置将对应下单数取整')
    )
  }
  return ''
}

/**
 * @param {*} 选择的收货开始结束时间
 * @param {*} undelivery_times 设置的不配送时间
 * 判断当前选择的收货时间是否与不配送时间设置交叉
 * 1、不跨天，直接判断
 * 2、跨天
 */
const isValidReceiveTime = (
  { receiveBeginTime, receiveEndTime },
  undelivery_times = [],
) => {
  const receiveBeginDay = moment(receiveBeginTime).get('day')
  const receiveEndDay = moment(receiveEndTime).get('day')
  const crossDay = receiveEndDay - receiveBeginDay

  let isValid = true
  _.forEach(undelivery_times, (item) => {
    const unReceiveBegin = `${moment(receiveBeginTime).format('YYYY-MM-DD')} ${
      item.start
    }`
    const unReceiveEnd = `${moment(receiveBeginTime).format('YYYY-MM-DD')} ${
      item.end
    }`

    if (crossDay) {
      // 分成两段时间进行判断
      const rEnd1 = moment(receiveBeginTime).endOf('day')
      const rBegin2 = moment(receiveBeginTime).startOf('day')
      const rEnd2 = moment(receiveEndTime).add(-1, 'd')

      if (
        moment(receiveBeginTime).isBefore(moment(unReceiveEnd)) &&
        moment(rEnd1).isAfter(moment(unReceiveBegin))
      ) {
        isValid = false
        return false
      }

      if (
        moment(rBegin2).isBefore(moment(unReceiveEnd)) &&
        moment(rEnd2).isAfter(moment(unReceiveBegin))
      ) {
        isValid = false
        return false
      }

      return true
    } else {
      // 收货不包括其中一段时间即是合法的 s1 <= e2 and e1 >= s2
      if (
        moment(receiveBeginTime).isBefore(moment(unReceiveEnd)) &&
        moment(receiveEndTime).isAfter(moment(unReceiveBegin))
      ) {
        isValid = false
        return false
      }
      return true
    }
  })

  return isValid
}

const hasUnReceiveTimes = (
  is_undelivery,
  undelivery_times,
  { receive_begin_time, receive_end_time },
) => {
  if (is_undelivery) {
    const isValid = isValidReceiveTime(
      {
        receiveBeginTime: receive_begin_time,
        receiveEndTime: receive_end_time,
      },
      undelivery_times || [],
    )

    if (!isValid) {
      return true
    }
  }
  return false
}

// 判断是否是赠品
const isPresent = (type) => _.includes([2, 3], type)
/**
 * @description: 点击【复制至订单】弹窗提示
 * @param {boolean} inList是否在列表处触发的
 */
const copyOrderTip = (inList, callback) => {
  const option = {
    value: getCopyOrderSyncGoodsPrice(),
  }
  const setOption = (newValue) => (option.value = newValue)
  Dialog.confirm({
    onHide: Dialog.hide,
    children: <CopyOrderTip inList={inList} onChange={setOption} />,
    title: '提示',
  }).then(() => {
    const newValue = option.value
    setCopyOrderSyncGoodsPrice(newValue)
    callback(isCopyOrderSyncGoodsPrice(newValue))
  })
}
export {
  isPresent,
  getRoundingText,
  isCustomerFalse,
  keepTwoDigitPrecision,
  findSameSku,
  asyncSalePriceInOrder,
  deleteConfirmText,
  deleteConfirm,
  asyncSpuRemarkAndCustomize,
  getSkusLength,
  asyncSkuInfo,
  dealCombineGoodsList,
  getCombineGoodsMap,
  asyncQuantityAndFakeQuantity,
  setSalePriceIfCombineGoods,
  getSalePrice,
  debounce,
  getPostSkus,
  dealCombineGoodsData,
  toCombineGoodsIfExist,
  asyncSalePrice,
  deleteCombineGoods,
  getCombineGoodsClass,
  filterSkusCommon,
  filterSkus,
  dialogMsgs,
  getOrderMsg,
  getConfirmMsg,
  getQuantityWithUnit,
  fixReceiveTime,
  isNoAvailReceiveTime,
  getFirstAvailConfigTime,
  isReceiveTimeValid,
  inValidSkuTip,
  getServiceTime,
  convertFlag2Date,
  convertString2Date,
  convertString2DateAndTime,
  isStation,
  isLK,
  isPL,
  fixNowMoment,
  taskCycleList,
  isQuantityInvalid,
  isOrderInvalid,
  isCustomerValid,
  isOrderTimeValid,
  endDateRanger,
  startDateRanger,
  isSkuInValid,
  getAllSkuTotalPrice,
  getDynamicFreight,
  isAbnormalFun,
  isAbnormalOrder,
  squeshQoutePriceList,
  transformPostArea,
  filterIdForCategories,
  getSkuNameWithXinhaoIcon,
  getReceiveTime,
  isOld,
  getCurrentSortType,
  transformHistoryPrice,
  isValidReceiveTime,
  hasUnReceiveTimes,
  copyOrderTip,
}
