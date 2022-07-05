import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { createHashHistory } from 'history'
import { processHistory } from '@gm-common/router'
import { Request } from '@gm-common/request'
import { matchPath } from 'react-router'
import { isEnglish, i18next } from 'gm-i18n'
import _ from 'lodash'
import globalStaticResourceStore from '../stores/global_static_resource'
import Big from 'big.js'
import withRouter from 'gm-service/src/common/with_router_compatible'
import { getStaticStorage } from 'gm_static_storage'
import { Tip } from '@gmfe/react'
import { uploadImage } from '@gmfe/qiniu-image'
import globalStore from '../stores/global'
import System from './system'
import productDefaultImg from '../../img/product-default-gm.png'

/* global gio */
// gio 打点平台信息
const gioProjectObj = {
  platform: 'web',
  project: 'station',
}
const history = processHistory(createHashHistory())

const getXlsxURLByLocale = (name) => {
  const prefix = '//js.guanmai.cn/static_storage/files'
  if (isEnglish()) {
    return `${prefix}/xlsx_en/${name}`
  }
  return `${prefix}/${name}`
}
// 全屏配置放在这里
const fullScreenPaths = [
  '/order_manage/order/report_print',
  '/sales_invoicing/finance/print/:id',
  '/system/setting/distribute_templete/print',
  '/supply_chain/purchase/task/print',
  '/supply_chain/purchase/bills/print',
  '/sales_invoicing/stock_out/refund/print',
  '/system/setting/distribute_templete/print_preview_template',
  '/system/setting/distribute_templete/print_edited_distribute',
  '/supply_chain/process/receipt/print',
  '/supply_chain/process/receipt/print/material_print',
  '/supply_chain/process/receipt/print/process_print',
  '/supply_chain/process/material_management/print',
  '/system/setting/distribute_templete/malay_print',
  '/system/setting/order_printer/print',
  '/system/setting/finance_voucher_printer/print',
  '/system/setting/account_printer/print',
  '/system/setting/order_printer/template_editor',
  '/sales_invoicing/supplier/list/purchase_specification_print',
  '/sales_invoicing/base/supplier/purchase_specification_print',
  '/merchandise/manage/sale/print',
  '/merchandise/manage/sale/toImage',
  '/merchandise/manage/quotation_record/print',
  '/supply_chain/purchase/require_goods/print',
  '/supply_chain/sorting/schedule/full_screen',
  '/system/setting/distribute_templete/purchase_editor',
  '/system/setting/distribute_templete/purchase_printer',
  '/system/setting/distribute_templete/label_editor',
  '/system/setting/distribute_templete/stockin_editor',
  '/system/setting/distribute_templete/stockin_printer',
  '/system/setting/distribute_templete/stockout_editor',
  '/system/setting/distribute_templete/stockout_printer',
  '/system/setting/distribute_templete/settle_editor',
  '/system/setting/distribute_templete/settle_printer',
  '/system/setting/distribute_templete/thermal_printer',
  '/system/setting/distribute_templete/box_label_editor',
  '/system/setting/distribute_templete/box_label_printer',
  '/system/setting/distribute_templete/commander_task_printer',
  '/system/setting/distribute_templete/pre_sort_editor',
  '/system/setting/distribute_templete/salemenus_editor',
  '/system/setting/distribute_templete/salemenus_printer',
  '/system/setting/label/print',
  '/merchandise/manage/sale/printer_to_img',
  '/system/setting/order_printer/print_sid_detail2',
  '/printer/smart_menu_printer/print',
  '/printer/picking/task',
  '/home/old/full_screen', // 老投屏
  '/sales_invoicing/processing_division/split_document/print',
  '/supply_chain/purchase/overview/full_screen',
  '/supply_chain/purchase/performance/full_screen',
  '/supply_chain/distribute/driver_performance/full_screen',
  '/supply_chain/sorting/performance/full_screen',
  '/carousel_full_screen',
  '/supply_chain/sorting/performance/print',
  '/data/dashboard/sale_dashboard/fullscreen', // 新的投屏
  '/dashboard/purchase_dashboard/fullscreen', // 新的投屏
  '/carousel_full_screen', // 旧的的投屏
  '/browser_incompatible_tip',
]
const fullScreenCache = {}

function isFullScreen(pathname) {
  if (fullScreenCache[pathname]) {
    return true
  }
  return !!_.find(fullScreenPaths, (v) => {
    if (matchPath(pathname, { path: v })) {
      fullScreenCache[pathname] = true
      return true
    }
  })
}

// 针对定制化域名做转换处理
// 纯C站点域名 http://buy.guanmai.cn
const changeDomainName = (fromValue, toValue) => {
  let realDomainName = ''
  const domainNameData = globalStaticResourceStore.domainName
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  const matchRule = new RegExp('^(http://|https://)')

  // fromValue为''表示需要依靠当前域名判断
  let fromName = fromValue
  if (fromName === '') {
    fromName = window.location.hostname.split('.')[0]
  }

  _.forEach(domainNameData, (value) => {
    if (_.replace(value[fromName], matchRule, '') === hostname) {
      realDomainName = value[toValue]
    }
  })

  if (!realDomainName) {
    realDomainName = `${protocol}//${hostname.replace(fromName, toValue)}`
  }

  if (toValue === 'bshop') {
    realDomainName += '/v587/'
  }

  return realDomainName
}

/**
 * 上报到钉钉的信息
 * @param type 类型 station  bshop  manage cdn_exception_station cdn_exception_bshop
 * @param title 消息标题
 * @param data [{title: ***, text: ***}] 可选参数 上报信息
 * @param traceId 671cb385-2644-cadf-3e5b-7ae7127d03bb 可选参数 跟踪错误id
 */
const reportDingtalk = (type, title, data, traceId) => {
  // 只有不是开发环境和测试环境的时候才上报错误消息（devhost为测试环境的域名）
  const isDebug = __DEBUG__ // eslint-disable-line
  const hostname = window.location.hostname
  if (!isDebug && hostname.indexOf('devhost') === -1) {
    const url = '//trace.guanmai.cn/api/webhook/dingtalk'
    const CLIENTIDKEY = '_GM_SERVICE_CLIENT_ID'
    const text = data
      ? _.map(data, (v) => {
          return `\n ##### ${v.title}: \n${v.text}`
        })
      : ''

    const req = {
      msgtype: 'markdown',
      markdown: {
        title,
        text:
          `##### station_id:\n ${
            window.g_user && window.g_user.station_id
          }\n ##### station_name:\n ${
            window.g_user && window.g_user.station_name
          }\n ##### group_id:\n ${window.g_group_id}\n ##### branch:\n ${
            window.____fe_branch
          }\n ##### commit:\n ${window.____git_commit}\n ##### href: \n[${
            window.location.hash
          }](${window.location.href})\n ##### clientId: \n${
            window.localStorage && window.localStorage.getItem(CLIENTIDKEY)
          }\n ##### 环境信息: \n${
            window.navigator && window.navigator.userAgent
          }` + text, // eslint-disable-line
        // 加上traceId
        traceId,
      },
    }

    window.fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        type,
        data: req,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

const cutNumberByPrecision = (number, precision) => {
  const p = Big(10).pow(precision)
  const b = Big(parseInt(Big(number).times(p))).div(p)
  return toString.call(number) === '[object String]' ? b + '' : +b
}

function arrearsTip() {
  getStaticStorage('/common/arrears_list.json').then((json) => {
    const arrears = json.arrears || []
    _.forEach(arrears, (item) => {
      if (+item.group_id === globalStore.groupId) {
        Tip.info({
          children: i18next.t(
            '尊敬的客户您好，您的系统于本月到期，请及时联系售后人员续费，逾期系统将自动关停。谢谢您的支持！',
          ),
          time: 0,
        })
      }
    })
  })
}

const useBreadcrumbs = (breadcrumbs) => {
  let pre
  useEffect(() => {
    pre = globalStore.breadcrumbs.slice()

    globalStore.setBreadcrumbs(breadcrumbs)

    return () => {
      globalStore.setBreadcrumbs(pre)
    }
  }, [])
}

// 当 breadcrumbs 固定用此装饰 @withBreadcrumbs(['xxxx'])
const withBreadcrumbs = (breadcrumbs) => (WrappedComponent) => {
  return (props) => {
    useBreadcrumbs(breadcrumbs)
    return <WrappedComponent {...props} />
  }
}

// 当 breadcrumbs 是不固定的，比如显示详情页数据的名字
const WithBreadCrumbs = (props) => {
  useBreadcrumbs(props.breadcrumbs)
  return null
}

WithBreadCrumbs.propTypes = {
  breadcrumbs: PropTypes.array.isRequired,
}

// 根据有没有查看税率权限get_tax，判断显示什么文案
function copywriterByTaxRate(notax, hastax) {
  if (globalStore.hasViewTaxRate()) {
    return hastax
  }
  return notax
}

/**
 * gio设置登录用户ID
 * @param userId {json} 包含用户信息的JSON对象
 */
const gioSetUser = (userId) => {
  if (!window.gio || !globalStore.canGio) {
    return
  }
  gio('setUserId', userId)
}

/**
 * gio清楚登录用户ID
 */
const gioClearUser = () => {
  if (!window.gio || !globalStore.canGio) {
    return
  }
  gio('clearUserId')
}

/**
 * gio设置登录用户级变量
 * @param customerVariables {json} 包含用户信息的JSON对象
 */
const gioPeopleSet = (customerVariables) => {
  if (!window.gio || !globalStore.canGio) {
    return
  }
  gio('people.set', customerVariables)
}

/**
 * gio手动发送页面浏览事件 sendPage
 * 设置页面级变量
 * @param key {string} 页面级变量的标识符
 * @param value {string} 页面级变量的值
 * gio的('page.set', key, value)要求定义唯一的一组key-value对应，但如果只是记录页面浏览量的话，value可以直接取key的值
 */
const gioSendPage = (key, value) => {
  if (!window.gio || !globalStore.canGio) {
    return
  }
  gio('sendPage')
  if (value) gio('page.set', key, value)
  else gio('page.set', key, key)
}

/**
 * gio设置自定义事件和事件级变量
 * @param eventId {string} 事件标识符 命名方式： 模块名+功能 如 order_batch_import
 * @param number {number} 事件的数值，没有number参数时，事件默认加1；当出现number参数时，事件自增number的数值
 * @param eventLevelVariables {json} 包含事件级变量的JSON对象，暨事件发生时所伴随的维度信息
 */
const gioTrackEvent = (eventId, number = 1, eventLevelVariables) => {
  if (!window.gio || !globalStore.canGio) {
    return
  }
  const eventVariables = {
    ...eventLevelVariables,
    ...gioProjectObj,
  }
  gio('track', eventId, number, eventVariables)
}

const getQiniuToken = () => {
  return Request('/gm_wheat/qiniu_token')
    .get()
    .then((json) => {
      if (!json.code) {
        return json.data
      } else {
        throw new Error(`error ${json.msg}`)
      }
    })
}

const uploadQiniuImage = (file, prefix = '') => {
  return uploadImage(file, {
    getToken: getQiniuToken,
    prefix,
  }).then(({ url, key }) => ({
    data: {
      url,
      id: `:qiniu-v1:${key}`,
    },
  }))
}

// 用于「系统设置」判断
const isCStationAndC = () => {
  const { isCStation } = globalStore.otherInfo
  const retail = System.isC()
  return isCStation || retail
}

// 导入周期定价规则异常信息提示
const cyclePriceWarning = (pathname) => {
  getStaticStorage('/common/gio_config/station_config.json').then((json) => {
    if (json[pathname] || pathname === '/home' || pathname === '/') {
      Request('/salemenu/cycle_pricing/failed_info')
        .get()
        .then((json) => {
          const { data } = json
          if (data.length) {
            Tip.warning(
              i18next.t(
                '报价单规则同步时存在异常，请前往【报价单周期定价列表】查看！',
              ),
            )
          }
        })
    }
  })
}

export {
  System,
  history,
  withRouter,
  isFullScreen,
  getXlsxURLByLocale,
  reportDingtalk,
  productDefaultImg,
  changeDomainName,
  cutNumberByPrecision,
  arrearsTip,
  withBreadcrumbs,
  WithBreadCrumbs,
  copywriterByTaxRate,
  gioSetUser,
  gioClearUser,
  gioPeopleSet,
  gioSendPage,
  gioTrackEvent,
  getQiniuToken,
  uploadQiniuImage,
  isCStationAndC,
  cyclePriceWarning,
}
