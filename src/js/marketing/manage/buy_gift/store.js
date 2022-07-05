import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

import { addTableCell, CHECKBOX_PRESENT_TYPE_DATA } from './utils'

// 分类树
const skuTreeRequest = async (data) => {
  return Request('/station/promotion/category/tree').data(data).get()
}
// 报价单列表
const saleMenuRequest = async (data) => {
  return Request('/salemenu/sale/list').data(data).get()
}
// 根据分类获取商品
const categorySkuListRequest = async (data) => {
  return Request('/station/promotion/category/sku/list').data(data).get()
}
// 获取已添加赠品的商品id
const existPresentListRequest = async (data) => {
  return Request('/station/present/exist/sku/list').data(data).get()
}

class AddStore {
  // 第一步
  @observable saleMenus = []
  @observable selectSaleMenu = null

  @observable tableOne = []
  @observable selectedTableOne = []

  // 第二步
  @observable presentType = []
  @observable tableTwo = []

  // 商品相关数据
  @observable skuTree = []
  @observable existIds = []

  @action
  clearStore() {
    this.tableOne = []
    this.selectedTableOne = []
    this.presentType = []
    this.tableTwo = []
  }

  // 设置报价单
  @action
  setSelectedSaleMenu(obj) {
    this.selectSaleMenu = obj
  }

  // 设置第一步表格数据
  @action
  setTableOne(data) {
    this.tableOne = data
  }

  // 第一步表格，添加一空行
  @action
  addTableOneCell(index) {
    this.tableOne = addTableCell(
      this.tableOne.slice(),
      index != null ? index : this.tableOne.length - 1,
    )
  }

  // 第一步表格，删除一行
  @action
  delTableOneCell(index) {
    this.tableOne.remove(this.tableOne[index])
  }

  // 第一步表格，单行设置
  @action
  setTableOneCell(index, obj) {
    this.tableOne[index] = {
      ...obj,
    }
  }

  // 第一步表格，单行数据设置
  @action
  setTableOneCellData(index, obj) {
    this.tableOne[index] = {
      ...this.tableOne[index],
      ...obj,
    }
  }

  // 设置第二步表格数据
  @action
  setTableTwo(data) {
    this.tableTwo = data
  }

  // 第二步表格，添加一空行
  @action
  addTableTwoCell(index) {
    this.tableTwo = addTableCell(
      this.tableTwo.slice(),
      index != null ? index : this.tableTwo.length - 1,
    )
  }

  // 第二步表格，删除一行
  @action
  delTableTwoCell(index) {
    this.tableTwo.remove(this.tableTwo[index])
  }

  // 第二步表格，设置单行
  @action
  setTableTwoCell(index, obj) {
    this.tableTwo[index] = {
      ...obj,
    }
  }

  // 第二步表格，单行数据设置
  @action
  setTableTwoCellData(index, obj) {
    this.tableTwo[index] = {
      ...this.tableTwo[index],
      ...obj,
    }
  }

  // 设置赠送类型
  @action
  setPresentType(v) {
    this.presentType = v
  }

  // 获取已存在的赠品id集
  @action
  getExistPresentIds() {
    return existPresentListRequest({
      salemenu_id: this.saleMenuId,
    }).then(
      action((json) => {
        this.existIds = json.data
        return json
      }),
    )
  }

  // 获取报价单列表
  @action
  getSaleMenuList() {
    return saleMenuRequest({ is_deleted: 0 }).then(
      action((json) => {
        this.saleMenus = _.map(json.data, (v) => ({
          ...v,
          text: v.name,
          value: v.id,
        }))
        return json
      }),
    )
  }

  // 获取对应报价单列表的分类数据
  @action
  getSkuTree() {
    return skuTreeRequest({ salemenu_id: this.saleMenuId }).then(
      action((json) => {
        this.skuTree = _.map(json.data, (v) => ({
          ...v,
          text: v.name,
          value: v.id,
          children: _.map(v.children, (s) => ({ text: s.name, value: s.id })),
        }))
        return json.data
      }),
    )
  }

  // 获取对应报价单，分类的商品数据
  @action
  getSkuTreeList(params) {
    return categorySkuListRequest({
      ...params,
      salemenu_id: this.saleMenuId,
    }).then((json) => _.map(json.data, (v) => ({ ...v, id: v.sku_id })))
  }

  // 创建赠品
  @action
  createBuyGift() {
    return Request('/station/present/create').data(this.submitParams).post()
  }

  // 选择的报价单id
  @computed
  get saleMenuId() {
    return this.selectSaleMenu ? this.selectSaleMenu.id : ''
  }

  // 过滤空行的表格一的数据
  @computed
  get tableOneData() {
    return _.filter(this.tableOne, (v) => v.id)
  }

  // 过滤空行表格一的总数
  @computed
  get tableOneCount() {
    return this.tableOneData.length
  }

  // 过滤空行的表格二的数据
  @computed
  get tableTwoData() {
    return _.filter(this.tableTwo, (v) => v.id)
  }

  // 过滤空行表格二的总数
  @computed
  get tableTwoCount() {
    return this.tableTwoData.length
  }

  // 判断非空行数据，是否存在未填兑换比例
  @computed
  get canSubmit() {
    const list = _.filter(this.tableTwoData, (v) =>
      _.isNumber(v.exchange_ratio),
    )

    return list.length === this.tableTwoCount
  }

  // 表格一id集
  @computed
  get tableOneIds() {
    return _.map(this.tableOneData, (v) => v.id)
  }

  // 已存在的赠品和表格一已添加的商品
  @computed
  get tableOneExistIds() {
    return [...this.tableOneIds, ...this.existIds.slice()]
  }

  // 表格二id集
  @computed
  get tableTwoIds() {
    return _.map(this.tableTwoData, (v) => v.id)
  }

  // 包括已存在的赠品、表格一已添加的商品，及表格二已添加的商品
  @computed
  get tableTwoExistIds() {
    return [...this.tableTwoIds, ...this.existIds.slice(), ...this.tableOneIds]
  }

  // 是否显示表格二，只有满赠时，不显示
  @computed
  get hasProduct() {
    if (this.presentType.length !== 2 && _.head(this.presentType) === 1) {
      return false
    }
    return true
  }

  // 转换创建的请求体数据
  @computed
  get submitParams() {
    const presentType =
      this.presentType.length === 2 ? 3 : _.head(this.presentType)
    const skuList = _.map(
      this.tableOneData,
      ({ sku_id, stock_num, status }) => ({
        sku_id,
        stock_num: _.isNumber(stock_num) ? stock_num : 0,
        status: status === undefined ? 1 : status,
        stock_type: _.isNumber(stock_num) ? 1 : 0,
      }),
    )

    let params = {
      present_type: JSON.stringify(presentType),
      salemenu_id: this.saleMenuId,
      sku_info: JSON.stringify(skuList),
    }

    if (this.hasProduct) {
      const refer_sku_info = _.map(
        this.tableTwoData,
        ({ sku_id, exchange_ratio }) => ({
          sku_id,
          exchange_ratio,
        }),
      )
      params = Object.assign(params, {
        refer_sku_info: JSON.stringify(refer_sku_info),
      })
    }

    return params
  }
}

class DetailStore {
  // 详情对应报价单id
  @observable saleMenuId = ''
  // 商品相关数据
  @observable skuTree = []
  @observable existIds = []

  // 基本信息
  @observable skuName = ''
  @observable saleRatio = 0
  @observable saleUnitName = ''
  @observable stdUnitNameForsale = ''
  @observable category1Name = ''
  @observable category2Name = ''
  @observable salemenuName = ''
  @observable stockNum = 0
  @observable status = 0
  @observable has_used_stock = 0

  // 赠送方式
  @observable presentType = []

  // 赠品表格
  @observable table = []

  // 设置详情报价单id
  @action
  setSaleMenuId(id) {
    this.saleMenuId = id
  }

  // 设置库存
  @action.bound
  setStockNum(v) {
    this.stockNum = v
  }

  // 设置状态
  @action.bound
  setStatus(v) {
    this.status = v
  }

  // 设置赠送类型
  @action
  setPresentType(value) {
    this.presentType = value
  }

  // 设置表格数据
  @action
  setTable(data) {
    this.table = data
  }

  // 添加一空行
  @action
  addTableCell(index) {
    this.table = addTableCell(
      this.table.slice(),
      index != null ? index : this.table.length - 1,
    )
  }

  // 删除一行
  @action
  delTableCell(index) {
    this.table.remove(this.table[index])
  }

  // 设置单行数据
  @action
  setTableCell(index, obj) {
    this.table[index] = {
      ...obj,
    }
  }

  // 设置单行数据设置
  @action
  setTableCellData(index, obj) {
    this.table[index] = {
      ...this.table[index],
      ...obj,
    }
  }

  // 获取已存在单赠品id集
  @action
  getExistPresentIds() {
    return existPresentListRequest({
      salemenu_id: this.saleMenuId,
    }).then(
      action((json) => {
        this.existIds = json.data
        return json
      }),
    )
  }

  // 获取分类数据
  @action
  getSkuTree() {
    return skuTreeRequest({ salemenu_id: this.saleMenuId }).then(
      action((json) => {
        this.skuTree = _.map(json.data, (v) => ({
          ...v,
          text: v.name,
          value: v.id,
          children: _.map(v.children, (s) => ({ text: s.name, value: s.id })),
        }))
        return json.data
      }),
    )
  }

  // 获取分类对应商品数据
  @action
  getSkuTreeList(params) {
    return categorySkuListRequest({
      ...params,
      salemenu_id: this.saleMenuId,
    }).then((json) => _.map(json.data, (v) => ({ ...v, id: v.sku_id })))
  }

  // 获取赠品详情
  @action
  getDetail(id) {
    return Request('/station/present/get')
      .data({
        present_id: id,
      })
      .get()
      .then(
        action((json) => {
          const {
            category_1_name,
            category_2_name,
            sale_ratio,
            sku_name,
            sale_unit_name,
            std_unit_name_forsale,
            salemenu_name,
            stock_num,
            status,
            present_type,
            refer_sku_info,
            has_used_stock,
          } = json.data

          // 基本信息
          this.skuName = sku_name
          this.saleRatio = sale_ratio
          this.saleUnitName = sale_unit_name
          this.stdUnitNameForsale = std_unit_name_forsale
          this.category1Name = category_1_name
          this.category2Name = category_2_name
          this.salemenuName = salemenu_name
          this.stockNum = stock_num
          this.has_used_stock = has_used_stock
          this.status = status

          // 赠送方式
          this.presentType = CHECKBOX_PRESENT_TYPE_DATA[present_type]

          // 商品表格
          this.table = _.map(refer_sku_info, (v) => ({
            ...v,
            id: v.sku_id,
            salemenu_name: salemenu_name,
          })) || [{}]
          return json
        }),
      )
  }

  // 更新赠品详情
  @action
  updateDetail(id) {
    const params = Object.assign(this.submitParams, { present_id: id })
    return Request('/station/present/update').data(params).post()
  }

  // 已存在的商品id集
  @computed
  get tableExistIds() {
    return [..._.map(this.tableData, (v) => v.id), ...this.existIds.slice()]
  }

  // 商品表格过滤空行的数据
  @computed
  get tableData() {
    return _.filter(this.table, (v) => v.id)
  }

  // 过滤空行的数据总数
  @computed
  get tableCount() {
    return this.tableData.length
  }

  // 判断是否存在兑换比例未填写的情况
  @computed
  get noEmptyRatio() {
    const list = _.filter(this.tableData, (v) => _.isNumber(v.exchange_ratio))
    return list.length === this.tableCount
  }

  @computed
  get hasFailProduct() {
    return _.every(this.tableData, (v) => v.state === 1 || v.sku_status === 1)
  }

  // 是否显示商品表格，只有满赠时，无商品
  @computed
  get hasProduct() {
    if (this.presentType.length !== 2 && _.head(this.presentType) === 1) {
      return false
    }
    return true
  }

  // 转换请求体数据
  @computed
  get submitParams() {
    const presentType =
      this.presentType.length === 2 ? 3 : _.head(this.presentType)
    let params = {
      present_type: JSON.stringify(presentType),
      status: this.status,
      salemenu_id: this.saleMenuId,
      stock_type: this.stockNum === 0 ? 0 : 1,
      stock_num: this.stockNum === 0 ? 0 : this.stockNum,
    }

    if (this.hasProduct) {
      const refer_sku_info = _.map(
        this.tableData,
        ({ sku_id, exchange_ratio }) => ({
          sku_id,
          exchange_ratio,
        }),
      )
      params = Object.assign(params, {
        refer_sku_info: JSON.stringify(refer_sku_info),
      })
    }

    return params
  }

  // 拼接规格数据
  @computed
  get spec() {
    return `${this.saleRatio}${this.stdUnitNameForsale}/${this.saleUnitName}`
  }

  // 拼接分类数据
  @computed
  get sort() {
    return `${this.category1Name}/${this.category2Name}`
  }
}

class MainStore {
  @observable doBuyGiftFirstRequest = _.noop()
  @observable count = 0
  // 分类信息
  @observable skuTree = []

  // 赠品列表
  @observable giftList = []

  // 头部过滤栏
  @observable filter = {
    present_type: -1,
    status: -1,
    search_text: '',
  }

  // 更改过滤条件
  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  // 初始化数据
  @action
  initBuyGift() {}

  @action
  setBuyGiftDoFirstRequest(func) {
    // doBuyGiftFirstRequest 有 ManagePagination 提供
    this.doBuyGiftFirstRequest = func
  }

  // 获取赠品数据
  @action
  getGiftList(page = null) {
    const params = Object.assign(this.filterParams, page)

    return Request('/station/present/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.giftList = json.data
          this.count = json.pagination.count
          return json
        }),
      )
  }

  // 删除赠品
  @action
  deleteBuyGift(present_id) {
    return Request('/station/present/delete').data({ present_id }).get()
  }

  // 转换过滤的请求体
  @computed
  get filterParams() {
    const { search_text, present_type, status } = this.filter
    const params = {
      search_text,
    }

    if (present_type !== -1) {
      params.present_type = present_type
    }

    if (status !== -1) {
      params.status = status
    }

    return params
  }
}

const mainStore = new MainStore()
const detailStore = new DetailStore()
const addStore = new AddStore()

export { mainStore, addStore, detailStore }
