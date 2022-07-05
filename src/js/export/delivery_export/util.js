// 处理订单对应模板配置
import _ from 'lodash'

import { table_config, delivery_config } from './config/template_config'

const getOrderCategory = (details) => {
  const skuGroupByCategory1 = _.groupBy(details, 'category_title_1')
  const splitOrderList = Object.keys(skuGroupByCategory1)
  return splitOrderList
}

const getCategoryTableColumns = (details) => {
  const splitOrderList = getOrderCategory(details)
  return _.map(splitOrderList, (category) => {
    return {
      key: category,
      header: category,
    }
  })
}

const getCategoryDetailBlock = (details) => {
  const splitOrderList = getOrderCategory(details)
  const detail_block = []
  _.forEach(splitOrderList, (name, index) => {
    const table_id = `${name}_table`
    const block_id = `${name}_block`

    // 第二个表格起 不用展示表头
    const detail_table = {
      ...table_config.table,
      id: table_id,
      disabledHeaderRow: index > 0,
    }
    const detail_sub_block = {
      ...table_config.block,
      id: block_id,
    }

    detail_block.push(detail_table)
    detail_block.push(detail_sub_block)
  })

  return detail_block
}

const getCategoryConfig = (order) => {
  // 处理 分类表格
  let order_config = { ...delivery_config }
  const { details } = order

  const category_columns = getCategoryTableColumns(details)
  // 模板固定, category_columns肯定在content第2个位置
  const content = [...order_config.content]
  content[1] = {
    ...content[1],
    columns: category_columns,
  }
  order_config = {
    ...order_config,
    content,
  }

  //  category_details直接从content后面插入即可
  const category_details = getCategoryDetailBlock(details)
  order_config = {
    ...order_config,
    content: order_config.content.concat(category_details),
  }

  return order_config
}

export { getCategoryTableColumns, getCategoryDetailBlock, getCategoryConfig }
