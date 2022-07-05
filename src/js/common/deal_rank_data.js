/** 处理人员绩效数据业务相关 */
import _ from 'lodash'
import { i18next, t } from 'gm-i18n'
import { history } from './service'
import Big from 'big.js'
import globalStore from '../stores/global'
import { toJS } from 'mobx'

// 交换数组顺序
const alterItem = (arr, index1, index2) => {
  // 解析代码时，防止错误
  ;[arr[index1], arr[index2]] = [arr[index2], arr[index1]]
  return arr
}

// 处理第4名到第10名所占百分比
const dealOwnPercent = (data) => {
  if (_.isEmpty(data)) {
    return
  }
  _.each(data, (item, index) => {
    if (index >= 0 && +data[0].statistic_results) {
      data[0].percentage = 100
      item.percentage = Big(item.statistic_results * 100)
        .div(data[0].statistic_results)
        .toFixed(0)
    } else {
      item.percentage = 0
    }
  })
}

const dealResults = (item, type, rankType) => {
  if (
    (type === 'driver' && rankType === 2) ||
    (type === 'purchaser' && rankType === 1)
  ) {
    return `${
      !_.isString(item.statistic_results)
        ? Big(item.statistic_results).div(100).toFixed(2)
        : item.statistic_results
    }${t('元')}`
  } else if (type === 'purchaser' && rankType === 3) {
    return `${item.statistic_results}${i18next.t('次')}`
  }
  return `${item.statistic_results}${i18next.t('个任务')}`
}

// 排名数据统一处理
const dealRankData = (type, data, rankType = null) => {
  const dealKeyData = _.each(data, (item) => {
    item.name = item[`${type}_name`]
    item.count = dealResults(item, type, rankType)
  })
  let beforeThirdData = alterItem(_.slice(dealKeyData, 0, 3), 0, 1)
  if (beforeThirdData.length <= 3) {
    // 如果后端返回数据小于等于3，需要有rank为1~3的数据，背景图靠索引css
    beforeThirdData = [
      { rank: 2, ...beforeThirdData[0] },
      { rank: 1, ...beforeThirdData[1] },
      { rank: 3, ...beforeThirdData[2] },
    ]
  }
  // 处理排名中数据所占的百分比
  const restData = _.slice(dealKeyData, 3, 10)
  dealOwnPercent(restData)

  return { beforeThirdData, restData }
}

const judgeIfGoCarousel = (index, normalPath) => {
  const { carousel_interface } = globalStore.fullScreenInfo
  const { is_set_carousel } = globalStore.fullScreenInfo
  if (is_set_carousel && carousel_interface.includes(index)) {
    const currentIndex = _.findIndex(
      _.sortBy(carousel_interface.slice()),
      (value) => value === index,
    )
    history.push(`/carousel_full_screen?currentIndex=${currentIndex}`)
  } else {
    history.push(normalPath)
  }
}

const isInCarouselList = (index) => {
  const carouselList = globalStore.fullScreenInfo.carousel_interface
  console.log('carouselList', toJS(carouselList))
  return carouselList.includes(index)
}

export { dealRankData, judgeIfGoCarousel, isInCarouselList }
