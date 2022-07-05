// 处理数据问题
import _ from 'lodash'
import moment from 'moment'
import Big from 'big.js'

const price = (price) => {
  const result = Big(price || 0).toFixed(2)
  return result === '0.00' ? '' : result
}

/**
 * 相关字段
 *
 * number: 序号
 * category: 品类
 * sku_name: 商品名
 * spec: 规格
 * order_num: 下单数
 * real_num: 出库数
 * unit_price: 单价
 * real_price: 应付金额
 * remark: 备注
 */
const getTableColumnsData = (category_data, category_index) => {
  return _.map(category_data, (item, index) => {
    return {
      number: category_index + index, // 商品序号, 从上面往下增加
      category: item.category_title_1,
      sku_name: item.name,
      spec:
        item.std_unit_name_forsale === item.sale_unit_name &&
        item.sale_ratio === 1
          ? `按${item.sale_unit_name}`
          : `${item.sale_ratio}${item.std_unit_name_forsale}/${item.sale_unit_name}`,
      order_num: `${item.quantity}${item.sale_unit_name}` || '',
      real_num: `${item.real_weight}${item.std_unit_name_forsale}` || '',
      unit_price: price(item.std_sale_price_forsale),
      real_price: price(item.real_item_price),
      remark: item.remark,
    }
  })
}

const getBlockColumnsData = (category_data) => {
  return [
    {
      subtotal: '小计',
      sum: _.sum(_.map(category_data, (item) => item.real_item_price)).toFixed(
        2
      ),
    },
  ]
}

// 处理 详情block 数据
const getDetailBlcokData = (details) => {
  // 根据分类情况 -- 多个table
  const skuGroupByCategory1 = _.groupBy(details, 'category_title_1')
  const splitOrderList = Object.keys(skuGroupByCategory1)

  const total_table = []
  const total_sub_block = []
  let category_num = null
  // 记录不同品类表格起始序号
  let category_index = 1
  _.forEach(splitOrderList, (category_name, index) => {
    const category_data = skuGroupByCategory1[category_name]

    const table_data = {
      id: `${category_name}_table`,
      columns: getTableColumnsData(category_data, category_index),
    }
    const block_data = {
      id: `${category_name}_block`,
      columns: getBlockColumnsData(category_data),
    }

    category_num = {
      ...category_num,
      [category_name]: category_data.length,
    }
    total_table.push(table_data)
    total_sub_block.push(block_data)

    category_index += category_data.length
  })

  // 处理 分类表格 数据
  const category_table = {
    id: 'category_table',
    columns: [category_num],
  }
  total_table.push(category_table)

  // 添加其它数据（销售明细）
  const detail_block = {
    id: 'detail_block',
    columns: [{ sales_detail: '销售明细：' }],
  }
  total_sub_block.push(detail_block)

  return {
    table: total_table,
    block: total_sub_block,
  }
}

const getCommonData = (order, index) => {
  return {
    common: {
      title: '配送单',
      service_tel: '客服电话:                ',
      order_date: `下单日期: ${moment(order.date_time).format(
        'YYYY-MM-DD HH:mm:ss'
      )}`,
      delivery_date: `配送: ${moment(order.receive_begin_time).format(
        'MM-DD HH:mm'
      )} ～ ${moment(order.receive_end_time).format('MM-DD HH:mm')}`,
      export_date: `导出时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
      order_no: `订单编号: ${order.id}`,
      serial_number: `序号: ${index + 1}`,
      rec_merchant: `收货商户: ${order.resname}`,
      recever: `收货人: ${order.receiver_name}`,
      receiver_phone: `联系电话: ${order.receiver_phone}`,
      address: `地址: ${order.address}`,
      order_price: `下单金额: ${price(order.total_price)}`,
      out_stock_price: `出库金额: ${price(order.real_price)}`,
      freight: `运费: ${price(order.freight)}`,
      abnormal_price: `异常金额: ${price(
        Big(order.abnormal_money).plus(order.refund_money)
      )}`,
      sales_price: `销售额(含运税): ${price(order.total_pay)}`,
      out_stock_signature: '出库签字: ',
      delivery_signature: '配送签字: ',
      customer_signature: '客户签字: ',
    },
  }
}

export { getCommonData, getDetailBlcokData }
