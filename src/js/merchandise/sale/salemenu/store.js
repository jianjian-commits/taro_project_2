import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const initSalemenuDetails = {
  id: '',
  name: '',
  time_config: {},
  time_config_id: '-',
  is_active: true,
  targets: [],
  supplier_name: '',
  about: '',
  copy_salemenu_id: '-',
  is_copy_salemenu: false,
  fee_type: 'CNY',
}

class MerchandiseSaleFormStore {
  @observable feeList = [{ symbol: '￥', type: 'CNY', name: '人民币' }]
  @observable serviceTime = []

  @observable salemenuTargets = []

  @observable allSalemenuList = []

  @observable salemenuDetails = { ...initSalemenuDetails }

  @action
  getServiceTime() {
    Request('/service_time/list')
      .data({ details: 0 })
      .get()
      .then((json) => {
        runInAction(() => {
          this.serviceTime = json.data
        })
      })
  }

  @action
  getSalemenuTargets() {
    return Request('/salemenu/sale/targets')
      .get()
      .then((json) => {
        runInAction(() => {
          this.salemenuTargets = this.formatSaletarget(json.data)
        })
        return this.formatSaletarget(json.data)
      })
  }

  // MoreSelect需要的数据解构是({text, value})，接口/salemenu/sale/targets和/salemenu/sale/detail 需要格式化
  formatSaletarget(data) {
    return _.map(data, (v) => ({ text: v.name, value: v.id }))
  }

  @action
  getSalemenuDetails(id) {
    Request('/salemenu/sale/detail')
      .data({ id })
      .get()
      .then((json) => {
        runInAction(() => {
          const { time_config, targets, ...rest } = json.data
          this.salemenuDetails = {
            ...rest,
            targets: this.formatSaletarget(targets),
            time_config,
            time_config_id: time_config.id,
          }
        })
      })
  }

  @action
  getAllSalemenuList() {
    Request('/salemenu/sale/list')
      .get()
      .then((json) => {
        runInAction(() => {
          this.allSalemenuList = json.data
        })
      })
  }

  @action
  clearSalemenuDetails() {
    this.salemenuDetails = { ...initSalemenuDetails }
  }

  @action
  changeDetails(name, val) {
    this.salemenuDetails[name] = val
  }

  @action
  createSalemenu() {
    const {
      name,
      time_config_id,
      is_active,
      targets,
      supplier_name,
      about,
      copy_salemenu_id,
      is_copy_salemenu,
      fee_type,
    } = this.salemenuDetails
    let params = {
      name,
      supplier_name,
      about,
      is_copy_salemenu,
      time_config_id,
      fee_type,
      is_active: is_active ? 1 : 0,
      targets: JSON.stringify(_.map(targets, (tg) => tg.value)),
    }
    if (is_copy_salemenu)
      params = Object.assign({}, params, { copy_salemenu_id })

    return Request('/salemenu/sale/create').data(params).post()
  }

  @action
  updateSalemenu() {
    const {
      id,
      name,
      time_config_id,
      is_active,
      targets,
      supplier_name,
      about,
    } = this.salemenuDetails
    const params = {
      id,
      name,
      supplier_name,
      about,
      time_config_id,
      targets: JSON.stringify(_.map(targets, (tg) => tg.value)),
      is_active: is_active ? 1 : 0,
    }
    return Request('/salemenu/sale/update').data(params).post()
  }

  @action
  getFeeList() {
    Request('/fee/type/list')
      .get()
      .then((json) => {
        runInAction(() => {
          this.feeList = json.data
        })
      })
  }
}

export default new MerchandiseSaleFormStore()
