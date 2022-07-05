import moment from 'moment'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { gioSetUser, gioPeopleSet, gioTrackEvent } from '../service'
import { getStaticStorage } from 'gm_static_storage'
import globalStore from '../../stores/global'

const getDate = (date) => {
  return moment(date).format('YYYYMMDD')
}

const gioUserEvent = (config, data) => {
  const {
    group_type,
    user_id,
    group_id,
    station_id,
    is_valid,
    create_date,
    saas_version,
    renewal_time,
    online_date,
    offline_date,
    ext_json,
  } = data

  gioSetUser(user_id)
  gioTrackEvent('all_user_login', 1, {})

  const userData = {
    // 区域
    district: config.district[ext_json.district],
    province: ext_json.province.text,
    city: ext_json.city.text,
    // 是否KA 1-普通用户 2-KA用户
    customer_type: ext_json.customer_type === 2 ? '是' : '否',
    saas_version: config.saasVersion[saas_version],
    group_id,
    station_id,
    create_date: getDate(create_date),
    renewal_time: getDate(renewal_time),
    online_date: getDate(online_date),
    offline_date: getDate(offline_date),
    is_valid: is_valid ? '有效' : '无效',
    // 加盟类型
    group_type: group_type === 1 ? '客户' : '内部',
    project: 'station',
    platform: 'web',
  }
  gioPeopleSet(userData)
}

const getConfig = (userInfo) => {
  const { group_type, user_id } = userInfo
  globalStore.getGioPermission(group_type, user_id)

  if (globalStore.canGio) {
    getStaticStorage('/common/gio_config/common.json').then((json) => {
      gioUserEvent(json, userInfo)
    })
  }
}

// 上报group运营数据
const gioUserGroupInfo = () => {
  const infoName = `STATION_GIO_USER_INFO_${globalStore.user.userId}`
  const gioUserInfo = JSON.parse(window.localStorage.getItem(infoName))
  const now = new Date().getTime()
  if (gioUserInfo?.data && now < gioUserInfo.effectiveTime) {
    getConfig(gioUserInfo.data)
    return
  }
  Request('/station/partner/info')
    .data()
    .get()
    .then(async (res) => {
      getConfig(res.data)
      window.localStorage.setItem(
        infoName,
        JSON.stringify({
          data: res.data,
          effectiveTime: new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
        }),
      )
    })
}

const pageList = [
  {
    path: '/order_manage/order/list/repair_create',
    eventId: 'station_order_repaire',
    name: '订单/订单/订单补录',
  },
]

// 二级页面打点
const gioPage = (pathname) => {
  getStaticStorage('/common/gio_config/station_config.json').then((json) => {
    const pageListIndex = _.findIndex(
      pageList,
      (pageItem) => pageItem.path === pathname,
    )
    if (json[pathname] || pageListIndex >= 0) {
      const pageConfig = json[pathname]
      const pageName = pageConfig
        ? pageConfig.pageName
        : pageList[pageListIndex].name
      const pageEventId = pageConfig
        ? pageConfig.pageId
        : pageList[pageListIndex].eventId
      /**
       * 埋点事件：所有二级页面浏览量
       * 维度：页面
       */
      gioTrackEvent('browse_the_page', 1, {
        page_name: pageName,
      })
      /**
       * 埋点事件：单个页面浏览
       * 维度：暂无，可为访问页面的用户，触发事件等
       */
      gioTrackEvent(pageEventId, 1, {})
    }
  })
}

export { gioUserGroupInfo, gioPage }
