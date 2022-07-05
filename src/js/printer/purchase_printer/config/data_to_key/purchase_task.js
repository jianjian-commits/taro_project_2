import moment from 'moment'
import _ from 'lodash'
import { Price } from '@gmfe/react'
import Big from 'big.js'
import {
  money,
  toFixed2,
  getSpecialTable,
  generateMultiData,
  groupByCategory,
} from './util'
import { convertNumber2Sid } from '../../../../common/filter'

function generateTable(tasks) {
  return tasks.map((task, index) => {
    // 打印会汇集相同商品的记录，计划采购是总和，每个商品对应的库存相同。建议采购的值：总和计划 - 库存（自己算）
    let suggestPurchase = ''
    if (task.customized_suggest_purchase_amount) {
      suggestPurchase = `${parseFloat(
        toFixed2(task.customized_suggest_purchase_amount),
      )}${task.std_unit_name}`
    } else if (Number(task.stock) < 0) {
      suggestPurchase = `${parseFloat(
        Big(task.plan_purchase_amount).toFixed(2),
      )}${task.std_unit_name}`
    } else {
      suggestPurchase =
        Number(task.suggest_purchase_num) > 0
          ? `${parseFloat(Big(task.suggest_purchase_num).toFixed(2))}${
              task.std_unit_name
            }`
          : '库存充足'
    }
    // if (Number(task.suggest_purchase_num) <= 0) {
    //   suggestPurchase = '库存充足'
    // }
    return {
      序号: ++index,

      商品名称: task.sku_name,
      单价_基本单位: '',
      单价_采购单位: '',

      一级分类: task.category1_name,
      二级分类: task.category2_name,
      品类: task.pinlei_name,

      参考成本: `${task.price ? money(task.price) : 0}${Price.getUnit() + '/'}${
        task.std_unit_name
      }`,
      采购描述: task.description,
      商品备注: task.goods_remark,
      规格: `${task.sale_ratio}${task.std_unit_name}/${task.sale_unit_name}`,
      库存: parseFloat(toFixed2(task.stock)),
      建议采购: suggestPurchase,

      采购单位: task.sale_unit_name,
      基本单位: task.std_unit_name,
      明细数: task.addresses.length,

      计划采购_基本单位: parseFloat(toFixed2(task.plan_purchase_amount)),
      计划采购_采购单位: parseFloat(
        Big(task.plan_purchase_amount).div(task.sale_ratio).toFixed(2),
      ),

      实采_基本单位: '',
      实采_采购单位: '',

      预采购金额: money(Big(task.plan_purchase_amount).times(task.price || 0)),
      采购金额: '',

      __details: task.addresses.map((o) => {
        return {
          分拣序号: o.sort_id || '-',
          商户名: o.res_name || '-',
          商户ID: convertNumber2Sid(o.address_id) || '-',
          商户自定义编码: o.res_custom_code || '-',
          采购数量_基本单位: parseFloat(toFixed2(o.plan_purchase_amount)),
          采购数量_采购单位: parseFloat(
            Big(o.plan_purchase_amount).div(task.sale_ratio).toFixed(2),
          ),
          商品备注: o.remark,

          采购单位: task.sale_unit_name,
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

function purchaseTask(data) {
  const {
    purchaser_phone_num,
    supplier_phone_num,
    purchaser,
    station_name,
    settle_supplier_name,
    customer_id,
    purchase_sheet_id,
    sheet_remark,
    tasks = [],
  } = data

  let purchase_money = Big(0)
  _.each(tasks, (task) => {
    task.plan_purchase_amount = _.reduce(
      task.addresses,
      (sum, addr) => sum + addr.plan_purchase_amount,
      0,
    )
    purchase_money = Big(task.plan_purchase_amount)
      .times(task.price || 0)
      .plus(purchase_money)
  })
  // 当前获取最小时间 就是根据后台放回的receive_begin_time来比较每一条 然后获取到最小的那一条
  const minTime = _.minBy(tasks, function (o) {
    return o.receive_begin_time
  }) || { receive_begin_time: 0 }

  const common = {
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    当前时间_日期: moment().format('YYYY-MM-DD'),
    当前时间_时间: moment().format('HH:mm:ss'),

    采购员: purchaser.length
      ? purchaser.map((o) => o.purchaser_name).join(',')
      : '-',
    采购单位: station_name,

    供应商: settle_supplier_name,
    供应商编号: customer_id, // 这个后台变量名很搞

    预采购金额: money(purchase_money),
    采购金额: '',

    任务数: tasks.length,
    采购员电话: purchaser_phone_num,
    供应商电话: supplier_phone_num,
    采购单据号: purchase_sheet_id || '-',
    单据备注: sheet_remark || '-',
    最早收货时间: minTime.receive_begin_time
      ? moment(minTime.receive_begin_time).format('YYYY-MM-DD')
      : '-',
  }

  const normalTable = generateTable(tasks)
  /* ----------- 双栏 -------------- */
  const normalTableMulti = generateMultiData(normalTable)

  // 按一级分类分组
  const groupByCategory1 = _.groupBy(
    normalTable,
    (v) => v._origin.category1_name,
  )

  const [kCategory, kCategoryMulti] = groupByCategory(groupByCategory1)
  return {
    common,
    _table: {
      purchase_no_detail_category: kCategory, // 分类
      purchase_no_detail_category_multi: kCategoryMulti, // 双栏

      purchase_no_detail: normalTable, // 无明细
      purchase_no_detail_multi: normalTableMulti, // 双栏

      purchase_last_col_noLineBreak: normalTable, // 明细:单列-总表最后一列不换行
      purchase_last_col_noLineBreak_multi: normalTableMulti, // 双栏
      purchase_last_col_noLineBreak_category: kCategory, // 明细:单列-总表最后一列  分类
      purchase_last_col_noLineBreak_category_multi: kCategoryMulti, // 明细:单列-总表最后一列 双栏 + 分类

      purchase_last_col: normalTable, // 明细:单列-总表最后一列
      purchase_last_col_multi: normalTableMulti, // 明细:单列-总表最后一列 + 双栏
      purchase_last_col_category: kCategory, // 明细:单列-总表最后一列  分类
      purchase_last_col_category_multi: kCategoryMulti, // 明细:单列-总表最后一列 双栏 + 分类

      purchase_one_row: normalTable.reduce(
        (arr, task) => [
          ...arr,
          task,
          { _special: { list: task.__details, type: 'separator' } },
        ],
        [],
      ), // 明细: 当行-总表下方一行
      purchase_one_row_multi: normalTableMulti.reduce(
        (arr, task) => [
          ...arr,
          task,
          { _special: { list: task.__details, type: 'separator' } },
        ],
        [],
      ),

      purchase_one_row_category: kCategory.reduce((arr, task) => {
        if (!task.__details.length) return [...arr, task]
        return [
          ...arr,
          task,
          { _special: { list: task.__details, type: 'separator' } },
        ]
      }, []), // 明细: 当行-总表下方一行
      purchase_one_row_category_multi: kCategoryMulti.reduce((arr, task) => {
        if (!task.__details.length) return [...arr, task]
        return [
          ...arr,
          task,
          { _special: { list: task.__details, type: 'separator' } },
        ]
      }, []),

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

export default purchaseTask
