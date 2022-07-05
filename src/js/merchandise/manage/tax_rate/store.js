import { i18next } from 'gm-i18n'
import { action, computed, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import { history } from 'common/service'
import { convertNumber2Sid, convertSid2Number } from 'common/filter'

import _ from 'lodash'
import Big from 'big.js'

export const STATUS = [
  { id: 10, name: i18next.t('全部状态') },
  { id: 0, name: i18next.t('无效') },
  { id: 1, name: i18next.t('有效') },
]

const debounce = _.debounce((func) => {
  return func()
}, 800)

const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
}
const initData = {
  filter: {
    tax_status: 10,
    spu_status: 10,
    tax_search_text: '',
    spu_search_text: '',
  },
  ruleDetail: {
    tax_id: '',
    name: '',
    new_status: 1,
    viewType: 'edit', // edit view
    addresses: [],
    spus: [],
    create_user: '',
    create_time: '',
    modify_time: '',
    finally_operator: '',
  },
  // detail_sku_list 假分页
  pagination: initPagination,
  currentPage: 0,
}
class TaxRateStore {
  @observable data = initData

  // 按税率规则查看页面用新的分页规范，按商户商品查看页面用旧的分页规范
  @observable tax_pagination = {
    page_obj: 'page_obj',
    peek: 55,
    more: true,
  }

  @observable spu_pagination = {
    offset: 0,
    limit: 10,
  }

  @observable tax_list = []

  @observable spu_list = []

  @observable searchSpuData = {
    loading: false,
    list: [],
  }

  @observable searchAddressData = {
    loading: false,
    list: [],
  }

  @action
  setData(type, value) {
    this.data.filter[type] = value
  }

  @action
  selectStatus(value) {
    this.data.ruleDetail.new_status = value
  }

  @action
  searchTaxRateList(pagination) {
    if (!pagination) {
      this.tax_pagination = {}
    }

    const { tax_status, tax_search_text } = this.data.filter

    let postData = Object.assign(
      {},
      { search_text: tax_search_text },
      pagination,
    )
    postData =
      tax_status === 10
        ? postData
        : Object.assign({}, postData, { status: tax_status })

    return Request('/station/tax/tax_rule/list')
      .data(postData)
      .get()
      .then((json) => {
        this.tax_list = json.data
        this.tax_pagination = json.pagination
        return json
      })
  }

  @action
  searchSpuList(pagination) {
    const { spu_status, spu_search_text } = this.data.filter

    let postData = Object.assign(
      {},
      { search_text: spu_search_text },
      pagination,
    )
    postData =
      spu_status === 10
        ? postData
        : Object.assign({}, postData, { status: spu_status })

    return Request('/station/tax/spu/list')
      .data(Object.assign({}, postData, pagination))
      .get()
      .then((json) => {
        if (json.data.list.length) {
          _.forEach(json.data.list, (val) => {
            val.tax_rate = Big(val.tax_rate).div(100).toFixed(2)
          })
        }
        this.spu_list = json.data.list
        this.spu_pagination = json.data.pagination
      })
  }

  @action
  changeName(value) {
    this.data.ruleDetail.name = value
  }

  @action
  create() {
    this.data = initData
    this.searchSpuData = {
      loading: false,
      list: [],
    }
    this.searchAddressData = {
      loading: false,
      list: [],
    }
  }

  @action.bound
  addAddress(data) {
    const map = {}
    this.data.ruleDetail.addresses.concat(data).forEach((item) => {
      // 原有addresses里的数据是S开头的，新增的date是纯number
      if (_.startsWith('' + item.address_id, 'S')) {
        map[convertSid2Number(item.address_id)] = item.address_name
      } else {
        map[item.address_id] = item.address_name
      }
    })
    this.data.ruleDetail.addresses = Object.entries(
      map,
    ).map(([key, value]) => ({ address_id: key, address_name: value }))
  }

  @action
  deleteAddress(index) {
    const addresses = [...this.data.ruleDetail.addresses]
    addresses.splice(index, 1)

    return Object.assign(this.data, {
      ruleDetail: Object.assign({}, this.data.ruleDetail, {
        addresses,
      }),
    })
  }

  @action
  addSku(data) {
    let spus = []
    const spu = _.find(this.data.ruleDetail.spus, (s) => {
      return s.spu_id === data.spu_id
    })

    if (spu) {
      return this.data
    } else {
      spus = [data, ...this.data.ruleDetail.spus]
    }

    return Object.assign(this.data, {
      ruleDetail: Object.assign({}, this.data.ruleDetail, {
        spus,
      }),
      pagination: Object.assign({}, this.data.pagination, {
        count: spus.length,
      }),
    })
  }

  @action
  deleteSpu(index) {
    const {
      ruleDetail: { spus },
      pagination,
      currentPage,
    } = this.data
    let page = currentPage

    spus.splice(currentPage * pagination.limit + index, 1)
    // 如果最后一页的删除完了，自动跳到倒数第二页
    if (
      spus.length % pagination.limit === 0 &&
      currentPage !== 0 &&
      Big(currentPage).gte(parseInt(spus.length / pagination.limit))
    ) {
      page = currentPage - 1
      const data = { offset: page * pagination.limit, limit: pagination.limit }

      this.changeSpuListPage(data)
    }

    return Object.assign(this.data, {
      ruleDetail: Object.assign({}, this.data.ruleDetail, { spus }),
      currentPage,
      pagination: Object.assign({}, this.data.pagination, {
        count: spus.length,
      }),
    })
  }

  @action
  debounceSearchData(keyword, type) {
    const addr = type === 'searchAddressData'
    const url = addr
      ? '/station/tax/customer/search'
      : '/station/tax/spu/search'

    if (_.trim(keyword) === '') {
      this.clearnSearchData(type)
      return false
    }
    this[type].loading = true

    debounce(() => {
      Request(url)
        .data({ search_text: keyword })
        .get()
        .then((json) => {
          let res = []
          if (json.data.length) {
            res = addr
              ? _.map(json.data, (val) => ({
                  address_id: convertNumber2Sid(val.address_id),
                  address_name: val.resname,
                }))
              : _.map(json.data, (val) => ({
                  spu_id: val.id,
                  spu_name: val.name,
                }))
          }

          return Object.assign(
            addr ? this.searchAddressData : this.searchSpuData,
            {
              loading: false,
              list: res,
            },
          )
        })
        .catch(() => {
          return Object.assign(
            addr ? this.searchAddressData : this.searchSpuData,
            {
              loading: false,
              list: [],
            },
          )
        })
    })
  }

  @action
  clearnSearchData(data) {
    this[data] = {
      loading: false,
      list: [],
    }
  }

  @action.bound
  changeSkuTaxRate(index, value) {
    const { currentPage, pagination } = this.data
    const { spus } = this.data.ruleDetail
    spus[currentPage * pagination.limit + index].tax_rate = value

    return Object.assign(this.data, {
      ruleDetail: Object.assign({}, this.data.ruleDetail, {
        spus,
      }),
    })
  }

  @action
  getTaxRateDetail(tax_id, view) {
    Request('/station/tax/tax_rule/get')
      .data({ tax_id: tax_id })
      .get()
      .then((json) => {
        const {
          tax_rule_name,
          create_user,
          create_time,
          modify_time,
          finally_operator,
          address,
          spu,
          status,
        } = json.data
        this.data.ruleDetail = {
          tax_id: tax_id,
          name: tax_rule_name,
          new_status: status,
          viewType: view,
          addresses: _.map(address, (val) => ({
            ...val,
            address_id: convertNumber2Sid(val.address_id),
          })),
          spus: spu.map((value) => {
            const { tax_rate } = value
            return Object.assign({}, value, {
              tax_rate: Big(tax_rate).div(100).toFixed(2),
            })
          }),
          create_user,
          create_time,
          modify_time,
          finally_operator,
        }
        this.data.pagination = Object.assign({}, initPagination, {
          count: spu.length,
        })
        const option = {}
        spu.forEach((item) => {
          const {
            spu_id,
            spu_name,
            category_1_name,
            tax_rate,
            category_1_id,
          } = item
          if (option[category_1_id]) {
            option[category_1_id].children.push({
              spu_id,
              spu_name,
              tax_rate: Big(tax_rate).div(100).toFixed(2),
            })
          } else {
            option[category_1_id] = {
              category_1_id,
              category_1_name,
              children: [
                {
                  spu_id,
                  spu_name,
                  tax_rate: Big(tax_rate).div(100).toFixed(2),
                },
              ],
            }
          }
        })
        this.category = Object.values(option)
      })
  }

  @action
  modify() {
    const { tax_id } = this.data.ruleDetail
    history.push({
      pathname: '/merchandise/manage/tax_rate/details',
      query: {
        viewType: 'edit',
        tax_id: tax_id,
      },
    })
  }

  @action.bound
  changeSpuListPage(page) {
    const pagination = Object.assign({}, this.data.pagination, page)
    const offset = pagination.offset
    const limit = pagination.limit

    this.data.pagination = pagination
    this.data.currentPage = +(offset / limit)
  }

  @action
  clearPagination() {
    this.data.currentPage = 0
    this.data.pagination = {
      count: 0,
      offset: 0,
      limit: 10,
    }
  }

  @observable treeData = []

  @action fetchTreeData = () => {
    Request('/station/address_label/list')
      .get()
      .then(({ data }) => {
        runInAction(() => {
          this.treeData = data.map((item) => ({
            value: item.id,
            text: item.name,
          }))
          this.treeData.unshift({ value: -1, text: i18next.t('无') })
        })
      })
  }

  @observable treeSelected = []

  @action setTreeSelected = (list) => {
    this.treeSelected = list
  }

  @observable merchantsMap = new Map()

  @action fetchMerchantsMap = (value) => {
    Request('/station/tax/label/address/list')
      .data({ address_label_id: value })
      .get()
      .then(({ data }) => {
        runInAction(() => {
          this.merchantsMap.set(value, data)
        })
      })
  }

  @action deleteMerchantsMapItem = (key) => {
    this.merchantsMap.delete(key)
    this.setTableSelected(
      this.tableSelected.filter((item) =>
        this.merchantsList.some((v) => v.address_id === item),
      ),
    )
  }

  @action resetMerchantsMap = () => {
    this.merchantsMap.clear()
  }

  @computed get merchantsList() {
    let list = []
    this.merchantsMap.forEach((value) => {
      list = list.concat(value.slice())
    })
    return list.filter(
      (value) =>
        value.address_name.includes(this.word) ||
        `${convertNumber2Sid(value.address_id)}`.includes(this.word),
    )
  }

  @observable tableSelected = []

  @action setTableSelected = (list) => {
    this.tableSelected = list
  }

  @observable word = ''

  @action setWord = (word) => {
    this.word = word
  }

  @observable category = []

  @action setCategory = (list) => {
    this.category = list
  }

  @action resetProduct = () => {
    this.category = []
    this.data.ruleDetail.spus = []
  }

  handleCreate = (options) => {
    return Request('/station/tax/tax_rule/create').data(options).post()
  }

  handleEdit = (options) => {
    return Request('/station/tax/tax_rule/edit').data(options).post()
  }
}

const taxRateStore = new TaxRateStore()

export default taxRateStore
