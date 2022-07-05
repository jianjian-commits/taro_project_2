import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { generateUIList } from '../common/utils'

class LockDetailStore {
  @observable list = []

  // eslint-disable-next-line gmfe/no-observable-empty-object
  @observable title = {}

  @observable isLoading = false

  @action.bound
  getLogDetail(id) {
    this.isLoading = true
    Request('/station/op_log/get')
      .data({ id })
      .get()
      .then(
        action('getDetail', (json) => {
          const data = json.data
          const { log_type, fee_type } = data
          const { addresses, skus, categories, ...modifyObj } = data.modify
          // {modifyObj, log_type, type, fee_type}
          const modifyList = generateUIList({ modifyObj, log_type, fee_type })
          // 锁价商品改动
          const type = modifyObj.type
          let detailList = []
          _.each(addresses, (addressesObj) => {
            const address = generateUIList({
              modifyObj: addressesObj,
              log_type,
              type,
              fee_type,
            })
            detailList = [...detailList, ...address]
          })
          _.each(categories, (categoriesObj) => {
            const category = generateUIList({
              modifyObj: categoriesObj,
              log_type,
              fee_type,
            })
            detailList = [...detailList, ...category]
          })
          _.each(skus, (skuObj) => {
            let sku = generateUIList({ modifyObj: skuObj, log_type, fee_type })
            if (
              // 判断商品是否改变
              !skuObj ||
              skuObj.sku_rule_type.before !== skuObj.sku_rule_type.after ||
              skuObj.sku_yx_price.before !== skuObj.sku_yx_price.after ||
              skuObj.sale_unit_name.before !== skuObj.sale_unit_name.after
            ) {
              sku = [
                {
                  fieldName: skuObj.sku_id.before
                    ? `${skuObj.sku_id.before} ${skuObj.sku_name.before}`
                    : `${skuObj.sku_id.after} ${skuObj.sku_name.after}`,
                  before: ' ',
                  after: ' ',
                  borderTop: true,
                  bold: true,
                },
                ...sku,
              ]
            } else {
              sku = [...sku]
            }
            detailList = [...detailList, ...sku]
          })

          this.isLoading = false
          this.list = [...modifyList, ...detailList]
          this.title = {
            op_id: data.op_id,
            create_time: moment(data.create_time).format('YYYY-MM-DD HH:mm:ss'),
            op_user: data.op_user,
            log_type: log_type,
          }
        })
      )
      .catch((e) => {
        this.isLoading = false
        console.log(e)
      })
  }
}

export default new LockDetailStore()
