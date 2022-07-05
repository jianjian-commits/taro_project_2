import { observable, action, runInAction, computed } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'

class DriverEditorStore {
  @observable
  isNewCarrierOrCarModel = {
    carrier: false,
    carModel: false,
  }

  @observable
  errorMsg = null

  @observable
  data = {
    name: null,
    phone: null,
    carrier_id: null,
    car_model_id: null,
    plate_number: null,
    share: 1,
    state: 1,
    account: null,
    password: null,
    password_check: null,
    allow_login: 1,

    car_model_name: null,
    max_load: null,
    company_name: null,
  }

  @observable
  carrierList = []

  @observable
  carModelList = []

  @computed
  get carrierListWithAdd() {
    return [
      ...this.carrierList,
      {
        value: 0,
        text: i18next.t('+添加承运商'),
      },
    ]
  }

  @computed
  get carModelListWithAdd() {
    return [
      ...this.carModelList,
      {
        value: 0,
        text: i18next.t('+添加车型'),
      },
    ]
  }

  @action.bound
  setName(e) {
    this.data.name = e.target.value
  }

  @action.bound
  setPhone(e) {
    this.data.phone = e.target.value
  }

  @action.bound
  setCarrier(item) {
    if (item) {
      this.data.carrier_id = item.value
      // 是否新建承运商
      this.isNewCarrierOrCarModel.carrier = item.value === 0
    } else {
      this.data.carrier_id = null
    }
  }

  @action.bound
  setCarModel(item) {
    if (item) {
      this.data.car_model_id = item.value
      this.data.max_load = item.max_load
      // 是否新建车型
      this.isNewCarrierOrCarModel.carModel = item.value === 0
    } else {
      this.data.car_model_id = null
      this.data.max_load = null
    }
  }

  @action.bound
  setPlateNumber(e) {
    this.data.plate_number = e.target.value
  }

  @action.bound
  setShare(val) {
    this.data.share = +val
  }

  @action.bound
  setState(val) {
    this.data.state = +val
  }

  @action.bound
  setAccount(e) {
    this.data.account = e.target.value
  }

  @action.bound
  setPassword(e) {
    this.data.password = e.target.value
  }

  @action.bound
  setPasswordCheck(e) {
    this.data.password_check = e.target.value
  }

  @action.bound
  setAllowLogin(val) {
    this.data.allow_login = +val
  }

  @action.bound
  setCarModelName(e) {
    this.data.car_model_name = e.target.value
  }

  @action.bound
  setMaxLoad(e) {
    this.data.max_load = e.target.value
  }

  @action.bound
  setCompanyName(e) {
    this.data.company_name = e.target.value
  }

  // 获取承运商列表
  @action.bound
  getCarrierList() {
    return Request('/station/carrier/list')
      .get()
      .then((res) => {
        runInAction(() => {
          this.carrierList = _.map(res.data, (item) => ({
            ...item,
            value: item.id,
            text: item.company_name,
          }))
        })
      })
  }

  // 创建承运商
  @action.bound
  createCarrier(company_name) {
    return Request('/station/carrier/create')
      .data({ company_name })
      .post()
      .then((res) => {
        runInAction(() => {
          this.data.carrier_id = res.data.id
        })
      })
  }

  // 获取车型列表
  @action.bound
  getCarModelList() {
    return Request('/station/car_model/list')
      .get()
      .then((res) => {
        runInAction(() => {
          this.carModelList = _.map(res.data, (item) => ({
            ...item,
            value: item.id,
            text: item.name,
          }))
        })
      })
  }

  // 创建车型
  @action.bound
  createCarModel({ car_model_name, max_load }) {
    return Request('/station/car_model/create')
      .data({ car_model_name, max_load })
      .post()
      .then((res) => {
        runInAction(() => {
          this.data.car_model_id = res.data.id
        })
      })
  }

  // 若新建承运商和车型更新相应ID
  @action.bound
  async updateCarrierOrCarModelAndSubmit(submit) {
    if (_.keys(this.errorMsg).length) {
      Tip.warning(i18next.t('提交信息有误，请修改'))
      return
    }

    const { car_model_name, max_load, company_name } = this.data
    const { carModel, carrier } = this.isNewCarrierOrCarModel

    if (carModel) await this.createCarModel({ car_model_name, max_load })
    if (carrier) await this.createCarrier(company_name)
    submit()
  }

  @action.bound
  addErrors({ name, msg }) {
    this.errorMsg = {
      ...this.errorMsg,
      [name]: msg,
    }
  }

  @action.bound
  deleteErrors(names = []) {
    _.forEach(names, (name) => {
      if (this.errorMsg === null) return
      // 其中一条密码验证通过就清空两个密码的 错误
      if (
        (name === 'password' || name === 'password_check') &&
        this.data.password &&
        this.data.password_check
      ) {
        this.errorMsg = _.omit(this.errorMsg, ['password', 'password_check'])
        return
      }
      this.errorMsg = _.omit(this.errorMsg, [name])
    })
  }

  @action.bound
  checkAccount(account) {
    return Request('/station/driver/account/check').data({ account }).post()
  }

  @action.bound
  checkPhone(phone, driver_id) {
    return Request('/station/driver/phone/check')
      .data({ phone, driver_id })
      .post()
  }

  @action.bound
  checkName(name, driver_id) {
    return Request('/station/driver/name/check')
      .data({ name, driver_id })
      .post()
  }

  @action.bound
  checkPlateNumber(plate_number, driver_id) {
    return Request('/station/driver/plate/check')
      .data({ plate_number, driver_id })
      .post()
  }
}

export default DriverEditorStore
