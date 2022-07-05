import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

import { squeshQoutePriceList } from '../../../../order/util'

const initDetail = {
  customer: null, // 商户
  details: [], // 商品详情
  freightFromDatabase: 0, // 数据库记录的运费
  remark: '', // 备注
  isCustomerStatusChecking: true,
  ostatus: 0, // 订单状态
  fee_type: '',
  _id: '', // 订单id
  last_op_user: '',
  last_op_time: '',
}

class Store {
  @observable orderDetail = { ...initDetail }

  @observable loading = false

  @action
  get(id) {
    this.loading = true
    return Request('/station/order/edit')
      .data({ id: id, client: 10, is_retail_interface: 1 }) // client 字段表示c端订单
      .get()
      .then((json) => {
        _.each(json.data && json.data.details, (v) => {
          v._spu_remark = v.spu_remark
        })
        runInAction(() => {
          this.orderDetail = Object.assign(
            {
              ...initDetail,
            },
            json.data,
            {
              details: squeshQoutePriceList(json.data.details),
              freightFromDatabase: json.data.freight,
              ostatus: json.data.status,
              freight: this.orderDetail.freight,
              fee_type: json.data.fee_type,
            },
          )
          this.loading = false
        })
        return json.data
      })
  }

  @action
  clear() {
    this.orderDetail = { ...initDetail }
  }
}

export default new Store()
