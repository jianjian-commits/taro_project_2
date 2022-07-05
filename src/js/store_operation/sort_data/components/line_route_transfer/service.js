/*
 * @Description: 线路穿梭框接口
 */
import { Request } from '@gm-common/request'

// 获取线路列表
const getRouteLineList = async () =>
  Request('/station/address_route/list').data({ limit: 9999 }).get()
// 获取商户标签列表
const getMerchantList = async () =>
  Request('/station/freight/address/list').get()
const getCUserList = async () => Request('/station/freight/c_user/list').get()
export { getRouteLineList, getMerchantList, getCUserList }
