import { Request } from '@gm-common/request'
import { isEndOfDay } from 'common/util'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { action, observable, runInAction } from 'mobx'
import moment from 'moment'

// 初始的筛选器
const initFilter = {
  start_time: moment().startOf('day'),
  end_time: moment().endOf('day'),
  sheet_no: '',
  settle_supplier_id: '',
  status: '', // 全部状态
  require_goods_sheet_status: '', // 要货申请状态
  source: '', // 单据来源
}

/**
 * 采购单Store的类，用于采购单相关操作
 */
class Store {
  @observable filter = initFilter
  @observable supplyGroup = [] // 列表页筛选用
  @observable list = []
  @observable selected = []
  @observable selectAllType = false

  /**
   * 重置筛选器
   */
  @action
  resetFilter() {
    this.filter = initFilter
  }

  @action
  reloadFilter(filter) {
    this.filter = { ...filter }
  }

  /**
   * 更改筛选器
   * @param  {string} name  筛选名称
   * @param  {string} value 筛选值
   */
  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  /**
   * 获取供应商列表
   */
  @action
  getSupplierList() {
    Request('/stock/settle_supplier/get')
      .data()
      .get()
      .then((json) => {
        runInAction(() => {
          const group = _.map(json.data, (g) => {
            return {
              label: g.name,
              children: _.map(g.settle_suppliers, (suppliy) => {
                return {
                  value: suppliy._id,
                  text: suppliy.name,
                }
              }),
            }
          })
          group.unshift({
            label: t('全部'),
            children: [
              {
                text: t('全部供应商'),
                value: '',
              },
            ],
          })

          this.supplyGroup = group
        })
      })
  }

  /**
   * 批量提交采购单
   * @param  {Array}   purchaseSheets 采购单数据
   * @return {Promise}                提交采购单的请求
   */
  @action
  submitPurchaseSheets(purchaseSheets) {
    return Request('/stock/purchase_sheet/batch/submit')
      .data(purchaseSheets)
      .post()
  }

  /**
   * 设置该页已选的采购单
   * @param  {Array} selected 已选择的采购单
   */
  @action
  selectSingle(selected) {
    this.selected = selected
  }

  /**
   * 设置是否选择全部页的全部项
   * @param  {boolean} bool 是否选择全部页的全部项
   */
  @action
  setSelectAllType(bool) {
    this.selectAllType = bool
  }

  /**
   * 发送要货申请
   * @param  {Array}   sheet_no_list 采购单编号列表
   * @return {Promise}               要货的请求
   */
  @action
  apply(sheet_no_list) {
    const { end_time, start_time, ...rest } = this.filter
    const options = {
      ...rest,
      start_time_new: moment(this.filter.start_time).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
      end_time_new: moment(this.filter.end_time).format('YYYY-MM-DD HH:mm:ss'),
    }
    if (sheet_no_list) options.sheet_no_list = JSON.stringify(sheet_no_list)

    return Request('/stock/require_goods_sheet/apply').data(options).post()
  }

  /**
   * 获取分享二维码
   * @param  {string} sheet_no 采购单编号
   */
  @action
  getShareToken(sheet_no) {
    return Request('/stock/purchase_sheet/share_token').data({ sheet_no }).get()
  }

  /**
   * 获取采购单列表
   * @param  {Object} pagination 分页对象，默认为空
   * @return {Array}             采购单数据列表
   */
  @action
  getList(pagination = {}) {
    const { sheet_no, end_time, start_time, ...rest } = this.filter
    // 针对选择的结束时间需要多做一步处理, 当选择 24:00 时需要转换成 第二天00:00 传给后台
    const starTime = isEndOfDay(start_time)
    const endTime = isEndOfDay(end_time)

    const params = {
      ...rest,
      sheet_no: _.trim(sheet_no),
      // 添加时分的选择，后台为了兼容旧UI，新增字段名
      start_time_new: moment(starTime).format('YYYY-MM-DD HH:mm:ss'),
      end_time_new: moment(endTime).format('YYYY-MM-DD HH:mm:ss'),
      ...pagination,
    }

    return Request('/stock/purchase_sheet/get')
      .data(params)
      .get()
      .then((json) => {
        runInAction(() => {
          this.list = json.data
          this.selected = []
        })
        return json
      })
  }

  /**
   * 初始化所有属性
   */
  @action
  init() {
    this.filter = initFilter
    this.supplyGroup = []
    this.list = []
    this.selected = []
    this.selectAllType = false
  }

  /**
   * 删除采购单
   * @param  {string}  sheet_no 删除的采购单编号
   * @return {Promise}          删除采购单的请求
   */
  @action
  delete(sheet_no) {
    return Request('/stock/purchase_sheet/delete').data({ sheet_no }).post()
  }
}

export default new Store()
