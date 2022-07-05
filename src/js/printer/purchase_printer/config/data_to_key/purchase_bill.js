import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import {
  money,
  toFixed2,
  getSpecialTable,
  generateMultiData,
  groupByCategory,
  baseUrl,
} from './util'
import { convertNumber2Sid } from '../../../../common/filter'
import { Price } from '@gmfe/react'
import emptyImge from '../../../../../img/transparent.png'

function generateTable(tasks) {
  return tasks.map((task, index) => {
    // const suggest_purchase_num = task.suggest_purchase_num
    let suggestPurchase = ''
    if (task.customized_suggest_purchase_amount) {
      suggestPurchase = `${parseFloat(
        toFixed2(task.customized_suggest_purchase_amount),
      )}${task.std_unit_name}`
    } else if (Number(task.stock) < 0) {
      suggestPurchase = `${parseFloat(Big(task.plan_amount).toFixed(2))}${
        task.std_unit_name
      }`
    } else {
      const suggestPurchasing = Big(task?.plan_amount)
        .minus(task?.stock)
        .toFixed(2)
      suggestPurchase =
        Number(task?.stock) >= 0 && suggestPurchasing < 0
          ? '库存充足'
          : `${suggestPurchasing}${task?.std_unit_name}`

      // suggestPurchase =
      //   Number(suggest_purchase_num) > 0
      //     ? `${parseFloat(Big(suggest_purchase_num).toFixed(2))}${
      //         task.std_unit_name
      //       }`
      //     : '库存充足'
    }

    // stock/purchase_sheet/details

    return {
      序号: ++index,

      商品名称: task.spec_name,
      单价_基本单位: `${money(task.purchase_price || 0)}${
        Price.getUnit() + '/'
      }${task.std_unit_name}`,
      单价_采购单位: `${money(
        Big(task.purchase_price || 0).times(task.ratio),
      )}${Price.getUnit() + '/'}${task.purchase_unit_name}`,

      一级分类: task.category_name_1,
      二级分类: task.category_name_2,
      品类: task.pinlei_name,

      参考成本: `${task.ref_price ? money(task.ref_price) : 0}${
        Price.getUnit() + '/'
      }${task.std_unit_name}`,
      采购描述: task.description,
      采购备注: task.goods_remark,
      规格: `${task.ratio}${task.std_unit_name}/${task.purchase_unit_name}`,
      库存: parseFloat(toFixed2(task.stock)),
      建议采购: suggestPurchase,

      采购单位: task.purchase_unit_name,
      基本单位: task.std_unit_name,
      明细数: task.address.length,

      计划采购_基本单位: parseFloat(toFixed2(task.plan_amount)),
      计划采购_采购单位: parseFloat(
        Big(task.plan_amount).div(task.ratio).toFixed(2),
      ),

      实采_基本单位: parseFloat(toFixed2(task.already_purchased_amount)),
      实采_采购单位: parseFloat(
        Big(task.already_purchased_amount).div(task.ratio).toFixed(2),
      ),

      预采购金额: money(Big(task.purchase_price || 0).times(task.plan_amount)),
      采购金额: Big(task.purchase_money || 0).toFixed(2),
      采购金额_不含税: _.isNil(task.purchase_money_no_tax)
        ? '-'
        : task.purchase_money_no_tax,
      进项税率: _.isNil(task.tax_rate)
        ? '-'
        : `${Big(task.tax_rate).div(100).toFixed(2)}%`,
      进项税额: _.isNil(task.tax_money) ? '-' : task.tax_money,
      __details: task.address.map((o) => {
        return {
          分拣序号: o.sort_id || '-',
          商户名: o.res_name || '-',
          商户ID: convertNumber2Sid(o.address_id) || '-',
          商户自定义编码: o.res_custom_code || '-',
          采购数量_基本单位: parseFloat(toFixed2(o.plan_amount)),
          采购数量_采购单位: parseFloat(
            Big(o.plan_amount).div(task.ratio).toFixed(2),
          ),
          商品备注: o.remark,

          采购单位: task.purchase_unit_name,
          基本单位: task.std_unit_name,
          收货时间: o.receive_begin_time
            ? moment(o.receive_begin_time).format('YYYY-MM-DD HH:mm:ss') +
              (o.receive_end_time
                ? '-' + moment(o.receive_end_time).format('YYYY-MM-DD HH:mm:ss')
                : '')
            : '',
        }
      }),
      _origin: task,
    }
  })
}
/**
 * 单栏或者多栏，明细显示处理
 * @param {[]} normalTable 一行商品数据和对应的一条明细
 * @param {string} type
 * @returns []
 */
function getSpecialRowTable(normalTable, type) {
  return normalTable.reduce((arr, task) => {
    const __detailsList = []

    // 抽取 __details(_MULTI_SUFFIX)? 的明细key
    for (const key in task) {
      if (key.includes('__details')) {
        __detailsList.push(key)
      }
    }
    // 整合该行所有明细
    let size = 0
    const list = _.map(__detailsList, (details) => {
      size = Math.max(task[details].length, size)
      return task[details]
    }).reduce((prev, next) => prev.concat(next), [])

    // 明细：总表下方一行-多栏，明细分两行展示
    const specialList = _.chunk(list, size).map((list) => ({
      _special: { list, type, fixedSize: size },
    }))

    return [...arr, task, ...specialList]
  }, [])
}

function purchaseBill(data) {
  const { purchase_sheet, tasks } = data

  let plan_money = Big(0)
  let pur_money = Big(0)
  _.each(tasks, (task) => {
    if (task.plan_amount) {
      plan_money = Big(task.plan_amount)
        .times(task.purchase_price)
        .plus(plan_money)
    }
    if (task.already_purchased_amount) {
      // 单价存在精度丢失问题，直接用后台算好的相加
      pur_money = Big(task.purchase_money || '0')
        .times(100)
        .plus(pur_money)
    }
  })

  const common = {
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),

    采购员: purchase_sheet.operator,
    采购单位: purchase_sheet.station_name,

    供应商: purchase_sheet.supplier_name,
    供应商编号: purchase_sheet.customer_id, // 这个后台变量名很搞

    预采购金额: money(plan_money),
    采购金额: money(pur_money),

    任务数: tasks.length,
    采购员电话: purchase_sheet.purchaser_phone_num,
    供应商电话: purchase_sheet.supplier_phone_num,
    采购单据号: purchase_sheet.purchase_sheet_id || '-',
    单据备注: purchase_sheet.sheet_remark || '-',
    最早收货时间: '-',
    电子签名: purchase_sheet.signature_image_id
      ? baseUrl + purchase_sheet.signature_image_id
      : emptyImge,
  }

  const normalTable = generateTable(tasks)
  /* ----------- 双栏 -------------- */
  const normalTableMulti = generateMultiData(normalTable)

  // 按一级分类分组
  const groupByCategory1 = _.groupBy(
    normalTable,
    (v) => v._origin.category_name_1,
  )
  const [kCategory, kCategoryMulti] = groupByCategory(groupByCategory1)
  return {
    common,
    _table: {
      purchase_no_detail: normalTable, // 无明细
      purchase_no_detail_multi: normalTableMulti, // 双栏

      purchase_no_detail_category: kCategory, // 分类
      purchase_no_detail_category_multi: kCategoryMulti, // 双栏

      purchase_last_col: normalTable, // 明细:单列-总表最后一列
      purchase_last_col_noLineBreak: normalTable, // 明细:单列-总表最后一列
      purchase_last_col_multi: normalTableMulti, // 双栏
      purchase_last_col_noLineBreak_multi: normalTableMulti, // 双栏
      purchase_last_col_noLineBreak_category: kCategory, // 明细:单列-总表最后一列  分类
      purchase_last_col_noLineBreak_category_multi: kCategoryMulti, // 明细:单列-总表最后一列 双栏 + 分类

      purchase_last_col_category: kCategory, // 明细:单列-总表最后一列
      purchase_last_col_category_multi: kCategoryMulti, // 双栏

      purchase_one_row: getSpecialRowTable(normalTable, 'separator'),
      // 明细: 当行-总表下方一行
      purchase_one_row_multi: getSpecialRowTable(normalTableMulti, 'separator'),

      purchase_one_row_category: getSpecialRowTable(kCategory, 'separator'),
      // 明细: 当行-总表下方一行
      purchase_one_row_category_multi: getSpecialRowTable(
        kCategoryMulti,
        'separator',
      ),

      purchase_flex_2: getSpecialTable(normalTable, 2, 'flex'), // 明细: 两栏-总表下方一行两栏
      purchase_flex_2_multi: getSpecialTable(normalTableMulti, 2, 'flex'), // 明细: 两栏-总表下方一行两栏

      purchase_flex_2_category: getSpecialTable(kCategory, 2, 'flex'), // 明细: 两栏-总表下方一行两栏
      purchase_flex_2_category_multi: getSpecialTable(
        kCategoryMulti,
        2,
        'flex',
      ), // 明细: 两栏-总表下方一行两栏

      purchase_flex_4: getSpecialTable(normalTable, 4, 'flex'), // 明细: 四栏-总表下方一行四栏
      purchase_flex_4_multi: getSpecialTable(normalTableMulti, 4, 'flex'), // 明细: 四栏-总表下方一行四栏

      purchase_flex_4_category: getSpecialTable(kCategory, 4, 'flex'), // 明细: 四栏-总表下方一行四栏
      purchase_flex_4_category_multi: getSpecialTable(
        kCategoryMulti,
        4,
        'flex',
      ), // 明细: 四栏-总表下方一行四栏
    },
  }
}

export default purchaseBill
