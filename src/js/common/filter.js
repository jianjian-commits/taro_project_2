import React from 'react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import {
  purchaseSheetStatus,
  REQUIRE_GOODS_APPLY_STATUS,
  PURCHASE_TASK_STATUS,
  RECEIVE_WAYS,
  purchaseSheetSource,
} from './enum'
import { Price } from '@gmfe/react'
import { SvgPriceRule } from 'gm-svg'
import Big from 'big.js'
import moment from 'moment'
import TextTip from 'common/components/text_tip'
import globalStore from 'stores/global'

// 过滤服务，参考ng
// 数据 -》 view

const money = (value, precision = 2) => {
  if (!value) {
    return value
  }
  const result = Big(value || 0)
    .div(100)
    .toFixed(precision)
  const left = result.split('.')[0]
  const right = result.split('.')[1]

  if (right === '00') {
    return left
  } else {
    return result
  }
}

const moneyLock = (value, precision = 3) => {
  if (!value) {
    return value
  }
  const result = Big(value || 0)
    .div(100)
    .toFixed(precision)
  const left = result.split('.')[0]
  const right = result.split('.')[1]

  if (right === '000') {
    return left
  } else {
    return result
  }
}

/**
 * -1-订单已删除, 1-等待出库, 5-分拣中, 10-配送中, 15-已签收,
 * 100-已支付(先款后货版本后废弃100), 改为用paystatus
 */
const orderState = (status) => {
  switch (status + '') {
    case '1':
      return i18next.t('等待分拣')
    case '5':
      return i18next.t('分拣中')
    case '10':
      return i18next.t('配送中')
    case '15':
      return i18next.t('已签收')
    case '-1':
      return i18next.t('已删除')

    default:
      return ''
  }
}

const lockState = (status) => {
  switch (status + '') {
    case '0':
      return i18next.t('关闭')
    case '1':
      return i18next.t('无效')
    case '2':
      return i18next.t('未开始')
    case '3':
      return i18next.t('有效')

    default:
      return ''
  }
}
// 锁价类型  面向商户 面向站点
const typeState = (status) => {
  switch (status) {
    case 'station':
      return i18next.t('面向站点的锁价')
    case 'customer':
      return i18next.t('面向商户的锁价')

    default:
      return ''
  }
}
// 锁价规则
const ruleState = (status) => {
  switch (status + '') {
    case '0':
      return i18next.t('固定')
    case '1':
      return i18next.t('加')
    case '2':
      return i18next.t('乘')

    default:
      return ''
  }
}
const payState = (status) => {
  switch (status + '') {
    case '1':
      return i18next.t('未支付')
    case '5':
      return i18next.t('部分支付')
    case '10':
      return i18next.t('已支付')
    case '15':
      return i18next.t('超时关闭')
    default:
      return ''
  }
}

const orderStateIcon = (status) => {
  switch (status + '') {
    case '1':
      return 'glyphicon-time'
    case '5':
      return 'glyphicon-inbox'
    case '10':
      return 'glyphicon-inbox'
    case '15':
      return 'glyphicon-inbox'
    case '100':
      return 'glyphicon-inbox'
    case '-1':
      return 'glyphicon-inbox'
    default:
      return ''
  }
}

const processStatus = (status) => {
  switch (status) {
    case 1:
      return i18next.t('待处理')
    case 2:
      return i18next.t('已添加')
    case 3:
      return i18next.t('已拒绝')
  }
}

const convertSid2Number = (KID) => {
  const reg = /^s?0*/i
  return _.parseInt(KID.replace(reg, ''))
}

// 12 -> S000012 1232131 ->S1232131  不足6位补足
const convertNumber2Sid = (id) => {
  if (id === '0') {
    return '-'
  }
  if (/^\d+$/.test(id)) {
    id = parseInt(id, 10)
    if (id > 1000000) {
      return 'S' + id
    } else {
      return 'S' + (1000000 + id + '').slice(1)
    }
  } else {
    return id
  }
}

const purchaseSheetMap = {}
_.each(purchaseSheetStatus, (value) => {
  purchaseSheetMap[value.value] = value.name
})

// 采购单状态
const getPurchaseSheetStatus = (status) => {
  return purchaseSheetMap[status] || ''
}

const purchaseSheetSourceMap = {}
_.each(purchaseSheetSource, (value) => {
  purchaseSheetSourceMap[value.value] = value.name
})

const getPurchaseSheetSource = (status) => {
  return purchaseSheetSourceMap[status] || ''
}

const requireGoodsStatusMap = {}
_.each(REQUIRE_GOODS_APPLY_STATUS, (value) => {
  requireGoodsStatusMap[value.value] = value.name
})

// 要货单据状态
const getRequireGoodsStatus = (status) => {
  return requireGoodsStatusMap[status] || ''
}

const serviceTime = {
  // 翻译时间跨度
  dayName: (span) => {
    returnDateByFlag(span) || i18next.t('未知')
  },
  // 下单时间
  orderTimeLimit: (order_time_limit) => {
    return i18next.t('KEY2', {
      VAR1: order_time_limit.start,
      VAR2: serviceTime.dayName(order_time_limit.e_span_time),
      VAR3: order_time_limit.end,
    })
  },
  // 配送时间
  receiveTimeLimit: (receive_time_limit) => {
    return (
      serviceTime.dayName(receive_time_limit.s_span_time) +
      receive_time_limit.start +
      '~' +
      serviceTime.dayName(receive_time_limit.e_span_time) +
      receive_time_limit.end
    )
  },
  // 最晚出库时间
  finalDistributeTime: (final_distribute_time, final_distribute_time_span) => {
    return (
      serviceTime.dayName(final_distribute_time_span) + final_distribute_time
    )
  },
  // 整合，直接给整条数据来即可
  withData: (data) => {
    return {
      orderTimeLimit: serviceTime.orderTimeLimit(data.order_time_limit),
      receiveTimeLimit: serviceTime.receiveTimeLimit(data.receive_time_limit),
      finalDistributeTime: serviceTime.finalDistributeTime(
        data.final_distribute_time,
        data.final_distribute_time_span,
      ),
    }
  },
}

const cycleRenderInputValue = (
  time_config,
  isChangeCal,
  begin_time,
  end_time,
) => {
  if (!time_config) {
    return ''
  }
  // 非预售
  if (time_config.type !== 2) {
    return i18next.t('KEY3', {
      VAR1: moment(begin_time).format('MM月DD日'),
      VAR2: isChangeCal
        ? renderIsEndOfDay(begin_time)
        : time_config.order_time_limit.start,
      VAR3: isChangeCal
        ? moment(end_time).format('MM月DD日')
        : moment(begin_time)
            .add('d', time_config.order_time_limit.e_span_time)
            .format('MM月DD日'),
      VAR4: isChangeCal
        ? renderIsEndOfDay(end_time)
        : time_config.order_time_limit.end,
    })
    /* src:`${moment(date).format('MM月DD日')}${time_config.order_time_limit.start}~${moment(date).add('d', time_config.order_time_limit.e_span_time).format('MM月DD日')}${time_config.order_time_limit.end}下单` => tpl:${VAR1}${VAR2}~${VAR3}${VAR4}下单 */
  }
  const { receiveEndSpan, start, end } = time_config.receive_time_limit
  // 预售不跨天
  if (receiveEndSpan === 0) {
    return i18next.t('KEY4', {
      VAR1: moment(begin_time).format('MM月DD日'),
      VAR2: isChangeCal ? renderIsEndOfDay(begin_time) : start,
      VAR3: moment(begin_time).format('MM月DD日'),
      VAR4: isChangeCal ? renderIsEndOfDay(end_time) : end,
    })
    /* src:`${moment(date).format('MM月DD日')}${start}~${moment(date).format('MM月DD日')}${end}收货` => tpl:${VAR1}${VAR2}~${VAR3}${VAR4}收货 */
  } else {
    return i18next.t('KEY4', {
      VAR1: moment(begin_time).format('MM月DD日'),
      VAR2: isChangeCal ? renderIsEndOfDay(begin_time) : start,
      VAR3: isChangeCal
        ? moment(end_time).format('MM月DD日')
        : moment(begin_time).add('d', 1).format('MM月DD日'),
      VAR4: isChangeCal ? renderIsEndOfDay(end_time) : end,
    })
    /* src:`${moment(date).format('MM月DD日')}${start}~${moment(date).add('d', 1).format('MM月DD日')}${end}收货` => tpl:${VAR1}${VAR2}~${VAR3}${VAR4}收货 */
  }
}

const renderIsEndOfDay = (end) => {
  const date = moment(end).format('YYYY-MM-DD')
  const theSecondDay = moment(date).add(1, 'd')
  const addOneMoreMs = moment(end).add(1, 'ms')
  if (addOneMoreMs.isSame(theSecondDay)) {
    return '24:00'
  } else {
    return moment(end).format('HH:mm')
  }
}

const cycleDateRangePickerInputValue = (date, time_config) => {
  // 运营周期单个选时间
  return cycleRenderInputValue(time_config, false, date, date)
}

const cycleDateRangePickerInputValueV2 = (
  begin_time,
  end_time,
  time_config,
  isChangeCal,
) => {
  return cycleRenderInputValue(time_config, isChangeCal, begin_time, end_time)
}

/**
 * 库存
 */
const stockState = (status) => {
  switch (status) {
    case 0:
      return i18next.t('读取上游库存')
    case 1:
      return i18next.t('不限库存')
    case 2:
      return i18next.t('设置固定库存')
    case 3:
      return i18next.t('限制库存')

    default:
      return '-'
  }
}

const purchaseTaskStatus = (status) => {
  const s = _.find(PURCHASE_TASK_STATUS, (st) => st.value === status)
  return s ? s.name : ''
}
/* i18n-scan-disable */
const coverDigit2Uppercase = (n) => {
  const fraction = ['角', '分']
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ]
  const head = n < 0 ? '欠' : ''

  n = Math.abs(n)

  let left = ''
  let right = ''
  for (var i = 0; i < fraction.length; i++) {
    right +=
      digit[
        Math.floor(
          Big(n)
            .times(Big(10).pow(i + 1))
            .mod(10)
            .toString(),
        )
      ] + fraction[i]
  }

  right = right.replace(/(零分)/, '').replace(/(零角)/, '零')
  right = right === '零' ? '整' : right
  right = /角$/.test(right) ? right + '整' : right

  n = Math.floor(n)

  for (i = 0; i < unit[0].length && n > 0; i++) {
    var p = ''
    for (var j = 0; j < unit[1].length && n > 0; j++) {
      p = digit[n % 10] + unit[1][j] + p
      n = Math.floor(n / 10)
    }
    left = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + left
  }

  return (
    head +
    (left.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零') + right).replace(
      /^整$/,
      '零元整',
    )
  )
}

/*
 * 1斤/斤 => 按斤
 */
const renderPurchaseSpec = (data) => {
  if (!data.std_unit || !data.ratio) return '-'
  const spec = `${data.ratio}${data.std_unit}/${data.purchase_unit}`
  // 1斤/斤 显示为 按斤
  return /^1(.+)\/\1$/.test(spec) ? `按${data.std_unit}` : spec
}

/*
 *  商品: 1斤/斤 => 按斤
 */
const renderSkuSpec = (data) => {
  if (!data.std_unit_name || !data.sale_ratio) return '-'
  const spec = `${data.sale_ratio}${data.std_unit_name}/${data.sale_unit_name}`
  // 1斤/斤 显示为 按斤
  return /^1(.+)\/\1$/.test(spec) ? `按${data.std_unit_name}` : spec
}

//  商品类型
const remarkType = (type) => {
  switch (type + '') {
    case '1':
      return i18next.t('原料')
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
      return i18next.t('净菜')
    case '7':
      return i18next.t('毛菜')
    default:
      return ''
  }
}

// 任务状态
const taskStatus = (statu) => {
  switch (statu + '') {
    case '1':
      return i18next.t('未发布')
    case '2':
      return i18next.t('已发布')
    default:
      return ''
  }
}

// 签收方式
const getSignWay = (n) => {
  switch (+n) {
    case 1:
      return i18next.t('司机签收')
    case 2:
      return i18next.t('客户签收')
    case 3:
      return i18next.t('代客签收')
    case 4:
      return i18next.t('系统签收')
    default:
      return '-'
  }
}

// 订单集包状态
const orderPackageStatus = (status) => {
  switch (status + '') {
    case '0':
      return i18next.t('未集包')
    case '1':
      return i18next.t('已集包')
    default:
      return ''
  }
}

// 商品装箱状态
const skuBoxStatus = (status) => {
  switch (status + '') {
    case '0':
      return i18next.t('未装箱')
    case '1':
      return i18next.t('已装箱')
    default:
      return ''
  }
}

const boxTypes = (type) => {
  switch (type) {
    case 0:
      return i18next.t('散件装箱')
    case 1:
      return i18next.t('整件装箱')
    default:
      return ''
  }
}

/**
 * 服务时间
 * @param flag
 * @return {string}
 */
const returnDateByFlag = (flag) => {
  const map = [
    i18next.t('当天'),
    i18next.t('第二天'),
    i18next.t('第三天'),
    i18next.t('第四天'),
    i18next.t('第五天'),
    i18next.t('第六天'),
    i18next.t('第七天'),
    i18next.t('第八天'),
    i18next.t('第九天'),
    i18next.t('第十天'),
    i18next.t('第十一天'),
    i18next.t('第十二天'),
    i18next.t('第十三天'),
    i18next.t('第十四天'),
    i18next.t('第十五天'),
    i18next.t('第十六天'),
    i18next.t('第十七天'),
    i18next.t('第十八天'),
    i18next.t('第十九天'),
    i18next.t('第二十天'),
    i18next.t('第二十一天'),
    i18next.t('第二十二天'),
    i18next.t('第二十三天'),
    i18next.t('第二十四天'),
    i18next.t('第二十五天'),
    i18next.t('第二十六天'),
    i18next.t('第二十七天'),
    i18next.t('第二十八天'),
    i18next.t('第二十九天'),
    i18next.t('第三十天'),
  ]
  return map[flag]
}

// 销售状态
const saleState = (n) => [i18next.t('下架'), i18next.t('上架')][n] || '-'

/**
 * 根据原价及现价计算变化率
 * @param {number} prevPrice 原价
 * @param {number} nextPrice 现价
 * @param {number} yxPrice
 * @param {number} ruleObjectType ruleObjectType===3时 ChangeRate取yxPrice
 */
export const getChangeRate = (
  prevPrice,
  nextPrice,
  yxPrice,
  ruleObjectType,
) => {
  if (!prevPrice || !nextPrice) return 0
  const changeRate =
    ruleObjectType === 3
      ? Big(yxPrice || 0).div(100)
      : Big(nextPrice).div(prevPrice)
  return globalStore?.orderInfo?.contract_rate_format === 1
    ? `${Big(changeRate - 1)
        .times(100)
        .toFixed(2)}%`
    : Big(changeRate).toFixed(2)
}

/**
 *  判断sku的折扣活动 price_origin 2:锁价 3:上浮率 4:整单折扣
 * @param {object} sku
 */
export const getDiscountSku = (sku) => {
  const {
    price_origin,
    lock_price,
    sale_unit_name,
    fee_type,
    before_change_price_forsale,
    sale_price,
  } = sku

  const diff_rate = Number(sale_price) - Number(before_change_price_forsale)
  const ChangeRateCell = (sku) => {
    const { sale_price, before_change_price_forsale, yx_price } = sku

    // 未填写现价或原价时 返回占位符 -
    if (!yx_price && (!sale_price || !Number(before_change_price_forsale)))
      return '-'

    const change_rate = yx_price
      ? yx_price / 100
      : Number(sale_price) / Number(before_change_price_forsale)

    return globalStore?.orderInfo?.contract_rate_format === 1
      ? `${+Big(change_rate - 1)
          .times(100)
          .toFixed(2)}%`
      : +Big(change_rate).toFixed(2)
  }
  switch (price_origin) {
    case 1:
      return undefined
    case 2:
      return (
        <TextTip
          content={
            <div className='gm-inline-block gm-bg'>
              {i18next.t('order_price_rule', {
                price: `${lock_price}${
                  Price.getUnit(fee_type) + '/'
                }${sale_unit_name}`,
              })}
            </div>
          }
        >
          <span>
            <SvgPriceRule />
          </span>
        </TextTip>
      )
    case 3:
    case 4:
      return (
        diff_rate !== 0 && (
          <TextTip
            content={
              <div className='gm-inline-block gm-bg'>
                {i18next.t('order_price_discount', {
                  text:
                    price_origin === 3
                      ? i18next.t('上浮率')
                      : i18next.t('整单折扣'),
                  change_rate: ChangeRateCell(sku),
                })}
              </div>
            }
          >
            <span>
              {diff_rate > 0 ? (
                <i
                  className='glyphicon glyphicon-arrow-up'
                  style={{ color: '#ff5454' }}
                />
              ) : (
                <i
                  className='glyphicon glyphicon-arrow-down'
                  style={{ color: '#bdea74' }}
                />
              )}
            </span>
          </TextTip>
        )
      )

    default:
      return undefined
  }
}

// 是否锁价商品
const isLockPriceSku = (price_origin) => price_origin === 2

const prioritySupplierStatus = (status) => {
  switch (status) {
    case 0:
      return i18next.t('操作成功')
    case 1:
      return i18next.t('供应商无法供商品')
    case 2:
      return i18next.t('服务器错误')
    default:
      return i18next.t('未知')
  }
}

const findReceiveWayById = (id) => {
  const target = _.find(RECEIVE_WAYS, (item) => item.value === id)
  return (target && target.name) || ''
}

/**
 * 调整单状态
 */
const adjustSheetStatus = (status) => {
  switch (status) {
    case 1:
      return i18next.t(' 未生效')
    case 2:
      return i18next.t('已生效')
    case 3:
      return i18next.t('调整中')
    case -1:
      return i18next.t('已删除')
    default:
      return ''
  }
}

const adjustSheetTagStatus = (status) => {
  switch (status) {
    case 1:
    case 3:
      return 'processing'
    case -1:
    case 2:
      return 'finish'
  }
}

/**
 * 调整类型,目前只有入库调整一个值
 */
const adjustType = (type) => {
  switch (type) {
    case 1:
      return i18next.t(' 入库调整')
    default:
      return ''
  }
}

/**
 * 获取枚举value=>text
 * @param {array} enumData 枚举数据
 * @param {number | string} value 值
 * @param {string} keyName key的字段名，不传默认为value
 * @returns {string}
 */
const getEnumValue = (enumData, value, keyName = 'value') => {
  const fieldName = keyName

  const item = _.find(enumData, (item) => +item[fieldName] === +value)

  if (item) {
    return item.text
  } else {
    return '-'
  }
}

export {
  findReceiveWayById,
  prioritySupplierStatus,
  returnDateByFlag,
  money,
  renderPurchaseSpec,
  orderState,
  orderStateIcon,
  getPurchaseSheetStatus,
  purchaseTaskStatus,
  convertSid2Number,
  convertNumber2Sid,
  serviceTime,
  cycleDateRangePickerInputValue,
  cycleDateRangePickerInputValueV2,
  stockState,
  coverDigit2Uppercase,
  payState,
  saleState,
  isLockPriceSku,
  getRequireGoodsStatus,
  renderSkuSpec,
  remarkType,
  taskStatus,
  adjustSheetStatus,
  adjustSheetTagStatus,
  adjustType,
  processStatus,
  lockState,
  ruleState,
  typeState,
  moneyLock,
  getPurchaseSheetSource,
  getSignWay,
  orderPackageStatus,
  skuBoxStatus,
  boxTypes,
  getEnumValue,
}
