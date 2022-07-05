import _ from 'lodash'
import {
  filterBlockAndGroupBy,
  getAlignment,
  template,
  templateSpecialDetails,
  getTableColumns,
  getTableData,
  getSubtotal,
  pseudoTableDataGroupBy,
  removeNbsp,
  sumCol,
  isMultiTable,
} from './util'
import { getTableConfig, getEmpty, getBlockConfig } from './config'
import { coverDigit2Uppercase } from '../../../printer/order_printer/config/data_to_key/util'
import { border } from '../../enum'

export const paintRow = (row, index, data, opts, v, purchaseText) => {
  const rowData = []
  const rowConfig = []
  if (row.length === 1) {
    const id = `${opts.target}_${index}_0`
    const cell = row[0]
    const column = { key: id }
    if (cell.size) column.size = cell.size
    const config = {
      columns: [column],
      layout: 'all',
      style: {
        border,
        font: {
          bold: !!cell.style.fontWeight,
          size: parseInt(cell.style.fontSize, 10) > 16 ? 16 : 11,
        },
        ...getAlignment(cell),
      },
    }

    // key => value
    const dataKey = {}
    dataKey[id] =
      v?._special?.type === 'separator' || v?._special?.type === 'flex'
        ? templateSpecialDetails(purchaseText, v._special.list)
        : template(cell.text, data)
    rowData.push(dataKey)
    rowConfig.push(config)
  } else {
    const config = {
      columns: [],
      layout: 'average',
    }
    const dataKey = {}
    _.each(row, (cell, i) => {
      const id = `${opts.target}_${index}_${i}`
      const column = { key: id }
      if (cell.size) column.size = cell.size
      config.columns.push(column)
      dataKey[id] = template(cell.text, data)
    })
    rowConfig.push(config)
    rowData.push(dataKey)
  }

  return { rowData, rowConfig }
}

export const paintBlock = (temp, data, opts) => {
  const config = getBlockConfig(opts.target)

  const sheetData = {
    type: 'block',
    id: opts.target,
    columns: [],
  }

  const blocks = filterBlockAndGroupBy(temp)
  _.each(blocks, (item, index) => {
    const { rowData, rowConfig } = paintRow(item, index, data, opts)
    config.block.rows = config.block.rows.concat(rowConfig)
    sheetData.columns = sheetData.columns.concat(rowData)
  })

  if (!blocks.length) {
    return null
  }

  return { config, sheetData }
}

// 汇总
export const paintTotalBase = (row, opts, v, purchaseText) => {
  const config = getBlockConfig(opts.target)
  const sheetData = {
    id: opts.target,
    columns: [],
  }

  const { rowData, rowConfig } = paintRow([row], 0, {}, opts, v, purchaseText)
  config.customer = true
  delete rowConfig[0].layout
  config.block.rows = config.block.rows.concat(rowConfig)
  sheetData.columns = sheetData.columns.concat(rowData)
  return { config, sheetData }
}

export const paintSubtotal = (tempColumns, desc, opts, v, purchaseText) => {
  return paintTotalBase(
    {
      style: {},
      text: desc,
      size: [1, tempColumns.length],
    },
    {
      ...opts,
      target: `${opts.target}_subtotal`,
    },
    v,
    purchaseText,
  )
}

export const paintTableStatistics = (temp, tempColumns, list, opts) => {
  const needUpperCase = temp.subtotal?.needUpperCase
  const pageSummaryShow = temp.summaryConfig?.pageSummaryShow
  const price = getSubtotal(list)
  const upperStr = needUpperCase ? `大写：${coverDigit2Uppercase(price)}` : ''
  const text = `每页合计：${price} ${upperStr}`
  const sub = temp.subtotal?.show
    ? paintSubtotal(tempColumns, text, opts)
    : null
  const config = [sub?.config]
  const sheetData = [sub?.sheetData]
  if (pageSummaryShow && !isMultiTable(temp?.dataKey)) {
    const summaryColumns = temp.summaryConfig?.summaryColumns || []
    const id = opts.target + '_page_summary'
    const cfg = getTableConfig(id)
    const ds = {}
    _.each(tempColumns, (column, index) => {
      cfg.columns.push({
        key: `column_${index}`,
        header: column.head,
      })
      ds[`column_${index}`] = summaryColumns.includes(column.text)
        ? sumCol(column.text, list)
        : ''
      if (!index) ds[`column_${index}`] = '合计'
    })
    cfg.disabledHeaderRow = true
    config.push(cfg)
    sheetData.push({ id, columns: [ds] })
  }
  return {
    config: [...config, getEmpty()].filter((_) => _),
    sheetData: sheetData.filter((_) => _),
  }
}

export const paintTable = (content, data, opts) => {
  const list = data._table[content.dataKey] || data._table.orders
  const config = getTableConfig(opts.target)
  const tempColumns = getTableColumns(content)
  if (!list.length) return null
  config.columns = _.map(tempColumns, (column, index) => ({
    key: `column_${index}`,
    header: column.head,
  }))

  const ds = getTableData(tempColumns, list, data)
  const statistics = paintTableStatistics(content, tempColumns, list, opts)

  return {
    config: [config, ...statistics.config],
    sheetData: [
      {
        id: opts.target,
        columns: ds,
      },
      ...statistics.sheetData,
    ],
  }
}

export const paintPseudoTable = (temp, data, opts) => {
  const list = data._table[temp.dataKey] || data._table.orders
  const pseudoList = pseudoTableDataGroupBy(list)
  const tempColumns = getTableColumns(temp)
  const config = []
  const sheetData = []
  _.each(pseudoList, (v, index) => {
    const id = `${opts.target}_pseudo_${index}`
    if (_.isArray(v)) {
      const cfg = getTableConfig(id)
      cfg.columns = _.map(tempColumns, (column, index) => ({
        key: `column_${index}`,
        header: column.head,
      }))
      if (index) cfg.disabledHeaderRow = true
      const ds = getTableData(tempColumns, v, data)
      config.push(cfg)
      sheetData.push({ id, columns: ds })
    } else if (v?._special) {
      const needUpperCase = temp.specialConfig?.needUpperCase
      const text = needUpperCase ? v._special?.upperCaseText : v._special?.text
      const sub = paintSubtotal(
        tempColumns,
        removeNbsp(text || ''),
        {
          ...opts,
          target: `${id}_special`,
        },
        v,
        temp.specialConfig?.template_text, // 采购明细的字段
      )
      config.push(sub.config)
      sheetData.push(sub.sheetData)
    }
  })

  if (!list.length || !config.length) return null
  const statistics = paintTableStatistics(temp, tempColumns, list, opts)
  config.push(...statistics.config)
  sheetData.push(...statistics.sheetData)
  return { config, sheetData }
}

export const paintCounter = (temp, data, id) => {
  const value = temp.value || ['len']
  const isWithLen = _.includes(value, 'len')
  const isWithTotal = _.includes(value, 'subtotal')
  const config = {
    ...getTableConfig(id),
    columns: [
      {
        key: 'type_name',
        header: '类别',
      },
    ],
  }
  const sheetData = {
    id,
    columns: [],
  }

  const counter = data._counter
  const lenData = { type_name: '商品数' }
  const totalData = { type_name: '小计' }

  _.each(counter, (v, index) => {
    const _id = `counter_${index}`
    config.columns.push({
      header: v.text,
      key: _id,
    })
    lenData[_id] = v.len
    totalData[_id] = v.subtotal
  })

  isWithLen && sheetData.columns.push(lenData)
  isWithTotal && sheetData.columns.push(totalData)

  return {
    config: [config, getEmpty()],
    sheetData,
  }
}
