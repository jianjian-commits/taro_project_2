import { action, computed, observable } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { System } from '../../../common/service'

const initFilter = {
  search_text: '',
  status: 0,
}

const initDetail = {
  image: '',
  sku_name: '',
  sale_unit: '',
  sku_desc: '',
  status: 1,
  sku_cost: '',
  cost_point: '',
  once_limit: '',
  detail_image: '',
  stock_num: '',
}

class PointsMerchandiseStore {
  @observable filter = { ...initFilter }

  @observable list = []

  @observable detail = { ...initDetail }

  @observable count = 0

  @action
  initList() {
    this.filter = { ...initFilter }
    this.list = []
  }

  @action
  initDetail() {
    this.detail = { ...initDetail }
  }

  @action
  setFilter(field, value) {
    this.filter[field] = value
  }

  @action
  setDetailValue(field, value) {
    this.detail[field] = value
  }

  @computed
  get getFilterParam() {
    const { status, search_text } = this.filter
    const params = {}

    if (status !== 0) {
      params.status = status
    }

    if (search_text) {
      params.search_text = search_text
    }
    return params
  }

  @computed
  get getDetailParam() {
    const { cost_point, sku_cost, stock_num, once_limit } = this.detail
    const params = _.pickBy(this.detail, (value) => !!value)
    if (cost_point) {
      params.cost_point = +cost_point
    }
    if (sku_cost) {
      params.sku_cost = +sku_cost
    }
    if (stock_num) {
      params.stock_num = +stock_num
    }
    if (once_limit) {
      params.once_limit = +once_limit
    }
    return params
  }

  // 积分商品列表
  @action
  fetchData(pagination = {}) {
    const params = {
      ...this.getFilterParam,
      ...pagination,
    }
    return Request('/station/point/reward_sku/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.count = json.pagination.count
          this.list = json.data
          return json
        })
      )
  }

  // 查看积分商品详情
  @action
  getDetail(reward_sku_id) {
    return Request('/station/point/reward_sku/get')
      .data({ reward_sku_id })
      .get()
      .then(
        action((json) => {
          this.detail = json.data
          return json
        })
      )
  }

  // 创建积分商品
  @action
  createPointsMerchandise() {
    return Request('/station/point/reward_sku/create')
      .data(this.getDetailParam)
      .post()
  }

  // 更新积分商品
  @action
  updatePointsMerchandise() {
    return Request('/station/point/reward_sku/update')
      .data(this.getDetailParam)
      .post()
  }

  // 修改商品兑换状态
  @action
  changeStatus(reward_sku_id, status) {
    return Request('/station/point/reward_sku/status/update')
      .data({ reward_sku_id, status })
      .post()
      .then(
        action((json) => {
          const modifySku = _.find(
            this.list,
            (sku) => sku.reward_sku_id === reward_sku_id
          )
          modifySku.status = status
          return json
        })
      )
  }

  // 删除积分商品
  @action
  deletePointsMerchandise(reward_sku_id) {
    return Request('/station/point/reward_sku/delete')
      .data({ reward_sku_id })
      .post()
  }

  // 上传图片
  @action
  imgUpload(file, source) {
    return Request('/image/upload')
      .data({ image_file: file, is_retail_interface: System.isC() ? 1 : null })
      .post()
      .then(
        action((json) => {
          if (source === 'detail') {
            this.detail.detail_image = json.data.image_url
          } else {
            this.detail.image = json.data.image_url
          }
        })
      )
  }

  setPagination(pagination) {
    this.pagination = pagination
  }
}

export default new PointsMerchandiseStore()
