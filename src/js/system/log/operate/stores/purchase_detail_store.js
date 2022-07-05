import { i18next } from 'gm-i18n'
import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { generateUIList } from '../common/utils'

const order_show = [
  { fieldName: i18next.t('订单号') },
  { fieldName: i18next.t('采购商品') },
  { fieldName: i18next.t('采购规格') },
  { fieldName: i18next.t('供应商') },
  { fieldName: i18next.t('采购员') },
  { fieldName: i18next.t('采购量') },
  { fieldName: i18next.t('关联周期') },
  { fieldName: i18next.t('运营周期') },
  { fieldName: i18next.t('备注') },
  { fieldName: i18next.t('状态') },
  { fieldName: i18next.t('生成采购单据') },
]

class LockDetailStore {
  @observable list = []

  // eslint-disable-next-line gmfe/no-observable-empty-object
  @observable title = {}

  @observable isLoading = false

  // 加入采购规格信息
  getTitleText = (data, list) => {
    const { op_type } = data
    const { modify } = data
    let firstText = null

    const _purchase_spec = _.filter(
      list,
      (item) => item.fieldName === i18next.t('采购规格'),
    )
    const purchase_spec =
      op_type === 3 ? _purchase_spec[0].before : _purchase_spec[0].after

    const sku_name =
      op_type === 3 ? modify.sku_name.before : modify.sku_name.after

    firstText = `${sku_name}(${purchase_spec})`
    return firstText
  }

  @action.bound
  getLogDetail(id) {
    this.isLoading = true
    Request('/station/op_log/get')
      .data({ id })
      .get()
      .then(
        action('getDetail', (json) => {
          const data = json.data
          const log_type = data.log_type
          const op_type = data.op_type
          // 添加 采购规格 字段
          data.modify.purchase_spec = { before: '', after: '' }
          const { skus = [], orders = [], ...modifyObj } = data.modify
          let dataList = []

          const list = generateUIList({ modifyObj, log_type })

          // 处理商品
          _.each(skus, (sku) => {
            const _sku = generateUIList({ modifyObj: sku, log_type })
            dataList = [...dataList, ..._sku]
          })

          // 处理订单
          _.each(orders, (order) => {
            let _order = generateUIList({ modifyObj: order, log_type })

            const order_id = {
              fieldName:
                order.order_id.before === null ? '-' : order.order_id.before,
              before: ' ',
              after: ' ',
              bold: true,
            }

            // 编辑 | 发布 展示订单号
            if (op_type === 2 || op_type === 10) {
              _order = [order_id, ..._order]
            }
            dataList = [...dataList, ..._order]
          })

          const firstText = this.getTitleText(data, list)
          // 过滤未修改字段
          const _list = _.filter([...list, ...dataList], (item) => {
            if (op_type === 1) {
              return (
                (item &&
                  item.before !== item.after &&
                  item.fieldName !== i18next.t('基本单位')) ||
                item.fieldName === i18next.t('订单号')
              )
            }
            return (
              (item &&
                item.before !== item.after &&
                item.fieldName !== i18next.t('基本单位')) ||
              item.bold
            )
          })

          // 按照一定顺序展示
          let order_list = _list
          if (op_type !== 2 && op_type !== 10) {
            order_list = []
            _.each(order_show, (item) => {
              const _item = _.filter(
                _list,
                (each) => each.fieldName === item.fieldName,
              )
              _item.length && order_list.push(_item[0])
            })

            const id = _.filter(_list, (item) => {
              return item && item.bold
            })
            id.length && order_list.unshift(id[0])
          }

          this.isLoading = false
          this.list = order_list
          this.title = {
            firstText: firstText,
            create_time: moment(data.create_time).format('YYYY-MM-DD HH:mm:ss'),
            op_user: data.op_user,
            log_type: log_type,
          }
        }),
      )
      .catch((e) => {
        this.isLoading = false
        console.log(e)
      })
  }
}

export default new LockDetailStore()
