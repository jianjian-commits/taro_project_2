import { Request } from '@gm-common/request'

const getDetails = async (params) =>
  Request('/sorter/perf/detail').data(params).get()

export { getDetails }
