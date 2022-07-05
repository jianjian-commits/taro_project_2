import { action, computed, observable, runInAction } from 'mobx'
import { t } from 'gm-i18n'
import { createRef } from 'react'
import { Request } from '@gm-common/request'
import Big from 'big.js'

class Store {
  @observable pagination = createRef()

  @observable statusList = [
    { value: 0, text: t('无效') },
    { value: 1, text: t('有效') },
    { value: 2, text: t('全部') },
  ]

  @observable filter = {
    search_text: '',
    status: 2,
    tax_type: 1, // 与销项共用同一个接口，tax_type区分，1 为进项
  }

  @action mergeFilter = (data) => {
    Object.assign(this.filter, data)
  }

  @computed get searchFilter() {
    const { status, ...rest } = this.filter
    const option = { ...rest }
    if (status !== 2) {
      option.status = status
    }
    return option
  }

  @observable list = []

  @observable loading = false

  @action fetchList = (pagination) => {
    this.loading = true
    return Request('/station/tax/tax_rule/list')
      .data({ ...this.searchFilter, ...pagination })
      .get()
      .then((result) => {
        runInAction(() => {
          const { data } = result
          this.list = data
        })
        return result
      })
      .finally(() => {
        runInAction(() => (this.loading = false))
      })
  }

  @observable edit = true

  @action setEdit = (status) => {
    this.edit = status
  }

  @action fetchDetails = (tax_id) => {
    return Request('/station/tax/tax_rule/get')
      .data({ tax_id, tax_type: 1 })
      .get()
      .then(({ data }) => {
        runInAction(() => {
          let { spu, ...rest } = data
          spu = spu.map((item) => {
            const { tax_rate, ...rest } = item
            return {
              ...rest,
              tax_rate: Big(tax_rate).div(100).toFixed(2),
            }
          })
          this.details = Object.assign({}, rest, { spu })
          const option = {}
          spu.forEach((item) => {
            const {
              tax_rate,
              spu_id,
              spu_name,
              category_1_id,
              category_1_name,
            } = item
            if (option[category_1_id]) {
              option[category_1_id].children.push({
                spu_id,
                spu_name,
                tax_rate,
              })
            } else {
              option[category_1_id] = {
                category_1_id,
                category_1_name,
                children: [
                  {
                    tax_rate,
                    spu_id,
                    spu_name,
                  },
                ],
              }
            }
          })
          this.category = Object.values(option)
        })
      })
  }

  @observable details = {
    /** @type {Date} 最后修改时间 */
    modify_time: null,
    /** @type {string} 创建人 */
    create_user: '',
    /** @type {Date} 创建时间 */
    create_time: null,
    /** @type {string} 税率规则名称 */
    tax_rule_name: '',
    /** @type {string} 最后修改人 */
    finally_operator: '',
    /** @type {{spu_name:string,spu_id:string,tax_rate:string}[]} */
    spu: [],
    /** @type {{supplier_id:string,supplier_name:string,tax_rate_id:string}[]} */
    supplier: [],
    /** @type {number} 状态 */
    status: 1,
  }

  @action setSupplier = (data) => {
    this.details.supplier = data
  }

  @action deleteSupplierItem = (index) => {
    this.details.supplier.splice(index, 1)
  }

  /** @type {{category_1_name:string,category_1_id:string,children:{sku_id:string,sku_name:string,tax_rate:string}[]}[]} 商品数表格 */
  @observable category = []

  @action setCategory = (list) => {
    this.category = list
  }

  @action mergeDetails = (data) => {
    Object.assign(this.details, data)
  }

  @observable word = ''

  @action setWord = (word) => {
    this.word = word
  }

  @observable treeSelected = []

  @action setTreeSelected = (list) => {
    this.treeSelected = list
  }

  @observable supplierMap = new Map()

  @action resetSupplierMap = () => {
    this.supplierMap.clear()
  }

  @observable supplierLoading = false

  @action fetchSupplierMap = (bill_type) => {
    this.loading = true
    Request('/station/input_tax/invoice/supplier/list')
      .data({ bill_type })
      .get()
      .then(({ data }) => {
        runInAction(() => {
          this.supplierMap.set(bill_type, data)
        })
      })
      .finally(() => {
        runInAction(() => {
          this.loading = false
        })
      })
  }

  @action deleteSupplierMapItem = (key) => {
    this.supplierMap.delete(key)
    this.setTableSelected(
      this.tableSelected.filter((item) =>
        this.supplierList.some((v) => v.supplier_id === item)
      )
    )
  }

  @computed get supplierList() {
    let list = []
    this.supplierMap.forEach((value) => {
      list = list.concat(value.slice())
    })
    return list.filter(
      (item) =>
        item.customer_id.includes(this.word) ||
        item.supplier_name.includes(this.word)
    )
  }

  @observable tableSelected = []

  @action setTableSelected = (list) => {
    this.tableSelected = list
  }

  @action resetAddSupplier = () => {
    this.word = ''
    this.treeSelected = []
    this.supplierMap.clear()
    this.tableSelected = []
  }

  handleAdd = (option) => {
    return Request('/station/tax/tax_rule/create').data(option).post()
  }

  handleEdit = (option) => {
    return Request('/station/tax/tax_rule/edit').data(option).post()
  }
}

export default new Store()
