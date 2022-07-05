import _ from 'lodash'
import { t } from 'gm-i18n'
import moment from 'moment'
import queryString from 'query-string'
import Big from 'big.js'
import { RECEIVE_LIMIT_BY_DAYS, searchDateTypes } from '../common/enum'
import dsBridge from 'dsbridge'
import { is } from '@gm-common/tool'
const today = moment()

const clone = (o) => {
  let k = o
  let ret = o
  let b
  if (o && ((b = o instanceof Array) || o instanceof Object)) {
    ret = b ? [] : {}
    for (k in o) {
      // eslint-disable-next-line no-prototype-builtins
      if (o.hasOwnProperty(k)) {
        ret[k] = clone(o[k])
      }
    }
  }
  return ret
}

// 非负数 且 最大两位小数点
const isRightNumber = (input) => {
  return (
    /^[+]?((\d+.(\d){1,2})|(\d)+)$/.test(input + '') || parseFloat(input) === 0
  )
}

// 最大两位小数点
const isDecimalNumber = (input) => {
  return (
    /^[+|-]?((\d+.(\d){1,2})|(\d)+)$/.test(input + '') ||
    parseFloat(input) === 0
  )
}

// 是否为正浮点数,非负数且最大两位小数点,可用于验证价格
function isPositiveFloat(input) {
  return /^[+]?((\d+.(\d){1,2})|(\d)+)$/.test(input + '') && input > 0
}

function isPrice(price) {
  return /^\d{0,8}\.{0,1}(\d{1,2})?$/.test(price + '')
}

// 是否为数字，英文，下划线组合
function isNumOrEnglishOrUnderline(input) {
  return /^[_a-zA-Z0-9]+$/.test(input + '')
}

// 是否为数字，英文组合
function isNumOrEnglish(input) {
  return /^[a-zA-Z0-9]+$/.test(input + '')
}

// 是否为中文
function isChinese(input) {
  return /[\u4e00-\u9fa5]/.test(input + '')
}

// 是否是数字， 这个判断应该完善了吧
const isNumber = (value) => {
  return value !== null && value !== '' && !_.isNaN(Number(value))
}

// 是否全为数字组合
function isNumberCombination(input) {
  return /^[0-9]+$/.test(input + '')
}

// 字符串的字节数。中文长度算2
function getStrByte(str) {
  str = str || ''
  const len = str.length
  let byteLength = 0
  let charCode = -1

  for (let i = 0; i < len; i++) {
    charCode = str.charCodeAt(i)
    if (charCode >= 0 && charCode <= 128) {
      byteLength += 1
    } else {
      byteLength += 2
    }
  }

  return byteLength
}

// 是否为特殊字符
function isSpecialCharacter(input) {
  const regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im // eslint-disable-line
  const regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im
  return regCn.test(input) || regEn.test(input)
}

function replaceWithToJSX(text, target, what) {
  if (!text || !target) {
    return text
  }

  const re = what(target)
  const so = text.split(target)

  return _.zip(
    so,
    _.times(so.length - 1, () => re),
  )
}

function groupByWithIndex(list, cb) {
  let i = 0
  return _.groupBy(list, (v) => {
    return cb(v, i++)
  })
}

function calculateCycleTime(date, time_config, dateFormat = 'YYYY-MM-DD') {
  if (!time_config) return {}
  // 非预售
  if (time_config.type !== 2) {
    return {
      begin: `${moment(date).format(dateFormat)} ${
        time_config.order_time_limit.start
      }`,
      end: `${moment(date)
        .add('d', time_config.order_time_limit.e_span_time)
        .format(dateFormat)} ${time_config.order_time_limit.end}`,
    }
  }

  const { receiveEndSpan, start, end } = time_config.receive_time_limit
  // 预售不跨天
  if (receiveEndSpan === 0) {
    return {
      begin: `${moment(date).format(dateFormat)} ${start}`,
      end: `${moment(date).format(dateFormat)} ${end}`,
    }
  } else {
    return {
      begin: `${moment(date).format(dateFormat)} ${start}`,
      end: `${moment(date).add('d', 1).format(dateFormat)} ${end}`,
    }
  }
}

function urlToParams(obj) {
  return queryString.stringify(obj, '&')
}

// 12 -> SC000012 1232131 ->SC1232131  不足6位不足
const idConvert2Show = (id, prefix) => {
  const convertId = window.parseInt(id, 10)
  if (convertId > 1000000) {
    return prefix + convertId
  } else {
    return prefix + (1000000 + convertId + '').slice(1)
  }
}

const contains = (root, n) => {
  let node = n
  while (node) {
    if (node === root) {
      return true
    }
    node = node.parentNode
  }

  return false
}

// 约定: 经纬度 同时0 或者 同时null,视为无效坐标点
const isInvalidLocation = (lat, lng) => !lat && !lng

// 1111111 b 代表周一至周日
const convertNumber2Date = (weekdays) => {
  const receiveDays = []
  _.forEach(RECEIVE_LIMIT_BY_DAYS, (item) => {
    if (item.value & weekdays) {
      receiveDays.push(item)
    }
  })
  return receiveDays
}

const convertDay2Bit = (flag, current_date) => {
  const day = moment(current_date).add(flag, 'd').day() || 7 // 1-7 周日值为0 修正
  return 1 << (day - 1)
}

// 这样打开网页,防止打开新标签页window.print()卡住opener
const openNewTab = (url) => {
  const a = document.createElement('a')
  a.rel = 'noopener'
  a.href = url
  a.target = '_blank'
  a.click()
}

// 反正是写出来了，我也不知道啊
function filterGroupListModify(list, what) {
  return _.filter(list, function (d) {
    if (d.children) {
      d.children = filterGroupListModify(d.children, what)
    }

    if (d.children) {
      return !!d.children.length
    } else {
      return what(d)
    }
  })
}

function filterGroupList(list, what) {
  return filterGroupListModify(_.cloneDeep(list), what)
}

function getLeaf(list, result = []) {
  _.each(list, (v) => {
    if (v.children) {
      getLeaf(v.children, result)
    } else {
      result.push(v)
    }
  })
  return result
}

// 适配数据
const skuListAdapter = (list) => {
  return _.map(list, (item) => {
    item.value = item.id
    if (item.children && item.children.length > 0) {
      item.children = skuListAdapter(item.children)
    }
    return item
  })
}

/**
 * 分离组合商品和普通商品id
 * @param ids
 * @returns {{sku_ids: string[], combine_goods_ids: string[]}}
 */
const separateSkuIds = (ids) =>
  _.groupBy(ids, (id) => {
    if (id.startsWith('D')) {
      return 'sku_ids' // 普通商品id
    } else if (id.startsWith('M')) {
      return 'combine_good_ids' // 组合商品id
    }
  })

function endDateRanger(type, e_span_time, begin) {
  const days61 = moment(begin).add(61, 'd')
  const today = moment()

  if (
    (type === searchDateTypes.RECEIVE.type ||
      type === searchDateTypes.CYCLE.type) &&
    e_span_time
  ) {
    const daysWithSpan = today.add(e_span_time, 'd')
    const maxTemp = daysWithSpan.isAfter(days61) ? days61 : daysWithSpan

    return {
      min: begin,
      max: maxTemp,
    }
  }

  return {
    min: begin,
    max: days61.isAfter(today) ? today : days61,
  }
}

function startDateRanger(type, e_span_time) {
  if (
    (type === searchDateTypes.RECEIVE.type ||
      type === searchDateTypes.CYCLE.type) &&
    e_span_time
  ) {
    return {
      max: today.add(e_span_time, 'd'),
    }
  }

  return {
    max: today,
  }
}
const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD')
}
const formatDateTime = (date) => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

// 将后台货位数据打平
function spreadOutData(shelfData) {
  const map = {}

  _.each(shelfData, (originItem) => {
    _.each(originItem.shelf, (v) => {
      map[v.shelf_id] = {
        value: v.shelf_id,
        text: v.name,
        parent_id: v.parent_id,
      }
    })
  })

  return map
}

// 根据后台返回的分层货位数据处理为Cascade的children形式
function formatShelfDataForCascade(shelfData) {
  const map = spreadOutData(shelfData)
  const result = []

  // 放到合适的位置
  _.each(map, (v) => {
    if (v.parent_id) {
      const parent = map[v.parent_id]

      if (!parent.children) {
        parent.children = []
      }

      parent.children.push(v)
    } else {
      result.push(v)
    }
  })

  return result
}

// 将后台获取的Cascade数据处理成展示数据
function getCascadeSelectedName(cascadeData, selectedValue) {
  let name = ''
  const map = spreadOutData(cascadeData)

  _.each(selectedValue, (selectedV) => {
    _.each(map, (mapV) => {
      if (mapV.value === selectedV) {
        name += mapV.text
      }
    })
  })

  return name
}

function getShelfSelectedValueForCascade(shelfData, shelfId) {
  const map = spreadOutData(shelfData)
  const result = []
  let levelShelfId = shelfId
  // 存在货位不填的情况，因此需要对货位未选择做校验
  if (map[levelShelfId]) {
    result.unshift(levelShelfId)
    while (map[levelShelfId].parent_id) {
      result.unshift(map[levelShelfId].parent_id)

      levelShelfId = map[levelShelfId].parent_id
    }
  }

  return result
}

// 针对levelSelect树形结构做处理，（key属性命名不同）
function formatLevelSelectData(data) {
  return _.map(data, (item) => {
    return {
      ...item,
      text: item.name,
      children: item.children && formatLevelSelectData(item.children),
    }
  })
}

const treeToMap = (data) => {
  let currentQueen = []
  currentQueen = currentQueen.concat(data) // 入队
  const result = {}

  // 当前队列长度
  while (currentQueen.length) {
    let inQueenData = currentQueen.shift() // 第一个出队

    if (inQueenData.children) {
      currentQueen = currentQueen.concat(inQueenData.children) // 子节点入队
      inQueenData = _.omit(inQueenData, ['children'])
    }

    result[inQueenData.id] = inQueenData // 存储出队数据作为打平的数据
  }

  return result
}

const getSelectedShelfName = (data, selected) => {
  let resultName = ''

  _.each(selected, (selectedValue) => {
    _.each(data, (item) => {
      if (selectedValue === item.value) {
        resultName += item.name
      }
    })
  })

  return resultName
}

/**
 * 根据货位id获取货位选择数组
 * @param {object} data 平铺的object，内自带parent_id
 * @param {string} shelfId 货位id
 */
const getShelfSelected = (data, shelfId) => {
  const result = []
  let levelShelfId = shelfId

  // 存在货位不填的情况，因此需要对货位未选择做校验
  if (data[levelShelfId]) {
    result.unshift(levelShelfId)
    while (data[levelShelfId].parent_id) {
      result.unshift(data[levelShelfId].parent_id)

      levelShelfId = data[levelShelfId].parent_id
    }
  }

  return result
}

// 锁价日志 计算规则 单位是否加元
function doller(before, after) {
  const unit = []
  if (before === 2) {
    unit.push('')
  } else {
    unit.push('元')
  }
  if (after === 2) {
    unit.push('')
  } else {
    unit.push('元')
  }
  return unit
}

const asyncImportExcel = () => import('gm-excel')

function resNameSortByFirstWord(list = []) {
  // 删去空格和括号
  const reg = /(\s|\(|（)/g
  return list.sort((a, b) => {
    const resnameA = a.resname.replace(reg, '')
    const resnameB = b.resname.replace(reg, '')
    // 第一位是数字的，数字排在汉字后面
    if (/\d/.test(resnameA[0]) || /\d/.test(resnameB[0])) {
      return resnameA[0] > resnameB[0] ? -1 : 1
    }

    return resnameA.localeCompare(resnameB)
  })
}

const sortBySingleRule = (list, name, direction) => {
  if (!name || !list || !direction) return list

  // 删去空格和括号
  const reg = /(\s|\(|（)/g
  const sortList = list.sort((a, b) => {
    const nameA = a[name].replace(reg, '')
    const nameB = b[name].replace(reg, '')
    // 第一位是数字的，数字排在汉字后面
    if (/\d/.test(nameA[0]) || /\d/.test(nameB[0])) {
      return nameA[0] > nameB[0] ? -1 : 1
    }

    return nameA.localeCompare(nameB)
  })
  return direction === 'asc' ? sortList : _.reverse(sortList)
}

const sortByMultiRule = (list, ruleList) => {
  if (!list.length || !ruleList.length) return list
  const sortList = []

  _.forEach(ruleList, (rule, index) => {
    if (!index) {
      sortList[index] = sortBySingleRule(
        list,
        rule.sort_by,
        rule.sort_direction,
      )
    } else {
      let result = []
      const groupList = _.groupBy(
        sortList[index - 1],
        ruleList[index - 1].sort_by,
      )
      const groupKeys = _.keys(groupList)
      _.forEach(groupKeys, (key) => {
        const _len = groupList[key].length
        if (_len === 1) {
          result = _.concat(result, groupList[key])
        } else {
          result = _.concat(
            result,
            sortBySingleRule(groupList[key], rule.sort_by, rule.sort_direction),
          )
        }
      })
      sortList[index] = result
    }
  })

  return sortList[ruleList.length - 1]
}

// !!! 针对选择的结束时间需要多做一步处理, 当选择 24:00 时需要转换成 第二天00:00 传给后台
const isEndOfDay = (end) => {
  let end_new = moment(end).format('YYYY-MM-DD HH:mm')
  const date = moment(end).format('YYYY-MM-DD')
  const theSecondDay = moment(date).add(1, 'd')
  const addOneMoreMs = moment(end).add(1, 'ms')
  if (addOneMoreMs.isSame(theSecondDay)) {
    end_new = theSecondDay.format('YYYY-MM-DD HH:mm')
  }
  return end_new
}

// 值可以为0
const isValid = (val) => val !== undefined && val !== null && _.trim(val) !== ''

const doNumberDigitFixed = (number, digit = 2) => {
  return parseFloat(Big(number).toFixed(digit || 2))
}

/**
 * 通过type 获取时间段
 * @param {string} type '1'-今天 '2'-近7天 '3'-近30天
 */
const getDateRangeByType = (type) => {
  const params = {}
  switch (type) {
    case '1':
      params.begin_time = moment().format('YYYY-MM-DD')
      params.end_time = moment().format('YYYY-MM-DD')
      break
    case '2':
      params.begin_time = moment().subtract(1, 'days').format('YYYY-MM-DD')
      params.end_time = moment().subtract(1, 'days').format('YYYY-MM-DD')
      break
    case '3':
      params.begin_time = moment().subtract(7, 'days').format('YYYY-MM-DD')
      params.end_time = moment().format('YYYY-MM-DD')
      break
    case '4':
      params.begin_time = moment().subtract(30, 'days').format('YYYY-MM-DD')
      params.end_time = moment().format('YYYY-MM-DD')
      break
  }
  return params
}

/*
 * 将后台数据转换为select组件的数据
 * @param {array} data 待适配数据
 * @param {string} valueName value的字段名
 * @param {string} textName text的字段名
 */
const adapterSelectComData = (data, valueName = 'id', textName = 'name') => {
  return _.map(data, (item) => {
    return {
      ...item,
      value: item[valueName],
      text: item[textName],
    }
  })
}

/*
 * 将后台数据转换为MoreSelect组件的数据
 * @param {array} data 待适配数据
 * @param {string} valueName value的字段名
 * @param {string} textName text的字段名
 */
const adapterMoreSelectComData = (
  data,
  valueName = 'id',
  textName = 'name',
) => {
  return adapterSelectComData(data, valueName, textName)
}

// 校验非数字开头
const isNotBeginWithNumber = (str) => {
  return /^[^0-9]+$/.test(str + '')
}

// 根据 station_id 划分一级分类group数据
const TransformCategoty1Group = (data) => {
  const group = {}
  _.forEach(data, (v) => {
    if (v.station_id) {
      group[v.station_id] = group[v.station_id]
        ? [...group[v.station_id], v]
        : [v]
    } else {
      group.normal = group.normal ? [...group.normal, v] : [v]
    }
  })
  return _.map(group, (v, n) => ({
    label: n === 'normal' ? '通用' : `站点${n}`,
    children: v,
  }))
}
/**
 * @description: 生成全局ID
 */
function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (
    S4() +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    S4() +
    S4()
  )
}

/**
 * 投屏模式下主题配置
 * 参数类型适配
 * @param {String | Object} theme
 */
function adapter(theme) {
  let t = {
    theme: theme,
    type: '',
  }
  if (_.isObject(theme)) {
    t = theme
  }
  return t
}

/**
 * @description: 获取chrome浏览器下载链接
 */
function getChromeDownLoadLink() {
  let chromelink = ''
  const agent = window.navigator.userAgent.toLowerCase()
  const isWin64 = agent.indexOf('win64') >= 0 || agent.indexOf('wow64') >= 0
  const isWin32 = agent.indexOf('win32') >= 0 || agent.indexOf('wow32') >= 0
  const isMac = agent.includes('mac')
  if (isWin64) {
    chromelink = '//js.guanmai.cn/v2/static/file/chrome/ChromeSetup.win.64.exe'
  } else if (isWin32) {
    chromelink = '//js.guanmai.cn/v2/static/file/chrome/ChromeSetup.win.32.exe'
  } else if (isMac) {
    chromelink = '//js.guanmai.cn/v2/static/file/chrome/googlechrome.mac.dmg'
  }
  return chromelink
}
// 是否是object或者array
const isObjectOrArray = (obj) =>
  obj !== null && (Array.isArray(obj) || typeof obj === 'object')
/**
 * @description: 上传数据前格式化数据, 将prop为object或array的stringify
 * @param {object} obj
 * @param {string[]} 要删除的属性数组
 */
const formatPostData = (obj, deleteProps = []) => {
  const newObj = { ...obj }
  deleteProps.forEach((prop) => delete newObj[prop])
  Object.keys(newObj).forEach((key) => {
    const value = obj[key]
    if (isObjectOrArray(value)) {
      newObj[key] = JSON.stringify(value)
    }
  })
  return newObj
}

const isForeignCustomer = () => {
  // eslint-disable-next-line gm-react-app/no-window-template-state
  return [1135, 1448].indexOf(window.g_group_id) >= 0
}

const parseCustomizeRadioList = (list) => {
  const radioList = (list || []).map((v) => ({
    value: v.id,
    text: v.name,
  }))
  radioList.unshift({ value: 'false', text: t('无') })
  radioList.unshift({ value: undefined, text: t('全部') })
  return radioList
}

/**
 * @description: 格式化DateRangePicker的时间传给后端
 * @param {string} startDate 开始时间
 * @param {string} endDate 结束时间
 * @param {string} dateFormat 格式
 */
function formatStartEndDate(startDate, endDate, dateFormat = 'YYYY-MM-DD') {
  return [
    moment(startDate).startOf('date').format(dateFormat),
    moment(endDate).endOf('date').format(dateFormat),
  ]
}
/**
 * @description: 判断是否是函数 是的话传入参数
 * @param {func} fn 待判断的函数
 * @param args 参数
 */
function judgeFunction(fn, ...args) {
  typeof fn === 'function' && fn(...args)
}
/**
 * @description: 判断数组是否都为数字
 * @param {number[]} numberArr 待检测数组
 * @return {boolean} 数组是否都为数字
 */

function isAllNumber(numberArr) {
  return numberArr.every(isNumber)
}
/**
 * @description: 判断两个数字是否相等
 * @param {number} number1 数字1
 * @param {number} number2 数字2
 * @param {number} digit 保留小数位数
 * @return {boolean} 两个数字是否相等
 */
function isTwoNumberEqual(number1, number2, digit = 2) {
  return Big(number1).toFixed(digit) === Big(number2).toFixed(digit)
}

const isPcConnect = !dsBridge.hasNativeMethod('isX5WebView') && !is.phone()
/**
 * @description: 是否是开发环境
 */
const isDev = process.env.NODE_ENV === 'development'
/**
 * @description: 页面刷新
 */
function reload() {
  window.location.reload()
}
export {
  parseCustomizeRadioList,
  resNameSortByFirstWord,
  sortByMultiRule,
  sortBySingleRule,
  formatDate,
  formatDateTime,
  skuListAdapter,
  getLeaf,
  filterGroupList,
  convertDay2Bit,
  convertNumber2Date,
  clone,
  isRightNumber,
  isPositiveFloat,
  isNumber,
  isPrice,
  getStrByte,
  isDecimalNumber,
  replaceWithToJSX,
  isNumOrEnglishOrUnderline,
  isChinese,
  isNumOrEnglish,
  isNumberCombination,
  groupByWithIndex,
  calculateCycleTime,
  urlToParams,
  isSpecialCharacter,
  idConvert2Show,
  contains,
  isInvalidLocation,
  openNewTab,
  endDateRanger,
  startDateRanger,
  formatShelfDataForCascade, // todo 将废弃（原因：获取货位使用新接口，可返回正确的树形结构，下同）
  getCascadeSelectedName, // todo 将废弃
  getShelfSelectedValueForCascade, // todo 将废弃
  doller,
  formatLevelSelectData,
  treeToMap,
  getSelectedShelfName,
  getShelfSelected,
  asyncImportExcel,
  separateSkuIds,
  isEndOfDay,
  isValid,
  doNumberDigitFixed,
  getDateRangeByType,
  adapterSelectComData,
  adapterMoreSelectComData,
  isNotBeginWithNumber,
  TransformCategoty1Group,
  guid,
  getChromeDownLoadLink,
  formatPostData,
  isForeignCustomer,
  formatStartEndDate,
  judgeFunction,
  isAllNumber,
  isTwoNumberEqual,
  adapter,
  isPcConnect,
  isDev,
  reload,
}
