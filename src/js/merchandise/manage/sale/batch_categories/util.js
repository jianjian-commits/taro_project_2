import { i18next } from 'gm-i18n'
import _ from 'lodash'

const flattenAndUniq = (arr) => _.uniq(_.flatten(arr))

// 一级分类被checked
const getChildIdList_1 = (data) => {
  const ret_2 = []
  const ret_3 = []
  const ret_4 = []
  _.each(data.chtree, (v) => {
    ret_2.push(v.id)
    _.each(v.chtree, (val) => {
      ret_3.push(val.id)
      _.each(val.chtree, (value) => {
        ret_4.push(value.id)
      })
    })
  })
  return {
    ret_2,
    ret_3,
    ret_4,
  }
}
// 二级分类被checked
const getChildIdList_2 = (data) => {
  const ret_3 = []
  const ret_4 = []
  _.each(data.chtree, (v) => {
    ret_3.push(v.id)
    _.each(v.chtree, (val) => {
      ret_4.push(val.id)
    })
  })
  return {
    ret_3,
    ret_4,
  }
}
// 三级分类被checked
const getChildIdList_3 = (data) => {
  const ret = []
  _.each(data.chtree, (v) => {
    ret.push(v.id)
  })
  return ret
}

const findChtreeAll = (list, id) => {
  let obj = {}
  _.forEach(list, (v) => {
    if (v.id === id) {
      obj = v
      return false
    }
    if (v.chtree) {
      _.forEach(v.chtree, (val) => {
        if (val.id === id) {
          obj = val
          return false
        }
        if (val.chtree) {
          _.forEach(val.chtree, (value) => {
            if (value.id === id) {
              obj = value
              return false
            }
          })
        }
      })
    }
  })
  return obj.chtree || []
}

const isAllInSelectedList = (list, selectedList) => {
  const length = list.length
  let num = 0
  _.each(list, (v) => {
    if (_.includes(selectedList, v.id)) {
      num = num + 1
    }
  })
  return length === num
}

const emptyTip = (index) => {
  if (+index === 2) {
    return i18next.t('请选择一级分类')
  } else if (+index === 3) {
    return i18next.t('请选择二级分类')
  } else if (+index === 4) {
    return i18next.t('请选择品类')
  } else {
    return i18next.t('数据为空')
  }
}

export {
  flattenAndUniq,
  getChildIdList_1,
  getChildIdList_2,
  getChildIdList_3,
  findChtreeAll,
  isAllInSelectedList,
  emptyTip,
}
