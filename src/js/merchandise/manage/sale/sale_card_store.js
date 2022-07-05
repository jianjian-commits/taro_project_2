import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import { sortDataForOverdue } from './utils'

const initFilter = {
  time_config: '-1',
  sale_type: '-1',
  status: '-1',
  q: '',
}
class SaleCardStore {
  @observable filter = {
    ...initFilter,
  }

  @observable cardList = []

  // 默认报价单 删除时展示
  @observable defaultSaleMenu = {
    default_salemenu_id: '',
    default_salemenu_name: '',
    station_id: '',
    station_name: '',
  }

  @action
  resetFilter() {
    this.filter = {
      ...initFilter,
    }
  }

  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @action
  getSaleCards() {
    const { time_config, sale_type, status, q } = this.filter
    const req = {
      time_config_id: time_config === '-1' ? null : time_config,
      type: sale_type === '-' ? null : sale_type,
      is_active: status === '-1' ? null : status,
      with_sku_num: 1, // 是否拉取[在售商品数]. 🐸由于拉[在售商品数]比较慢,所以传true才去拉
      q,
    }
    Request('/salemenu/sale/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.cardList = sortDataForOverdue(json.data, 'price_end_time')
        })
      })
  }

  @action
  getDefaultSaleMenu() {
    Request('/salemenu/sale/default')
      .get()
      .then((json) => {
        runInAction(() => {
          this.defaultSaleMenu = json.data
        })
      })
  }

  @action
  deleteSaleMenu(id) {
    return Request('/salemenu/sale/delete ').data({ id }).post()
  }

  @action
  getSalemenuShareId(salemenu_id) {
    return Request('/station/salemenu/share/create')
      .data({ salemenu_id })
      .post()
  }
}

export default new SaleCardStore()
