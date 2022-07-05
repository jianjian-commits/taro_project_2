import { observable, action, computed, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import Big from 'big.js'
import moment from 'moment'
import {
  isValid,
  getStockOutListAdapter,
  getOutStockConfirmData,
  createDetailId,
} from '../util'
import { convertNumber2Sid } from 'common/filter'
import global from 'stores/global'
import { resNameSortByFirstWord } from 'common/util'

const initOutStockListItem = {
  // 辅助数据
  isNeedReselectBatch: false, // 是否需要重新选择批次（当已选批次时出库数变化则需要）
  batchSelected: [],
  batchSelectedOutStockNum: new Map(),
  clean_food: null,
  out_of_stock: null,
  // 提交数据
  quantity: null,
  real_std_count: null,
  name: null,
  id: null,
  spu_id: null,
  is_anomaly: null,
  sale_ratio: null,
  std_ratio: null,
  std_unit_name: null,
  category: null,
  sale_unit_name: null,
  batch_details: [],
  tax_rate: null,
  tax_money: null,
  out_stock_money_no_tax: null,
  addresses: [],
}

const initOutStockDetail = {
  is_bind_order: null,
  status: null,
  id: null,
  out_stock_target: null,
  out_stock_time: new Date(),
  creator: null,
  create_time: null,
  details: [], // 已抽出为outStockList
  update_time: null,
  money: null,
  out_stock_remark: '', // 单据备注
  out_stock_target_type: 1, // 商户信息类型 1 商户列表｜ 2 自定义商户
  out_stock_customer: null, // 选择的出库商户对象
}

const initBatchFilter = {
  q: '',
  sku_id: null,
  clean_food: null,
  detail_id: null,
}

class Store {
  // 当前是否详情页面
  @observable isAddPage = true

  @observable outStockDetail = { ...initOutStockDetail }

  @observable outStockList = [{ ...initOutStockListItem }]
  // @observable outStockList = _.times(30, () => {
  //   return { ...initOutStockListItem }
  // })

  @observable batchFilter = { ...initBatchFilter }

  // 批次列表信息
  @observable batchList = []

  // 选中的批次
  @observable currentBatchSelected = []

  // 批次中的出库数
  @observable currentBatchSelectedOutStockNumMap = new Map()

  // 出库对象商户列表
  @observable outStockTargetList = []

  // 对应sku_id的批次操作信息
  // @observable skuOperatedBatchMap = new Map()

  // 选中的批次出库数汇总
  @computed
  get totalSelectedNum() {
    let total = 0

    this.currentBatchSelectedOutStockNumMap.forEach((v, k) => {
      if (this.currentBatchSelected.includes(k)) {
        total = Big(v || 0).plus(total || 0)
      }
    })
    return total
  }

  @computed
  get unAssignedNum() {
    let result = this.totalSelectedNum

    // 待出库总数减去已选总数, 多sku以detail_id来区分sku
    _.each(this.outStockList, (v) => {
      // 当前sku
      if (
        v.id === this.batchFilter.sku_id &&
        v.detail_id &&
        v.detail_id === this.batchFilter.detail_id
      ) {
        const { real_std_count } = v
        const std_num = parseFloat(Big(real_std_count || 0).toFixed(2))

        const sale_num = Big(v.quantity).toFixed(2) // 加工菜出库数（净菜）

        // 净菜销售单位，毛菜基本单位
        result = Big(v.clean_food ? sale_num : std_num)
          .minus(this.totalSelectedNum)
          .toFixed(2)
      }
    })

    return result
  }

  @action
  initCurrentStatus = () => {
    this.isAddPage = false
  }

  @action
  fetchOutStockTargetList = (search_text) => {
    return Request('/station/order/customer/search')
      .data({ search_text, limit: 1000 })
      .get()
      .then(({ data }) => {
        const { list } = data
        this.outStockTargetList = resNameSortByFirstWord(
          list.map((item) => ({
            ...item,
            value: item.address_id,
            text: `${item.resname}(${convertNumber2Sid(item.address_id)}/${
              item.username
            })`,
          })),
        )
      })
  }

  @action
  initBatchFilterData(data) {
    Object.assign(this.batchFilter, { ...data })
  }

  @action.bound
  clearBatchList() {
    this.batchList = []
    this.currentBatchSelected = []
    this.currentBatchSelectedOutStockNumMap = new Map()
  }

  @action
  clearTableBatchSelected(index) {
    this.changeOutStockListDetail(index, 'batchSelected', [])
    this.changeOutStockListDetail(index, 'batchSelectedOutStockNum', new Map())
    this.changeOutStockListDetail(index, 'batch_details', [])
  }

  @action
  changeOutStockListDetail(index, field, value) {
    this.outStockList[index][field] = value
  }

  @action
  changeProductNameSelected(index, selected) {
    let changeData = {}

    if (selected) {
      const {
        name,
        value,
        category,
        sale_unit_name,
        spu_id,
        std_unit_name,
        sale_ratio,
        std_ratio,
        clean_food,
        tax_rate,
        addresses,
      } = selected

      const real_std_count = Big(this.outStockList[index].quantity || 0)
        .mul(sale_ratio)
        .mul(std_ratio)
        .toFixed(2) // 联动出库数销售单位

      changeData = {
        name,
        id: value,
        category,
        sale_unit_name,
        spu_id,
        std_unit_name,
        sale_ratio,
        std_ratio,
        real_std_count,
        clean_food,
        tax_rate,
        addresses,
        detail_id: createDetailId(value, index),
      }
    } else {
      changeData = {
        name: null,
        id: null,
        category: null,
        sale_unit_name: null,
        spu_id: null,
        std_unit_name: null,
        sale_ratio: null,
        std_ratio: null,
        real_std_count: null, // 清空商品时也需要清空基本单位的值
        clean_food: null,
        tax_rate: null,
        addresses: [],
        detail_id: null,
      }
    }

    Object.assign(this.outStockList[index], {
      ...changeData,
    })
  }

  @action
  changeDetail(name, value) {
    this.outStockDetail[name] = value
  }

  @action
  checkDetailData = (data) => {
    const { address_id } = data
    const list = this.outStockList.filter(
      (item) => item.id && !item.addresses.includes(address_id),
    )
    for (const item of list) {
      this.outStockList.remove(item)
    }
    if (!this.outStockList.length) {
      this.outStockList = [{ ...initOutStockListItem }]
    }
  }

  @action
  changeBatchFilter(field, value) {
    this.batchFilter[field] = value
  }

  @action
  changeBatchSelected(selected) {
    this.currentBatchSelected = selected
  }

  @action
  changeBatchSelectAll(selectAll) {
    this.currentBatchSelected = selectAll
      ? _.map(this.batchList, (v) => v.batch_number)
      : []
  }

  // 改变批次出库数数
  @action
  changeBatchOutStockNum(batchNumber, value) {
    this.currentBatchSelectedOutStockNumMap.set(batchNumber, value)
  }

  @action
  saveOperatedBatchData(index) {
    const { currentBatchSelected, currentBatchSelectedOutStockNumMap } = this
    const batchSelectedOutStockNum = new Map()
    const batchSelected = []

    _.forEach(currentBatchSelected, (v) => {
      // 未填写出库数及0不做记录
      if (currentBatchSelectedOutStockNumMap.get(v)) {
        batchSelected.push(v)
        batchSelectedOutStockNum.set(
          v,
          currentBatchSelectedOutStockNumMap.get(v),
        )
      }
    })

    // 净菜商品出库数（out_stock_base）为销售单位,其他为基本单位，值由后台做换算
    let rr = null
    const selectedObject = {
      batchSelected,
      batchSelectedOutStockNum,
      batch_details: _.map(batchSelected, (v) => {
        this.outStockList.forEach((it) => {
          const r = it.batch_details.find((it_) => it_.batch_number === v)
          if (r) rr = r
        })

        return {
          batch_number: v,
          out_stock_base: batchSelectedOutStockNum.get(v),
          remain: rr?.remain,
          status: rr?.status ?? 2,
        }
      }),
    }

    Object.assign(this.outStockList[index], {
      ...selectedObject,
    })

    return Promise.resolve()
  }

  // 设置弹窗的已操作信息
  @action
  setSelectedData(index) {
    // 若已选择批次并填写数据则恢复
    if (this.outStockList[index].batchSelected.length > 0) {
      // 需要过滤掉get_batch_out中没有的批次（保存草稿）
      const batchList = _.map(this.batchList, (v) => v.batch_number)
      this.currentBatchSelected = _.remove(
        this.outStockList[index].batchSelected,
        (v) => batchList.includes(v),
      )
      this.currentBatchSelectedOutStockNumMap = new Map(
        this.outStockList[index].batchSelectedOutStockNum,
      ) // 需要构造新的map
    } else {
      this.currentBatchSelected = []
      this.currentBatchSelectedOutStockNumMap = new Map()
    }
  }

  @action
  addOutStockListItem() {
    this.outStockList.push({ ...initOutStockListItem })
  }

  @action
  deleteOutStockListItem(index) {
    this.outStockList.remove(this.outStockList[index])
  }

  getAllSelectedBatch() {
    const total = []
    _.each(this.outStockList, (v) => {
      _.each(v.batchSelected, (selected) => {
        total.push({
          batchNumber: selected,
          outStockNum: v.batchSelectedOutStockNum.get(selected),
          sku_id: v.id,
          detail_id: v.detail_id,
        })
      })
    })

    return total
  }

  // 显示的库存减去已选择的相同spu（spu对应批次号）下不同sku的出库数
  @action
  calculateQuantityBySelected(data) {
    const result = data
    const { detail_id } = this.batchFilter
    const allSelectedBatch = this.getAllSelectedBatch()

    _.each(data, (v, index) => {
      _.each(allSelectedBatch, (selected) => {
        if (
          v.batch_number === selected.batchNumber &&
          detail_id !== selected.detail_id
        ) {
          result[index].remain = +Big(v.remain)
            .sub(selected.outStockNum)
            .toFixed(2)
        }
      })
    })

    return result
  }

  filterSkuList = (index, data) => {
    const list = []
    const skuList = data
    const { outStockList } = this

    // 获取除当前index的id集
    const listIds = []
    _.each(outStockList, (item, i) => {
      if (i !== index) {
        listIds.push(item.id)
      }
    })

    // 过滤在id集中的数据，达到过滤掉已存在sku_id的数据(过滤已选择的sku,避免选择同一个sku)的效果
    _.each(skuList, (skuData) => {
      const skuForGroup = []
      _.each(skuData.skus, (item) => {
        if (!listIds.includes(item.sku_id)) {
          skuForGroup.push({
            name: item.sku_name,
            value: item.sku_id,
            category: item.category_id_2_name,
            sale_price: item.sale_price,
            sale_unit_name: item.sale_unit_name,
            spu_id: item.spu_id,
            std_unit_name: item.std_unit_name,
            sale_ratio: item.sale_ratio,
            std_ratio: item.std_ratio,
            text: item.sku_name,
            clean_food: item.clean_food,
            tax_rate: skuData.tax_rate,
            addresses: item.addresses,
          })
        }
      })

      // 如果sku不在listIds中，则添加
      if (skuForGroup.length > 0) {
        list.push({
          label: skuData.category_name,
          children: skuForGroup,
        })
      }
    })

    return list
  }

  @action
  setAnomalyError = (data) => {
    const outStock = this.outStockList
    _.forEach(outStock, (item) => {
      if (_.includes(data, item.id)) {
        item.is_anomaly = true
        // 清空批次信息
        item.batch_details = []
        item.batchSelected = []
        item.batchSelectedOutStockNum = new Map()
      }
    })

    this.outStockList = outStock
  }

  getValidStockOutListData = () => {
    const result = []
    _.each(this.outStockList, (item) => {
      if (item.id || isValid(item.quantity)) {
        // 清除辅助数据
        const data = _.omit(item, [
          'isNeedReselectBatch',
          'batchSelected',
          'batchSelectedOutStockNum',
          'addresses',
          'detail_id',
        ])

        result.push({
          ...data,
        })
      }
    })

    return result
  }

  @action
  getOutStockPostData(submitType) {
    const {
      out_stock_time,
      out_stock_customer,
      out_stock_target_type,
      out_stock_target,
      id,
      ...rest
    } = this.outStockDetail
    const option =
      out_stock_target_type === 1
        ? { out_stock_customer_id: out_stock_customer.value }
        : { out_stock_target }

    return {
      ...option,
      ...rest,
      id: id.trim(),
      out_stock_time: moment(out_stock_time).format('YYYY-MM-DD HH:mm:ss'),
      is_submit: submitType,
      details: JSON.stringify(this.getValidStockOutListData()),
    }
  }

  @action
  getConfirmOutStockData(stock_method) {
    return {
      id: this.outStockDetail.id.trim(),
      details: JSON.stringify(
        getOutStockConfirmData(this.getValidStockOutListData(), stock_method),
      ),
    }
  }

  @action
  fetchOutStockList(id) {
    return Request('/stock/out_stock_sheet/detail')
      .data({ id })
      .get()
      .then((json) => {
        runInAction(() => {
          const {
            out_stock_customer_id,
            out_stock_time,
            out_stock_target,
            ...rest
          } = json.data
          this.outStockDetail = {
            ...rest,
            out_stock_time:
              out_stock_time === '-' ? new Date() : new Date(out_stock_time),
            out_stock_target_type: out_stock_customer_id ? 1 : 2,
            out_stock_target,
            out_stock_customer: {
              value: out_stock_customer_id,
              text: out_stock_target,
            },
          }

          // 构造一个id
          if (json.data.details.length > 0) {
            this.outStockList = _.map(
              getStockOutListAdapter(json.data.details),
              (v, index) => {
                return Object.assign({}, { ...initOutStockListItem }, { ...v })
              },
            )
          } else {
            this.outStockList = [{ ...initOutStockListItem }]
          }
        })
        return json
      })
  }

  @action
  fetchSkuList(index, name) {
    const option = { name }
    if (this.outStockDetail.out_stock_target_type === 1) {
      option.out_stock_customer_id = this.outStockDetail.out_stock_customer.value
    }
    return Request('/stock/search_sale_sku')
      .data(option)
      .get()
      .then((json) => {
        return this.filterSkuList(index, json.data)
      })
  }

  @action
  fetchBatchList() {
    const { detail_id } = this.batchFilter
    // 清除区分多sku的辅助数据
    const req = _.omit(this.batchFilter, ['detail_id'])

    return Request('/stock/get_batch_out')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.batchList = this.calculateQuantityBySelected(
            _.map(json.data, (item) => {
              return { ...item, detail_id } // 加上detail_id
            }),
          )
        })
      })
  }

  @action
  deleteReceipt(id) {
    return Request('/stock/out_stock_sheet/cancel').data({ id }).post()
  }

  @action.bound
  createOutStock(is_submit) {
    const postData = this.getOutStockPostData(is_submit)
    return Request('/stock/out_stock_sheet/create').data(postData).post()
  }

  @action
  confirmOutStock(stock_method) {
    const postData = this.getConfirmOutStockData(stock_method)

    return Request('/stock/out_stock_sheet/negative_stock_remind_single')
      .data(postData)
      .post()
  }

  @action
  postOutStockList(submitType, type = 'modify') {
    const postData = this.getOutStockPostData(submitType)
    return Request(`/stock/out_stock_sheet/${type}`)
      .data(postData)
      .code(-1)
      .post()
  }

  @action
  autoFetchBatchList = _.debounce((index) => {
    if (!global.otherInfo.autoSelectBatch) return // 如果不允许自动推荐
    const {
      id,
      clean_food,
      quantity,
      sale_ratio,
      std_ratio,
    } = this.outStockList[index]
    // 如果没填完，就不推荐
    if (_.isNil(id) || _.isNil(quantity)) return
    this.batchFilter.clean_food = +clean_food
    this.batchFilter.sku_id = id
    this.batchFilter.detail_id = createDetailId(id, index)

    this.fetchBatchList().then(() => {
      let sum = this.batchList.reduce((prev, curr) => {
        return +Big(prev?.remain ?? prev).plus(curr.remain)
      }, 0)
      const std_num = +Big(quantity).mul(sale_ratio).mul(std_ratio)
      const sale_num = +quantity
      const countNum = clean_food ? sale_num : std_num
      if (sum < countNum) {
        // 如果当前所有批次的数量和小于下单数，则不进行自动推荐
        return
      }
      sum = 0
      let batches = []
      this.batchList.forEach((item) => {
        if (Big(item.remain).plus(sum).lte(countNum)) {
          sum = +Big(item.remain).plus(sum)
          batches.push({ batch_number: item.batch_number, count: item.remain })
        } else {
          const count = +Big(countNum).minus(sum)
          sum = countNum
          batches.push({ batch_number: item.batch_number, count })
        }
      })
      batches = batches.filter((item) => item.count)
      const obj = {
        batchSelected: batches.map((item) => item.batch_number),
        batchSelectedOutStockNum: new Map(
          batches.map((item) => [item.batch_number, item.count]),
        ),
        batch_details: batches.map((item) => ({
          batch_number: item.batch_number,
          out_stock_base: item.count,
        })),
      }
      Object.assign(this.outStockList[index], obj)
    })
  }, 500)
}

export default new Store()
