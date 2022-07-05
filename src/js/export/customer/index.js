import _ from 'lodash'
import moment from 'moment'
import { asyncImportExcel } from 'common/util'
import {
  getDistributeData,
  getDistributeTemp,
  getPurchaseData,
  getPurchaseTemp,
} from '../util'
import { parseTemplate } from './core/index'
import { order as formatOrder } from '../../printer/order_printer/config/data_to_key'
import { formatTask } from '../../printer/purchase_printer/config/data_to_key/index.js'

export async function customerExport(query, templateId, isPurchaseExport) {
  try {
    const orderDatas = await (isPurchaseExport
      ? getPurchaseData(query)
      : getDistributeData(query))
    const template = await (isPurchaseExport
      ? getPurchaseTemp(templateId)
      : getDistributeTemp(templateId))

    const sheets = []
    const sheetOptions = []

    const formatData = isPurchaseExport ? formatTask : formatOrder

    _.forEach(orderDatas, (order, index) => {
      // 根据自定义模板与数据生成excel config，data
      const { config, sheetDatas } = parseTemplate(formatData(order), template)
      sheets.push({ config, sheetDatas: [sheetDatas] })
      sheetOptions.push({ sheetName: order.id })
    })
    console.log('sheetOptions', sheets, sheetOptions)
    const { doExportV2 } = await asyncImportExcel()
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    const fileName = isPurchaseExport
      ? `采购任务单导出_${now}.xlsx`
      : `配送单导出_${now}.xlsx`
    doExportV2(sheets, { fileName, sheetOptions })
  } catch (err) {
    console.log(err)
  }
}
