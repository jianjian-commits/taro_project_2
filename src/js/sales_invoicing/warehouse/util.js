import _ from 'lodash'
import { i18next } from 'gm-i18n'

const receiptType = {
  0: i18next.t('全部状态'),
  1: i18next.t('未移库'),
  2: i18next.t('未移库待审核'),
  3: i18next.t('审核不通过'),
  4: i18next.t('已移库'),
  5: i18next.t('已删除'),
}

const receiptTypeTag = (status) => {
  switch (status + '') {
    case '1':
    case '2':
      return 'processing'
    case '3':
      return 'error'
    case '4':
    case '5':
      return 'finish'
  }
}

function getFormatShelfName(shelfData) {
  let name = ''

  _.forEach(shelfData, (v) => {
    name += v.name
  })

  return name
}

function getFormatShelfId(shelfData) {
  const id = []

  _.forEach(shelfData, (v, index) => {
    id[index] = v.id
  })

  return id
}

function formatLevelSelectData(data) {
  return _.map(data, (item) => {
    return {
      ...item,
      text: item.name,
      children: item.children && formatLevelSelectData(item.children),
    }
  })
}

export {
  receiptType,
  receiptTypeTag,
  getFormatShelfName,
  getFormatShelfId,
  formatLevelSelectData,
}
