import { Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { observable, action, runInAction, computed } from 'mobx'
import { is } from '@gm-common/tool'
import { Request } from '@gm-common/request'

const initfilter = {
  categoryFilters: {
    // 不支持多选
    category1: null,
    category2: null,
    pinlei: null,
  },
  text: '',
}
const initPagination = {
  offset: 0,
  limit: 10,
  count: 0,
}
class StockSettingStore {
  @observable filter = initfilter

  @observable pagination = initPagination

  @observable list = []

  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @computed
  get searchData() {
    const {
      categoryFilters: { category1, category2, pinlei },
      text,
    } = this.filter
    return {
      category1_id: category1 ? category1.id : null,
      category2_id: category2 ? category2.id : null,
      pinlei_id: pinlei ? pinlei.id : null,
      text,
    }
  }

  @action
  getStockSettingList(params, id) {
    const req = Object.assign({}, params, {
      salemenu_id: id,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
    })

    Request('/product/stocks/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.list = json.data
          this.pagination = json.pagination
        })
      })
  }

  @action
  changePage(page) {
    this.pagination = page
  }

  @action
  itemToEdit(index, isEditing) {
    const newList = this.list.slice()
    newList[index].__isEditing = isEditing
    this.list = newList
  }

  @action
  saveItem(index, params, id) {
    const req = {
      sku_id: this.list[index].id,
      stock_type: this.list[index].stocks_type,
      amount: this.list[index].remain_stocks,
    }
    if (req.stock_type !== 2) {
      _.unset(req, 'amount')
    } else {
      if (!(_.toNumber(req.amount) >= 0)) {
        Tip.warning(
          i18next.t('销售库存设置为设置固定库存时,销售库存数不能为空')
        )
        return
      }
    }

    Request('/product/stocks/edit')
      .data(req)
      .post()
      .then((json) => {
        Tip.success(i18next.t('修改成功'))
        this.getStockSettingList(params, id)
      })
  }

  @action
  changeStock(index, name, value) {
    const newList = this.list.slice()
    newList[index][name] = value
    this.list = newList
  }
}

export default new StockSettingStore()
