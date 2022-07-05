import _ from 'lodash'
import { t } from 'gm-i18n'
import { Tip } from '@gmfe/react'
import { pinYinFilter } from '@gm-common/tool'

const pinyinFind = (data, searchText) => {
  if (searchText === '') {
    Tip.warning(t('没有找到'))
    return []
  }

  const find_list = pinYinFilter(data, searchText, (v) => v.text)
  let res = find_list
  _.forEach(data, (item) => {
    if (item.children && item.children.length) {
      res = _.concat(res, pinyinFind(item.children, searchText))
    }
  })

  return res
}

const filterRepeat = (listOne, listTwo) => {
  return _.concat(
    listOne,
    _.filter(listTwo, (v) => !_.includes(listOne, v)),
  )
}

export { pinyinFind, filterRepeat }
