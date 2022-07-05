import { i18next } from 'gm-i18n'
import { Price } from '@gmfe/react'
import _ from 'lodash'
import React from 'react'
import Big from 'big.js'
import {
  money,
  moneyLock,
  orderState,
  stockState,
  lockState,
  ruleState,
  convertNumber2Sid,
  typeState,
  payState,
} from '../../../../common/filter'
import { isNumber, doller } from '../../../../common/util'
import { getFiledData } from 'common/components/customize'
import renderFormulaText from '../../../../common/components/calculator/render_formula_text'
import { Popover } from '@gmfe/react'
import { t } from 'gm-i18n'

function list2Map(list, key) {
  const map = {}
  _.each(list, (item) => {
    map[item[key]] = item
  })
  return map
}

function getCustomizeLog(val, customizedListMap) {
  const before = []
  const after = []
  _.each(val, (value = {}, key) => {
    const config = customizedListMap[key] || {}
    const b = getFiledData(config, { [key]: value?.before })
    const a = getFiledData(config, { [key]: value?.after })
    if (a !== b) {
      before.push(`${config.field_name}:${b}`)
      after.push(`${config.field_name}:${a}`)
    } else if (value?.before !== value?.after) {
      before.push(`${config.field_name}:${value?.before}`)
      after.push(`${config.field_name}:${value?.after}`)
    }
  })
  return { before, after }
}

const suggestPrice = (before, after) => {
  let val = ''
  if (_.isNull(before) && _.isNull(after)) {
    val = '-'
  } else if (_.isNull(before) && isNumber(after)) {
    val = '<=' + Big(after).div(100).toFixed(2)
  } else if (isNumber(before) && _.isNull(after)) {
    val = '>=' + Big(before).div(100).toFixed(2)
  } else if (isNumber(before) && isNumber(after)) {
    val = Big(before).div(100).toFixed(2) + '~' + Big(after).div(100).toFixed(2)
  }

  return val
}

const isNullOrVoidStr = (str) => {
  return str === null || str === ''
}

// 采购日志 -- 商品的采购规格
const getPurchaseSpec = (item) => {
  const { sale_ratio, sale_unit_name, std_unit_name_forsale } = item
  if (!(sale_ratio && sale_unit_name && std_unit_name_forsale)) {
    return null
  }

  return {
    fieldName: i18next.t('采购规格'),
    before:
      isNullOrVoidStr(sale_ratio.before) &&
      isNullOrVoidStr(sale_unit_name.before) &&
      isNullOrVoidStr(std_unit_name_forsale.before)
        ? '-'
        : `${sale_ratio.before}${std_unit_name_forsale.before}/${sale_unit_name.before}`,
    after:
      isNullOrVoidStr(sale_ratio.after) &&
      isNullOrVoidStr(sale_unit_name.after) &&
      isNullOrVoidStr(std_unit_name_forsale.after)
        ? '-'
        : `${sale_ratio.after}${std_unit_name_forsale.after}/${sale_unit_name.after}`,
  }
}

// handler { val, modifyObj, type, fee_type}
// log_type 1
const detailsMap = {
  coupon: { fieldName: i18next.t('优惠金额'), type: 'str' },
  spu_remark: { fieldName: i18next.t('备注'), type: 'str' },
  customized_field: {
    fieldName: i18next.t('订单自定义'),
    type: 'func',
    handler({ val, customizedList }) {
      const customizedListMap = list2Map(customizedList, 'id')
      const { before, after } = getCustomizeLog(val, customizedListMap)
      return {
        fieldName: this.fieldName,
        before: before.join(',') || '',
        after: after.join(',') || '',
      }
    },
  },
  detail_customized_field: {
    fieldName: i18next.t('订单明细自定义'),
    type: 'func',
    handler({ val, customizedList }) {
      const customizedListMap = list2Map(customizedList, 'id')
      const { before, after } = getCustomizeLog(val, customizedListMap)
      return {
        fieldName: this.fieldName,
        before: before.join(',') || '',
        after: after.join(',') || '',
      }
    },
  },
  remark: {
    fieldName: i18next.t('订单备注'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before || '-',
        after: val.after || '-',
        bold: true,
      }
    },
  },
  name: {
    fieldName: i18next.t('商品名称(ID)'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: val.before
          ? `${modifyObj.name.before}(${modifyObj.id.before})`
          : i18next.t('无该商品'),
        after: val.after
          ? `${modifyObj.name.after}(${modifyObj.id.after})`
          : i18next.t('该商品被删除'),
        borderTop: true, // 每个商品上面加border
        bold: true,
      }
    },
  },
  receive_begin_time: {
    fieldName: i18next.t('收货时间'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: val.before
          ? modifyObj.receive_begin_time.before +
            '~' +
            modifyObj.receive_end_time.before
          : '-',
        after: val.after
          ? modifyObj.receive_begin_time.after +
            '~' +
            modifyObj.receive_end_time.after
          : '-',
        bold: true,
      }
    },
  },
  status: {
    fieldName: i18next.t('订单状态'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: _.isNil(val.before) ? '-' : orderState(val.before),
        after: _.isNil(val.after) ? '-' : orderState(val.after),
        bold: true,
      }
    },
  },
  pay_status: {
    fieldName: i18next.t('支付状态'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: _.isNil(val.before) ? '-' : payState(val.before),
        after: _.isNil(val.after) ? '-' : payState(val.after),
        bold: true,
      }
    },
  },
  quantity: {
    fieldName: i18next.t('下单数'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? `${val.before}${modifyObj.sale_unit_name.before}`
          : '-',
        after: !_.isNil(val.after)
          ? `${val.after}${modifyObj.sale_unit_name.after}`
          : '-',
      }
    },
  },
  real_quantity: {
    fieldName: i18next.t('出库数'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? `${val.before}${modifyObj.sale_unit_name.before}`
          : '-',
        after: !_.isNil(val.after)
          ? `${val.after}${modifyObj.sale_unit_name.after}`
          : '-',
      }
    },
  },
  sale_unit_name: { fieldName: i18next.t('销售单位'), type: 'str' },
  sale_price: {
    fieldName: i18next.t('单价(销售单位)'),
    type: 'func',
    handler({ val, modifyObj, fee_type }) {
      const sale_name = modifyObj.sale_unit_name || {}
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? money(val.before) + Price.getUnit(fee_type) + '/' + sale_name.before
          : '-',
        after: !_.isNil(val.after)
          ? money(val.after) + Price.getUnit(fee_type) + '/' + sale_name.after
          : '-',
      }
    },
  },
  total_item_price: {
    fieldName: i18next.t('下单金额'),
    type: 'func',
    handler({ val, modifyObj, fee_type }) {
      if (val.before === val.after) {
        return null
      }
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? money(val.before) + Price.getUnit(fee_type)
          : '-',
        after: !_.isNil(val.after)
          ? money(val.after) + Price.getUnit(fee_type)
          : '-',
      }
    },
  },
  out_of_stock: {
    fieldName: i18next.t('是否缺货'),
    type: 'func',
    handler({ val }) {
      const isOutOfStock = {
        false: i18next.t('不缺'),
        true: i18next.t('缺货'),
      }
      return {
        fieldName: this.fieldName,
        before: isOutOfStock[val.before] || '-',
        after: isOutOfStock[val.after] || '-',
      }
    },
  },
  std_unit_name_forsale: { fieldName: i18next.t('基本单位'), type: 'str' },
  after_sales_type: {
    fieldName: i18next.t('售后类型'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before || '-',
        after: val.after || '-',
      }
    },
  },
  refund_num: {
    fieldName: i18next.t('退货数'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? `${Big(val.before || 0).toFixed(2)}${
              modifyObj.std_unit_name_forsale.before
            }`
          : '-',
        after: !_.isNil(val.after)
          ? `${Big(val.after || 0).toFixed(2)}${
              modifyObj.std_unit_name_forsale.after
            }`
          : '-',
      }
    },
  },
  refund_money: {
    fieldName: i18next.t('金额变动'),
    type: 'func',
    handler({ val, modifyObj, fee_type }) {
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? money(val.before) + Price.getUnit(fee_type)
          : '-',
        after: !_.isNil(val.after)
          ? money(val.after) + Price.getUnit(fee_type)
          : '-',
      }
    },
  },
  abnormal_num: {
    fieldName: i18next.t('记账数'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? `${Big(val.before || 0).toFixed(2)}${
              modifyObj.std_unit_name_forsale.before
            }`
          : '-',
        after: !_.isNil(val.after)
          ? `${Big(val.after || 0).toFixed(2)}${
              modifyObj.std_unit_name_forsale.after
            }`
          : '-',
      }
    },
  },
  abnormal_money: {
    fieldName: i18next.t('异常金额'),
    type: 'func',
    handler({ val, modifyObj, fee_type }) {
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? money(val.before) + Price.getUnit(fee_type)
          : '-',
        after: !_.isNil(val.after)
          ? money(val.after) + Price.getUnit(fee_type)
          : '-',
      }
    },
  },
  exception_reason: { fieldName: i18next.t('异常原因'), type: 'str' },
  order_process_name: {
    fieldName: i18next.t('订单类型'),
    type: 'func',
    handler({ val, modify }) {
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? i18next.t('order_type_name', { name: val.before })
          : '-',
        after: !_.isNil(val.after)
          ? i18next.t('order_type_name', { name: val.after })
          : '-',
        bold: true,
      }
    },
  },
}

// log_type 2
const skuMap = {
  name: {
    fieldName: i18next.t('规格名称'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before ? val.before : i18next.t('无该规格'),
        after: val.after ? val.after : i18next.t('该规格被删除'),
        bold: true,
      }
    },
  },
  outer_id: { fieldName: i18next.t('自定义编码'), type: 'str' },
  salemenu_name: { fieldName: i18next.t('所在报价单'), type: 'str' },
  std_sale_price_forsale: {
    fieldName: i18next.t('单价(基本单位)'),
    type: 'func',
    handler({ val, modifyObj, fee_type }) {
      const std_name = modifyObj.std_unit_name_forsale || {}
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? money(val.before) + Price.getUnit(fee_type) + '/' + std_name.before
          : '-',
        after: !_.isNil(val.after)
          ? money(val.after) + Price.getUnit(fee_type) + '/' + std_name.after
          : '-',
      }
    },
  },
  sale_price: {
    fieldName: i18next.t('单价(销售单位)'),
    type: 'func',
    handler({ val, modifyObj, fee_type }) {
      const sale_name = modifyObj.sale_unit_name || {}
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? money(val.before) + Price.getUnit(fee_type) + '/' + sale_name.before
          : '-',
        after: !_.isNil(val.after)
          ? money(val.after) + Price.getUnit(fee_type) + '/' + sale_name.after
          : '-',
      }
    },
  },
  sale_unit_name: { fieldName: i18next.t('销售单位'), type: 'str' },
  sale_ratio: {
    fieldName: i18next.t('销售规格'),
    type: 'func',
    handler({ val, modifyObj }) {
      const {
        std_unit_name_forsale = {},
        sale_unit_name = {},
        sale_ratio = {},
      } = modifyObj
      const before =
        std_unit_name_forsale.before === sale_unit_name.before
          ? i18next.t('KEY48', {
              VAR1: sale_unit_name.before,
            }) /* src:`按${sale_unit_name.before}` => tpl:按${VAR1} */
          : `${sale_ratio.before}${std_unit_name_forsale.before}/${sale_unit_name.before}`
      const after =
        std_unit_name_forsale.after === sale_unit_name.after
          ? i18next.t('KEY48', {
              VAR1: sale_unit_name.after,
            }) /* src:`按${sale_unit_name.after}` => tpl:按${VAR1} */
          : `${sale_ratio.after}${std_unit_name_forsale.after}/${sale_unit_name.after}`
      return {
        fieldName: this.fieldName,
        before: val.before ? before : '-',
        after: val.after ? after : '-',
      }
    },
  },

  sale_num_least: {
    fieldName: i18next.t('最小下单数'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before)
          ? `${val.before}${modifyObj.sale_unit_name.before}`
          : '-',
        after: !_.isNil(val.after)
          ? `${val.after}${modifyObj.sale_unit_name.after}`
          : '-',
      }
    },
  },
  desc: { fieldName: i18next.t('商品描述'), type: 'str' },
  image: {
    fieldName: i18next.t('商品图片'),
    type: 'func',
    handler({ val }) {
      if (val.before === val.after) {
        return null
      }
      return {
        fieldName: this.fieldName,
        before: val.before ? (
          <img
            src={val.before}
            alt={i18next.t('更改前')}
            style={{ width: '100px', height: '100px' }}
          />
        ) : (
          '-'
        ),
        after: val.after ? (
          <img
            src={val.after}
            alt={i18next.t('更改后')}
            style={{ width: '100px', height: '100px' }}
          />
        ) : (
          '-'
        ),
      }
    },
  },
  is_weigh: {
    fieldName: i18next.t('是否称重'),
    type: 'func',
    handler({ val }) {
      const isWeigh = {
        true: i18next.t('是'),
        false: i18next.t('否'),
      }
      return {
        fieldName: this.fieldName,
        before: isWeigh[val.before] || '-',
        after: isWeigh[val.after] || '-',
      }
    },
  },
  state: {
    fieldName: i18next.t('销售状态'),
    type: 'func',
    handler({ val }) {
      const saleState = [i18next.t('下架'), i18next.t('上架')]
      return {
        fieldName: this.fieldName,
        before: saleState[val.before] || '-',
        after: saleState[val.after] || '-',
      }
    },
  },
  purchase_supplier_id_name: { fieldName: i18next.t('供应商'), type: 'str' },
  purchase_spec_name: { fieldName: i18next.t('采购规格'), type: 'str' },
  attrition_rate: {
    fieldName: i18next.t('耗损比例'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: !_.isNil(val.before) ? `${val.before}%` : '-',
        after: !_.isNil(val.after) ? `${val.after}%` : '-',
      }
    },
  },
  stock_type: {
    fieldName: i18next.t('库存设置'),
    type: 'func',
    handler({ val, modifyObj }) {
      const text = (val, type) =>
        val[type] === 2 ? `(${modifyObj.stocks[type]})` : ''
      return {
        fieldName: this.fieldName,
        before: stockState(val.before) + text(val, 'before'),
        after: stockState(val.after) + text(val, 'after'),
      }
    },
  },
  spu_remark: { fieldName: i18next.t('备注'), type: 'str' },
  split_flag: {
    fieldName: i18next.t('分拣设置'),
    type: 'func',
    handler({ val }) {
      const splitType = {
        '0': i18next.t('不分切不投筐'),
        '1': i18next.t('能投筐,不分切'),
        '2': i18next.t('能分切,不投筐'),
        '3': i18next.t('能投筐能分切'),
      }
      return {
        fieldName: this.fieldName,
        before: splitType[val.before] || '-',
        after: splitType[val.after] || '-',
      }
    },
  },
  is_price_timing: {
    fieldName: i18next.t('是否时价'),
    type: 'func',
    handler({ val }) {
      const isPriceTiming = {
        true: i18next.t('时价'),
        false: i18next.t('非时价'),
      }
      return {
        fieldName: this.fieldName,
        before: isPriceTiming[val.before] || '-',
        after: isPriceTiming[val.after] || '-',
      }
    },
  },
  suggest_price_min: {
    fieldName: i18next.t('建议价格区间'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: suggestPrice(val.before, modifyObj.suggest_price_max.before),
        after: suggestPrice(val.after, modifyObj.suggest_price_max.after),
      }
    },
  },
  formula_status: {
    fieldName: i18next.t('是否开启定价公式'),
    type: 'func',
    handler({ val }) {
      const formula_text = (val) =>
        val === 0 ? i18next.t('关闭') : val === 1 ? i18next.t('开启') : '-'
      return {
        fieldName: this.fieldName,
        before: formula_text(val.before),
        after: formula_text(val.after),
      }
    },
  },
  formula_text: {
    fieldName: i18next.t('定价公式'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before ? renderFormulaText(val.before) : '-',
        after: val.after ? renderFormulaText(val.after) : '-',
      }
    },
  },
}

const spuMap = {
  name: {
    fieldName: i18next.t('商品名称'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before ? val.before : i18next.t('无该商品'),
        after: val.after ? val.after : i18next.t('该商品被删除'),
        bold: true,
      }
    },
  },
  category1_name: {
    fieldName: i18next.t('所属分类'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: val.before
          ? `${modifyObj.category1_name.before}/${
              modifyObj.category2_name.before
            }/${modifyObj.pinlei_id_name.before || ''}`
          : '-',
        after: val.after
          ? `${modifyObj.category1_name.after}/${
              modifyObj.category2_name.after
            }/${modifyObj.pinlei_id_name.after || ''}`
          : '-',
      }
    },
  },
  customize_code: {
    fieldName: i18next.t('自定义编码'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before ? val.before : '-',
        after: val.after ? val.after : '-',
      }
    },
  },
  alias: { fieldName: i18next.t('别名'), type: 'str' },
  image: {
    fieldName: i18next.t('商品图片'),
    type: 'func',
    handler({ val }) {
      if (val.before === val.after) {
        return null
      }
      return {
        fieldName: this.fieldName,
        before: val.before ? (
          <img
            src={val.before}
            alt={i18next.t('更改前')}
            style={{ width: '100px', height: '100px' }}
          />
        ) : (
          '-'
        ),
        after: val.after ? (
          <img
            src={val.after}
            alt={i18next.t('更改后')}
            style={{ width: '100px', height: '100px' }}
          />
        ) : (
          '-'
        ),
      }
    },
  },
  detail_images: {
    fieldName: i18next.t('商品详情'),
    type: 'func',
    handler({ val: value }) {
      const val = Array.isArray(value) ? value[0] : value
      if (val.before === val.after) {
        return null
      }
      return {
        fieldName: this.fieldName,
        before: val.before ? (
          <img
            src={val.before}
            alt={i18next.t('更改前')}
            style={{ width: '100px', height: '100px' }}
          />
        ) : (
          '-'
        ),
        after: val.after ? (
          <img
            src={val.after}
            alt={i18next.t('更改后')}
            style={{ width: '100px', height: '100px' }}
          />
        ) : (
          '-'
        ),
      }
    },
  },
  need_pesticide_detect: {
    fieldName: i18next.t('是否显示检测报告'),
    type: 'func',
    handler({ val }) {
      const need_pesticide_detect = {
        true: i18next.t('显示'),
        false: i18next.t('不显示'),
      }
      return {
        fieldName: this.fieldName,
        before: need_pesticide_detect[val.before] || '-',
        after: need_pesticide_detect[val.after] || '-',
      }
    },
  },
  p_type: {
    fieldName: i18next.t('商品类型'),
    type: 'func',
    handler({ val }) {
      const p_type = {
        '0': i18next.t('通用'),
        '1': i18next.t('本站'),
      }
      return {
        fieldName: this.fieldName,
        before: p_type[val.before] || '-',
        after: p_type[val.after] || '-',
      }
    },
  },
  desc: { fieldName: i18next.t('描述'), type: 'str' },
  std_unit_name_forsale: { fieldName: i18next.t('基本单位'), type: 'str' },
  suggest_price_min: {
    fieldName: i18next.t('建议价格区间'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: suggestPrice(val.before, modifyObj.suggest_price_max.before),
        after: suggestPrice(val.after, modifyObj.suggest_price_max.after),
      }
    },
  },
  is_price_timing: {
    fieldName: i18next.t('是否时价'),
    type: 'func',
    handler({ val }) {
      const isPriceTiming = {
        true: i18next.t('时价'),
        false: i18next.t('非时价'),
      }
      return {
        fieldName: this.fieldName,
        before: isPriceTiming[val.before] || '-',
        after: isPriceTiming[val.after] || '-',
      }
    },
  },
}

const weightMap = {
  is_weigh: {
    fieldName: i18next.t('称重'),
    type: 'func',
    handler({ val, modifyObj }) {
      const isWeigh = {
        '1': i18next.t('已称重'),
        '0': i18next.t('未称重'),
      }
      const label =
        val.before > val.after ? i18next.t('取消称重') : i18next.t('称重')
      return {
        fieldName: this.fieldName,
        label: label,
        before: (() => {
          let result = `${isWeigh[val.before]}(${i18next.t(
            '出库数',
          )}：${parseFloat(Big(modifyObj.real_quantity.before).toFixed(2))}${
            modifyObj.std_unit_name_forsale.before
          }`
          if (modifyObj.sale_unit_weighting_quantity) {
            result += `；${parseFloat(
              Big(modifyObj.sale_unit_weighting_quantity.before).toFixed(2),
            )}${modifyObj.sale_unit_name.before}`
          }
          result += ')'
          return result
        })(),
        after: (() => {
          let result = `${isWeigh[val.after]}(${i18next.t(
            '出库数',
          )}:${parseFloat(Big(modifyObj.real_quantity.after).toFixed(2))}${
            modifyObj.std_unit_name_forsale.after
          }`
          if (modifyObj.sale_unit_weighting_quantity) {
            result += `；${parseFloat(
              Big(modifyObj.sale_unit_weighting_quantity.after).toFixed(2),
            )}${modifyObj.sale_unit_name.after}`
          }
          result += ')'
          return result
        })(),
      }
    },
  },
  out_of_stock: {
    fieldName: i18next.t('缺货'),
    type: 'func',
    handler({ val }) {
      const isOutOfStock = {
        true: i18next.t('缺货'),
        false: i18next.t('不缺货'),
      }
      const label = val.before ? i18next.t('取消缺货') : i18next.t('缺货')
      return {
        fieldName: this.fieldName,
        label: label,
        before: isOutOfStock[val.before] || '-',
        after: isOutOfStock[val.after] || '-',
      }
    },
  },
  is_print: {
    fieldName: i18next.t('打印'),
    type: 'func',
    handler({ val, modifyObj }) {
      const isPrint = {
        true: i18next.t('已打印'),
        false: i18next.t('未打印'),
      }
      return {
        fieldName: this.fieldName,
        label: i18next.t('打印'),
        before:
          `${isPrint[val.before]}(${i18next.t('打印数')}:${
            modifyObj.print_quantity.before
          }${modifyObj.std_unit_name_forsale.before})` || '-',
        after:
          `${isPrint[val.after]}(${i18next.t('打印数')}:${
            modifyObj.print_quantity.after
          }${modifyObj.std_unit_name_forsale.after}(${i18next.t('最近')}))` ||
          '-',
      }
    },
  },
  sale_unit_weighting_quantity: {
    fieldName: i18next.t('销售单位称重'),
    type: 'func',
    handler({ _, modifyObj }) {
      const isWeight = (obj, tag) => {
        if (!obj) {
          return ''
        }
        return { 0: i18next.t('未称重'), 1: i18next.t('已称重') }[obj[tag]]
      }
      const label = i18next.t('销售单位称重')
      return {
        fieldName: this.fieldName,
        label,
        before: (() => {
          let result = `${isWeight(modifyObj.is_weigh, 'before')}(${i18next.t(
            '出库数',
          )}：`
          if (modifyObj.real_quantity) {
            result += `${parseFloat(
              Big(modifyObj.real_quantity.before).toFixed(2),
            )}${modifyObj.std_unit_name_forsale.after}；`
          }
          result += `${parseFloat(
            Big(modifyObj.sale_unit_weighting_quantity.before).toFixed(2),
          )}${modifyObj.sale_unit_name.before})`
          return result
        })(),
        after: (() => {
          let result = `${isWeight(modifyObj.is_weigh, 'after')}(`
          if (modifyObj.real_quantity) {
            result += `${parseFloat(
              Big(modifyObj.real_quantity.after).toFixed(2),
            )}${modifyObj.std_unit_name_forsale.after}；`
          }
          result += `${parseFloat(
            Big(modifyObj.sale_unit_weighting_quantity.after).toFixed(2),
          )}${modifyObj.sale_unit_name.after})`
          return result
        })(),
      }
    },
  },
  sorting_tag: {
    fieldName: i18next.t('标记'),
    type: 'func',
    handler({ val }) {
      const isMark = {
        true: i18next.t('已标记'),
        false: i18next.t('未标记'),
      }

      const label = val.before ? i18next.t('取消标记') : i18next.t('标记')
      return {
        fieldName: this.fieldName,
        label: label,
        before: isMark[val.before] || '-',
        after: isMark[val.after] || '-',
      }
    },
  },
}
// log_type 5  锁价详情
const lockMap = {
  name: {
    fieldName: i18next.t('锁价规则名称'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before || '-',
        after: val.after || '-',
      }
    },
  },
  status: {
    fieldName: i18next.t('状态'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: _.isNil(val.before) ? '-' : lockState(val.before),
        after: _.isNil(val.after) ? '-' : lockState(val.after),
      }
    },
  },
  begin: {
    fieldName: i18next.t('起止时间'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: val.before
          ? modifyObj.begin.before + '至' + modifyObj.end.before
          : '-',
        after: val.after
          ? modifyObj.begin.after + '至' + modifyObj.end.after
          : '-',
      }
    },
  },
  salemenu_id: {
    fieldName: i18next.t('报价单编号'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before,
        after: val.after,
      }
    },
  },
  salemenu_name: {
    fieldName: i18next.t('报价单名称'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before,
        after: val.after,
      }
    },
  },
  type: {
    fieldName: i18next.t('类型'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: typeState(val.before),
        after: typeState(val.after),
      }
    },
  },
  // addresses
  address_name: {
    fieldName: i18next.t('商户'),
    type: 'func',
    handler({ val, modifyObj, type }) {
      const isStaion_before = type.before
      const isStaion_after = type.after
      if (isStaion_before === 'station' || isStaion_after === 'station') {
        return {
          fieldName: i18next.t('站点'),
          before: val.before
            ? `${modifyObj.address_id.before}  ${modifyObj.address_name.before}`
            : i18next.t('无该站点'),
          after: val.after
            ? `${modifyObj.address_id.after}  ${modifyObj.address_name.after}`
            : i18next.t('该站点被删除'),
        }
      } else {
        return {
          fieldName: this.fieldName,
          before: val.before
            ? `${convertNumber2Sid(
                modifyObj.address_id.before,
              )}  ${convertNumber2Sid(modifyObj.address_name.before)}`
            : i18next.t('无该商户'),
          after: val.after
            ? `${convertNumber2Sid(
                modifyObj.address_id.after,
              )}  ${convertNumber2Sid(modifyObj.address_name.after)}`
            : i18next.t('该商户被删除'),
        }
      }
    },
  },
  // categories
  category_2_id: {
    fieldName: i18next.t('分类ID'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before ? val.before : '-',
        after: val.after ? val.after : '-',
      }
    },
  },
  category_1_name: {
    fieldName: i18next.t('分类名'),
    type: 'func',
    handler({ val, modifyObj }) {
      return {
        fieldName: this.fieldName,
        before: val.before
          ? `${val.before}/${modifyObj.category_2_name.before}`
          : '-',
        after: val.after
          ? `${val.after}/${modifyObj.category_2_name.after}`
          : '-',
      }
    },
  },
  category_rule_type: {
    fieldName: i18next.t('计算规则'),
    type: 'func',
    handler({ val, modifyObj }) {
      const price = modifyObj.category_yx_price || {}
      return {
        fieldName: this.fieldName,
        before: val.before
          ? ruleState(val.before) +
            '\xa0\xa0\xa0' +
            moneyLock(price.before) +
            doller(val.before, val.after)[0]
          : '无该商品',
        after: val.after
          ? ruleState(val.after) +
            '\xa0\xa0\xa0' +
            moneyLock(price.after) +
            doller(val.before, val.after)[1]
          : '无该商品',
      }
    },
  },
  // skus
  sku_rule_type: {
    fieldName: i18next.t('计算规则'),
    type: 'func',
    handler({ val, modifyObj, fee_type }) {
      const sale_name = modifyObj.sale_unit_name || {}
      const price = modifyObj.sku_yx_price || {}
      return {
        fieldName: this.fieldName,
        before:
          val.before === 2
            ? !_.isNil(val.before)
              ? ruleState(val.before) + '\xa0\xa0\xa0' + moneyLock(price.before)
              : '无该商品'
            : !_.isNil(val.before)
            ? ruleState(val.before) +
              '\xa0\xa0\xa0' +
              moneyLock(price.before) +
              Price.getUnit(fee_type) +
              '/' +
              sale_name.before
            : '无该商品',
        after:
          val.after === 2
            ? !_.isNil(val.after)
              ? ruleState(val.after) + '\xa0\xa0\xa0' + moneyLock(price.after)
              : '无该商品'
            : !_.isNil(val.after)
            ? ruleState(val.after) +
              '\xa0\xa0\xa0' +
              moneyLock(price.after) +
              Price.getUnit(fee_type) +
              '/' +
              sale_name.after
            : '无该商品',
      }
    },
  },
}

// log_type 7 采购日志详情
const purchaseMap = {
  has_service_time: {
    fieldName: i18next.t('关联周期'),
    type: 'func',
    handler({ val }) {
      const isNull = val.after === null
      let _after = null

      if (isNull) {
        _after = '-'
      } else {
        _after = val.after ? i18next.t('是') : i18next.t('否')
      }

      return {
        fieldName: this.fieldName,
        before: val.before === null ? '-' : val.before ? '是' : '-',
        after: _after,
      }
    },
  },
  service_time: {
    fieldName: i18next.t('运营周期'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: isNullOrVoidStr(val.before) ? '-' : val.before,
        after: isNullOrVoidStr(val.after) ? '-' : val.after,
      }
    },
  },
  sku_name: {
    fieldName: i18next.t('采购商品'),
    type: 'func',
    handler({ val }) {
      const _before = val.before === null ? '-' : val.before
      const _after = val.after === null ? i18next.t('已删除') : val.after

      return {
        fieldName: this.fieldName,
        before: _before,
        after: _after,
      }
    },
  },
  std_unit_name_forsale: {
    fieldName: i18next.t('基本单位'),
    type: 'str',
  },
  settle_supplier_name: {
    fieldName: i18next.t('供应商'),
    type: 'func',
    handler({ val }) {
      const _before = val.before === null ? '-' : val.before
      const _after = val.after === null ? '-' : val.after

      return {
        fieldName: this.fieldName,
        before: _before,
        after: _after,
      }
    },
  },
  plan_amount: {
    fieldName: i18next.t('采购量'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === null ? '-' : val.before,
        after: val.after === null ? '-' : val.after,
      }
    },
  },
  purchaser: {
    fieldName: i18next.t('采购员'),
    type: 'func',
    handler({ val }) {
      const _before = val.before === null ? '-' : val.before
      const _after = val.after === null ? '-' : val.after

      return {
        fieldName: this.fieldName,
        before: _before,
        after: _after,
      }
    },
  },
  purchase_sheet_num: {
    fieldName: i18next.t('生成采购单据'),
    type: 'func',
    handler({ val }) {
      const _before = val.before || 0
      const _after = val.after || 0
      return {
        fieldName: this.fieldName,
        before: i18next.t('publish_amount', {
          VAR1: _before,
        }),
        after: i18next.t('publish_amount', {
          VAR1: _after,
        }),
      }
    },
  },
  order_id: {
    fieldName: i18next.t('订单号'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === 0 ? '-' : val.before,
        after: val.after === null ? '-' : val.after,
      }
    },
  },
  purchase_spec: {
    fieldName: i18next.t('采购规格'),
    type: 'func',
    handler({ val, modifyObj }) {
      return getPurchaseSpec(modifyObj)
    },
  },
  status: {
    fieldName: i18next.t('状态'),
    type: 'func',
    handler({ val }) {
      const before = val.before
      const after = val.after
      let _before = '-'
      let _after = '-'

      if (before === 1) {
        _before = i18next.t('未发布')
      } else if (before === 2) {
        _before = i18next.t('已发布')
      }

      if (after === 2) {
        _after = i18next.t('已发布')
      } else if (after === 3) {
        _after = i18next.t('已完成')
      }

      return {
        fieldName: this.fieldName,
        before: _before,
        after: _after,
      }
    },
  },
  remark: {
    fieldName: i18next.t('备注'),
    type: 'str',
  },
}

// log_type 8 分类日志详情
const sortMap = {
  pinlei_name: {
    fieldName: i18next.t('分类名称'),
    type: 'func',
    handler({ val }) {
      const _before = val.before === null ? '-' : val.before
      const _after = val.after === null ? i18next.t('该分类已删除') : val.after
      return {
        fieldName: this.fieldName,
        before: _before,
        after: _after,
      }
    },
  },
  category2_name: {
    fieldName: i18next.t('分类名称'),
    type: 'func',
    handler({ val }) {
      const _before = val.before === null ? '-' : val.before
      const _after = val.after === null ? i18next.t('该分类已删除') : val.after
      return {
        fieldName: this.fieldName,
        before: _before,
        after: _after,
      }
    },
  },
  category1_name: {
    fieldName: i18next.t('分类名称'),
    type: 'func',
    handler({ val }) {
      const _before = val.before === null ? '-' : val.before
      const _after = val.after === null ? i18next.t('该分类已删除') : val.after
      return {
        fieldName: this.fieldName,
        before: _before,
        after: _after,
      }
    },
  },
  belong_cat: {
    fieldName: i18next.t('所属分类'),
    type: 'func',
    catType: {
      '1': '一级分类',
      '2': '二级分类',
      '3': '品类',
    },
    handler({ val, modifyObj }) {
      const _cat_type_before = modifyObj?.detail_cat_type?.before
      const _cat_type_after = modifyObj?.detail_cat_type?.after
      const _cat_type = _cat_type_before || _cat_type_after
      let _before_content = '-'
      let _after_content = '-'
      // 删除和编辑的情况
      if (_cat_type_before) {
        const _category1_name_before =
          val?.category1_name?.before || modifyObj.category1_name.before
        const _category2_name_before =
          val?.category2_name?.before || modifyObj?.category2_name?.before || ''
        _before_content = `${
          this.catType[_cat_type_before]
        }：${_category1_name_before}${
          _cat_type >= 2 ? '/' + _category2_name_before : _category2_name_before
        }${_cat_type === 3 ? '/' + modifyObj.pinlei_name.before : ''}`
      }
      // 新建和编辑的情况
      if (_cat_type_after) {
        const _category1_name_after =
          val?.category1_name?.after || modifyObj.category1_name.after
        const _category2_name_after =
          val?.category2_name?.after || modifyObj?.category2_name?.after || ''
        _after_content = `${
          this.catType[_cat_type_after]
        }：${_category1_name_after}${
          _cat_type >= 2 ? '/' + _category2_name_after : _category2_name_after
        }${_cat_type === 3 ? '/' + modifyObj.pinlei_name.after : ''}`
      }
      return {
        fieldName: this.fieldName,
        before: _before_content,
        after: _after_content,
      }
    },
  },
  cat_name: {
    fieldName: i18next.t('列表分类名称'),
    type: 'func',
    handler({ val }) {
      const _before = val.before === null ? '-' : val.before
      const _after = val.after === null ? i18next.t('该分类已删除') : val.after

      return {
        fieldName: this.fieldName,
        before: _before,
        after: _after,
      }
    },
  },
  list_cat_type: {
    fieldName: i18next.t('列表分类级别'),
    type: 'str',
  },
}

// log_type 采购入库日志详情
const storageMap = {
  in_stock_time: {
    fieldName: i18next.t('入库时间'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  remark: {
    fieldName: i18next.t('入库单备注'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  status: {
    fieldName: i18next.t('入库单状态'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  spec_id: {
    fieldName: i18next.t('商品ID'),
    type: 'str',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '无该商品' : `${val.before}`,
        after: val.after ? val.after : i18next.t('商品已被删除'),
      }
    },
  },
  spec_name: {
    fieldName: i18next.t('商品名称(ID)'),
    type: 'func',
    handler(param) {
      const { val, modifyObj } = param
      return {
        fieldName: this.fieldName,
        before:
          val.before === '-'
            ? '无该商品'
            : `${val.before}(${modifyObj?.spec_id?.before})`,
        after: `${val.after}(${modifyObj?.spec_id?.after})`
          ? `${val.after}(${modifyObj?.spec_id?.after})`
          : i18next.t('商品已被删除'),
      }
    },
  },
  tare_quantity: {
    fieldName: i18next.t('皮重'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  quantity: {
    fieldName: i18next.t('入库数(基本单位)'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  unit_price: {
    fieldName: i18next.t('入库单价(基本单位)'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after || val.after === 0 ? val.after : '-',
      }
    },
  },
  purchase_unit_quantity: {
    fieldName: i18next.t('入库数(包装单位)'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  purchase_unit_price: {
    fieldName: i18next.t('入库单价(包装单位)'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after || val.after === 0 ? val.after : '-',
      }
    },
  },
  money: {
    fieldName: i18next.t('入库金额'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after || val.after === 0 ? val.after : '-',
      }
    },
  },
  production_time: {
    fieldName: i18next.t('生产日期'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  life_time: {
    fieldName: i18next.t('保质截止日期'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  shelf: {
    fieldName: i18next.t('货位'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  is_arrival: {
    fieldName: i18next.t('是否到货'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  changed_spec_name: {
    fieldName: i18next.t('商品规格2'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  // 备注
  pur_spec_remark: {
    fieldName: i18next.t('商品备注'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  // 分摊
  share_reason: {
    fieldName: i18next.t('分摊原因'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  share_method: {
    fieldName: i18next.t('分摊方式'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  share_money: {
    fieldName: i18next.t('分摊金额'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  share_action: {
    fieldName: i18next.t('分摊类型'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  share_in_sku_logs: {
    fieldName: i18next.t('分摊商品'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before:
          val.before === '-' ? (
            '-'
          ) : (
            <Popover
              showArrow
              type='hover'
              left
              bottom
              style={{
                marginLeft: '-3px',
                marginTop: '3px',
                fontSize: '12px',
                padding: '5px',
              }}
              popup={val.before}
            >
              <span style={{ cursor: 'pointer' }}>
                {val.before.split('，')[0]}...
              </span>
            </Popover>
          ),
        after:
          val.after === '-' ? (
            '-'
          ) : (
            <Popover
              showArrow
              type='hover'
              left
              bottom
              style={{
                marginLeft: '-3px',
                marginTop: '3px',
                fontSize: '12px',
                padding: '5px',
              }}
              popup={val.after}
            >
              <span style={{ cursor: 'pointer' }}>
                {val.after.split('，')[0]}...
              </span>
            </Popover>
          ),
      }
    },
  },
  // 折让
  discount_reason: {
    fieldName: i18next.t('折让原因'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  discount_action: {
    fieldName: i18next.t('折让类型'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  discount_money: {
    fieldName: i18next.t('金额'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
  discount_remark: {
    fieldName: i18next.t('备注'),
    type: 'func',
    handler({ val }) {
      return {
        fieldName: this.fieldName,
        before: val.before === '-' ? '-' : val.before,
        after: val.after ? val.after : '-',
      }
    },
  },
}

const generateUIList = ({
  modifyObj,
  log_type,
  type,
  fee_type,
  op_type,
  customizedList = [],
}) => {
  let dataMap
  switch (+log_type) {
    case 1: // 订单
      dataMap = detailsMap
      break
    case 2: // sku
      dataMap = skuMap
      break
    case 3: // spu
      dataMap = spuMap
      break
    case 4: // 分拣
      dataMap = weightMap
      break
    case 5: // 锁价
      dataMap = lockMap
      break
    case 7: // 采购
      dataMap = purchaseMap
      break
    case 8: // 分类
      dataMap = sortMap
      break
    case 9: // 入库日志
      dataMap = storageMap
      break
  }
  // val = {before:xx, after: xxx}, key = 字段key
  const list = _.map(modifyObj, (val, key) => {
    const item = dataMap[key]
    if (!item) {
      return null
    }

    if (item.type === 'str') {
      return { fieldName: item.fieldName, before: val.before, after: val.after }
    } else {
      return item.handler({ val, modifyObj, type, fee_type, customizedList })
    }
  })
  // 采购任务数据只过滤 null
  let listAfterFilter = null
  if (+log_type === 7 || log_type === 8) {
    listAfterFilter = _.filter(list, (obj) => {
      return obj !== null
    })
  } else {
    // 过滤修改字段
    listAfterFilter = _.filter(list, (obj) => {
      return obj && obj.before !== obj.after
    })
  }

  if (op_type === 14) {
    listAfterFilter = _.filter(
      listAfterFilter,
      (obj) => obj.fieldName === i18next.t('销售单位称重'),
    )
  } else if (op_type === 4 || op_type === 5) {
    listAfterFilter = _.filter(
      listAfterFilter,
      (obj) => obj.fieldName === i18next.t('称重'),
    )
  }

  // 名称排在第一的位置
  return _.sortBy(listAfterFilter, [
    (item) =>
      ![
        i18next.t('商品名称(ID)'),
        i18next.t('规格名称'),
        i18next.t('商品名称'),
        i18next.t('分类名称'),
      ].includes(item.fieldName),
    (item) =>
      ![
        i18next.t('单价(基本单位)'),
        i18next.t('单价(销售单位)'),
        i18next.t('销售规格'),
        i18next.t('销售单位'),
      ].includes(item.fieldName),
    (item) =>
      ![i18next.t('供应商'), i18next.t('采购规格')].includes(item.fieldName),
  ])
}
export { generateUIList }
