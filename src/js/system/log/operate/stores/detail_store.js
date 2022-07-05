/* eslint-disable gmfe/no-observable-empty-object */
import { i18next } from 'gm-i18n'
import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'

import { generateUIList } from '../common/utils'

// 订单类型展示流程
const orderStreamType = [
  { name: 'bshop', text: i18next.t('商城') },
  { name: 'purchase_task', text: i18next.t('采购') },
  { name: 'sorting_task', text: i18next.t('分拣') },
  { name: 'distribute_task', text: i18next.t('配送') },
  { name: 'out_stock', text: i18next.t('出库') },
  { name: 'operational_data', text: i18next.t('运营数据') },
  { name: 'customer_settlement', text: i18next.t('商户结算') },
  { name: 'customer_bill', text: i18next.t('商户对账单') },
]

const getOrderTypeText = (config) => {
  let before = ''
  let after = ''
  _.forEach(orderStreamType, (order, index) => {
    const obj = config[order.name]
    if (obj.before && obj.before === '1') {
      before += order.text
      if (index !== orderStreamType.length - 1) {
        before += '、'
      }
    }

    if (obj.after && obj.after === '1') {
      after += order.text
      if (index !== orderStreamType.length - 1) {
        after += '、'
      }
    }
  })
  return {
    before,
    after,
  }
}

class DetailStore {
  @observable list = []

  @observable title = {}

  @observable isLoading = false

  @action.bound
  async getLogDetail(id) {
    this.isLoading = true
    const res = await Request('/station/customized_field/list')
      .data({ deleted: 1 })
      .get()
    const customizedList = res.data || []
    Request('/station/op_log/get')
      .data({ id })
      .get()
      .then(
        action('getDetail', (json) => {
          const data = json.data
          const log_type = data.log_type
          const fee_type = data.fee_type
          const { details, order_process_config, ...modifyObj } = data.modify
          // 订单改动
          const modifyList = generateUIList({
            modifyObj,
            log_type,
            fee_type,
            customizedList,
          })
          // 订单商品改动
          let detailList = []

          // 订单改动,还要生成一下商品数据
          if (log_type === 1 && details) {
            // 商品按 => 修改>删除>新增, 排序
            const skuList = _.sortBy(details, [
              (sku) => !sku.id.before,
              (sku) => !sku.id.after,
            ])

            _.each(skuList, (skuObj) => {
              let sku = generateUIList({
                log_type,
                fee_type,
                modifyObj: skuObj,
                customizedList,
              })
              // 订单详情要显示商品名字,没有就补上
              if (sku[0] && sku[0].fieldName !== i18next.t('商品名称(ID)')) {
                sku = [
                  {
                    fieldName: `${skuObj.name.after}(${skuObj.id.after})`,
                    before: '',
                    after: '',
                    borderTop: true,
                    bold: true,
                  },
                  ...sku,
                ]
              }

              detailList = [...detailList, ...sku]
            })
          }

          // 订单改动, 处理订单类型的详细展示
          if (log_type === 1 && order_process_config && modifyList.length) {
            let before = ''
            let after = ''
            const text = getOrderTypeText(order_process_config)
            const { order_process_name } = data.modify
            const index = _.findIndex(
              modifyList,
              (obj) => obj.fieldName === i18next.t('订单类型'),
            )

            // 处理展示信息
            if (index !== -1 && order_process_name.before) {
              before = `${modifyList[index].before}（${i18next.t('进入')}${
                text.before
              }${i18next.t('模块')}）`
            }

            if (index !== -1 && order_process_name.after) {
              after = `${modifyList[index].after}（${i18next.t('进入')}${
                text.after
              }${i18next.t('模块')}）`
            }

            modifyList[index] = {
              ...modifyList[index],
              before,
              after,
            }
          }

          this.isLoading = false
          this.list = [...modifyList, ...detailList]
          this.title = {
            op_id: data.op_id,
            sort_id: data.sort_id,
            customer_name: data.customer_name,
            create_time: moment(data.create_time).format('YYYY-MM-DD HH:mm:ss'),
            op_user: data.op_user,
            op_source: [i18next.t('单条操作'), i18next.t('批量操作')][
              data.op_source - 1
            ],
            log_type: log_type,
            name: log_type === 1 ? i18next.t('订单ID') : i18next.t('商品ID'),
          }
        }),
      )
      .catch((e) => {
        this.isLoading = false
        console.log(e)
      })
  }
}

export default new DetailStore()
