import { action, observable, runInAction } from 'mobx'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { sortByMultiRule } from '../../../../common/util'
import { Dialog, Storage } from '@gmfe/react'
import Big from 'big.js'
import { ROOT_KEY, getRuleList } from '../util'
import { getPurchasePrice, isValid } from '../../util'
import { history } from 'common/service'
const smartToFixed = (value) => {
  return parseFloat(value || 0, 10) + ''
}

const initTasksItem = {
  purchase_money: null,
  release_id: null,
  suggest_purchase_num: '',
  description: '',
  id: '',
  latest_quote_from_supplier: false,
  spu_status: null,
  purchase_unit_name: '',
  plan_amount: null,
  stock: null,
  ref_price: null,
  std_unit_name: '',
  pinlei_name: '',
  supplier_purchase_avg_price: '',
  quoted_from_supplier: false,
  status: null,
  goods_remark: '',
  release_time: null,
  category_name_1: '',
  address: [],
  spec_id: '',
  already_purchased_amount: null, // 已采购
  category_name_2: '',
  purchase_amount: null,
  purchase_sale_amount: null,
  ratio: 1,
  spec_name: '',
  purchase_price: '',
  supply_amount: '', // 供应商报量（基本单位）
  supply_price: '', // 供应商报价
  tax_rate: null,
  tax_money: null,
  purchase_money_no_tax: null,
  // 参考成本价格字段 start
  // 供应商周期报价
  supplier_cycle_quote: null,
  last_in_stock_price: null,
  last_quote_price: null,
  latest_in_stock_price: null,
  latest_purchase_price: null,
  latest_quote_price: null,
  stock_avg_price: null,
  last_purchase_price: null,
  // 参考成本价格字段 end
}

const initBillDetail = {
  purchase_sheet_id: '', // 单据id
  settle_supplier_id: '', // 所选供应商id
  purchaser_id: '', // 所选采购员id
  sheet_remark: '', // 单据备注
  require_goods_sheet_status: '', // 要货申请状态
  status: '', // 单据状态
  operator: '', // 创建人
  submit_time: '', // 提交时间
  supplier_name: '', // 供应商名称
  purchaser_name: '', // 采购员名称
}

class Store {
  @observable supplyList = [] // 供应商list
  @observable purchaserList = [] // 采购员list
  @observable billDetail = initBillDetail

  @observable in_stock_sheet_id = '' // 管理入库单id
  @observable in_stock_sheet_status = 0 // 管理入库单状态
  // 排序 记录在localstorage上 格式 { sort_by, sort_direction }
  @observable sortItem = Storage.get(ROOT_KEY) || {
    sort_by: '',
    sort_direction: '',
  }

  @observable tasks = [initTasksItem] // table list
  @observable taskFinishDialogShow = false
  @observable finishTasks = []
  @observable reference_price_type = 1 // 参考价格类型
  @observable isEditTask = false // 保存草稿or直接保存
  @observable progressUnit = 0 // 0-基本单位 1-采购单位

  @observable psmCreateSheetItems = Storage.get('psm_create_sheet_items') || [
    'release_time',
    'category_name',
    'ref_price',
    'purchase_price',
    'suggest_purchase_num',
    'plan_amount',
  ]

  @action
  changeBillDetail(name, value) {
    this.billDetail[name] = value
  }

  @action
  getPurchaserList(settle_supplier_id) {
    return Request('/purchase/task/optional_suppliers_purchasers')
      .data({ settle_supplier_id })
      .get()
      .then((json) => {
        runInAction(() => {
          const list = json.data.optional_purchasers
          this.purchaserList = _.map(list, (pl) => ({
            value: pl.purchaser_id,
            text: pl.purchaser_name,
          }))
          if (list.length) {
            this.billDetail.purchaser_id = list[0].purchaser_id
          }
        })
      })
  }

  @action
  getDetail(sheet_no) {
    const { sort_by, sort_direction } = this.sortItem
    return Request('/stock/purchase_sheet/details', { timeout: 60000 })
      .data({ sheet_no })
      .get()
      .then((json) => {
        runInAction(() => {
          const {
            in_stock_sheet_id,
            tasks,
            purchase_sheet,
            in_stock_sheet_status,
          } = json.data
          this.tasks = _.map(
            sortByMultiRule(tasks, getRuleList(sort_by, sort_direction)),
            (v) => {
              const {
                purchase_price_limit,
                purchase_amount,
                purchase_price,
                ratio,
                purchase_money,
              } = v
              return {
                ...v,
                purchase_money: purchase_money
                  ? Big(purchase_money).toFixed(2)
                  : smartToFixed(
                      Big(purchase_amount)
                        .times(purchase_price / 100)
                        .toFixed(2),
                    ),
                purchase_price_limit: purchase_price_limit
                  ? smartToFixed(purchase_price_limit / 100)
                  : '',
                purchase_sale_amount: smartToFixed(
                  Big(purchase_amount).div(ratio).toFixed(2),
                ), // 采购数量(采购单位)
                purchase_price: smartToFixed(purchase_price / 100),
              }
            },
          )
          this.billDetail = { ...initBillDetail, ...purchase_sheet }
          this.in_stock_sheet_id = in_stock_sheet_id
          this.in_stock_sheet_status = in_stock_sheet_status
        })
        return json
      })
  }

  @action
  submit(sheet_no) {
    return Request('/stock/purchase_sheet/submit')
      .data({ sheet_no })
      .code([0, 2])
      .post()
      .then((json) => {
        runInAction(() => {
          if (json.code === 2) {
            Dialog.alert({
              children: i18next.t('存在已完成的任务，请删除后再提交！'),
            })

            return Promise.reject(new Error('existCompletedTask'))
          } else if (json.code === 0) {
            this.taskFinishDialogShow = true
            this.finishTasks = _.map(json.data, (v) => ({
              ...v,
              _selected: true,
            }))

            return Promise.resolve()
          }
        })
      })
  }

  @action
  save(
    purchase_sheet_id,
    settle_supplier_id,
    purchaser_id,
    sheet_remark,
    tasks,
    isRequireGoodsSend = null,
  ) {
    // 特殊逻辑判断 当如果单价为0的特殊逻辑
    _.forEach(tasks, (item) => {
      if (
        Number(item?.purchase_money) > 0 &&
        Number(item?.purchase_price) === 0
      ) {
        // 保存草稿 如果获取到为空的值会存入时间
        window.localStorage.setItem(
          'zero_purchase',
          JSON.stringify(tasks) + '-' + new Date().getTime(),
        )
        item.purchase_price = Big(item?.purchase_money || 0)
          .div(item?.purchase_amount || 1)
          .times(100)
          .toFixed(2)
      }
    })
    const params = {
      purchase_sheet_id,
      settle_supplier_id,
      details: JSON.stringify(tasks),
    }
    if (isRequireGoodsSend !== null) {
      params.resend_require_goods_sheet = isRequireGoodsSend
    }

    params.purchaser_id = purchaser_id || ''
    params.sheet_remark = sheet_remark
    return Request('/stock/purchase_sheet/modify').data(params).post()
  }

  // submit 0：新建+保存草稿 1：新建+直接提交
  @action
  create(settle_supplier_id, purchaser_id, sheet_remark, tasks, submit) {
    const params = {
      settle_supplier_id,
      purchaser_id,
      sheet_remark: sheet_remark || null,
      details: JSON.stringify(tasks),
      submit,
    }
    return Request('/stock/purchase_sheet/create').data(params).post()
  }

  @action
  checkResend(sheet_no) {
    return Request('/stock/require_goods_sheet/check_resend')
      .data({ sheet_no })
      .get()
  }

  @action
  batchImport(sheet_id, file) {
    return Request('/stock/purchase_sheet/import')
      .data({ sheet_id, file })
      .post()
  }

  @action
  getSupplyList() {
    return Request('/stock/settle_supplier/get')
      .get()
      .then((json) => {
        runInAction(() => {
          const list = []
          _.forEach(json.data, (v) => {
            _.forEach(v.settle_suppliers, (supply) => {
              list.push({
                value: supply._id,
                text: supply.name,
              })
            })
          })
          this.supplyList = list
        })
      })
  }

  @action
  getReferencePriceType(data) {
    Request('/station/ref_price_type/get')
      .data({ where: data })
      .get()
      .then((json) => {
        runInAction(() => {
          this.reference_price_type = json.data.type || 1
        })
      })
  }

  @action
  changeEditTask(bool) {
    this.isEditTask = bool
  }

  @action
  sort(name, direction) {
    let sortItem = {}
    if (!direction) {
      sortItem = { sort_by: '', sort_direction: '' }
    } else {
      sortItem = { sort_by: name, sort_direction: direction }
      this.tasks = sortByMultiRule(this.tasks, getRuleList(name, direction))
    }
    this.sortItem = sortItem
    Storage.set(ROOT_KEY, sortItem)
  }

  @action
  changeProgressUnit(type) {
    console.log('changeProgressUnit', type)
    this.progressUnit = type
  }

  @action
  setPsmCreateSheetItems(items) {
    Storage.set('psm_create_sheet_items', items)
    this.psmCreateSheetItems = items
  }

  @action
  addListItem() {
    this.tasks.push(initTasksItem)
  }

  @action
  deleteListItem(index) {
    this.tasks.remove(this.tasks[index])
    if (!this.tasks.length) {
      this.tasks.push(initTasksItem)
    }
  }

  @action
  changeListItem(index, changeData) {
    Object.assign(this.tasks[index], { ...changeData })
  }

  @action
  changeListItemName(index, selected, isSelect) {
    const changeData = {
      ...selected,
      spec_id: selected.value,
      spec_name: selected.text,
      purchase_money: null,
      ratio: selected.sale_ratio,
      purchase_price: isSelect
        ? Big(selected.purchase_price).toFixed(2)
        : Big(getPurchasePrice(selected) || 0)
            .div(100)
            .toFixed(2),
      purchase_amount: null,
      purchase_sale_amount: null,
      category_name_1: selected.category_id_1_name,
      category_name_2: selected.category_id_2_name,
      purchase_price_limit: selected.purchase_price_limit
        ? smartToFixed(selected.purchase_price_limit / 100)
        : null,
    }
    this.changeListItem(index, changeData)
  }

  @action
  searchSku(name) {
    return Request('/stock/in_stock_sku/supply_sku_new')
      .data({
        settle_supplier_id: this.billDetail.settle_supplier_id,
        name: name,
      })
      .get()
      .then((json) => {
        return json
      })
  }

  @action
  changeListItemPurchaseAmount(index, value) {
    const { ratio, purchase_price, tax_rate } = this.tasks[index]
    const changeData = {
      purchase_amount: value,
      purchase_money: Big(value || 0)
        .times(purchase_price || 0)
        .toFixed(2),
      purchase_sale_amount: Big(value || 0)
        .div(ratio)
        .toFixed(2),
    }
    if (changeData.purchase_money !== null) {
      this.batchSetMoney(changeData, tax_rate)
    }
    this.changeListItem(index, changeData)
  }

  @action
  changeListItemPurchaseSaleAmount(index, value) {
    const { ratio, purchase_price, tax_rate } = this.tasks[index]
    const purchase_amount = isValid(value)
      ? Big(value || 0)
          .times(ratio)
          .toFixed(2)
      : null
    const changeData = {
      purchase_sale_amount: value,
      purchase_money:
        isValid(value) && isValid(purchase_price)
          ? Big(purchase_amount || 0)
              .times(purchase_price || 0)
              .toFixed(2)
          : null,
      purchase_amount,
    }
    if (changeData.purchase_money !== null) {
      this.batchSetMoney(changeData, tax_rate)
    }
    this.changeListItem(index, changeData)
  }

  @action
  changeListItemPrice(index, value) {
    const { purchase_amount, tax_rate } = this.tasks[index]
    const changeData = {
      purchase_price: value,
      purchase_money: Big(value || 0)
        .times(purchase_amount || 0)
        .toFixed(2),
    }
    if (changeData.purchase_money !== null) {
      this.batchSetMoney(changeData, tax_rate)
    }
    this.changeListItem(index, changeData)
  }

  @action
  changeListItemMoney(index, value) {
    const { purchase_amount, tax_rate } = this.tasks[index]
    const changeData = {
      purchase_money: value,
      purchase_price: Big(value || 0)
        .div(purchase_amount || 0)
        .toFixed(2),
    }
    if (value !== null) {
      this.batchSetMoney(changeData, tax_rate)
    }
    this.changeListItem(index, changeData)
  }

  @action
  clear() {
    this.tasks = [initTasksItem]
    this.supplyList = []
    this.purchaserList = []
    this.billDetail = initBillDetail
    this.finishTasks = []
  }

  @action
  taskFinish() {
    const release_ids = _.map(
      _.filter(this.finishTasks, (f) => f._selected),
      (t) => t.release_id,
    )
    return Request('/purchase/task/finish_task')
      .data({ release_ids: JSON.stringify(release_ids) })
      .post()
      .then(() => {
        this.finishTasks = []
        this.taskFinishDialogShow = false
      })
      .then(() => {
        window.closeWindow()
      })
  }

  @action
  taskCancel() {
    this.taskFinishDialogShow = false
    this.finishTasks = []
  }

  @action
  taskSelectAll(bool) {
    this.finishTasks = _.map(this.finishTasks, (task) => {
      task._selected = bool
      return task
    })
  }

  @action
  taskSelect(index, value) {
    this.finishTasks[index]._selected = value
  }

  @action
  batchSetMoney(changeData, tax_rate) {
    if (changeData.purchase_money !== null) {
      changeData.purchase_money_no_tax = Big(changeData.purchase_money)
        .div(
          Big(tax_rate || 0)
            .div(10000)
            .plus(1),
        )
        .toFixed(2)
      changeData.tax_money = Big(changeData.purchase_money)
        .times(Big(tax_rate || 0).div(10000))
        .div(
          Big(tax_rate || 0)
            .div(10000)
            .plus(1),
        )
        .toFixed(2)
    }
  }

  // 获取参考成本
  @action
  fetchRefPriceData(req) {
    return Request('/purchase/purchase_spec/ref_price')
      .data(req)
      .get()
      .then((json) => {
        return json
      })
  }
}

export default new Store()
