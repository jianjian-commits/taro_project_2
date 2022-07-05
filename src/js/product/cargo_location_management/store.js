import { action, observable } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import {
  addChildren,
  findCargoLocationAfterDelete,
  mergeSameItem,
  recursiveProgram,
  setSpuListToMoveNum,
} from './utils'

class Store {
  // 按货位查询搜索货位名定位
  @observable cargoLocationName = ''

  // 货位列表
  @observable cargoLocationMenu = []

  // 按货位搜索条件
  @observable cargoLocationSearchOption = {
    shelf_id: -1,
    q: '',
    limit: 40,
  }

  // 选中的货位
  @observable searchItem = {
    name: '未分配',
    shelf_id: -1,
  }

  // 商品统计信息
  @observable summary = {
    spu_sum: 0,
    shelf_sum: 0,
    stock_sum: 0,
    stock_sum_money: '',
  }

  // 商品列表
  @observable spuList = []

  // 商品列表当前页之后是否还有数据
  @observable spuListMore = false

  // 商品列表分页码
  @observable spuListPageObj = ''

  // 设置商品列表分页码
  @action setSpuListPageObj(e) {
    this.spuListPageObj = e
  }

  // 重设商品列表分页码
  resetSpuListPageObj() {
    this.setSpuListPageObj('')
  }

  // 负库存列表当前页之后是否还有数据
  @observable negativeListMore = false

  // 负库存列表分页码
  @observable negativeListPageObj = ''

  // 设置商品列表分页码
  @action setNegativeListPageObj(e) {
    this.negativeListPageObj = e
  }

  // 重设负库存列表分页码
  resetNegativeListPageObj() {
    this.setNegativeListPageObj('')
  }

  // 商品列表移库状态
  @observable isMoving = false

  // 修改商品列表移库状态
  @action setIsMoving(e) {
    this.isMoving = e
  }

  // 负库存商品列表
  @observable negativeList = []

  // 设置货位搜索条件
  @action setCargoLocationSearchOption(key, value) {
    this.cargoLocationSearchOption[key] = value
  }

  // 重置货位搜索条件
  @action resetCargoLocationSearchOption() {
    this.cargoLocationSearchOption = {
      shelf_id: -1,
      q: '',
      limit: 40,
    }
    this.resetSpuListPageObj()
    this.resetNegativeListPageObj()
  }

  // 输入货位名搜索定位
  @action setCargoLocationName(e) {
    this.cargoLocationName = e
  }

  // 设置表单错误显示
  @action setError(e) {
    this.error = e
  }

  // 设置表单错误信息
  @action setHelp(e) {
    this.help = e
  }

  // 获取商品列表
  @action getCargoLocationMenu(first) {
    return Request('/stock/shelf/get')
      .get()
      .then((result) => {
        let list = _.reverse(result.data)
        if (list.length) {
          for (let i = 0; i < list.length - 1; i++) {
            recursiveProgram(list[i], list[i + 1])
          }
        } else {
          list = [{ shelf: [] }]
        }
        const [{ shelf: treeData }] = _.reverse(list)
        addChildren(treeData)
        const defaultItem = { name: '未分配', shelf_id: -1, selected: true }
        treeData.unshift(defaultItem)
        if (first) {
          this.searchItem = defaultItem
        } else {
          if (
            _.some(
              treeData,
              (item) => item.shelf_id === this.searchItem.shelf_id,
            )
          ) {
            _.forEach(treeData, (item) => {
              item.selected = item.shelf_id === this.searchItem.shelf_id
            })
          } else {
          }
        }
        this.cargoLocationMenu = treeData
        return this.cargoLocationMenu
      })
  }

  // 重新渲染货位列表
  @action setCargoLocationMenu(e) {
    this.cargoLocationMenu = e.slice()
  }

  // 获取商品统计
  @action getSummary(e) {
    Request('/stock/shelf/spu/summary')
      .data(e)
      .get()
      .then(({ data }) => {
        this.summary = data
      })
  }

  // 获取商品列表
  @action getSpuList(first) {
    return Request('/stock/shelf/spu/list')
      .data(
        this.spuListPageObj
          ? {
              ...this.cargoLocationSearchOption,
              page_obj: this.spuListPageObj,
            }
          : this.cargoLocationSearchOption,
      )
      .get()
      .then(({ data, msg: { more, page_obj, shelf_id } }) => {
        if (
          (shelf_id ?? this.searchItem.shelf_id) === this.searchItem.shelf_id
        ) {
          setSpuListToMoveNum(data)
          this.spuList = first ? data : [...this.spuList, ...data]
          this.spuListMore = more
          this.setSpuListPageObj(page_obj)
        }
      })
  }

  // 获取负库存商品列表
  @action getNegativeList(first) {
    return Request('/stock/shelf/spu_negative/list')
      .data(
        this.negativeListPageObj
          ? {
              ...this.cargoLocationSearchOption,
              page_obj: this.negativeListPageObj,
            }
          : this.cargoLocationSearchOption,
      )
      .get()
      .then(({ data, msg: { more, page_obj, shelf_id } }) => {
        if (
          (shelf_id ?? this.searchItem.shelf_id) === this.searchItem.shelf_id
        ) {
          this.negativeList = first ? data : [...this.negativeList, ...data]
          this.negativeListMore = more
          this.setNegativeListPageObj(page_obj)
        }
      })
  }

  // 点击设计选中的货位
  @action setSearchItem(e) {
    this.searchItem = e
  }

  // 获取summary数据（同时包含按货位搜索及按商品搜索的summary）
  @action setSummary(e) {
    this.summary = e
  }

  // 设置商品列表
  @action setSpuList(e) {
    this.spuList = e.slice()
  }

  // 设置负库存商品列表
  @action setNegativeList(e) {
    this.negativeList = e
  }

  // 商品列表的搜索条件
  @observable productMenuSearchOption = {
    category1: undefined,
    category2: undefined,
    text: '',
    limit: 50,
    offset: 0,
  }

  // 设置商品列表搜索条件
  @action setProductMenuSearchOption(value, key) {
    this.productMenuSearchOption[key] = value
  }

  // 重置商品列表搜索条件
  @action resetProductMenuSearchOption() {
    this.productMenuSearchOption = {
      category1: undefined,
      category2: undefined,
      text: '',
      limit: 50,
      offset: 0,
    }
  }

  // 商品列表总条数
  @observable productMenuCount = 0

  // 商品列表
  @observable productMenu = []

  @observable getProductMenuLoading = false

  @action setGetProductMenuLoading(loading) {
    this.getProductMenuLoading = loading
  }

  // 获取商品列表
  @action getProductMenu() {
    const { category1, category2, ...rest } = this.productMenuSearchOption
    const option = {
      ...rest,
      category_id_1: category1 ? category1.id : null,
      category_id_2: category2 ? category2.id : null,
    }
    return Request('/stock/list')
      .data(option)
      .get()
      .then((result) => {
        this.setProductMenu([
          ...this.productMenu,
          ..._.map(result.data, (item) => ({
            value: item.spu_id,
            name: item.name,
          })),
        ])
        this.productMenuCount = result.pagination.count
      })
  }

  // 设置商品列表
  @action setProductMenu(e) {
    this.productMenu = e.slice()
  }

  // 按商品搜索条件
  @observable productSearchOption = {
    spu_id: '',
    shelf_name: '',
    limit: 40,
    page_obj: '',
  }

  // 修改商品搜索条件
  @action setProductSearchOption(key, value) {
    this.productSearchOption[key] = value
  }

  @action resetProductSearchOption() {
    this.productSearchOption = {
      spu_id: '',
      shelf_name: '',
      limit: 40,
      page_obj: '',
    }
  }

  // 货位列表
  /**
   *
   * @type {{root: string, shelf_list: []}[]}
   */
  @observable cargoLocationList = []

  // 货位列表是否还有货位
  @observable cargoLocationListMore = false

  // 设置货位列表
  @action setCargoLocationList(e) {
    this.cargoLocationList = e
  }

  // 按商品搜索获取货位
  @action getCargoLocationList(first) {
    const option = {}
    _.forIn(this.productSearchOption, (value, key) => {
      if (value) {
        option[key] = value
      }
    })
    return Request('/stock/shelf/list')
      .data(option)
      .get()
      .then(({ data, msg: { more, page_obj } }) => {
        this.setProductSearchOption('page_obj', page_obj)
        if (!first) {
          mergeSameItem(this.cargoLocationList, data)
        } else {
          this.cargoLocationList = data
        }
        this.setCargoLocationList(this.cargoLocationList)
        this.cargoLocationListMore = more
      })
  }

  // 带移库列表
  @observable toMoveList = []

  // 设置带移库列表
  @action setToMoveList(e) {
    this.toMoveList = e.slice()
  }

  // 删除货位后清空带移库列表移入货位
  @action clearToMoveListWithDeleteShelf() {
    _.forEach(this.toMoveList, (item) => {
      const in_shelf_id = item.in_shelf_id.length
        ? item.in_shelf_id[item.shelf_id.length - 1]
        : null
      if (!findCargoLocationAfterDelete(in_shelf_id, this.cargoLocationMenu)) {
        item.in_shelf_id = []
      }
    })
  }
}

export const store = new Store()
