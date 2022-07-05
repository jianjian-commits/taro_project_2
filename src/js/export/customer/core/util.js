import _ from 'lodash'
import Big from 'big.js'
import { DEFAULT_HEIGHT, MULTI_SUFFIX } from './enum'
import { alignment, alignmentRight, alignmentLeft } from '../../enum'

export const mmToPx = (mm) => {
  const m = parseInt(mm, 10) || 210
  return parseInt((m / 25.4) * 96, 10)
}

const price = (n, f = 2) => Big(n || 0).toFixed(f)

export const template = (text, data, pre = {}) => {
  // 做好保护，出错就返回 text
  try {
    return _.template(text, {
      interpolate: /{{([\s\S]+?)}}/g,
    })({
      ...data.common,
      ...pre,
      price: price,
    })
  } catch (err) {
    console.warn(err)
    return text
  }
}

// 解析采购模板的明细数据
export const templateSpecialDetails = (text, detail) => {
  // 做好保护，出错就返回 text
  try {
    const compiled = _.template(text, { interpolate: /{{([\s\S]+?)}}/g })
    return detail.reduce((d, i) => d + compiled(i), '')
  } catch (err) {
    console.warn(err)
    return text
  }
}

const getTop = (o) => parseInt(o.style.top) || 0
const getLeft = (o) => parseInt(o.style.left) || 0

export const getAlignment = (o) => {
  switch (o.style.textAlign) {
    case 'center':
      return { alignment }
    case 'right':
      return { alignmentRight }
    case 'left':
      return { alignmentLeft }
    default:
      return {}
  }
}
export const isAll = (o) => o.style.left === o.style.right

export const filterBlockAndGroupBy = (temp) => {
  // 修正数据
  // DEFAULT_HEIGHT 18px
  const blocks = _.groupBy(
    _.filter(_.sortBy(temp.blocks, [(o) => getTop(o)]), (item) => {
      return !item.type
    }),
    (item) => parseInt(getTop(item) / DEFAULT_HEIGHT),
  )

  return _.map(blocks, (value, key) => {
    return _.sortBy(value, [(o) => getLeft(o)])
  })
}

export const isMultiTable = (dataKey = '') => dataKey.includes('multi')

// 获取table有多少栏,最少是双栏
export const getMultiNumber = (dataKey) => {
  const reg = /multi(\d)?/
  const result = reg.exec(dataKey)
  return Number(result[1]) || 2
}

export const getTableColumns = (content) => {
  const tempColumns = content.columns

  if (isMultiTable(content.dataKey)) {
    let res = tempColumns
    const colNumber = getMultiNumber(content.dataKey)
    for (let i = 2; i <= colNumber; i++) {
      const colNum = i > 2 ? i : '' // 栏数
      const columnsI = tempColumns.map((val, index) => {
        return {
          ...val,
          index,
          text: val.text.replace(
            /{{(price\()?列\.([^{{]+)}}/g,
            // (s, s1) => `{{列.${s1}${MULTI_SUFFIX}${colNum}}}`,
            (s, s1, s2) => {
              if (s1) {
                // 有price函数插进来， 匹配‘ _基本单位 ’类似的字符串并添加后缀，生成三栏或者双栏数据
                const _s = s.replace(
                  /_[\u4e00-\u9fa5]*/g,
                  (match) => `${match}${MULTI_SUFFIX}${colNum}`,
                )
                return _s
              } else {
                return `{{列.${s2}${MULTI_SUFFIX}${colNum}}}`
              }
            },
          ), // {{列.xx}} => {{列.xxMULTI_SUFFIXi}}
        }
      })
      res = res.concat(columnsI)
    }
    return res
  }

  return tempColumns
}

export const getTableData = (columns, list, allData) => {
  return _.map(list, (d, j) => {
    const data = {}
    _.each(columns, (column, index) => {
      // 采购模板的明细数据需要特殊处理
      data[`column_${index}`] = column.isSpecialColumn
        ? templateSpecialDetails(column.text, d?.__details)
        : template(column.text, allData, {
            列: d,
          })
    })
    return data
  })
}

export const getSubtotal = (list, field = 'real_item_price') => {
  return _.reduce(
    list,
    (a, b) => {
      let result = a

      const _origin = b._origin || {}
      const _origin2 = b['_origin' + MULTI_SUFFIX] || {}

      result = a.plus(_origin[field] || 0)
      if (_origin2[field]) {
        result = result.plus(_origin2[field])
      }
      return result
    },
    Big(0),
  ).toFixed(2)
}

export const getEmptyRows = (time) => {
  if (time <= 0) return []
  return _.map(_.times(time), (v) => ({ style: {}, text: '' }))
}

export const pseudoTableDataGroupBy = (list) => {
  const data = []
  let group = 0
  _.each(list, (v) => {
    if (v._special) {
      data[group + 1] = { ...v }
      group += 2
    } else {
      if (!data[group]) {
        data[group] = []
      }
      data[group].push({ ...v })
    }
  })
  return data
}

export const removeNbsp = (str) => {
  return str.replace(/&nbsp;/g, ' ')
}

export const sumCol = (colText, dataList) => {
  const match = /(?<=\.).+?(?=}})/.exec(colText)
  if (!match) return ''
  const key = match[0]

  let result
  try {
    result = dataList
      .reduce((acc, item) => {
        acc = acc.plus(item[key] || 0)
        return acc
      }, Big(0))
      .toFixed(2)
  } catch (e) {
    result = ''
  }
  return result
}
