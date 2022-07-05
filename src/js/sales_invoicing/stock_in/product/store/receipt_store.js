import { observable, action, runInAction, autorun } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import {
  formatLevelSelectData,
  treeToMap,
  getShelfSelected,
  getSelectedShelfName,
  sortByMultiRule,
} from '../../../../common/util'
import BaseStore from './base_store'
import Big from 'big.js'
import {
  isValid,
  getStockInDetailListAdapter,
  stockInDefaultPriceKey,
} from '../../util'
import { Storage, Tip } from '@gmfe/react'
import moment from 'moment'
import globalStore from '../../../../stores/global'
import { t } from 'gm-i18n'

const getRuleList = (sort_by, sort_direction) => {
  if (!sort_direction) return []

  return sort_by === 'name'
    ? [{ sort_by: 'name', sort_direction }]
    : [
        { sort_by: 'category_name_1', sort_direction },
        { sort_by: 'category_name_2', sort_direction },
      ]
}

const ROOT_KEY = 'list_sort_type_stock_in_receipt_detail'

class Store extends BaseStore {
  // 供应商
  @observable supplierList = []

  @observable supplierSelected = null

  // 入库详情
  @observable stockInReceiptList = [
    {
      ...this.initStockInReceiptList,
      // 未建单前需要初始化数据
      // batch_number: _.random(10000, true), // 不需要给一个默认的批次号，会造成商品盘点对不上，没有则不传即可
      uniqueKeyForSelect: _.random(1000, true),
    },
  ]
  // @observable stockInReceiptList = _.times(300, () => {
  //   return { ...this.initStockInReceiptList }
  // })

  @observable stockInReceiptDetail = { ...this.initStockInReceiptDetail }

  @observable shelfList = []

  @observable spreadOutShelfList = [] // 已打平的货位数据

  // 金额折让
  @observable stockInDiscountList = []

  // 费用分摊
  @observable stockInShareList = [{}]

  // 分摊商品信息
  @observable stockInShareProductList = []

  // 分摊操作数据
  @observable stockInOperatedShare = { ...this.initStockInOperatedShare }

  // canShow
  @observable canShow = []

  @observable showRefCostType = 1

  @observable tableSelected = []

  // 排序
  @observable sortItem = Storage.get(ROOT_KEY) || {
    sort_by: '',
    sort_direction: '',
  }

  @observable unitDetailsIdMap = null

  skuMoneyDisposer = _.noop
  deltaMoneyDisposer = _.noop

  @action
  changeShowRefCostType(type) {
    return Request('/station/ref_price_type/set')
      .data({ where: 4, type })
      .post()
      .then(() => {
        this.showRefCostType = type
      })
  }

  @action fetchGetShowRefCostType() {
    return Request('/station/ref_price_type/get')
      .data({ where: 4 })
      .get()
      .then(({ data }) => {
        this.showRefCostType = data.type
      })
  }

  @action
  initAutoRun = () => {
    this.skuMoneyDisposer = autorun(() => {
      let total = 0

      _.each(this.stockInReceiptList, (item) => {
        total = Big(total).plus(item.money || 0)
      })

      this.stockInReceiptDetail.sku_money = +total
    })

    this.deltaMoneyDisposer = autorun(() => {
      let total = 0

      _.each(this.stockInDiscountList, (item) => {
        total =
          item.action + '' === '1'
            ? Big(total).plus(item.money || 0)
            : Big(total).minus(item.money || 0)
      })

      this.stockInReceiptDetail.delta_money = +total
    })
  }

  @action.bound
  clear() {
    this.skuMoneyDisposer()
    this.deltaMoneyDisposer()
  }

  // 供应商
  @action
  changeSupplierSelected(selected) {
    this.supplierSelected = selected

    this.stockInReceiptDetail.settle_supplier_id = selected.value
    this.stockInReceiptDetail.supplier_name = selected.text
  }

  /**
   * 设置入库单号
   * @param {string} id 单据id
   */
  @action
  setReceiptId(id) {
    this.stockInReceiptDetail.id = id
  }

  @action
  changeStockInReceiptDetail(field, value) {
    this.stockInReceiptDetail[field] = value
  }

  /**
   * 批量修改存放货位
   * @param {array} shelfSelected 表格选中项
   * @param {array} tableSelected 表格选中项
   */
  @action
  batchSetShelf(shelfSelected, tableSelected) {
    _.each(this.stockInReceiptList, (item, index) => {
      if (_.includes(tableSelected, item.uniqueKeyForSelect)) {
        this.setShelfSelected(index, shelfSelected)
      }
    })
  }

  @action.bound
  addStockInReceiptListItem() {
    this.stockInReceiptList.push({
      ...this.initStockInReceiptList,
      // batch_number: _.random(10000, true),
      uniqueKeyForSelect: _.random(1000, true),
    })
  }

  @action.bound
  deleteStockInReceiptListItem(index) {
    this.stockInReceiptList.remove(this.stockInReceiptList[index])
  }

  @action
  changeProductNameSelected(index, selected) {
    // 切换或清空时将该行数据全部清空
    const changeData = {
      ...this.initStockInReceiptList,
      // 由于前端生成批次号只做标示该行数据作用，保留批次号和选择标示
      batch_number: this.stockInReceiptList[index].batch_number,
      uniqueKeyForSelect: this.stockInReceiptList[index].uniqueKeyForSelect,
    }
    if (selected) {
      Object.assign(changeData, {
        name: selected.sku_name,
        displayName: selected.name,
        id: selected.value,
        category: selected.category,
        category_name_1: selected.category_name_1,
        category_name_2: selected.category_name_2,
        std_unit: selected.std_unit,
        purchase_unit: selected.purchase_unit,
        ratio: selected.ratio,
        spu_id: selected.spu_id,
        max_stock_unit_price: selected.max_stock_unit_price,
        tax_rate: selected.tax_rate,
      })
    }

    Object.assign(this.stockInReceiptList[index], { ...changeData })
  }

  @action
  changeStockInReceiptListItem(index, changeData) {
    Object.assign(this.stockInReceiptList[index], { ...changeData })
  }

  // todo 以下三个设置待理清扫码入库逻辑考虑是否需要提到store，单独处理可能更好
  // 选中商品后设置
  @action
  setProductNameSelected(index, selected) {
    this.changeProductNameSelected(index, selected)
    const { settle_supplier_id } = this.stockInReceiptDetail
    const priceReq = {
      spec_id: selected.value,
      settle_supplier_id,
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
      settle_supplier_id,
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
        supplier_cycle_quote,
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
        supplier_cycle_quote,
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
        // 增加供应商周期报价
        case 'supplier_cycle_quote':
          defaultPrice = changeData.supplier_cycle_quote || 0
          break
        default:
          break
      }
      changeData.unit_price = _.isNil(defaultPrice)
        ? defaultPrice
        : _.toNumber(defaultPrice)

      const { ratio } = this.stockInReceiptList[index]
      changeData.purchase_unit_price =
        isValid(changeData.unit_price) && isValid(ratio)
          ? +Big(changeData.unit_price).times(ratio).toFixed(2)
          : null

      this.changeStockInReceiptListItem(index, {
        ...changeData,
      })
    })
  }

  // 设置皮重
  @action
  setTareQuantityChange(index, value) {
    const changeData = {
      tare_quantity: value,
    }
    this.changeStockInReceiptListItem(index, changeData)
  }

  // 设置入库数（基本单位）
  @action
  setQuantityChange(index, value) {
    const { unit_price, ratio, tax_rate } = this.stockInReceiptList[index]
    // 入库单价（基本单位）改变会直接导致包装单位和入库金额的改变
    const changeData = {}

    // 入库数 (基本单位)
    changeData.quantity = value
    changeData.different_price = 0

    // 包装单位基于基本单位和换算比率
    changeData.purchase_unit_quantity =
      isValid(value) && ratio ? +Big(value).div(ratio).toFixed(4) : null

    // 金额基于单价和数量，缺一不可
    changeData.money =
      isValid(unit_price) && isValid(value)
        ? +Big(value).times(unit_price).toFixed(2)
        : null

    if (changeData.purchase_unit_quantity === 0) {
      changeData.purchase_unit_price = 0
    } else {
      changeData.purchase_unit_price =
        isValid(changeData.money) && isValid(changeData.purchase_unit_quantity)
          ? +Big(changeData.money)
              .div(changeData.purchase_unit_quantity)
              .toFixed(4)
          : null
    }

    if (changeData.money !== null) {
      this.setChangeData(changeData, tax_rate)
    }

    this.changeStockInReceiptListItem(index, changeData)
  }

  // 设置入库单价（基本单位）
  @action
  setUnitPriceChange(index, value) {
    const {
      quantity,
      // purchase_unit_quantity,
      tax_rate,
      ratio,
    } = this.stockInReceiptList[index]
    const changeData = {}

    changeData.unit_price = value

    changeData.different_price = 0

    changeData.money =
      isValid(value) && isValid(quantity)
        ? +Big(value).times(quantity).toFixed(2)
        : null

    // changeData.purchase_unit_price =
    //   isValid(changeData.money) && isValid(purchase_unit_quantity)
    //     ? +Big(changeData.money).div(purchase_unit_quantity).toFixed(2)
    //     : null

    changeData.purchase_unit_price =
      isValid(value) && isValid(ratio)
        ? +Big(value).times(ratio).toFixed(2)
        : null

    if (changeData.money !== null) {
      this.setChangeData(changeData, tax_rate)
    }
    this.changeStockInReceiptListItem(index, changeData)
  }

  /**
   * 设置货位选择
   * @param {number} index 下标
   * @param {array} selected 货位选择
   */
  @action
  setShelfSelected = (index, selected) => {
    const changeData = {}

    changeData.shelfSelected = selected
    changeData.shelf_id =
      selected.length > 0 ? selected[selected.length - 1] : null
    changeData.shelf_name = getSelectedShelfName(
      this.spreadOutShelfList,
      selected,
    )

    this.changeStockInReceiptListItem(index, changeData)
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
      this.tableSelected = _.map(
        this.stockInReceiptList,
        (v) => v.uniqueKeyForSelect,
      )
    } else {
      this.tableSelected = []
    }
  }

  // 入库详情-金额折让
  @action
  addDiscountList(discount) {
    this.stockInDiscountList.push(discount)
  }

  @action
  deleteDiscountListItem(index) {
    this.stockInDiscountList.remove(this.stockInDiscountList[index])
  }

  // 入库详情-费用分摊
  @action
  addShareList() {
    this.stockInShareList = [{ ...this.stockInOperatedShare }]
  }

  @action
  deleteShareList() {
    this.stockInShareList = [{}]
  }

  @action
  changeOperatedShareItem(field, value) {
    this.stockInOperatedShare[field] = value
  }

  @action
  getValidStockInListData() {
    const result = []
    _.each(this.stockInReceiptList, (item, index) => {
      // 校验所填的数据
      if (
        item.spu_id ||
        isValid(item.quantity) ||
        isValid(item.unit_price) ||
        isValid(item.money)
      ) {
        // 清除辅助数据
        const data = _.omit(item, ['shelfSelected', 'uniqueKeyForSelect'])

        // 校验该条数据是否被修改为了其他商品
        const uniq_id = `${data.detail_id}_${data.id}`
        const isSame = this.unitDetailsIdMap && !!this.unitDetailsIdMap[uniq_id]
        result.push({
          ...data,
          batch_number: isSame ? data.batch_number : '',
        })
      }
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
    const postData = this.getValidStockInListData()
    let canSubmitType = 1

    if (postData.length === 0) {
      Tip.warning(t('请先添加商品明细'))
      return 0
    }

    let currentIndex = 0
    while (currentIndex < postData.length) {
      if (
        !isValid(postData[currentIndex].name) ||
        !isValid(postData[currentIndex].money) ||
        !isValid(postData[currentIndex].unit_price)
      ) {
        Tip.warning(t('商品明细填写不完善'))
        canSubmitType = 0
      } else if (postData[currentIndex].quantity === 0) {
        Tip.warning(t('商品入库数为0无法提交，请填写入库数后再提交'))
        canSubmitType = 0
      } else if (
        postData[currentIndex].production_time &&
        postData[currentIndex].life_time &&
        moment(postData[currentIndex].production_time).isAfter(
          postData[currentIndex].life_time,
        )
      ) {
        Tip.warning(t('生产日期不能超过保质期'))
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
          v.max_stock_unit_price !== null &&
          Big(v.max_stock_unit_price).lt(v.purchase_unit_price || 0),
      )
    ) {
      canSubmitType = 2
    }

    return canSubmitType
  }

  @action
  getPostStockReceiptData(submit_type) {
    // const details = _.uniqBy(this.getValidStockInListData(), 'batch_number')
    const details = this.getValidStockInListData()
    return {
      // ..._.omit(this.stockInReceiptDetail, ['submit_time']),
      ..._.pick(this.stockInReceiptDetail, [
        'id',
        'remark',
        'settle_supplier_id',
        'supplier_name',
        'purchase_sheet_id',
      ]),
      submit_time_new: moment(this.stockInReceiptDetail.submit_time_new).format(
        'YYYY-MM-DD HH:mm',
      ),
      details: JSON.stringify(details),
      share: JSON.stringify(
        _.isEmpty(this.stockInShareList[0]) ? [] : this.stockInShareList,
      ),
      discount: JSON.stringify(this.stockInDiscountList),
      is_submit: submit_type,
    }
  }

  @action
  getFirstPostData(submit_type) {
    const req = this.getPostStockReceiptData(submit_type)

    const {
      settle_supplier_id,
      supplier_name,
      share,
      discount,
      // sku_money,
      // delta_money,
      remark,
      submit_time_new,
      // supplier_customer_id,
      details,
      is_submit,
    } = req

    // 注释掉的字段，后端说是不需要(多余的)
    return {
      share,
      discount,
      details,
      settle_supplier_id,
      supplier_name,
      // sku_money,
      // delta_money,
      remark,
      submit_time_new,
      // supplier_customer_id,
      is_submit,
    }
  }

  doShelfError = (error) => {
    const { stockInReceiptList } = this
    _.forEach(stockInReceiptList, (item, index) => {
      item.error = error[item.batch_number]
      if (item.error) {
        Tip.danger(t('提交入库单失败'))
        item.shelfSelected = []
        item.shelf_id = item.shelf_name = null
        this.fetchStockInShelfList()
        this.changeStockInReceiptListItem(index, item)
      }
    })
  }

  @action
  postStockReceiptData(submit_type) {
    // 若未有单号，则是未建单，因此需要调create接口
    const hasDetailNum = !!this.stockInReceiptDetail.id
    const req = hasDetailNum
      ? this.getPostStockReceiptData(submit_type)
      : this.getFirstPostData(submit_type)

    const reqUrl = hasDetailNum
      ? '/stock/in_stock_sheet/material/modify'
      : '/stock/in_stock_sheet/material/create/new'

    return Request(reqUrl)
      .data(req)
      .code([20])
      .post()
      .then((json) => {
        // 首次进来没有单号，需要获取到单号再拉数据
        if (json.data && json.data.id) {
          this.setReceiptId(json.data.id)
          runInAction(() => {
            // 一开始没有创建人，因此创建后会返回，需要加上
            this.stockInReceiptDetail.creator = json.data.creator
            // 未建单没有单据状态，建单后更新
            this.stockInReceiptDetail.status = json.data.status
          })
        }

        return json
      })
  }

  @action
  fetchSupplierList() {
    return Request('/stock/settle_supplier/get')
      .get()
      .then((json) => {
        runInAction(() => {
          this.supplierList = _.map(json.data, (supplierGroup) => {
            return {
              label: supplierGroup.name,
              children: _.map(supplierGroup.settle_suppliers, (supplier) => {
                return {
                  value: supplier._id,
                  text: supplier.name,
                }
              }),
            }
          })
        })

        return json
      })
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

  @action
  fetchStockInReceiptList() {
    const req = { id: this.stockInReceiptDetail.id }

    return Request('/stock/in_stock_sheet/material/new_detail')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.supplierSelected = {
            value: json.data.settle_supplier_id,
            text: json.data.supplier_name,
          }
          Object.assign(this.stockInReceiptDetail, { ...json.data })
          // 重新获取数据需要清空表格选择
          this.tableSelected = []

          // 当有数据才覆盖init
          if (json.data.details.length > 0) {
            const list = sortByMultiRule(
              getStockInDetailListAdapter(
                json.data.details,
                this.spreadOutShelfList,
              ),
              getRuleList(this.sortItem.sort_by, this.sortItem.sort_direction),
            )
            this.stockInReceiptList = _.map(list, (value) => {
              // 对每一条数据做备份，在提交的时候做校验
              this.unitDetailsIdMap = _.assign(this.unitDetailsIdMap, {
                [`${value?.detail_id}_${value?.id}`]: value?.batch_number,
              })

              return Object.assign(
                {},
                { ...this.initStockInReceiptList },
                { ...value },
                {
                  uniqueKeyForSelect: _.random(1000, true),
                  batch_number: value.batch_number
                    ? value.batch_number
                    : _.random(1000, true), // 采购单过来的数据没有批次号，这边需要生成
                },
              )
            })
          } else {
            this.stockInReceiptList = [
              {
                ...this.initStockInReceiptList,
                // batch_number: _.random(1000, true), // 由于后台不用前端批次号，但是获取不到单号，因此改变批次号创建规则
                uniqueKeyForSelect: _.random(1000, true),
              },
            ]
          }

          if (json.data.share.length > 0) {
            this.stockInShareList = json.data.share
          }
          this.stockInDiscountList = json.data.discount
        })

        return json
      })
  }

  @action
  fetchShareProductList() {
    const req = { id: this.stockInReceiptDetail.id }

    // todo 直接搬过来，还未优化
    return Request('/stock/in_stock_sheet/material/search_share_sku')
      .data(req)
      .get()
      .then((json) => {
        const shareProductMap = {}
        _.each(json.data, (s) => {
          if (_.has(shareProductMap, s.category_id_1)) {
            if (
              _.has(shareProductMap[s.category_id_1].children, s.category_id_2)
            ) {
              shareProductMap[s.category_id_1].children[
                s.category_id_2
              ].children.push({
                value: s.sku_id,
                name: s.name,
              })
            } else {
              shareProductMap[s.category_id_1].children[s.category_id_2] = {
                value: s.category_id_2,
                name: s.category_name_2,
                children: [
                  {
                    value: s.sku_id,
                    name: s.name,
                  },
                ],
              }
            }
          } else {
            const children1 = {}
            children1[s.category_id_2] = {
              value: s.category_id_2,
              name: s.category_name_2,
              children: [
                {
                  value: s.sku_id,
                  name: s.name,
                },
              ],
            }
            shareProductMap[s.category_id_1] = {
              value: s.category_id_1,
              name: s.category_name_1,
              children: children1,
            }
          }
        })

        const shareProduct = _.map(shareProductMap, (data) => {
          return {
            value: data.value,
            name: data.name,
            children: _.map(data.children, (c) => {
              return c
            }),
          }
        })

        runInAction(() => {
          this.stockInShareProductList = shareProduct
        })

        return json
      })
  }

  @action
  fetchSkuList(req) {
    return Request('/stock/in_stock_sku/supply_sku_new')
      .data(req)
      .get()
      .then((json) => {
        return json
      })
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
  fetchPurchaseAvgPrice(req) {
    return Request('/purchase/purchase_spec/avg_price/get').data(req).get()
  }

  @action
  deleteStockInReceiptList(id) {
    return Request('/stock/in_stock_sheet/material/cancel').data({ id }).post()
  }

  @action
  notApprovedStockInReceiptList(req) {
    return Request('/stock/in_stock_sheet/material/review')
      .data(req)
      .code([5])
      .post()
  }

  @action
  sortStockInReceiptList(name, direction) {
    let sortItem = {}
    if (!direction) {
      sortItem = { sort_by: '', sort_direction: '' }
    } else {
      sortItem = { sort_by: name, sort_direction: direction }
      this.stockInReceiptList = sortByMultiRule(
        this.stockInReceiptList,
        getRuleList(name, direction),
      )
    }
    this.sortItem = sortItem
    Storage.set(ROOT_KEY, sortItem)
  }

  @action
  setChangeData(changeData, tax_rate) {
    changeData.instock_money_no_tax = Big(changeData.money).div(
      Big(tax_rate || 0)
        .div(10000)
        .plus(1)
        .toFixed(2),
    )
    changeData.tax_money = Big(changeData.money)
      .times(Big(tax_rate || 0).div(10000))
      .div(
        Big(tax_rate || 0)
          .div(10000)
          .plus(1),
      )
      .toFixed(2)
  }
}

export default new Store()
