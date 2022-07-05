/*
 * @Description: sku穿梭框接口
 */
import { Request } from '@gm-common/request'

const commonRequest = async (api, params) =>
  Request(`/merchandise/${api}`).data(params).get()

const getSpuList = async (params) => commonRequest('spu/list', params)
const getCategory1 = async (params) => commonRequest('category1/get', params)
const getCategory2 = async (params) => commonRequest('category2/get', params)
const getPinLeiList = async (params) => commonRequest('pinlei/get', params)

export { getSpuList, getCategory1, getCategory2, getPinLeiList }
