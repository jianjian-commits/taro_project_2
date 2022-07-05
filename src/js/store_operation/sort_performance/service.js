import { Request } from '@gm-common/request'

const commonRequest = async (api, params, isGet = true) =>
  Request(`/sorter/perf/${api}`).data(params)[isGet ? 'get' : 'post']()

// 获取绩效列表
const getPerformanceList = async (params = {}) =>
  commonRequest('search', params)
// 导出绩效列表
const exportList = async (params = {}) => commonRequest('export', params)

export { getPerformanceList, exportList }
