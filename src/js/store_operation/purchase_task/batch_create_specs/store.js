import { i18next } from 'gm-i18n'
import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'

class Store {
  specDetail = {
    spec_id: '',
    plan_purchase_amount: null, // 采购基本单位
    time_config_id: '',
    isRelatedTasksCycle: false,
    cycle_start_time: moment(),
    selectedSpec: {
      text: '',
      value: '',
      spec: {},
    },
    suppliers: [],
    selectedSupplier: {
      text: '',
      value: '',
      supplier: {
        settle_supplier_id: '',
        supplier_name: '',
        default_purchaser_id: null,
        default_purchaser_name: '',
      },
    },
    purchaserList: [],
    description: '',
  }

  @observable serviceTimes = []

  @observable tasks = []

  @observable specList = [] // 采购规格

  @action
  init(serviceTimes, time_config_id) {
    this.specDetail = Object.assign(
      {},
      { ...this.specDetail },
      { time_config_id },
    )
    this.tasks = [this.specDetail]
    this.serviceTimes = serviceTimes
    this.specList = []
  }

  @action
  addDeleteTaskDetail(index, isAdd = true) {
    const taskDetails = this.tasks.slice()
    if (isAdd) {
      if (index !== undefined) {
        taskDetails.splice(index + 1, 0, this.specDetail)
      } else {
        taskDetails.push(this.specDetail)
      }
    } else {
      taskDetails.splice(index, 1)
    }

    this.tasks = taskDetails
  }

  @action
  setRelatedTasksCycle(index, isRelatedTasksCycle) {
    const list = this.tasks.slice()
    list[index].isRelatedTasksCycle = !isRelatedTasksCycle
    this.tasks = list
  }

  @action
  setSpecsDetailInfo(index, value, filed) {
    const list = this.tasks.slice()
    list[index][filed] = value
    this.tasks = list
  }

  @action
  setSpecsSupplier(index, spec_id) {
    const list = this.tasks.slice()
    const spec = _.find(list[index].specs, (spec) => spec.value === spec_id)
    list[index].sale_purchase_amount = null
    list[index].selectedSpec = spec
    list[index].sku_id = spec_id
    this.getSupplierAndPurchaserBySpec_id(index, spec_id)
    this.tasks = list
  }

  @action
  setSelectedSupplier(index, selectedSupplier) {
    const list = this.tasks.slice()
    list[index].selectedSupplier = selectedSupplier || {
      text: '',
      value: '',
      supplier: {
        settle_supplier_id: '',
        supplier_name: '',
        default_purchaser_id: null,
        default_purchaser_name: '',
      },
    }
    this.tasks = list
    selectedSupplier && this.getPurchaserList(index, selectedSupplier.value)
  }

  @action
  setSelectedPurchaser(index, value) {
    const list = this.tasks.slice()
    const purchaser = _.find(
      list[index].purchaserList,
      (pl) => pl.value === value,
    )

    Object.assign(list[index].selectedSupplier.supplier, {
      default_purchaser_id: purchaser.value,
      default_purchaser_name: purchaser.text,
    })
    this.tasks = list
  }

  @action
  setPurchaseDesc(index, value) {
    const list = this.tasks.slice()
    list[index].description = value
    this.tasks = list
  }

  // 获取采购规格
  @action
  getMerchandiseSpec(q) {
    this.specList = []
    if (q) {
      Request('/stock/supply_sku')
        .data({ q })
        .get()
        .then(
          action((json) => {
            const specs = _.map(json.data, (item) => {
              const {
                spec_id,
                spec_name,
                sale_ratio,
                std_unit_name,
                sale_unit_name,
              } = item
              return {
                value: spec_id,
                // 展示单位如（1斤/斤）
                text: `${spec_name} (${sale_ratio}${std_unit_name}/${sale_unit_name})`,
                spec: item,
              }
            })

            this.specList = specs
          }),
        )
    }
  }

  // 选择采购规格 根据采购规格id拉取对应的供应商和采购员
  @action
  setSpecsInfo(index, selected) {
    const list = this.tasks.slice()
    if (!selected) {
      list[index] = this.specDetail
      this.specList = []
    } else {
      list[index].selectedSpec = selected
      list[index].spec_id = selected.spec && selected.spec.spec_id
      list[index].sale_purchase_amount = null
      list[index].description = selected.spec && selected.spec.description
      this.getSupplierAndPurchaserBySpec_id(
        index,
        selected.spec && selected.spec.spec_id,
      )
    }
    this.tasks = list
  }

  // 根据采购规格id,获取供应商
  @action
  getSupplierAndPurchaserBySpec_id(index, spec_id) {
    const list = this.tasks.slice()
    Request('/purchase/task/suppliers')
      .data({ spec_id })
      .get()
      .then(
        action((json) => {
          const supplier_list = []
          const supply = { label: i18next.t('推荐供应商') }
          const cant_supply = { label: i18next.t('其他供应商') }
          supply.children = _.map(json.data.supply, (ts) => ({
            value: ts.settle_supplier_id,
            text: ts.supplier_name,
            supplier: ts,
          }))

          cant_supply.children = _.map(json.data.cant_supply, (os) => ({
            value: os.settle_supplier_id,
            text: os.supplier_name,
            supplier: os,
          }))
          supplier_list.push(supply)
          supplier_list.push(cant_supply)
          list[index].suppliers = supplier_list
          const sup = json.data.supply[0] || json.data.cant_supply[0]
          list[index].selectedSupplier = {
            value: sup.settle_supplier_id,
            text: sup.supplier_name,
            supplier: sup,
          }

          this.getPurchaserList(index, sup.settle_supplier_id)

          this.tasks = list
        }),
      )
  }

  // 获取采购员
  @action
  getPurchaserList(index, settle_supplier_id) {
    const list = this.tasks.slice()
    Request('/purchase/task/optional_suppliers_purchasers')
      .data({ settle_supplier_id })
      .get()
      .then(
        action((json) => {
          list[index].purchaserList = _.map(
            json.data.optional_purchasers,
            (pl) => ({
              value: pl.purchaser_id,
              text: pl.purchaser_name,
            }),
          )

          this.tasks = list
        }),
      )
  }

  @action
  createPurchaseTask(params) {
    return Request('/purchase/task/create_many').data(params).post()
  }
}

export default new Store()
