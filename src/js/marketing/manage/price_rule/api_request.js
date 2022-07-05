import { Request } from '@gm-common/request'
import { System } from '../../../common/service'

// 导入
export const apiUploadPriceRule = (req) =>
  Request('/station/price_rule/upload/').data(req).post()

// 导出
export const apiDownloadPriceRule = (rule_id, download_type) => {
  const rule = rule_id ? `rule_id=${rule_id}&` : ''
  window.open(
    `/station/price_rule/download?${rule}download_type=${download_type}`
  )
}

// 二级分类
export const apiFetchCategory2 = () =>
  Request('/merchandise/category2/get')
    .get()
    .then((json) => json.data)

// 一级分类
export const apiFetchCategory1 = () =>
  Request('/merchandise/category1/get')
    .get()
    .then((json) => json.data)

/**
 * 拉取报价单锁价商品
 * @param req: {
    category1_ids: array
    category2_ids: array,
    pinlei_ids: array,
    text: string,
    state: state,
    offset: pagination.offset,
    limit: pagination.limit,
    salemenu_id: 报价单ID,
    sort_by: 排序字段,
    sort_direction: 升序还是降序
  }
 * @returns Promise
 */
export const apiFetchSkuSalemenu = (req) => {
  if (System.isC()) req.is_retail_interface = 1
  return Request('/product/sku_salemenu/list')
    .data(req)
    .get()
}
