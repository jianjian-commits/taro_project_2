import { Request } from '@gm-common/request'

const createShare = async (params) =>
  Request('/sorter/perf/share/create').data(params).get()

export { createShare }
