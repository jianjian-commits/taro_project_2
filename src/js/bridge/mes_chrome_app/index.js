import { i18next } from 'gm-i18n'
import { getDataHX, getDataWXL, getDataShouheng } from '../common/util'
import { Tip } from '@gmfe/react'
import { getStaticStorage } from 'gm_static_storage'
import _ from 'lodash'

const CHROME_APP_ID = 'lohljgnhcnademaofemfhhdgfbpokbme' // mes_app助手插件ID
// const CHROME_APP_ID = 'egnkejefafmmcphhkbleeknpcicogjic' // 测试的ID
const { chrome } = window
const UA = window.navigator.userAgent
let data = 0
let version = null
let isInstalled = false

// 判断是否安装了插件
function isInstalledChromeMesApp() {
  if (UA.includes('Chrome')) {
    if (isInstalled) {
      return
    }
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(
        CHROME_APP_ID,
        {
          type: 'version',
        },
        function (res) {
          if (res && res.code === 0) {
            version = res.data
            isInstalled = true
            disconnectWeight()
            connectWeight()
          } else {
            tipInfo()
          }
        },
      )
    } else {
      tipInfo()
    }
  }
}

const tipInfo = () => {
  Tip.info(
    i18next.t('您已开启地磅入库或库存盘点，但尚未安装MES助手,请下载安装...'),
  )
}

// 获取串口列表
function getDevices() {
  let devicesList = []
  if (UA.includes('Chrome')) {
    checkVersion()
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(CHROME_APP_ID, {
        type: 'getDevices',
        function(res) {
          devicesList = res.data
        },
      })
    }
  }
  return devicesList
}

// 检查插件的版本
function checkVersion() {
  if (UA.includes('Chrome')) {
    if (isInstalled && version) {
      getStaticStorage('/chromeapp/update.json').then((json) => {
        if (json.version) {
          versionDiff(json.version, version) &&
            Tip.warning(i18next.t('MES助手已经更新了版本，请及时下载安装...'))
        }
      })
    }
  }
}

// 连接串口
const connectWeight = () => {
  if (UA.includes('Chrome')) {
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(CHROME_APP_ID, { type: 'connectWeight' })
    }
  }
}

// 断开连接
function disconnectWeight() {
  if (UA.includes('Chrome')) {
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(CHROME_APP_ID, { type: 'disconnectWeight' })
    }
  }
}

// 获取数据
function getWeightData() {
  if (UA.includes('Chrome')) {
    try {
      if (isInstalled && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          CHROME_APP_ID,
          {
            type: 'getWeight',
          },
          function (res) {
            res && !res.data && connectWeight()
            let dStr = res ? res.data || '0' : '0'
            if (window.____selectedDevice === i18next.t('衡新')) {
              dStr = getDataHX(dStr)
            } else if (window.____selectedDevice === i18next.t('无限量')) {
              dStr = getDataWXL(dStr)
            } else if (window.____selectedDevice === i18next.t('首衡')) {
              dStr = getDataShouheng(dStr)
            }

            if (dStr) {
              // 保留两位数据(toFixed(5))，是因为当电子秤的数据为反数据重量小于1(反数据：=5.0000，实际数据：0.5)
              // 数据88.4250
              const d = dStr.includes('.')
                ? parseFloat(dStr).toFixed(5)
                : parseFloat(dStr)

              if (!_.isNaN(d) && d >= 0) {
                if (window.____isReverse) {
                  data = parseFloat([...d.toString()].reverse().join(''))
                } else {
                  data = parseFloat(d)
                }
              }
            }
          },
        )
      }
    } catch (error) {
      console.log(error)
    }

    setTimeout(() => {
      isInstalled && getWeightData()
    }, 500)
  }
}

function getMesAppData() {
  return data
}

function versionDiff(newVersion, oldVersion) {
  const nv = newVersion.split('.')
  const ov = oldVersion.split('.')

  if (nv[0] > ov[0]) {
    return 'major'
  }

  if (nv[1] > ov[1]) {
    return 'minor'
  }

  if (nv[2] > ov[2]) {
    return 'patch'
  }

  return false
}

const getChromeStatus = () => {
  return { version, isInstalled }
}

export {
  isInstalledChromeMesApp,
  checkVersion,
  getWeightData,
  getDevices,
  connectWeight,
  disconnectWeight,
  getMesAppData,
  getChromeStatus,
}
