import { Request } from '@gm-common/request'

const commonRequest = async (api, params, isGet = false) =>
  Request(`/salemenu/cycle_pricing/${api}`)
    .data(params)
    [isGet ? 'get' : 'post']()

// 获取周期定价列表
const cyclePriceListReq = async (params = {}) =>
  commonRequest('search', params, true)

// 新建周期定价规则
const createCyclePriceReq = async (params = {}) =>
  commonRequest('create', params)

// 修改周期定价规则
const editCyclePriceReq = async (params = {}) => commonRequest('edit', params)

// 删除周期定价规则
const deleteCyclePriceReq = async (params = {}) =>
  commonRequest('delete', params)

// 打印周期定价规则
const printCyclePriceReq = async (params = {}) => commonRequest('print', params)

// 获取报价单列表
const salemenuListReq = async (params = {}) =>
  Request('/salemenu/sale/list').data(params).get()

// 导出
const exportTemplateReq = async (params = {}) =>
  Request('/product/sku_salemenu/list').data(params).get()

export {
  cyclePriceListReq,
  createCyclePriceReq,
  editCyclePriceReq,
  deleteCyclePriceReq,
  printCyclePriceReq,
  salemenuListReq,
  exportTemplateReq,
}
