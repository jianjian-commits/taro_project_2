import { Request } from '@gm-common/request'

const api = {
  fetchSummaryApi(params) {
    return Request('/stock/address/stock_val/count').data(params).get()
  },
  fetchStockListApi(params) {
    return Request('/stock/address/stock_val/list').data(params).get()
  },
  exportListAPi(params) {
    return Request('/stock/address/stock_val/list').data(params).get()
  },
  fetchSpuListApi(params) {
    return Request('/stock/address/spu_stock/list').data(params).get()
  },
}
export default api
