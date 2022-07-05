import { i18next } from 'gm-i18n'
import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { generateUIList } from '../common/utils'

const order_show = [
  { fieldName: i18next.t('入库时间') },
  { fieldName: i18next.t('入库单备注') },
  { fieldName: i18next.t('入库单状态') },
  { fieldName: i18next.t('商品名称(ID)') },
  { fieldName: i18next.t('入库数(基本单位)') },
  { fieldName: i18next.t('入库单价(基本单位)') },
  { fieldName: i18next.t('入库数(包装单位)') },
  { fieldName: i18next.t('入库单价(包装单位)') },
  { fieldName: i18next.t('入库金额') },
  { fieldName: i18next.t('存放货位') },
  { fieldName: i18next.t('商品备注') },
  { fieldName: i18next.t('分摊') },
  { fieldName: i18next.t('分摊原因') },
  { fieldName: i18next.t('分摊类型') },
  { fieldName: i18next.t('分摊金额') },
  { fieldName: i18next.t('分摊方式') },
  { fieldName: i18next.t('分摊商品') },
  { fieldName: i18next.t('折让') },
  { fieldName: i18next.t('折让原因') },
  { fieldName: i18next.t('折让类型') },
  { fieldName: i18next.t('金额') },
  { fieldName: i18next.t('备注') },
]

class StorageDetailStore {
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable title = {}

  @observable list = []

  @observable specidList = []

  @observable isLoading = false

  @action.bound
  getLogDetail(id) {
    this.isLoading = true
    Request('/station/op_log/in_stock_sheet/detail')
      .data({ id })
      .get()
      .then(
        action('getDetail', (json) => {
          const data = json.data
          const log_type = 9
          const {
            op_type,
            sheet_no,
            supplier_name,
            create_time,
            op_source,
            modify,
          } = data
          this.title = {
            sheet_no,
            supplier_name,
            create_time: moment(create_time).format('YYYY-MM-DD HH:mm:ss'),
            op_type,
            op_source,
          }
          // 入库时间 备注 入库单状态
          const {
            pur_specs = [],
            share = [],
            discount = [],
            ...modifyObj
          } = modify
          let newlist = []
          let idlist = []
          let dataList = []
          const list = generateUIList({ modifyObj, log_type })

          // 新建 删除
          if (op_type === 1) {
            newlist = _.map(pur_specs, (pur) => {
              return {
                spec_name: generateUIList({
                  modifyObj: {
                    spec_name: pur.spec_name,
                    spec_id: pur.spec_id,
                  },
                  log_type,
                }),
                detail: generateUIList({
                  modifyObj: pur,
                  log_type,
                }),
              }
            })
          } else {
            newlist = _.map(pur_specs, (pur) => {
              let spec_detail = {}
              if (pur.change_type === 1) {
                spec_detail = {
                  spec_name: [
                    {
                      fieldName: '商品名称(ID)',
                      before: pur.spec_id.before === '-' && '无该商品',
                      after: pur.changed_spec_name.after,
                    },
                  ],
                  detail: generateUIList({
                    modifyObj: pur,
                    log_type,
                  }),
                }
              }
              if (pur.change_type === 2) {
                spec_detail = {
                  spec_name: [
                    {
                      fieldName: '商品名称(ID)',
                      before: pur.changed_spec_name.before,
                      after: '该商品被删除',
                    },
                  ],
                  detail: generateUIList({
                    modifyObj: pur,
                    log_type,
                  }),
                }
              }
              if (pur.change_type === 3) {
                spec_detail = {
                  spec_name: [
                    {
                      fieldName: '商品名称(ID)',
                      before: pur.changed_spec_name.before,
                      after: pur.changed_spec_name.before,
                    },
                  ],
                  detail: generateUIList({
                    modifyObj: pur,
                    log_type,
                  }),
                }
              }
              return spec_detail
            })
          }
          idlist = _.map(newlist, (item) => {
            return Object.assign(item.spec_name[0], {
              detail: item.detail.filter(
                (item) =>
                  item.fieldName !== '商品名称(ID)' &&
                  item.fieldName !== '商品ID',
              ),
            })
          })
          dataList = [...dataList, ...idlist]

          // 处理分摊
          if (share) {
            const _share = _.map(share, (sha) => {
              return Object.assign(
                {
                  fieldName: '分摊',
                  before: sha ? '-' : '新增分摊记录',
                  after:
                    sha.share_method.before === '-'
                      ? '新增分摊记录'
                      : '删除分摊记录',
                },
                {
                  detail: generateUIList({
                    modifyObj: sha,
                    log_type,
                  }),
                },
              )
            })
            dataList = [...dataList, ..._share]
          }

          // 处理折让
          if (discount) {
            const _discount = _.map(discount, (dis) => {
              return Object.assign(
                {
                  fieldName: '折让',
                  before: dis ? '-' : '新增折让记录',
                  after:
                    dis.discount_action.before === '-'
                      ? '新增折让记录'
                      : '删除折让记录',
                },
                {
                  detail: generateUIList({
                    modifyObj: dis,
                    log_type,
                  }),
                },
              )
            })
            dataList = [...dataList, ..._discount]
          }

          // 过滤未修改字段
          const _list = _.filter([...list, ...dataList], (item) => {
            return (
              (item && item.before !== item.after) ||
              item.fieldName === '商品名称(ID)'
            )
          })

          // 按照一定顺序展示
          const order_list = []
          _.each(order_show, (item) => {
            const _item = _.filter(
              _list,
              (each) => each.fieldName === item.fieldName,
            )

            _item.length && order_list.push(..._item)
          })

          const id = _.filter(_list, (item) => {
            return item && item.bold
          })
          id.length && order_list.unshift(id[0])

          this.specidList = order_list
          this.isLoading = false
        }),
      )
      .catch((e) => {
        this.isLoading = false
      })
  }
}

export default new StorageDetailStore()
