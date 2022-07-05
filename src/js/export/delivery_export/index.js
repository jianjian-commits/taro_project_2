import _ from 'lodash'
import moment from 'moment'

import { getCategoryConfig } from './util'
import { getDistributeData as getData } from '../util'
import { getCommonData, getDetailBlcokData } from './config/data'
import { asyncImportExcel } from 'common/util'

async function deliveryExport(query) {
  try {
    const orderDatas = await getData(query)
    const sheets = []
    const sheetOptions = []

    _.forEach(orderDatas, (order, index) => {
      // 处理 模板设置(不同订单类别数量，品类不同)
      const config = getCategoryConfig(order)

      // 处理数据
      const common = getCommonData(order, index)
      const detail_block = getDetailBlcokData(order.details)
      const sheetDatas = [
        {
          ...common,
          ...detail_block,
        },
      ]

      // 导出模式： 一个订单对应一个sheet, 一个模板
      sheets.push({ config, sheetDatas })
      // 处理每个sheet名称 - 对应订单号
      sheetOptions.push({ sheetName: order.id })
    })

    // 导出
    const { diyExport } = await asyncImportExcel()
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    diyExport(sheets, { fileName: `配送单导出_${now}.xlsx`, sheetOptions })
  } catch (err) {
    console.log(err)
  }
}

export { deliveryExport }
