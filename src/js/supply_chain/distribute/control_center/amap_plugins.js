import _ from 'lodash'

/**
 * 轨迹纠偏
 * 使用方法见文档: https://lbs.amap.com/api/javascript-api/guide/services/grasp
 * @param path 原始轨迹
 * @returns {Promise<any>} 返回promise,是纠偏后的轨迹. 纠偏后轨迹,会丢失一些信息(速度、角度、时间)
 */
export function getGraspRoad(path) {
  // path为原始轨迹点的数组，❌不得超过 500 个点
  // 纠偏之前需要按照下面的数据规格准备原始轨迹点，x、y、sp、ag、tm分别代表经度、纬度、速度、角度、时间。具体看上面文档
  const originPath = path.map((o, i) => ({
    x: parseFloat(o.longitude),
    y: parseFloat(o.latitude),
    sp: parseFloat(o.speed),
    ag: parseFloat(o.direction),
    tm: i === 0 ? o.locatetime : o.locatetime - path[0].locatetime, // tm以秒为单位，第一个采集点的tm值从1970年0点开始，其他采集点为与第一个采集点时间的差值
  }))

  return new Promise((resolve) => {
    window.AMap.plugin('AMap.GraspRoad', function () {
      const grasp = new window.AMap.GraspRoad()

      grasp.driving(originPath, (error, result) => {
        if (!error) {
          // 纠偏后的轨迹
          const newPath = result.data.points.map(({ x, y }) => ({
            latitude: y,
            longitude: x,
          }))
          resolve(newPath)
        } else {
          // 轨迹纠偏失败,返回原始轨迹
          resolve(path)
        }
      })
    })
  })
}

/**
 * 终极纠偏大法. 由于高德限制每次纠偏500个点,所以大于500个点就切割成chunk,然后去纠偏.
 * @param line
 * @returns {Promise<*|{path: any}|*|{path: Array}>}
 */
export async function getGraspRoadSupreme(line) {
  const { path, ...rest } = line

  if (path.length <= 500) {
    const newPath = await getGraspRoad(path)
    return {
      ...rest,
      path: newPath,
    }
  } else {
    // 分成500个点一个chunk
    const pathChunk = _.chunk(path, 500)
    const newPathChunk = await Promise.all(
      pathChunk.map((pa) => getGraspRoad(pa))
    )
    const newPath = _.flatten(newPathChunk)
    return {
      ...rest,
      path: newPath,
    }
  }
}
