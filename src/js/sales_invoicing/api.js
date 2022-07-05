import { Request } from '@gm-common/request'
import Big from 'big.js'
import _ from 'lodash'
import moment from 'moment'

// 库存总览——拉取商品列表
const stockListGet = (data) =>
  Request('/stock/list')
    .data(data)
    .get()
    .then((json) => {
      const list = _.map(json.data, (list) => {
        return {
          ...list,
          remain: Big(list.remain).toFixed(2),
          avg_price: Big(list.avg_price).div(100).toFixed(2),
          material_stock: Big(list.material.amount || 0).toFixed(2),
          semi_stock: Big(list.semi.amount || 0).toFixed(2),
          product_stock: Big(list.product.amount || 0).toFixed(2),
          processing_amount: Big(list.processing_amount || 0).toFixed(2),
          frozen: Big(list.frozen).toFixed(2),
        }
      })
      return {
        list: list,
        pagination: json.pagination,
      }
    })

// 库存总览——拉取商品详情
const stockDetailGet = (id) =>
  Request('/stock/get')
    .data(id)
    .get()
    .then((json) => {
      let data = json.data || []
      const material = _.map(data.material, (val) => {
        return {
          ...val,
          amount: Big(val.amount).toFixed(2),
          avg_price: Big(val.avg_price).div(100).toFixed(2),
          life_time: val.life_time
            ? moment(val.life_time).format('YYYY-MM-DD')
            : '-',
        }
      })
      const semi = _.map(data.semi, (val) => {
        return {
          ...val,
          amount: Big(val.amount).toFixed(2),
          unit_price: Big(val.unit_price).div(100).toFixed(2),
          in_stock_time: moment(val.in_stock_time).format('YYYY-MM-DD'),
        }
      })
      const product = _.map(data.product, (val) => {
        return {
          ...val,
          amount: Big(val.amount).toFixed(2),
          unit_price: Big(val.unit_price).div(100).toFixed(2),
          in_stock_time: moment(val.in_stock_time).format('YYYY-MM-DD'),
        }
      })
      data = {
        ...data,
        avg_price: Big(data.avg_price).div(100).toFixed(2),
        remain: Big(data.remain).toFixed(2),
        processing_amount: Big(data.processing_amount || 0).toFixed(2),
        material,
        semi,
        product,
      }

      return data
    })

const completedTaskListGet = (data) =>
  Request('/process/task/completed')
    .data(data)
    .get()
    .then((json) => {
      let res = []
      if (json.data.technics && json.data.technics.length) {
        res = _.map(json.data.technics, (val) => ({
          ...val,
          finish_time: val.finish_time
            ? moment(val.finish_time).format('YYYY-MM-DD')
            : '-',
        }))
      }

      return res
    })

const skucategoriesGet = () => Request('/station/skucategories').data().get()

const semiProductListGet = (data) =>
  Request('/stock/in_stock_sheet/semi_product/list')
    .data(data)
    .get()
    .then((json) => {
      let res = []
      if (json.data.length) {
        res = _.map(json.data, (val) => ({
          ...val,
          amount: Big(val.amount).toFixed(2),
          unit_price: val.unit_price
            ? Big(val.unit_price).div(100).toFixed(2)
            : val.unit_price,
          in_stock_time: moment(val.in_stock_time).format('YYYY-MM-DD'),
        }))
      }

      return { list: res, pagination: json.pagination }
    })

const batchStockEdit = (data) =>
  Request('/stock/check/batch_edit').data(data).post()

// 加工单详情
const processOrderDetailsGet = (q) =>
  Request('/stock/process/process_order/simple_search/list')
    .data({
      q,
      wip_only: true,
    })
    .get()

// 货位获取
const shelfListGet = () => Request('/stock/shelf/get').code(4).get()

const createStockIn = (param) =>
  Request('/stock/in_stock_sheet/product/create').data(param).post()

const editStockIn = (param) =>
  Request('/stock/in_stock_sheet/product/submit').data(param).post()

const getStockIn = (param) =>
  Request('/stock/in_stock_sheet/product/get').data(param).get()

const searchSkus = (q) =>
  Request('/stock/in_stock_sku/product_sku/list').data(q).get()

const deleteSkuIn = (param) =>
  Request('/stock/in_stock_sheet/product/delete ').data(param).post()

const getRecvers = () =>
  Request('/gm_account/station/clean_food/user/search').data().get()

export {
  stockListGet,
  stockDetailGet,
  completedTaskListGet,
  skucategoriesGet,
  semiProductListGet,
  batchStockEdit,
  shelfListGet,
  createStockIn,
  getStockIn,
  processOrderDetailsGet,
  searchSkus,
  editStockIn,
  deleteSkuIn,
  getRecvers,
}
