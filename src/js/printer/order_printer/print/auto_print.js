/*
 * @Description: 这个是用于自动下单的
 */
import { i18next } from 'gm-i18n'

import { doBatchPrint, getPrintContainerHTML } from 'gm-printer'

import { Request } from '@gm-common/request'

import _ from 'lodash'
import moment from 'moment'
import { order as formatOrder } from '../config/data_to_key'
import { ORDER_PRINT_API } from '../api'
import globalStore from 'stores/global'
import bridge from '../../../bridge'

export default async function autoPrint({ ids }) {
  let list = await getPrintList(getData({ ids }))

  // 按打印类型排序
  list = sortList(list)

  doBatchPrint(list, true, { isPrint: false, isTipZoom: false }).then(() => {
    const htmlString = getPrintContainerHTML()
    if (bridge.isElectron) {
      bridge.printer.sendToPrint({ htmlString })
    }
  })

  return list
}

function getData({ ids }) {
  const delivery_type = '1'

  // params 新老接口需要传递的参数 delivery_type为了区分新老接口
  const params = { ids: JSON.stringify(ids) }

  // 这里打印请求的接口有四个：新老接口、合并sid接口、合并订单相同商品的接口

  return ORDER_PRINT_API[delivery_type](params)
}

// 按商户打印
async function getPrintList(getDataPromise) {
  let list = []

  // 按商户配置的模板打印,每个订单可能使用不同的模板
  list = await getDistributeList(getDataPromise)
  // 数组扁平化
  list = _.flatten(list)

  return list
}

/**
 * 按商户配置的模板打印,使用多个模板
 * @param getDataPromise
 * @returns {Promise<(*)[]>}
 */
function getDistributeList(getDataPromise) {
  const reqList = [
    getDataPromise,
    Request('/station/distribute_config/list')
      .get()
      .then((json) => json.data),
    globalStore.fetchCustomizedConfigs(),
  ]

  return Promise.all(reqList).then((res) => {
    const [dataList, configList] = res
    // this.commonHandle(res)

    const templateMap = configList.reduce((acc, cur) => {
      acc[cur.id] = cur
      return acc
    }, {})

    return _.map(dataList, (data) => {
      const config = templateMap[data.template_id]
      !config &&
        window.alert(
          `(${data.resname})${i18next.t('商户未配置打印模板，打印异常!')}`,
        )

      return commonFormatData(data, config.content)
    })
  })
}

function commonFormatData(data, config) {
  // 添加打印人
  data.printer_operator = globalStore.user.name
  const dataConfigList = [{ data, config }]
  return dataConfigList.map((page) => ({
    data: formatOrder(page.data, false),
    config: page.config,
  }))
}

// 其他单排序
function sortList(list) {
  return _.sortBy(list, [
    (o) => moment.now() - moment(o.data._origin.date_time),
  ])
}
