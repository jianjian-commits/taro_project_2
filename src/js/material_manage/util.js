import _ from 'lodash'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { Price } from '@gmfe/react'
import Big from 'big.js'
function emptyRender(v, cb) {
  if (isEmpty(v)) {
    return '-'
  }
  return cb ? cb(v) : v
}
function isEmpty(v) {
  return _.isNil(v) || String(v).trim() === ''
}
const getSheetData = (sheetArray, sheetOptions, extra) => {
  return _.map(sheetArray, (row) => {
    let newRow = {}
    _.forEach(sheetOptions, (newField, field) => {
      if (_.isFunction(newField)) {
        let fn = newField
        let [key, val] = fn({
          row,
          value: row[field],
          field,
          extra,
        })
        newRow[key] = val
        return
      }
      newRow[newField] = row[field]
    })
    return newRow
  })
}
// dataArray 是二维数组
const exportExcel = (exportObj, dataArray, extra) => {
  let { options, fileName, sheetNames = ['Sheet1'] } = exportObj
  let exportSheets = []

  if (!_.isArray(options)) {
    options = [options]
  }

  _.forEach(options, (sheetOptions, i) => {
    let sheetArray = dataArray[i]
    exportSheets.push(getSheetData(sheetArray, sheetOptions, extra))
  })

  requireGmXlsx((res) => {
    const { jsonToSheet } = res
    jsonToSheet(exportSheets, { fileName, SheetNames: sheetNames })
  })
}
const formatPrice = (value) => {
  return Big(value).toFixed(2) + Price.getUnit()
}

const joinKey = (...args) => {
  return args.join('_')
}
export { formatDate, formatDateTime } from '../common/util'
export { emptyRender, isEmpty, exportExcel, formatPrice, joinKey }
