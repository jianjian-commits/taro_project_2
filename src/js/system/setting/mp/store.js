import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import _ from 'lodash'
import { MP } from './util'

class Store {
  // 1 cshop 2 bshop 3 club
  @observable mpType = 1
  @observable info = null
  @observable audit = {
    auditid: '',
    status: -1, // 0:审核成功 1审核被拒绝 2审核中 3已撤回
    reason: '',
  }

  @observable plugins = {
    c_is_open_wechat_miniprogram_live: false,
  }

  @observable payInfoList = []
  @observable payInfo = {
    type: 2,
    mpType: 1,
    appid: '',
    appsecret: '',
    merchant_id: '',
    pay_key: '',
    api_cert_name: '',
    api_key_name: '',
    checked: false,
  }

  @observable loading = true

  @action
  setPlugins(key, value) {
    this.plugins[key] = value
  }

  @action
  setPayInfo(key, value) {
    this.payInfo[key] = value
  }

  @action.bound
  getInfo() {
    this.loading = true
    return Request('/mp_third_party/authorizer/info')
      .code(1)
      .data({ type: this.mpType })
      .get()
      .then((json) => {
        this.loading = false
        if (json.code !== 0) {
          Tip.info(json.msg)
          return Promise.reject(new Error(json.msg))
        }
        const { cshop } = json.data
        this.info = cshop
        this.payInfo.appid = cshop?.authorizer_app_id
        return cshop
      })
  }

  @action.bound
  getPayInfo() {
    return Request('/station/pay_info/list')
      .get()
      .then((json) => {
        this.payInfoList = json.data
        // 这里的type 指的是B2B or B2C
        const target = _.find(json.data, (v) => MP[v.type] === this.mpType)
        if (target && target.appid === this.info?.authorizer_app_id) {
          this.payInfo = {
            ...this.payInfo,
            ...target,
            mpType: this.mpType,
          }
        } else {
          this.payInfo.appid = this.info?.authorizer_app_id
        }
        return json.data
      })
  }

  @action
  updatePayInfo() {
    const {
      mpType,
      appid,
      appsecret,
      merchant_id,
      pay_key,
      api_cert_name,
      api_key_name,
    } = this.payInfo
    const params = {
      mp_type: _.findKey(MP, (v) => v === mpType),
      appid,
      appsecret,
      merchant_id,
      pay_key,
      api_cert_name,
      api_key_name,
    }
    return Request('/station/pay_info/update').data(params).post()
  }

  @action
  uploadCertificateFile(type, file) {
    return Request('/station/certificate_file/upload')
      .data({
        cart_type: type,
        certificate_file: file,
      })
      .post()
  }

  @action.bound
  getAuditStatus(authorizer_app_id, audit_id) {
    return Request('/mp_third_party/code/audit_status')
      .data({ authorizer_app_id, audit_id })
      .get()
      .then((json) => {
        this.audit = json.data
        return json.data
      })
  }

  @action.bound
  getLatestAuditStatus(authorizer_app_id) {
    return Request('/mp_third_party/code/latest_audit_status')
      .data({ authorizer_app_id })
      .get()
      .then((json) => {
        this.audit = json.data
        return json.data
      })
  }

  @action.bound
  getPlugins() {
    return Request('/station/info')
      .get()
      .then((json) => {
        const { c_is_open_wechat_miniprogram_live } = json.data
        this.plugins.c_is_open_wechat_miniprogram_live = !!c_is_open_wechat_miniprogram_live
        return json
      })
  }

  updatePlugins() {
    const query = {}
    _.forEach(this.plugins, (v, k) => {
      query[k] = v ? 1 : 0
    })
    return Request('/station/profile_miniprogram/update').data(query).post()
  }

  codeUpload() {
    return Request('/mp_third_party/code/upload')
      .data({
        authorizer_app_id: this.info.authorizer_app_id,
        type: this.mpType,
      })
      .post()
  }

  submitAudit() {
    return Request('/mp_third_party/code/submit_audit')
      .data({
        authorizer_app_id: this.info.authorizer_app_id,
        type: this.mpType,
      })
      .post()
  }
}

export default new Store()
