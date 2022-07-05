import { Request } from '@gm-common/request'

const api = {
  fetchListBySpu(params) {
    return Request('/stock/product/in_stock_summary_by_spu/list')
      .data(params)
      .get()
  },

  fetchAmountBySpu(params) {
    return Request('/stock/product/in_stock_summary_by_spu/get')
      .data(params)
      .get()
  },

  exportExcelBySpu(params) {
    return Request('/stock/product/in_stock_summary_by_spu/list')
      .data(params)
      .get()
  },
}

export default api
