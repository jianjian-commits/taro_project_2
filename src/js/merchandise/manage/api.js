import { Request } from '@gm-common/request'
import { System } from '../../common/service'

const getCategory1 = () => Request('/merchandise/category1/get').get()
const getCategory2 = () => Request('/merchandise/category2/get').get()
const getPinlei = () => Request('/merchandise/pinlei/get').get()
const deleteSku = (deleteSkuId) =>
  Request('/product/sku/delete')
    .data({ id: deleteSkuId, is_retail_interface: System.isC() ? 1 : null })
    .post()
const deleteSpu = (spu_id) =>
  Request('/merchandise/spu/delete')
    .data({ id: spu_id, is_retail_interface: System.isC() ? 1 : null })
    .post()

const fetchServiceTime = (req) => Request('/service_time/list').data(req).get()

// 获得用户报价单列表
// type O int 报价单类型(-1:已删除;1:供应商报价单;2:代售单;4:自售单)
// is_active O int 报价单状态(0:未激活; 1:激活)
const fetchSalemenuList = (req) => Request('/salemenu/list').data(req).get()

const setRefPrice = (where, type) =>
  Request('/station/ref_price_type/set')
    .data({ where: where, type: type })
    .post()

const getRefPrice = (where) =>
  Request('/station/ref_price_type/get').data({ where }).get()

export {
  getCategory1,
  getCategory2,
  getPinlei,
  deleteSku,
  deleteSpu,
  fetchServiceTime,
  fetchSalemenuList,
  setRefPrice,
  getRefPrice,
}
