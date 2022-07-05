import { Request } from '@gm-common/request'

const api = {
  async fetchListBySpu(params) {
    return Request('/stock/in_stock_summary_by_spu/list').data(params).get()
  },
  async fetchListByCategory(params) {
    return Request('/stock/in_stock_summary_by_category/list')
      .data(params)
      .get()
  },
  async fetchAmountBySpu(params) {
    return Request('/stock/in_stock_summary_by_spu/get').data(params).get()
  },
  async fetchAmountByCategory(params) {
    return Request('/stock/in_stock_summary_by_category/get').data(params).get()
  },
  async exportExcelBySpu(params) {
    return Request('/stock/in_stock_summary_by_spu/list').data(params).get()
  },
  async exportExcelByCategory(params) {
    return Request('/stock/in_stock_summary_by_category/list')
      .data(params)
      .get()
  },
}

export default api
