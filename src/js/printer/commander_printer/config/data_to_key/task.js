import _ from 'lodash'
import moment from 'moment'

function task(data) {
  const commanderTask = _.map(data.order_detail, (o, index) => {
    return {
      序号: index + 1 || '-',
      订单号: o.order_id || '-',
      商品数: o.sku_num || '-',
      订单金额: o.order_money || '-',
      订单备注: o.remark || '-',
      配送方式: o.delivery_type || '-',
      用户名: o.receiver_name || '-',
      用户手机: o.receiver_phone || '-',
      收货地址: o.receiver_address || '-',
      收货时间: o.receive_begin_time || '-',
      签收: o.sign || '-'
    }
  })
  const common = {
    社区店名称: data.community_name || '-',
    打印时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    团长名称: data.name || '-',
    团长电话: data.phone || '-',
    团长地址: data.address || '-'
  }

  return {
    common,
    _table: {
      commander_task: commanderTask
    },
    _origin: data
  }
}

export default task
