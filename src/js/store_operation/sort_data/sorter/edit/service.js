import { Request } from '@gm-common/request'

// 获取分拣员详情
const getSorterDetail = async (params = {}) =>
  Request('/sorter/detail').data(params).get()
// 编辑分拣员
const editSorter = async (params = {}) =>
  Request('/sorter/edit').data(params).post()

export { getSorterDetail, editSorter }
