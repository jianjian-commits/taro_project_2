import { observable, action, runInAction } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'
import { DBActionStorage, withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../../../common/action_storage_key_names'

import _ from 'lodash'
import { calculateCycleTime, isEndOfDay } from '../../../../common/util'
import { t } from 'gm-i18n'
import { Storage } from '@gmfe/react'

const initQueryFilter = {
  type: 2,
  begin: moment().startOf('day'),
  end: moment().endOf('day'),
  status: 0,
  search_text: '',
  address_label_id: '',
  route_id: '',
  has_remark: '',
  time_config_id: '',
}

const initPagination = {
  offset: 0,
  limit: 10,
}

const TEMPLATEID = 'out_stock_print_template_id'

@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.ORDER_VIEW_SKU,
  selector: ['queryFilter.type'], // 定位到selected数据结构位置
})
class Store {
  @observable queryFilter = { ...initQueryFilter }

  @observable searchedType = initQueryFilter.type

  @observable in_query = false

  @observable in_query_search_text = ''

  @observable serviceTime = []

  @observable loading = false

  @observable outStockList = []

  @observable pagination = { ...initPagination }

  // 商户标签
  @observable addressLabelList = [
    { text: t('全部商户标签'), value: '' },
    { value: -1, text: t('无商户标签') },
  ]

  // 线路
  @observable addressRouteList = [
    { text: t('全部线路'), value: '' },
    { value: -1, text: t('无线路') },
  ]

  // table已勾选项
  @observable tableSelected = []

  // 是否选择全部页，true为全部页，false为当前页
  @observable isAllPageSelect = false

  @action
  changeFilter(filed, value) {
    this.queryFilter[filed] = value
  }

  @action
  changeServiceTime(data) {
    this.serviceTime = data
  }

  @action
  changePagination(pagination) {
    this.pagination = pagination
  }

  /**
   * 改变table勾选项
   * @param {array} selected table勾选项
   */
  @action
  changeSelected(selected) {
    this.tableSelected = selected
  }

  /**
   * 设置表格全选
   * @param {bool} isSelect 是否全选当前页
   */
  @action
  setTableAllSelect(isSelect) {
    if (!isSelect) {
      this.tableSelected = []
    } else {
      this.tableSelected = _.map(this.outStockList, (v) => v.id)
    }
  }

  /**
   * 设置全部页勾选还是当前页勾选
   * @param {bool} isSelectAllPage 是否全部页
   */
  @action
  setCurrentPageAllSelect(isSelectAllPage) {
    this.isAllPageSelect = isSelectAllPage
  }

  /**
   * 搜索后要重置table选择
   */
  @action
  clearTableSelected() {
    this.tableSelected = []
    this.isAllPageSelect = false
  }

  @action
  getReqDataList() {
    const {
      begin,
      end,
      type,
      search_text,
      status,
      time_config_id,
      address_label_id,
      route_id,
      has_remark,
    } = this.queryFilter

    // 是否是运营周期
    const isCycleType = type === 3
    // 运营周期不需要处理23：59这种情况
    const start_date = isCycleType
      ? moment(begin).format('YYYY-MM-DD HH:mm')
      : isEndOfDay(begin)
    const end_date = isCycleType
      ? moment(end).format('YYYY-MM-DD HH:mm')
      : isEndOfDay(end)
    const service_time = _.find(
      this.serviceTime,
      (s) => s._id === time_config_id,
    )

    const reqData = {
      type: type,
      status,
      search_text,
      address_label_id,
      route_id,
      has_remark,
    }

    if (type + '' === '3') {
      reqData.time_config_id = time_config_id
      reqData.cycle_start_time = calculateCycleTime(
        start_date,
        service_time,
      ).begin
      reqData.cycle_end_time = calculateCycleTime(end_date, service_time).end
    } else {
      reqData.start_date_new = start_date
      reqData.end_date_new = end_date
    }

    return reqData
  }

  @action
  fetchServiceTime() {
    return Request('/service_time/list')
      .get()
      .then((json) => {
        const time_config_id = DBActionStorage.get(
          ACTION_STORAGE_KEY_NAMES.PRODUCT_OUTSTOCK_TIME,
        )
        const { initServiceTimeId } = DBActionStorage.helper
        const curId = this.queryFilter.time_config_id

        this.serviceTime = json.data
        // 初始化运营时间
        initServiceTimeId(curId, time_config_id, json.data, (val) => {
          this.queryFilter.time_config_id = val
        })

        return json
      })
  }

  @action
  fetchOutStockList(pagination = { ...initPagination }) {
    const req = {
      ...this.getReqDataList(),
      ...pagination,
    }

    this.loading = true

    return Request('/stock/out_stock_sheet/list')
      .data(req)
      .get()
      .then((json) => {
        const response = json.data
        runInAction(() => {
          this.outStockList = response && response.out_stock_list
          this.in_query = response && response.in_query
          this.in_query_search_text = req.search_text || ''

          this.searchedType = req.type + ''
          this.loading = false
          this.clearTableSelected()
        })

        return json
      })
  }

  @action
  fetchAddressLabelList() {
    return Request('/station/address_label/list')
      .data()
      .get()
      .then((json) => {
        runInAction(() => {
          const dataForSelect = _.map(json.data, (item) => {
            return {
              ...item,
              text: item.name,
              value: item.id,
            }
          })
          dataForSelect.push({ value: -1, text: t('无商户标签') })
          dataForSelect.unshift({ text: t('全部商户标签'), value: '' })

          this.addressLabelList = dataForSelect
        })
      })
  }

  @action
  fetchAddressRouteList() {
    return Request('/station/address_route/list')
      .data({ limit: 1000 })
      .get()
      .then((json) => {
        runInAction(() => {
          const dataForSelect = _.map(json.data, (item) => {
            return {
              ...item,
              text: item.name,
              value: item.id,
            }
          })
          dataForSelect.push({ value: -1, text: t('无线路') })
          dataForSelect.unshift({ text: t('全部线路'), value: '' })

          this.addressRouteList = dataForSelect
        })
      })
  }

  @action
  fetchBatchRemindData() {
    let req = {}

    // 是否全选页，全选页则传条件，否则传out_stock_list单号
    if (this.isAllPageSelect) {
      req = {
        ...this.getReqDataList(),
      }
    } else {
      req = {
        out_stock_list: JSON.stringify(this.tableSelected),
      }
    }
    // 需要获取选择的出库单数目
    req = {
      ...req,
      is_new_ui: 1,
    }

    return Request('/stock/out_stock_sheet/negative_stock_remind_batch')
      .data(req)
      .get()
  }

  @action
  fetchBatchRemindDataNew = () => {
    // 批量出库新接口
    let req = {}
    // 是否全选页，全选页则传条件，否则传out_stock_list单号
    if (this.isAllPageSelect) {
      req = {
        ...this.getReqDataList(),
      }
    } else {
      req = {
        out_stock_list: JSON.stringify(this.tableSelected),
      }
    }

    return Request('/stock/out_stock_sheet/negative_stock_remind_batch_new')
      .data(req)
      .get()
  }

  @action
  postBatchOutStock() {
    let req = {}
    // 是否全选页，全选页则传条件，否则传out_stock_list单号
    if (this.isAllPageSelect) {
      req = {
        ...this.getReqDataList(),
      }
    } else {
      req = {
        out_stock_list: JSON.stringify(this.tableSelected),
      }
    }

    return Request('/stock/out_stock_sheet/submit/batch').data(req).post()
  }

  // 打印模板
  @observable
  templateList = []

  @observable
  templateID = null

  @action
  setTemplate = (v) => {
    Storage.set(TEMPLATEID, v)
    this.templateID = v
  }

  @action
  getTemplateList = () => {
    Request('/fe/stock_out_tpl/list')
      .get()
      .then((res) => {
        runInAction(() => {
          const templateID = Storage.get(TEMPLATEID)
          this.templateID = templateID || res.data[0].id
          this.templateList = res.data
        })
      })
  }
}

export default new Store()
