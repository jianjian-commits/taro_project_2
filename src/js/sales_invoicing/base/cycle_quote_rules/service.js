/*
 * @Description: 周期报价规则接口
 */
import { Request } from '@gm-common/request'

const commonRequest = async (api, params = {}, isGet = true) =>
  Request(`/stock/cycle_quote/${api}`).data(params)[isGet ? 'get' : 'post']()
// 搜索列表
const getList = async (params) => commonRequest('search', params)
// 新建
const add = async (params) => commonRequest('create', params, false)
// 编辑
const edit = async (params) => commonRequest('edit', params, false)
// 更新状态
const update = async (params) => commonRequest('update_status', params, false)
// 获取详情
const getDetail = async (params) => commonRequest('detail', params)
// 获取供应商
const getSupplier = async () => Request('/stock/settle_supplier/get').get()
// 获取sku
const getSkuList = async (params) =>
  Request('/purchase_spec/search?').data(params).get()
// 批量导入
const importSku = async (params) => commonRequest('import', params, false)
// 导出商品模版
const exportTemplate = async (params) => commonRequest('export', params)
// 批量返回采购规则的参考价
const getBatchRefPrice = async (params) =>
  Request('/purchase/purchase_spec_multi/ref_price').data(params).get()
export {
  getList,
  add,
  edit,
  update,
  getDetail,
  getSupplier,
  getSkuList,
  importSku,
  exportTemplate,
  getBatchRefPrice,
}
