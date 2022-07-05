import { action, observable, runInAction, toJS } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { exportExcel, formatPrice } from '../../util'
import { i18next } from 'gm-i18n'
class Store {
  export = {
    options: [
      {
        sid: i18next.t('商户ID'),
        sname: i18next.t('商户名'),
        amount: i18next.t('未归还数'),
        price: ({ value }) => {
          const text = formatPrice(value)
          return [i18next.t('未归还货值'), text]
        },
      },
      {
        sid: i18next.t('商户ID'),
        sname: i18next.t('商户名'),
        tid: i18next.t('周转物ID'),
        tname: i18next.t('周转物名称'),
        amount: i18next.t('未归还数'),
        price: ({ value }) => {
          const text = formatPrice(value)
          return [i18next.t('未归还货值'), text]
        },
      },
    ],
    sheetNames: [i18next.t('商户借出统计'), i18next.t('借出周转物统计')],
    fileName: i18next.t('周转物商户借出.xlsx'),
  }

  @observable
  filter = {
    q: '',
  }

  @observable
  customerMaterialList = []

  setPagination(p) {
    // 重新拉取 list 需要
    this.pagination = p
  }

  handleSearch = () => {
    this.pagination.apiDoFirstRequest()
  }

  @action
  handleNewChange = (field, value) => {
    this.newInRecord[field] = value
  }

  @action.bound
  handleFilterChange(field, value) {
    this.filter[field] = value
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
    const { data } = await Request('/station/turnover/unreturn/list')
      .data(params)
      .get()
    // 两个sheet
    const listData = []
    const detailData = []
    data.forEach(({ sid, sname, amount, price, tlist }) => {
      // 商户数据
      listData.push({
        sid,
        sname,
        amount,
        price,
      })
      tlist.forEach((t) => {
        const obj = _.pick(t, ['tid', 'tname', 'amount', 'price'])
        _.assign(obj, { sid, sname })

        // 周转物数据
        detailData.push(obj)
      })
    })
    exportExcel(this.export, [listData, detailData])
  }

  @action
  fetchCustomerMaterialList = async (pagination = {}) => {
    const params = {
      ...this.getQueryParams(),
      ...pagination,
    }
    const json = await Request('/station/turnover/unreturn/list')
      .data(params)
      .get()
    runInAction(() => {
      this.customerMaterialList = json.data
    })
    return json
  }

  @action
  async createNewReturn(data) {
    const req = {
      address_id: data.address_id,
      tid: data.tid,
      amount: data.amount,
      driver_id: data.driver_id,
    }

    await Request('/station/turnover/return_sheet/create').data(req).post()

    this.pagination.apiDoFirstRequest()
  }
}

export default new Store()
