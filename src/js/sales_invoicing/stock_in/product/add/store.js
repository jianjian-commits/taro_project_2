import { observable, action, runInAction, computed } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import {
  formatLevelSelectData,
  treeToMap,
  getShelfSelected,
  getSelectedShelfName,
} from '../../../../common/util'
import Big from 'big.js'
import {
  isValid,
  stockInDefaultPriceKey,
  getStockInDetailListAdapter,
} from '../../util'
import { Tip } from '@gmfe/react'
import moment from 'moment'
import globalStore from '../../../../stores/global'
import { t } from 'gm-i18n'

const initDetail = {
  submit_time: moment(),
  status: '', // save,submit,delete
  sheet_remark: '',
  operator: '', // 建单人
  settle_supplier_id: '',
  is_frozen: false, // 是否冻结
}
const initItemDetail = {
  // 后台返回
  batch_number: null,
  proc_order_custom_id: '',
  sku_id: null,
  sku_name: null,
  ratio: '',
  unit_price: null,
  std_unit_name: null,
  sale_unit_name: null,
  amount: null,
  sale_quantity: null,
  reference_cost: null,
  money: null,
  operator: null,
  shelf_name: null,
  production_time: null,
  remark: undefined,
  keyField: Math.random().toString(16),
}
class Store {
  // 新建，待提交，已完成，已删除
  @observable status = 'add' // 入库单页面状态 add edit detail

  @observable sheetDetail = initDetail // 入库单详情

  @observable itemDetailList = [{ ...initItemDetail }] // 商品明细表数据

  @observable tableSelected = []

  @observable skuData = []

  @observable orderSelected = null

  @observable shelfList = []

  @observable spreadOutShelfList = [] // 已打平的货位数据

  @action
  initPage = () => {
    this.sheetDetail = initDetail
    this.itemDetailList = [{ ...initItemDetail }]
    this.tableSelected = []
    this.status = 'add'
  }

  @action
  fetchDetail = (id) => {
    return Request('/stock/in_stock_sheet/product/details')
      .data({ id })
      .get()
      .then((res) => {
        const { data } = res

        const {
          details,
          status,
          operator,
          id,
          submit_time,
          sheet_remark,
          is_frozen,
        } = data

        this.itemDetailList = getStockInDetailListAdapter(
          details,
          this.spreadOutShelfList,
        ).map((item) => ({
          ...item,
          keyField: Math.random().toString(16),
        }))
        this.sheetDetail = {
          status,
          operator,
          id,
          submit_time,
          sheet_remark,
          is_frozen,
        }
        this.status = status === 2 || status === -1 ? 'detail' : 'edit'
      })
  }

  @action
  onDetailChange = (key, value) => (this.sheetDetail[key] = value)

  @action
  onRowDataChange = (index, rowData) =>
    Object.assign(this.itemDetailList[index], { ...rowData })

  @action
  onRowChange = (key, val, index) => (this.itemDetailList[index][key] = val)

  @action
  onAddRow = () => {
    this.itemDetailList.push({
      ...initItemDetail,
      keyField: Math.random().toString(16),
    })
  }

  @action
  handleSelected = (selected) => (this.tableSelected = selected)

  @action
  onDeleteRow = (index) => this.itemDetailList.splice(index, 1)

  @action
  handleDelete = (id) => {
    return Request('/stock/in_stock_sheet/product/delete_new')
      .data({ id })
      .post()
      .then((res) => {
        this.fetchDetail(id)
        return res
      })
  }

  @action
  fetchSkuList = (q) => {
    return Request('/stock/in_stock_sku/product_sku/list')
      .data({ q })
      .get()
      .then((json) => {
        this.skuData = json.data
        return json
      })
  }

  @action
  handleSubmit = (is_submit) => {
    if (!this.verifyData()) return

    const { submit_time, sheet_remark, id } = this.sheetDetail
    const params = {
      is_submit, // 2为提交，1为暂存
      submit_time: moment(submit_time).format('YYYY-MM-DD HH:mm:ss'),
      sheet_remark,
      details: JSON.stringify(this.itemDetailList),
    }
    if (id) params.id = id
    // id 存在时为编辑
    return Request(
      `/stock/in_stock_sheet/product/${id ? 'modify' : 'create_new'}`,
    )
      .data(params)
      .post()
      .then((res) => {
        const {
          data: { id },
        } = res
        this.sheetDetail.id = id
        if (id && is_submit === 1) this.fetchDetail(id)
        return res
      })
  }

  @action
  handleSyncCost = () => {
    this.itemDetailList = this.itemDetailList.map((item) => ({
      ...item,
      unit_price: item.reference_cost,
      money:
        +Big(item.reference_cost || 0)
          .times(item.quantity || 0)
          .toFixed(2) || null,
    }))
    Tip.success(t('同步参考成本成功'))
  }

  @action
  handleFinishTask = (ids) => {
    return Request('/stock/in_stock_sheet/product/finish_task')
      .data({ proc_order_custom_ids: JSON.stringify(ids) })
      .post()
  }

  @action
  validRowData() {
    const result = []
    this.itemDetailList.forEach((item) => {
      const { quantity, unit_price, money, batch_number } = item
      if (quantity || unit_price || money || batch_number) result.push(item)
    })
    return result
  }

  /**
   * 校验数据
   * @param {number} submit_type 提交类型
   * @returns {{canSubmitType: number}} 0: 不允许提交， 1: 可提交， 2: 最高入库价提示提交
   */
  @action
  verifyData(submit_type) {
    const postData = this.validRowData()
    let canSubmitType = 1
    if (postData.length === 0) {
      Tip.warning(t('请先添加商品明细'))
      return 0
    }

    let currentIndex = 0
    while (currentIndex < postData.length) {
      if (
        !isValid(postData[currentIndex].sku_name) ||
        !isValid(postData[currentIndex].money) ||
        !isValid(postData[currentIndex].unit_price) ||
        !isValid(postData[currentIndex].batch_number)
      ) {
        Tip.warning(t('商品明细填写不完善'))
        canSubmitType = 0
      } else if (postData[currentIndex].quantity === 0) {
        Tip.warning(t('商品入库数为0无法提交，请填写入库数后再提交'))
        canSubmitType = 0
      }

      currentIndex++
    }

    // 判断入库单价是否高于最高入库单价
    if (
      submit_type === 2 &&
      globalStore.otherInfo.inStockPriceWarning === 2 &&
      _.find(
        postData,
        (v) =>
          v.max_stock_unit_price &&
          v.purchase_unit_price &&
          Big(v.max_stock_unit_price || 0).lt(v.purchase_unit_price || 0),
      )
    ) {
      canSubmitType = 2
    }

    return canSubmitType
  }

  /**
   * 设置表格选择
   * @param {array} selected table返回的selected
   */
  @action.bound
  changeTableSelect = (selected) => {
    this.tableSelected = selected
  }

  /**
   * 设置表格全选
   * @param {bool} isSelectAll 是否表格全选
   */
  @action.bound
  changeTableSelectAll = (isSelectAll) => {
    // 表格全选，需要selected为当前表格页全部数据
    if (isSelectAll) {
      this.tableSelected = _.map(this.itemDetailList, (v) => v.keyField)
    } else {
      this.tableSelected = []
    }
  }

  @action
  fetchStockInShelfList() {
    return Request('/stock/shelf/tree')
      .get()
      .then((json) => {
        runInAction(() => {
          const formatData = formatLevelSelectData(json.data)
          this.shelfList = formatData

          this.spreadOutShelfList = treeToMap(formatData)
        })

        return json
      })
  }

  /**
   * 设置货位选择
   * @param {number} index 下标
   * @param {array} selected 货位选择
   */
  @action
  setShelfSelected = (index, selected) => {
    const changeData = {
      shelfSelected: selected,
      shelf_id: selected.length > 0 ? selected[selected.length - 1] : null,
      shelf_name: getSelectedShelfName(this.spreadOutShelfList, selected),
    }
    this.onRowDataChange(index, changeData)
  }

  @action
  changeProductNameSelected = (index, selected) => {
    // 切换或清空时将该行数据全部清空
    const changeData = {
      ...initItemDetail,
      // 由于前端生成批次号只做标示该行数据作用，保留批次号和选择标示
      batch_number: this.itemDetailList[index].batch_number,
      keyField: this.itemDetailList[index].keyField,
    }
    if (selected) {
      Object.assign(changeData, {
        sku_name: selected.text,
        sku_id: selected.id,
        ratio: selected.ratio,
        sale_unit_name: selected.sale_unit_name,
        std_unit_name: selected.std_unit_name,
      })
    }
    Object.assign(this.itemDetailList[index], { ...changeData })
  }

  // 选中商品后设置
  @action
  setProductNameSelected = (index, selected) => {
    this.changeProductNameSelected(index, selected)
    // const { settle_supplier_id } = this.stockInReceiptDetail
    const priceReq = {
      spec_id: selected.value,
      // settle_supplier_id,
      query_type: 3,
    }

    const changeData = {}

    // 默认货位,若该采购规格有默认货位，则设置默认货位，若无则设置上一次入库货位，默认货位>上一次入库货位>null,空（0||null）自动往后取值
    changeData.shelfSelected = getShelfSelected(
      this.spreadOutShelfList,
      selected.default_shelf_id || selected.shelf_id,
    )
    changeData.shelf_id = selected.default_shelf_id || selected.shelf_id
    changeData.shelf_name = selected.default_shelf_name || selected.shelf_name

    // 获取当前所选商品的采购均价
    const avgPromise = this.fetchPurchaseAvgPrice(priceReq).then((json) => {
      changeData.supplier_stock_avg_price = json.data.supplier_avg_price
    })

    // 获取商品参考成本
    const refPricePromise = this.fetchRefPriceData({
      spec_id: selected.value,
      spu_id: selected.spu_id,
      // settle_supplier_id,
    }).then((json) => {
      const {
        last_in_stock_price,
        last_purchase_price,
        last_quote_price,
        latest_in_stock_price,
        latest_purchase_price,
        latest_quote_price,
        stock_avg_price,
        max_stock_unit_price,
      } = json.data
      Object.assign(changeData, {
        last_in_stock_price,
        last_purchase_price,
        last_quote_price,
        latest_in_stock_price,
        latest_purchase_price,
        latest_quote_price,
        stock_avg_price,
        max_stock_unit_price,
      })
    })

    return Promise.all([refPricePromise, avgPromise]).then(() => {
      // 设置单价默认值
      const defaultPriceKey =
        stockInDefaultPriceKey[globalStore.otherInfo.inStockRefPrice]

      let defaultPrice = 0

      switch (defaultPriceKey) {
        case 'last_in_stock_price':
          defaultPrice = changeData.last_in_stock_price.newest.price || 0
          break
        case 'last_quote_price':
          defaultPrice = changeData.last_quote_price.newest.price || 0
          break
        case 'latest_in_stock_price':
          defaultPrice = changeData.latest_in_stock_price || 0
          break
        case 'latest_quote_price':
          defaultPrice = changeData.latest_quote_price || 0
          break
        default:
          break
      }
      changeData.unit_price = _.isNil(defaultPrice)
        ? defaultPrice
        : _.toNumber(defaultPrice)

      this.onRowDataChange(index, {
        ...changeData,
      })
    })
  }

  @action
  fetchPurchaseAvgPrice(req) {
    return Request('/purchase/purchase_spec/avg_price/get').data(req).get()
  }

  @action
  fetchRefPriceData(req) {
    return Request('/purchase/purchase_spec/ref_price')
      .data(req)
      .get()
      .then((json) => {
        return json
      })
  }

  @action
  doShelfError = (error) => {
    const { itemDetailList } = this
    _.forEach(itemDetailList, (item, index) => {
      item.error = error[item.batch_number]
      if (item.error) {
        Tip.danger(t('提交入库单失败'))
        item.shelfSelected = []
        item.shelf_id = item.shelf_name = null
        this.fetchStockInShelfList()
        this.onRowDataChange(index, item)
      }
    })
  }

  @computed
  get formatSkusData() {
    return _.map(this.skuData, (item) => {
      return {
        label: `${item.category_name_1}/${item.category_name_2}/${item.spu_name}`,
        children: _.map(item.skus, (o) => {
          return {
            ...o,
            value: o.id,
            text: `${o.name}(${o.id})`,
          }
        }),
      }
    })
  }
}

export default new Store()
