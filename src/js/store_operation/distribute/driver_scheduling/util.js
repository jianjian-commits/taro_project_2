import _ from 'lodash'

// 24种颜色
const COLOR_LIST = [
  '#E72019',
  '#2FAA38',
  '#77298C',
  '#F4D11F',
  '#2085B3',
  '#EF8317',
  '#09308D',
  '#AFD029',
  '#AC1888',
  '#F5B61B',
  '#1165AB',
  '#EE6D19',
  '#412089',
  '#F2E928',
  '#13B4A4',
  '#E94E18',
  '#3AB035',
  '#C7115E',
  '#F59C1A',
  '#182A80',
  '#78BC27',
  '#E30F26',
  '#15479C',
  '#23A938',
]

export function getColorByDriverID(driverID) {
  if (_.isNil(driverID)) {
    return '#222934'
  }

  const n = driverID % COLOR_LIST.length
  return COLOR_LIST[n]
}

export function shortestPathSorting(pathArray) {
  // 初始点
  let result = [{ lat: 0, lng: 0 }]

  function findMin(paths) {
    const lastPoint = result[result.length - 1]
    let min = 0
    let minIndex = 0
    paths.forEach((o, index) => {
      // 离lastPoint距离平方: c^2 = a^2 + b^2
      const cPow =
        Math.pow(o.lat - lastPoint.lat, 2) + Math.pow(o.lng - lastPoint.lng, 2)
      if (index === 0) {
        min = cPow
      } else {
        if (cPow < min) {
          min = cPow
          minIndex = index
        }
      }
    })

    const minObj = paths.splice(minIndex, 1)[0]
    result.push(minObj)

    if (paths.length > 0) {
      findMin(paths)
    }
  }

  findMin(pathArray)
  // 去掉初始点
  return result.slice(1)
}

// 分发事件
export function dispatchMsg(event, data) {
  window.document.dispatchEvent(
    new window.CustomEvent(event, {
      detail: data,
    })
  )
}
