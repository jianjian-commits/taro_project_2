import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'

const initRateObj = {}
class Store {
  @observable rateSummary = initRateObj

  @observable checkData = []

  @observable businessInfo = { name: '', id: '' }

  @observable params = null

  @action
  onCheck = (checkData) => (this.checkData = checkData)

  @action
  fetchRateList = (id) => {
    return Request(`/station/price_rule/edit`)
      .data({ price_rule_id: id })
      .get()
      .then((res) => {
        const {
          data: { addresses, rule_object_type, spus, status },
        } = res
        this.params = { rule_object_type, status }
        this.businessInfo = addresses[0]
        spus.forEach((item) => {
          this.rateSummary[item.spu_id] = item.yx_price
        })
      })
  }

  @action
  handleEditPriceRule = (id, spus) => {
    const params = {
      ...this.getParams,
      price_rule_id: id,
      spus: JSON.stringify(spus),
    }
    return Request('/station/price_rule/edit').data(params).post()
  }

  @action
  handleExport = (id) => {
    return Request('/station/price_rule/edit')
      .data({
        price_rule_id: id,
        is_export_spu: 1,
      })
      .get()
  }

  // 整合一些参数
  @computed
  get getParams() {
    const { rule_object_type, status } = this.params
    const { id } = this.businessInfo

    return {
      rule_object_type,
      status,
      address_ids: JSON.stringify([id]),
    }
  }
}

export default new Store()
