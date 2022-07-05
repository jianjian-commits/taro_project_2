import { Request } from '@gm-common/request'
// 获取运营周期
const getServiceTime = () => Request('/service_time/list').get()

// 加工计划或加工单搜索
const processPlanListGet = (data) =>
  Request('/stock/process/process_order/list').data(data).get()

// 加工计划详情
const processPlanDetailGet = (data) =>
  Request('/stock/process/process_order/get').data(data).get()

// 获取sku
const getSkuByName = (q) => Request('/process/sku/list').data({ q }).get()

// 获取任务总览列表
const getOrderList = (q) =>
  Request('/stock/process/order_request/list').data(q).get()

// 发布任务,release废弃
const postOrderList = (q) =>
  Request('/stock/process/order_request/release_v2').data(q).post()

// 下达加工单
const postProcessDan = (data) =>
  Request('/stock/process/process_order/submit').data(data).post()

// 获取待出库数 加工计划商品当前库存
const getProcessOrderStock = (data) =>
  Request('/stock/process/process_order/stock/get').data(data).get()

// 原料可用批次
const getMaterialBatch = (sku_id) =>
  Request('/stock/process/process_order/material/avail_batch')
    .data({ sku_id })
    .get()

// 半成品可用批次
const getSemiBatch = (sku_id) =>
  Request('/stock/process/process_order/semi/avail_batch')
    .data({ sku_id })
    .get()

// 获取角色列表
const getRoleList = () => Request('/gm_account/station/role/search').get()

// 获取工人
const getUserList = (role_id = null) =>
  Request('/gm_account/station/user/search').data({ role_id }).get()

// 新建加工计划
const postCreateDetail = (data) =>
  Request('/stock/process/process_order/create').data(data).post()

// 更新加工计划
const postUpdateDetail = (data) =>
  Request('/stock/process/process_order/update').data(data).post()

// 删除加工计划
const postDeleteDetail = (id) =>
  Request('/stock/process/process_order/delete').data({ id }).post()

// 下达加工单 获取计划对应的任务信息
const getTaskList = (list) =>
  Request('/stock/process/process_order/task/list')
    .data({ proc_order_ids: list })
    .get()

// 下达加工单 submit
const submitProcessOrder = (tasks) =>
  Request('/stock/process/process_order/submit').data({ tasks }).post()

// 获取线路
const getRouteList = (data) => {
  return Request('/station/address_route/list').data(data).get()
}

// 获取司机
const getDriverList = (req) => {
  return Request('/station/task/distribute/get_drivers').data(req).get()
}

// 获取商户标签
const getAddressLabel = (req) => {
  return Request('/station/address_label/list').data(req).get()
}

// 获取商品加工标签
const getProcessLabelList = (req) => {
  return Request('/process/label/list').data(req).get()
}

export {
  processPlanListGet,
  processPlanDetailGet,
  getSkuByName,
  getProcessOrderStock,
  getMaterialBatch,
  getSemiBatch,
  getRoleList,
  getUserList,
  postCreateDetail,
  postUpdateDetail,
  postDeleteDetail,
  getTaskList,
  submitProcessOrder,
  getServiceTime,
  getOrderList,
  postOrderList,
  postProcessDan,
  getRouteList,
  getDriverList,
  getAddressLabel,
  getProcessLabelList,
}
