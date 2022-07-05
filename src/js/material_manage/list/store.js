import { action, observable, runInAction, toJS } from 'mobx'
import { Request } from '@gm-common/request'
import { i18next } from 'gm-i18n'
import { exportExcel, formatPrice } from '../util'
class Store {
  export = {
    options: {
      id: i18next.t('周转物ID'),
      name: i18next.t('周转物名称'),
      unit_name: i18next.t('单位'),
      price: ({ row, value }) => {
        const text = formatPrice(value) + '/' + row.unit_name
        return [i18next.t('单个货值'), text]
      },
    },
    fileName: i18next.t('周转物列表.xlsx'),
  }

  @observable
  filter = {
    q: '',
  }

  @observable
  materialList = []

  constructor() {
    this.initNewMaterial()
  }

  @action
  async createNewMaterial() {
    const created = {
      ...this.newMaterial,
      is_weight: this.newMaterial.is_weight ? 1 : 0,
    }
    await Request('/station/turnover/create').data(created).post()
    runInAction(this.initNewMaterial)
    this.pagination.apiDoFirstRequest()
  }

  getQueryParams() {
    const params = toJS(this.filter)
    return params
  }

  handleExport = async () => {
    const params = {
      export: 1,
      ...this.getQueryParams(),
    }
    const { data } = await Request('/station/turnover/list').data(params).get()
    exportExcel(this.export, [data])
  }

  @action
  handleNewMaterialChange(field, value) {
    this.newMaterial[field] = value
  }

  @action
  initNewMaterial = () => {
    this.newMaterial = observable({
      unit_name: '',
      name: '',
      price: '',
      is_weight: false,
      weight: '',
    })
  }

  setPagination(p) {
    // 重新拉取 list 需要
    this.pagination = p
  }

  @action
  upadteMaterialList(index, key, value) {
    const newMateriallist = this.materialList.slice()
    newMateriallist[index][key] = value
    this.materialList = newMateriallist
  }

  @action
  async handleFilterChange(filter) {
    Object.assign(this.filter, filter)
  }

  @action
  async handleMaterialListChange(index) {
    const m = this.materialList[index]

    const { id, name, price, unit_name, is_weight, weight } = m
    const params = {
      tid: id,
      name,
      price,
      unit_name,
      is_weight: is_weight ? 1 : 0,
      weight,
    }
    await Request('/station/turnover/update').data(params).post()
    this.pagination.doCurrentRequest()
  }

  @action
  deleteMaterial = async (index) => {
    const { id } = this.materialList[index]
    const params = { tid: id }
    const json = await Request('/station/turnover/delete')
      .code(99)
      .data(params)
      .post()
    // 99 删除失败校验没通过 展示详细信息
    if (json.code === 99) {
      return json.data
    }
    this.pagination.doCurrentRequest()
    return true
  }

  @action
  fetchMaterialList = async (pagination = {}) => {
    const params = {
      ...this.getQueryParams(),
      ...pagination,
    }
    const json = await Request('/station/turnover/list').data(params).get()
    runInAction(() => {
      this.materialList = json.data
    })
    return json
  }
}

export default new Store()
