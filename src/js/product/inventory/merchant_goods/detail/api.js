import { Request } from '@gm-common/request'

const api = {
  fetchListApi(params) {
    return Request('/stock/address/spu_stock/log/list').data(params).get()
  },
  fetchSpuSummaryApi(params) {
    return Request('/stock/address/spu_stock/detail').data(params).get()
  },
}
export default api
