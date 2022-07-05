import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { Storage } from '@gmfe/react'

class Store {
  @observable addPaymentSlipSelected = []
  @observable paymentSlipList = []

  // 结款单模板
  @observable templateID = null
  /**
   * Array<template: {
   * id: number,
   * content: object,
   * create_time: Date,
   * is_default: bool,
   * creator: string
   * }>
   */
  @observable templateList = []

  @action
  changeAddPaymentSlipSelected(selected) {
    this.addPaymentSlipSelected = selected
  }

  @action
  async getAlreadyExistPaymentSlip(supplierId) {
    const req = {
      start: moment(new Date()).subtract(1, 'months').format('YYYY-MM-DD'),
      end: moment().startOf('day').format('YYYY-MM-DD'),
      status: 1,
      settle_supplier_id: supplierId,
    }

    await Request('/stock/settle_sheet/search')
      .data(req)
      .get()
      .then(
        action((json) => {
          this.paymentSlipList = json.data

          return json
        }),
      )
  }

  @action
  postAddInAlreadyExistPaymentSlip(selectedSheetNos) {
    const req = {
      op: 'append',
      sheet_nos: JSON.stringify(selectedSheetNos),
      id: this.addPaymentSlipSelected[0],
    }

    return Request('/stock/settle_sheet/add').data(req).post()
  }

  @action.bound
  setTemplate(val) {
    Storage.set('settle_tem', val)
    this.templateID = val
  }

  @action.bound
  async getTemplateList() {
    const data = await Request('/fe/settle_tpl/list')
      .get()
      .then((res) => res.data)
    runInAction(() => {
      const temID = Storage.get('settle_tem')
      this.templateID =
        temID && _.find(data, (item) => item.id === temID)
          ? temID
          : data[0]
          ? data[0].id
          : null
      this.templateList = data
    })
  }
}

export default new Store()
