/* eslint-disable no-void */
/* eslint-disable no-unused-vars */
import { observable, action, runInAction, computed } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'
import { DBActionStorage, withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'
import SellOutDialog from 'common/components/sell_out_dialog'

import _ from 'lodash'
import { calculateCycleTime, isEndOfDay } from 'common/util'
import { t } from 'gm-i18n'
import { Storage, Tip, Dialog } from '@gmfe/react'
import React from 'react'

const initQueryFilter = {
  type: 1,
  begin: moment().startOf('day'),
  end: moment().endOf('day'),
  search_text: '',
  address_label_id: '',
  sorter_id: '',
  time_config_id: '',
  salemenuSelected: { name: t('全部报价单') },
  categoryFilter: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  sorting_is_print: '',
  perf_method: '',
  inspect_status: '',
  shop_id: '',
  orderType: '0',
  sorting_is_weighted: '',
  sorting_out_of_stock: '',
}

const initPagination = {
  offset: 0,
  limit: 10,
}

const TEMPLATEID = 'out_stock_print_template_id'

@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.SORTING_DETAIL_VIEW,
  selector: ['queryFilter.type'], // 定位到selected数据结构位置
})
class Store {
  @observable queryFilter = { ...initQueryFilter }

  @observable searchedType = initQueryFilter.type

  @observable serviceTime = []

  @observable total = 0
  @observable finished = 0
  @observable loading = false

  @observable outStockList = []

  @observable ref = null

  @observable pagination = { ...initPagination }

  @observable salemenuList = []

  @observable resetValueRef = []

  // 商户标签
  @observable addressLabelList = [
    { text: t('全部商户标签'), value: '' },
    { value: -1, text: t('无商户标签') },
  ]

  // 分拣员
  @observable sorterList = []

  // 线路
  @observable addressRouteList = [
    { text: t('全部线路'), value: '' },
    { value: -1, text: t('无线路') },
  ]

  // table已勾选项
  @observable tableSelected = []

  // 是否选择全部页，true为全部页，false为当前页
  @observable isAllPageSelect = false

  // 报价单列表
  @action
  getSaleMenuList() {
    return Request('/salemenu/sale/list')
      .get()
      .then(
        action((json) => {
          const salemenuList = json.data || []
          salemenuList.unshift({ name: t('全部报价单') })
          this.salemenuList = salemenuList
        }),
      )
  }

  // 运营周期
  @observable serviceTime = []

  // 获取运营时间
  getServiceTime() {
    return Request('/service_time/list')
      .get()
      .then(
        action((json) => {
          this.serviceTime = json.data
          return json.data
        }),
      )
  }

  @action
  reset() {
    this.queryFilter = {
      ...initQueryFilter,
      time_config_id: this.serviceTime[0]._id,
      begin: moment().startOf('day'),
      end: moment().endOf('day'),
    }
  }

  @action
  init() {
    this.queryFilter = {
      ...initQueryFilter,
      begin: moment().startOf('day'),
      end: moment().endOf('day'),
    }
  }

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
      this.tableSelected = _.map(this.outStockList, (v) => v._order_id)
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
      time_config_id,
      address_label_id,
      categoryFilter,
      sorting_is_print,
      perf_method,
      inspect_status,
      shop_id,
      salemenuSelected,
      orderType,
      sorting_is_weighted,
      sorter_id,
      sorting_out_of_stock,
    } = this.queryFilter

    // 是否是运营周期
    const isCycleType = +type === 2
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
    const category_id_1 = JSON.stringify(
      _.map(categoryFilter.category1_ids.slice(), (v) => v.id),
    )
    const category_id_2 = JSON.stringify(
      _.map(categoryFilter.category2_ids.slice(), (v) => v.id),
    )
    const pinlei_id = JSON.stringify(
      _.map(categoryFilter.pinlei_ids.slice(), (v) => v.id),
    )

    const reqData = {
      query_type: +type === 1 ? 3 : +type,
      search: search_text,
      address_label_id,
      sorter_id,
      category_id_1,
      category_id_2,
      pinlei_id,
      sorting_is_print,
      perf_method,
      inspect_status,
      shop_id,
      time_config_id: +type === 2 ? time_config_id : undefined,
      salemenu_id: salemenuSelected.id,
      order_process_type_id: orderType === '0' ? undefined : orderType,
      sorting_is_weighted,
      sorting_out_of_stock,
    }
    // debugger

    if (+type === 2) {
      reqData.time_config_id = time_config_id
      reqData.start_date = calculateCycleTime(start_date, service_time).begin
      reqData.end_date = calculateCycleTime(end_date, service_time).end
    } else {
      reqData.start_date = start_date
      reqData.end_date = end_date
    }

    return reqData
  }

  @action
  fetchServiceTime() {
    return Request('/service_time/list')
      .get()
      .then((json) => {
        const time_config_id = DBActionStorage.get(
          ACTION_STORAGE_KEY_NAMES.SORTING_DETAIL_TIME,
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
  fetchOutStockList(pagination = {}) {
    const req = {
      ...this.getReqDataList(),
      ...pagination,
    }
    // debugger
    this.loading = true

    return Request('/weight/weight_collect/sku/list_v2')
      .data(req)
      .get()
      .then((json) => {
        const response = json.data
        runInAction(() => {
          this.outStockList =
            response?.skus.map((it) => ({
              ...it,
              _order_id:
                it.order.order_id +
                it.order.detail_id +
                (it.order.source_detail_id || ''),
              order: {
                ...it.order,
                id: it.order_id,
                is_edit: false,
                temp_username: it.sorter.username,
                temp_sku_production_date: it.order.sku_production_date,
                temp_std_real_quantity: it.order.std_real_quantity,
                temp_real_quantity: it.order.real_quantity,
                _order_id:
                  it.order.order_id +
                  it.order.detail_id +
                  (it.order.source_detail_id || ''),
              },
            })) ?? []

          this.total = response?.total ?? 0
          this.finished = response?.finished ?? 0

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
  fetchSorterList() {
    Request(`/sorter/search`)
      .data({
        limit: 999,
        offset: 0,
      })
      .get()
      .then((json) => {
        runInAction(() => {
          const { data } = json
          this.sorterList = data.sorters

          return data
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
  updateOrder(index, key, value) {
    const list = this.outStockList.slice()
    const sku = list[index]
    const order = sku.order
    order[key] = value
    this.outStockList = list
  }

  // 设置批量缺货
  @action
  batchOutStock({ hide, skus, no_confirm, sku }) {
    this.loading = true
    let req = {}

    if (!this.isAllPageSelect && !skus && this.tableSelected.length === 0) {
      Tip.info(t('请至少选择一个商品'))
      return Promise.reject(new Error('请至少选择一个商品'))
    }

    const sorter = this.sorterList.find(
      (it) => it.username === sku?.order?.temp_username,
    )

    // 是否全选页，全选页则传条件，否则传 sku_id 号
    if (this.isAllPageSelect && !skus) {
      req = {
        ...this.getReqDataList(),
        op_way: 3,
      }
    } else {
      req = {
        skus: JSON.stringify(
          skus ??
            this.tableSelected
              .map((order_id) => {
                return this.outStockList.find((it) => it._order_id === order_id)
              })
              .map(
                ({
                  sku_id,
                  order_id,
                  source_detail_id,
                  detail_id,
                  source_order_id,
                }) => ({
                  order_id,
                  sku_id,
                  detail_id,
                  source_order_id,
                  source_detail_id,
                }),
              ),
        ),
        set_sorter: sorter
          ? JSON.stringify({
              name: sorter.name,
              user_id: sorter.user_id,
              username: sorter.username,
            })
          : void 0,
      }
    }

    const fn = () => {
      return Request('/weight/batch_out_of_stock/update')
        .data(req)
        .post()
        .then((json) => {
          if (json.code === 0) {
            Tip.success(t('修改成功'))
          } else {
            Tip.danger(json.msg)
          }

          runInAction(() => {
            this.fetchOutStockList(this.pagination)
            this.searchedType = req.type + ''
            this.loading = false
            hide()
            this.clearTableSelected()
          })

          return json
        })
    }

    if (no_confirm) return fn()

    return Dialog.confirm({
      children: <SellOutDialog />,
      title: t('批量修改缺货'),
      size: 'md',
    })
      .then(fn)
      .catch(() => {
        this.loading = false
      })
  }

  // 设置批量取消缺货
  @action
  batchOutStockUn({ hide }) {
    this.loading = true
    let req = {}

    // 是否全选页，全选页则传条件，否则传 sku_id 号
    if (this.isAllPageSelect) {
      req = {
        ...this.getReqDataList(),
        op_way: 3,
      }
    } else {
      req = {
        skus: JSON.stringify(
          this.tableSelected
            .map((order_id) => {
              return this.outStockList.find((it) => it._order_id === order_id)
            })
            .map(
              ({
                sku_id,
                order_id,
                source_detail_id,
                detail_id,
                source_order_id,
              }) => ({
                order_id,
                sku_id,
                detail_id,
                source_order_id,
                source_detail_id,
              }),
            ),
        ),
      }
    }

    return Request('/weight/batch_un_out_of_stock/update')
      .data(req)
      .post()
      .then((json) => {
        if (json.code === 0) {
          Tip.success(t('修改成功'))
        } else {
          Tip.danger(json.msg)
        }
        runInAction(() => {
          this.searchedType = req.type + ''
          this.loading = false
          hide()
          this.clearTableSelected()
        })

        return json
      })
  }

  @computed
  get local_finished() {
    return this.isAllPageSelect
      ? this.finished
      : this.outStockList
          .filter((it) => this.tableSelected.includes(it._order_id))
          .reduce((acc, current) => {
            return acc + (current.is_finished ? 1 : 0)
          }, 0)
  }

  get local_total() {
    return this.isAllPageSelect ? this.total : this.tableSelected.length
  }

  @action
  noEdit() {
    this.outStockList = this.outStockList.slice().map((it) => {
      return {
        ...it,
        order: {
          ...it.order,
          is_edit: false,
        },
      }
    })
  }

  @action
  oneClickSort({ sorter_selected, autoPrint, hide }) {
    this.loading = true

    const { name, user_id, username } = sorter_selected.value
    const set_sorter = { name, user_id, username }
    const print_when_finished = autoPrint ? 1 : 0
    let req = {}

    // 是否全选页，全选页则传条件，否则传 sku_id 号
    if (this.isAllPageSelect) {
      req = {
        ...this.getReqDataList(),
        print_when_finished,
        set_sorter: JSON.stringify(set_sorter),
      }
    } else {
      req = {
        print_when_finished,
        set_sorter: JSON.stringify(set_sorter),
        skus: JSON.stringify(
          this.tableSelected
            .map((order_id) => {
              return this.outStockList.find((it) => it._order_id === order_id)
            })
            .map(
              ({
                sku_id,
                order_id,
                source_detail_id,
                detail_id,
                source_order_id,
                order,
              }) => ({
                set_weight: order.std_real_quantity,
                order_id,
                sku_id,
                detail_id,
                source_order_id,
                source_detail_id,
              }),
            ),
        ),
      }
    }

    return Request('/weight/sku/one_click_sort')
      .data(req)
      .post()
      .then((json) => {
        if (json.code === 0) {
          Tip.success(t('修改成功'))
        } else {
          Tip.danger(json.msg)
        }
        runInAction(() => {
          this.searchedType = req.type + ''
          this.loading = false
          hide()
          this.clearTableSelected()
        })

        return json
      })
  }

  @action
  batchChangeSorter({ sorter_selected, autoPrint, hide }) {
    this.loading = true

    const { name, user_id, username } = sorter_selected.value
    const set_sorter = { name, user_id, username }
    const print_when_finished = autoPrint ? 1 : 0
    let req = {}

    // 是否全选页，全选页则传条件，否则传 sku_id 号
    if (this.isAllPageSelect) {
      req = {
        ...this.getReqDataList(),
        print_when_finished,
        set_sorter: JSON.stringify(set_sorter),
      }
    } else {
      req = {
        print_when_finished,
        set_sorter: JSON.stringify(set_sorter),
        skus: JSON.stringify(
          this.tableSelected
            .map((order_id) => {
              return this.outStockList.find((it) => it._order_id === order_id)
            })
            .map(
              ({
                sku_id,
                order_id,
                source_detail_id,
                detail_id,
                source_order_id,
                order,
              }) => ({
                set_weight: order.std_real_quantity,
                order_id,
                sku_id,
                detail_id,
                source_order_id,
                source_detail_id,
              }),
            ),
        ),
      }
    }

    return Request('/weight/sku/sorter/update')
      .data(req)
      .post()
      .then((json) => {
        if (json.code === 0) {
          Tip.success(t('修改成功'))
        } else {
          this.loading = false
          Tip.danger(json.msg)
        }
        runInAction(() => {
          this.searchedType = req.type + ''
          this.loading = false
          hide()
          this.clearTableSelected()
        })

        return json
      })
  }

  // 设置出库数
  @action
  updateQuantity(index, value) {
    const skuList = this.outStockList.slice()
    const sku = skuList[index]
    const order = sku.order
    const sorter = this.sorterList.find(
      (it) => it.username === order.temp_username,
    )
    const param = {
      weights: JSON.stringify([
        {
          order_id: order.order_id,
          sku_id: sku.sku_id,
          detail_id: order.detail_id,
          weight: order.weighting_quantity,
          set_weight: value ?? order.set_weight,
          source_order_id: order.source_order_id,
          source_detail_id: order.source_detail_id,
          set_production_date: order.temp_sku_production_date
            ? moment(order.temp_sku_production_date).format('YYYY-MM-DD')
            : void 0,
        },
      ]),
      set_sorter: sorter
        ? JSON.stringify({
            name: sorter.name,
            user_id: sorter.user_id,
            username: sorter.username,
          })
        : void 0,
      need_res: 1,
    }
    return Request('/weight/sku/set_weight')
      .data(param)
      .code([101, 0])
      .post()
      .then(
        action((json) => {
          if (json.code === 0) {
            sku.order = Object.assign({}, order, json.data[0], {
              out_of_stock: 0,
            })
            this.outStockList = skuList
            Tip.success(t('修改成功！'))
          } else if (json.code === 101) {
            sku.order = Object.assign({}, order, json.data, {
              is_weight: json.data.has_weighted,
            })
            this.outStockList = skuList
            Tip.success(
              t(
                '已在其他设备完成分拣，出库数更新为最新重量。请核对数量后再进行操作。',
              ),
            )
          }
          return json
        }),
      )
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
  setPagination = (ref) => {
    this.ref = ref
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
