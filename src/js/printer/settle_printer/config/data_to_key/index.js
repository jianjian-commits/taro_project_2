import _ from 'lodash'
import { i18next } from 'gm-i18n'
import Big from 'big.js'
import { coverDigit2Uppercase } from '../../../../common/filter'
import moment from 'moment'

const REASON = {
  1: i18next.t('抹零'),
  2: i18next.t('供应商计算异常'),
  3: i18next.t('供应商折扣'),
  4: i18next.t('供应商罚款'),
  5: i18next.t('其他'),
}

const TYPE = { 1: i18next.t('加钱'), 2: i18next.t('扣钱') }

const getTableData = (data, type) => {
  let result = null
  if (type === 'ordinary') {
    // 按submit_time 排序
    const sheets = data.sub_sheets.sort((a, b) => {
      return moment(a.submit_time).isAfter(moment(b.submit_time)) ? 1 : -1
    })

    result = _.map(sheets, (item, index) => {
      const total_money = Big(item.sku_money || 0)
        .plus(item.delta_money)
        .div(100)
        .toFixed(2)
      const settle_money = Big(item.sku_money || 0)
        .plus(item.delta_money)
        .div(100)
        .toFixed(2)

      const total_money2 = item.type === 1 ? total_money : total_money * -1
      const settle_money2 = item.type === 1 ? settle_money : settle_money * -1

      return {
        序号: index + 1,
        单据类型:
          item.type === 1 ? i18next.t('成品入库单') : i18next.t('成品退货单'),
        单据编号: item._id,
        金额: total_money,
        结算金额: settle_money,
        入库时间: moment(item.submit_time).format('YYYY-MM-DD'),
        _origin: {
          ...item,
          total_money2,
          settle_money2,
        },
      }
    })
  } else if (type === 'delta') {
    result = _.map(data.discount, (item, index) => {
      return {
        序号: index + 1,
        折让原因: REASON[item.reason],
        折让类型: TYPE[item.action],
        折让金额: Big(item.money || 0)
          .div(100)
          .toFixed(2),
        备注: item.remark,
        _origin: item,
      }
    })
  }
  return result
}

const generateUpperPrice = (data) => {
  return {
    单据金额_大写: coverDigit2Uppercase(
      Big(data.total_price || 0)
        .div(100)
        .toFixed(2)
    ),
    折让金额_大写: coverDigit2Uppercase(
      Big(data.delta_money || 0)
        .div(100)
        .toFixed(2)
    ),
    结算金额_大写: coverDigit2Uppercase(
      Big(data.total_price || 0)
        .plus(data.delta_money || 0)
        .div(100)
        .toFixed(2)
    ),
  }
}

const formatData = (data) => {
  return {
    common: {
      单据日期: moment(data.date_time).format('YYYY-MM-DD HH:mm:ss'),
      单据日期_日期: moment(data.date_time).format('YYYY-MM-DD'),
      单据日期_时间: moment(data.date_time).format('HH:mm:ss'),
      结款日期: moment(data.pay_time).format('YYYY-MM-DD'),
      打印时间: moment(data.print_time).format('YYYY-MM-DD HH:mm:ss'),
      打印时间_日期: moment(data.print_time).format('YYYY-MM-DD'),
      打印时间_时间: moment(data.print_time).format('HH:mm:ss'),
      单据编号: data.id,
      付款单摘要: data.remark,
      制单人: data.print_operator,
      往来单位: data.settle_supplier_name,
      供应商编号: data.customer_id,
      供应商营业执照号: data.business_licence,
      联系电话: data.phone,
      开户银行: data.bank,
      银行账号: data.card_no,
      结款方式: data.pay_method,
      开户名: data.account_name,
      单据金额: Big(data.total_price || 0)
        .div(100)
        .toFixed(2),
      折让金额: Big(data.delta_money || 0)
        .div(100)
        .toFixed(2),
      结算金额: Big(data.total_price || 0)
        .plus(data.delta_money || 0)
        .div(100)
        .toFixed(2),
      ...generateUpperPrice(data),
    },
    _table: {
      ordinary: getTableData(data, 'ordinary'),
      delta: getTableData(data, 'delta'),
    },
    _origin: data,
  }
}

export default formatData
