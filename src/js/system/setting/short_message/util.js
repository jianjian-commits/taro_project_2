import _ from 'lodash'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'

const exportExcel = (exportOptions, responseArray, fileName) => {
  const exportData = _.map(responseArray, (row) => {
    const newRow = {}
    _.forEach(exportOptions, (newField, field) => {
      if (_.isFunction(newField)) {
        const fn = newField
        const [key, val] = fn({
          row,
          value: row[field],
          field,
        })
        newRow[key] = val
        return
      }
      newRow[newField] = row[field]
    })
    return newRow
  })

  requireGmXlsx((res) => {
    const { jsonToSheet } = res
    jsonToSheet([exportData], { fileName })
  })
}

export { exportExcel }
