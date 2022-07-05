import { t } from 'gm-i18n'
import { action, observable, computed, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import globalStore from 'stores/global'
import { doBatchEditData } from './tools'

class TechnologyStore {
  @observable receiveMaterialList = [] // 领料列表
  @observable returnMaterialList = [] // 退料列表
  @observable batchList = [] // 批次列表
  @observable users = [] // 设置领料人——领料用户列表
  @observable recverList = [] // 筛选条件领料用户列表
  @observable returnSkus = []

  @observable receiveMaterialFilter = {
    begin: new Date(),
    end: new Date(),
    q: '',
    status: 0,
    code: undefined,
    search_type: 1,
    remark_type: 0, // 0-全部
    recver_id: -1, // 领料人 -1-全部
  } // 领料搜索条件

  @observable receiveMaterialPagination = {
    page_obj: null,
  }

  @observable returnMaterialFilter = {
    begin: new Date(),
    end: new Date(),
    q: '',
    search_type: 1,
    recver_id: -1, // 领料人 -1-全部
  } // 退料搜索条件

  @observable returnMaterialPagination = {
    page_obj: null,
  }

  @observable batchActionList = []

  @observable allSelect = false

  /**
   * @type {{ingredient_id:number,ingredient_name:string,
   * ratio:number,std_unit_name:string,sale_unit_name:string,amount:number,total_remain:number}[]}
   */
  @observable batch_edit_list = []

  /**
   * 批量编辑领料的状态
   * @type {number} 1 未领取 2 已领取
   */
  @observable status = 2

  /**
   * 批量设置领料人
   * @type {number}
   */
  @observable batch_recver

  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable pagination = {} // 记录分页组件返回的pagination做二次查询使用

  @observable earlySelectedIds = []

  @action changeEarlySelectedIds(ids) {
    this.earlySelectedIds = ids
  }

  @action changePagination(pagination) {
    this.pagination = pagination
  }

  /**
   * @param v {number}
   */
  @action setBatchRecver(v) {
    this.batch_recver = v
  }

  /**
   * @param v {number}
   */
  @action setStatus(v) {
    this.status = v
  }

  @action.bound
  clearBatchEditList() {
    this.batch_edit_list = []
  }

  /**
   * 获取批量编辑领料批次信息列表
   * @param filter {number[]|{begin?:string,end?:string,q?:string,status?:number}[]}
   * @param type {string}
   */
  @action fetchBatchEditList(filter, type) {
    return Request(
      '/stock/process/process_order/ingredient_recv/aggs_ingredient',
    )
      .data(filter)
      .post()
      .then(({ data }) => {
        runInAction(() => {
          this.batch_edit_list =
            type === 'set_batch_num' ? doBatchEditData(data) : data // 批量设置领料批次需要过滤库存为0的数据
        })
      })
  }

  @action
  getBatchSelectFilter(selected) {
    const { allSelect, filterReceiveSearchData } = this
    let req = {}
    if (allSelect) {
      req = { ...filterReceiveSearchData }
    } else {
      req.ids = JSON.stringify(selected)
    }

    return req
  }

  /**
   * 更新编料批次值
   * @param value {{amount: *}}
   * @param index {number}
   */
  @action setBatchEditListItem(value, index) {
    Object.assign(this.batch_edit_list[index], value)
  }

  @action
  init() {}

  @action
  clearPagination(type) {
    type === 0
      ? (this.receiveMaterialPagination = { page_obj: null })
      : (this.returnMaterialPagination = { page_obj: null })
  }

  @action
  setReceiveMaterialFilter(field, value) {
    this.receiveMaterialFilter[field] = value
  }

  @action
  setReturnMaterialFilter(field, value) {
    this.returnMaterialFilter[field] = value
  }

  @action
  getReceiveMaterialList(data) {
    return Request('/stock/process/process_order/ingredient_recv/list')
      .data(data)
      .get()
      .then((json) => {
        this.receiveMaterialList = json.data
        return json
      })
  }

  @action setReceiveMaterialListItem(index, value) {
    Object.assign(this.receiveMaterialList[index], value)
  }

  @action
  getReturnMaterialList(data) {
    return Request('/stock/process/process_order/ingredient_return/list')
      .data(data)
      .get()
      .then((json) => {
        this.returnMaterialList = json.data
        return json
      })
  }

  @action
  searchReceiver() {
    return Request('/gm_account/station/clean_food/user/search')
      .data()
      .code([10])
      .get()
      .then((json) => {
        const filterData = _.filter(json.data.users, (item) => {
          // type_id 1 为供应商
          return item.type_id !== 1
        })
        const data = filterData.map((item) => ({
          ...item,
          value: item.id,
          text: _.trim(item.name) || item.username,
        }))

        this.users = globalStore.otherInfo.isStaff
          ? data
          : [
              {
                value: globalStore.user.userId,
                text: globalStore.user.first_name,
              },
            ]
        this.recverList = _.concat([{ text: t('全部领料人'), value: -1 }], data)

        return json.data
      })
  }

  @observable batchLoading = false

  @action
  doSortFilterBatch(data, selectedData) {
    const early = []
    const later = []

    _.map(data, (item) => {
      let isSelected = false
      _.each(selectedData, (selected) => {
        if (selected.batch_num === item.batch_num) {
          isSelected = true
          item.amount = +Big(selected.amount).toFixed(2)
        }
      })

      if (isSelected) {
        early.push(item)
      } else {
        later.push(item)
      }
    })

    return early.concat(later)
  }

  @action
  getMaterialBatch(index) {
    this.batchLoading = true
    const {
      ingredient_id,
      remark_type,
      ingredient_version,
      batch_list,
    } = this.receiveMaterialList[index]

    return Request('/stock/process/process_order/ingredient/avail_batch')
      .data({ ingredient_id, remark_type, ingredient_version })
      .get()
      .then((json) => {
        const data = json.data.batchs.map((i) => ({
          ...i,
          stock_num: +Big(i.stock_num).toFixed(2),
          amount: undefined,
        }))
        runInAction(() => {
          this.batchList = this.doSortFilterBatch(data, batch_list)
        })

        this.setBatchSelected(_.map(batch_list, (v) => v.batch_num))

        return json.data.batchs
      })
      .finally(() => {
        this.batchLoading = false
      })
  }

  @action
  setBatchListItem(value, index) {
    Object.assign(this.batchList[index], value)
  }

  @action
  updateReturn(param) {
    return Request('/stock/process/process_order/ingredient_recv/update')
      .data(param)
      .post()
      .then((json) => json)
  }

  @action
  checkProcessOrder(q) {
    return Request('/stock/process/process_order/check')
      .data({ q })
      .get()
      .then((json) => {
        this.returnSkus = _.map(json.data, (d) => {
          return {
            ...d,
            _id: _.toString(d.id) + d.batch_num,
          }
        })
        return json.data
      })
  }

  @action setReturnSkusItem(index, value) {
    Object.assign(this.returnSkus[index], value)
  }

  @action
  materialReturn(param) {
    return Request('/stock/process/process_order/ingredient_return/create')
      .data(param)
      .post()
      .then((json) => {
        return json
      })
  }

  @action setBatchActionList(list) {
    this.batchActionList = list
  }

  @action setSelectAll(v) {
    this.allSelect = v
  }

  /**
   * 批量操作
   * @param option {{begin?:string,
   * end?:string,
   * q?:string,
   * status?:string,
   * ids?:string,
   * update_type?:'set_batch_num'|'set_status'|'set_recver',
   * set_batch_list?:{ingredient_id:string,amount:number}[],
   * set_status?:1|2,set_recver?:number}}
   * @returns {Promise<*>}
   */
  @action batchUpdate(option) {
    return Request('/stock/process/process_order/ingredient_recv/batch_update')
      .data(option)
      .post()
  }

  @computed
  get filterReceiveSearchData() {
    const {
      q,
      recver_id,
      begin,
      code,
      end,
      remark_type,
      search_type,
      status,
    } = this.receiveMaterialFilter
    const filter = {
      status,
      code,
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
    }

    if (q !== '') {
      filter.q = q
      filter.search_type = search_type
    }
    if (remark_type !== 0) {
      filter.remark_type = remark_type
    }
    if (+recver_id !== -1) {
      filter.recver_id = recver_id
    }

    return filter
  }

  @computed
  get filterReturnSearchData() {
    const { q, begin, end, recver_id, search_type } = this.returnMaterialFilter
    const filter = {
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
    }
    if (q !== '') {
      filter.q = q
      filter.search_type = search_type
    }

    if (+recver_id !== -1) {
      filter.recver_id = recver_id
    }

    return filter
  }

  @observable batchSelected = []

  @action setBatchSelected = (list) => {
    this.batchSelected = list
  }
}

export default new TechnologyStore()
