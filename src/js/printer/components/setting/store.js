import { action, runInAction, extendObservable } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { convertNumber2Sid } from 'common/filter'

const debounce = _.debounce((func) => {
  return func()
}, 800)

export const initialState = {
  id: '',
  viewType: 'view',
  detail: {
    addresses: [],
    spus: [],
    create_time: '',
    content: {
      page: {},
    },
  },
  searchSpuData: {
    loading: false,
    list: [],
  },
  searchAddressData: {
    loading: false,
    list: [],
  },
  pagination: {
    // 假分页
    count: 0,
    offset: 0,
    limit: 10,
  },
}

class SettingStore {
  constructor() {
    extendObservable(this, initialState)
  }

  @action
  setDetailId(id) {
    this.id = id
  }

  @action
  debounceSearchData(keyword, type) {
    const addr = type === 'searchAddressData'
    const url = addr
      ? '/station/order/customer/search'
      : '/station/print_tag/spu_search'

    if (_.trim(keyword) === '') {
      this.clearSearchData(type)
      return false
    }
    this[type].loading = true

    debounce(() => {
      Request(url)
        .data({ search_text: keyword })
        .get()
        .then((json) => {
          const res = addr
            ? _.map(json.data.list, (val) => ({
                address_id: convertNumber2Sid(val.address_id),
                address_name: val.resname,
              }))
            : _.map(json.data, (val) => ({
                spu_id: val.id,
                spu_name: val.name,
                category: `${val.category_name_2}/${val.category_name_1}`,
              }))

          runInAction(() => {
            Object.assign(addr ? this.searchAddressData : this.searchSpuData, {
              loading: false,
              list: res,
            })
          })
        })
        .catch(() => {
          runInAction(() => {
            Object.assign(addr ? this.searchAddressData : this.searchSpuData, {
              loading: false,
              list: [],
            })
          })
        })
    })
  }

  @action
  modify() {
    this.viewType = 'edit'
  }

  @action
  cancelModify() {
    this.getDetail()
    this.viewType = 'view'
    this.searchAddressData = { ...initialState.searchAddressData }
    this.searchSpuData = { ...initialState.searchSpuData }
  }

  @action
  reset() {
    Object.assign(this, initialState)
  }

  @action
  addAddress(data) {
    // 是否已经在列表中
    const exist = !!_.find(this.detail.addresses, {
      address_id: data.address_id,
    })

    if (!exist) {
      const addresses = [data, ...this.detail.addresses]
      this.detail = Object.assign({}, this.detail, { addresses })
    }
  }

  @action
  importAddress(addresses) {
    this.detail = Object.assign({}, this.detail, { addresses })
  }

  @action
  deleteAddress(index) {
    const addresses = [...this.detail.addresses]
    addresses.splice(index, 1)

    this.detail = Object.assign({}, this.detail, { addresses })
  }

  @action
  setAddressColor(index, color) {
    const addresses = [...this.detail.addresses]
    addresses[index].color_code = color
    this.detail = {
      ...this.detail,
      addresses,
    }
  }

  @action
  addSku(data) {
    // 是否已经在列表中
    const exist = !!_.find(this.detail.spus, { spu_id: data.spu_id })

    if (!exist) {
      const spus = [data, ...this.detail.spus]
      this.detail = Object.assign({}, this.detail, { spus })
      this.updatePagination({
        count: spus.length,
      })
    }
  }

  @action
  importSpu(spus) {
    this.detail = Object.assign({}, this.detail, { spus })
    this.updatePagination({
      ...initialState.pagination,
      count: spus.length,
    })
  }

  @action
  updatePagination(data) {
    this.pagination = {
      ...this.pagination,
      ...data,
    }
  }

  @action
  deleteSpu(index) {
    const spus = [...this.detail.spus]
    const { offset, limit } = this.pagination
    let currentOffset = offset
    spus.splice(index + currentOffset, 1)

    this.detail = Object.assign({}, this.detail, { spus })
    if (spus.length <= offset) {
      currentOffset = Math.max(offset - 1 * limit, 0)
    }
    this.updatePagination({
      offset: currentOffset,
      count: spus.length,
    })
  }

  @action
  clearSearchData(type) {
    this[type] = {
      loading: false,
      list: [],
    }
  }
}

export default SettingStore
