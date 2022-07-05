import { Request } from '@gm-common/request'

const getCategory1 = () => Request('/merchandise/category1/get').get()
const getCategory2 = () => Request('/merchandise/category2/get').get()
const getPinlei = () => Request('/merchandise/pinlei/get').get()
const deleteSku = (deleteSkuId) =>
  Request('/product/sku/delete').data({ id: deleteSkuId }).post()
const deleteSpu = (spu_id) =>
  Request('/merchandise/spu/delete').data({ id: spu_id }).post()

const fetchServiceTime = (req) => Request('/service_time/list').data(req).get()

export {
  getCategory1,
  getCategory2,
  getPinlei,
  deleteSku,
  deleteSpu,
  fetchServiceTime,
}
