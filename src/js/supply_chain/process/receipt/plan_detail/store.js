import { action, observable, autorun, computed } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { Tip } from '@gmfe/react'
import { t } from 'gm-i18n'
import { getValueToPost } from '../utils'

class Store {
  @observable details = {
    sku_name: '',
    sku_id: '',
    custom_id: '',
    status: 0,
    id: 0,
    attrition_finished: 0,
    plan_start_time: new Date(),
    plan_finish_time: new Date(),
    finish_time: new Date(),
    finish_products: [],
    attritions: [],
  }

  _zeroDisposer = _.noop // 领料数不能为0

  @action
  initAutoRun = () => {
    this._zeroDisposer = autorun(() => {
      _.each(this.details.attritions, (item) => {
        item.zeroError = parseFloat(item.recv_amount) === 0
      })
    })
  }

  @action
  clear = () => {
    this._zeroDisposer()
  }

  @action fetchPlanDetail = (id) => {
    return Request('/stock/process/process_order/attrition_get')
      .data({ id })
      .get()
      .then(({ data }) => {
        this.details = {
          ...data,
          attritions: _.map(data.attritions, (item) => {
            return {
              ...item,
              zeroError: false,
            }
          }),
        }
      })
  }

  @observable edit = false

  @action setEdit = (edit) => {
    this.edit = edit
  }

  @action mergeAttritions = (value, index, key) => {
    this.details.attritions[index][key] = value
  }

  @observable disabled = false

  @action setDisabled = (value) => {
    this.disabled = value
  }

  @computed get canSubmit() {
    let can = true
    _.each(this.details.attritions, (item) => {
      if (item.zeroError) {
        can = false
      }
    })

    return can
  }

  @action
  saveAttrition(state) {
    const { attritions, id } = this.details
    const data = _.filter(attritions.slice(), (i) => i.task_id !== null)

    const req = {
      id,
      attrition_finished: state,
      attritions: JSON.stringify(
        _.map(data, (item) => {
          return {
            task_id: item.task_id,
            technic_recv_amount: getValueToPost(item.recv_amount), // 这里如果不填的话传给后台就为undefined
            technic_output_amount: getValueToPost(item.output_amount),
          }
        }),
      ),
    }

    return Request('/stock/process/process_order/attrition_update')
      .data(req)
      .post()
  }

  @action
  setProductInStock() {
    const { id } = this.details
    return Request('/stock/process/process_order/finish_product_in_stock')
      .data({ id })
      .post()
  }

  @action
  checkProcessOrder = () => {
    return Request('/stock/process/process_order/create_sheet/check')
      .data({
        proc_order_custom_ids: JSON.stringify([this.details?.custom_id]),
      })
      .get()
  }

  @action
  createSheet = (checked) => {
    const params = {
      ids: JSON.stringify([this.details?.id]),
      merge: checked ? 1 : 0,
      filter_stock: 0,
    }
    return Request('/stock/process/process_order/create_sheet')
      .data(params)
      .post()
      .then((res) => {
        Tip.success(t('创建成品入库单成功'))
      })
  }
}

export const store = new Store()
