import { i18next } from 'gm-i18n'
import { getDataWXL, getDataHX } from '../common/util'
import _ from 'lodash'

const SerialPort = window.require('serialport')

let isInit = false
let data = 0
let buffer = [] // 用数组 push 比 字符串相加快
let timerGetBufferData = null

// 频率特别高，且由serialport(c)控制，没法断掉，会非常占用资源，估尽量做的特别轻。 仅仅缓存数据，且不对数据做处理。
// 在另外起轮询去获取数据
// 称推送数据 20/s 次
function connect() {
  isInit = true

  getWeights().then(() => {
    _.each(comList, (com) => {
      const port = new SerialPort(com.name)
      port.on('data', (d) => {
        buffer.push(d)
      })
    })

    clearTimeout(timerGetBufferData)
    pollingBufferData()
  })
}

function pollingBufferData() {
  // try catch 保护，避免 setTimeout 中断
  try {
    const bufferStr = _.map(buffer, (b) => b.toString()).join('')
    let dStr = ''
    if (window.____selectedDevice === i18next.t('衡新')) {
      dStr = getDataHX(bufferStr)
    } else if (window.____selectedDevice === i18next.t('无限量')) {
      dStr = getDataWXL(bufferStr)
    }

    if (dStr) {
      // 保留两位数据(toFixed(5))，是因为当电子秤的数据为反数据重量小于1(反数据：=5.0000，实际数据：0.5)
      // 数据88.4250
      const d = parseFloat(dStr).toFixed(5)

      if (!_.isNaN(d) && d >= 0) {
        if (window.____isReverse) {
          data = parseFloat([...d.toString()].reverse().join(''))
        } else {
          data = parseFloat(d)
        }

        buffer = []
      }
    }
  } catch (error) {
    console.log(error)
  }

  timerGetBufferData = setTimeout(() => {
    pollingBufferData()
  }, 500)
}

let comList = []

function getWeights() {
  if (comList.length > 0) {
    return Promise.resolve(comList)
  }
  return SerialPort.list().then((list) => {
    comList = _.map(list, (com) => ({
      name: com.comName,
      manufacturer: com.manufacturer,
    }))
    return comList
  })
}

function getData() {
  if (!isInit) {
    connect()
  }

  return data
}

export { getWeights, connect, getData }
