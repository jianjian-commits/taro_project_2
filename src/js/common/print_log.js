import { Request } from '@gm-common/request'

// 配送单记录打印次数
function printLog(reqParams) {
  return Request('/station/print_log/create').data(reqParams).post()
}

/**
 * 入库单记录打印次数
 * @param ids 单号
 * @param sheet_type 单据类型 => 入库单打印：2
 * @returns {*}
 */
export function recordPrintLog({ ids, sheet_type }) {
  return Request('/stock/in_stock_sheet/material/print_log/create')
    .data({ ids: JSON.stringify(ids), sheet_type })
    .get()
}

// 老模板列表长度大于0,就显示切换模板版本的按钮
export async function isVersionSwitcherShow() {
  const { data } = await Request('/station/distribute_config/get').get()
  return data.length > 0
}

export async function getPrinterVersion() {
  return Request('/station/distribute_config/old_or_new/get')
    .get()
    .then((json) => {
      return json.data.config
    })
}

export default printLog
