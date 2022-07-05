import moment from 'moment'
import _ from 'lodash'

const today = moment()
const radioSelect = (dimension) => {
  const { selectedValue, list } = dimension
  const index = _.findIndex(list, (item) => item.value === selectedValue)
  return index
}

const getSearchData = (props) => {
  const { report } = props
  return {
    begin: moment(report.value_filter.begin).format('YYYY-MM-DD'),
    end: moment(report.value_filter.end).format('YYYY-MM-DD'),
    category_id_1: report.select_filter.category1_ids.length
      ? JSON.stringify(_.map(report.select_filter.category1_ids, (v) => v.id))
      : null,
    category_id_2: report.select_filter.category2_ids.length
      ? JSON.stringify(_.map(report.select_filter.category2_ids, (v) => v.id))
      : null,
    text: report.search_text || null,
    // view_type: radioSelect(report.filter_pop_dimension) + 1,  // 这个参数在report下都没有用到了
  }
}

function dateRangeMax(begin) {
  const days60 = moment(begin).add(60, 'd')
  return days60.isAfter(today) ? today : days60
}

function dateRangeMin(begin) {
  return moment(begin).subtract(60, 'd')
}

const filterByPrivilege = (filterList, selectedBoxs) => {
  return _.map(filterList, (item) => {
    if (selectedBoxs.has(item.value)) {
      return Object.assign({}, item, { checked: true })
    } else {
      return item
    }
  })
}

const getSelectedColumns = (data) => {
  const showItems = new Set()
  _.forEach(data[0].list, (field) => {
    if (field.checked && field.display) {
      showItems.add(field.value)
    }
  })
  return showItems
}

export {
  radioSelect,
  getSearchData,
  dateRangeMax,
  dateRangeMin,
  filterByPrivilege,
  getSelectedColumns,
}
