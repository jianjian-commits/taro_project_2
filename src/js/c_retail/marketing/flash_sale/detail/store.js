import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import globalStore from '../../../../stores/global'

const initItem = {
  sku_id: '',
  latest_quote_from_supplier: false,
  fee_type: 'CNY',
  outer_id: '',
  sale_price: '',
  last_purchase_price: null,
  stock_avg_price: null,
  name: '',
  last_in_stock_price: null,
  std_unit_name_forsale: '',
  sale_unit_name: '',
  search_text: [],
  last_quote_price: null,
  latest_quote_price: null,
  state: 1,
  sale_ratio: 1,
  rule_type: 1,
  yx_price: 1,
  latest_in_stock_price: null,
  latest_purchase_price: null,
  quoted_from_supplier: false,
  std_unit_name: '',
  flash_sale_stock: null,
  per_limit: null,
}

const initDetail = {
  name: '',
  flash_sale_id: '',
  status: '',
  modify_time: '', // 修改时间
  create_time: '', // 创建时间
  begin: '', // 活动开始时间
  end: '', // 活动结束时间
  modifier: '', // 最后修改人
  creator: '', // 创建人
  skus: [initItem],
}

class Store {
  @observable detail = initDetail
  @observable viewType = 'view'

  @action
  getDetail(flash_sale_id) {
    return Request('/flash_sale/get')
      .data({
        flash_sale_id,
        is_retail_interface: globalStore.otherInfo.isCStation ? null : 1,
      })
      .get()
      .then((json) => {
        runInAction(() => {
          this.detail = json.data
        })
        return json
      })
  }

  @action
  changeDetail(name, value) {
    this.detail[name] = value
  }

  @action
  init() {
    this.detail = initDetail
    this.viewType = 'view'
  }

  @action
  changeViewType(type) {
    this.viewType = type
  }

  @action
  addListItem() {
    this.detail.skus.push(initItem)
  }

  @action
  deleteListItem(index) {
    this.detail.skus.remove(this.detail.skus[index])
  }

  @action
  changeListItem(index, obj) {
    Object.assign(this.detail.skus[index], { ...obj })
  }

  @action
  changeListItemName(index, selected) {
    const obj = {
      ...selected,
      rule_type: 0,
      yx_price: '',
    }
    this.changeListItem(index, obj)
  }

  @action
  fetchSkuList(req) {
    return Request('/station/skus').data(req).get()
  }

  @action
  create(req) {
    if (!globalStore.otherInfo.isCStation) req.is_retail_interface = 1
    return Request('/flash_sale/create').data(req).post()
  }

  @action
  edit(flash_sale_id, req) {
    return Request('/flash_sale/edit')
      .data({
        flash_sale_id,
        is_retail_interface: globalStore.otherInfo.isCStation ? null : 1,
        ...req,
      })
      .post()
  }
}

export default new Store()
