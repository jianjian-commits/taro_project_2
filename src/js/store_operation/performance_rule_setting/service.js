import { Request } from '@gm-common/request'

// 获取分拣绩效规则
const getSorterPerformanceRules = async () =>
  Request('/sorter/perf/rules/get').get()
// 设置分拣绩效规则
const setSorterPerformanceRules = async (params) =>
  Request('/sorter/perf/rules/set').data(params).post()
// 获取绩效商品信息
const getSpu = async (perf_method) =>
  Request('/sorter/perf/spu/get').data({ perf_method }).get()
// 设置绩效商品信息
const setSpu = async (params) =>
  Request('/sorter/perf/spu/set').data(params).post()

export { getSorterPerformanceRules, setSorterPerformanceRules, getSpu, setSpu }
