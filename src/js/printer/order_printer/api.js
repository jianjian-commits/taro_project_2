import { Request } from '@gm-common/request'

// 获取配送单打印数据的接口: 1老接口  2 新接口(目前编辑配送单（也就是假单）使用) 3 合并sid进行打印 4 合并订单中相同的商品进行打印❗️接口超时60秒
export const ORDER_PRINT_API = {
  '1': (query) =>
    Request('/station/distribute/get_order_by_id')
      .data(query)
      .timeout(60000)
      .get()
      .then((json) => json.data),
  '2': (query) =>
    Request('/delivery/print')
      .data(query)
      .timeout(60000)
      .post()
      .then((json) => json.data.delivery_details),
  '3': (query) =>
    Request('/station/distribute/get_sid_by_order')
      .data(query)
      .timeout(60000)
      .get()
      .then((json) => json.data),
  '4': (query) =>
    Request('/station/distribute/get_order_by_id_merge')
      .data(query)
      .timeout(60000)
      .get()
      .then((json) => json.data),
}
