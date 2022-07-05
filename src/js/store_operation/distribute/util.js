import moment from 'moment'
import _ from 'lodash'
import qs from 'query-string'

import { searchDateTypes } from '../../common/enum'
import { openNewTab } from '../../common/util'
import { getOrderTypeId } from '../../common/deal_order_process'

const today = moment()

function endDateRanger(type, e_span_time, begin) {
  const days30 = moment(begin).add(30, 'd')

  if (
    (type === searchDateTypes.RECEIVE.type ||
      type === searchDateTypes.CYCLE.type) &&
    e_span_time
  ) {
    const daysWithSpan = moment().add(e_span_time, 'd')
    const maxTemp = daysWithSpan.isAfter(days30) ? days30 : daysWithSpan

    return {
      min: begin,
      max: maxTemp,
    }
  }

  return {
    min: begin,
    max: days30.isAfter(today) ? today : days30,
  }
}

function startDateRanger(type, e_span_time) {
  if (
    (type === searchDateTypes.RECEIVE.type ||
      type === searchDateTypes.CYCLE.type) &&
    e_span_time
  ) {
    return {
      max: moment().add(e_span_time, 'd'),
    }
  }

  return {
    max: today,
  }
}

function calculateCycleTime(date, time_config, dateFormat = 'YYYY-MM-DD') {
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

function setQueryTime(
  query,
  date_type,
  time_config_id,
  begin_time,
  end_time,
  service_times,
) {
  const begin = moment(begin_time).format('YYYY-MM-DD')
  const end = moment(end_time).format('YYYY-MM-DD')
  // 按下单时间搜索
  if (date_type === '1') {
    query.order_start_time = begin
    query.order_end_time = end
  }
  // 按收货时间
  if (date_type === '3') {
    query.receive_start_time = begin
    query.receive_end_time = end
  }
  // 按运营时间
  if (date_type === '2') {
    const service_time = _.find(service_times, (s) => s._id === time_config_id)
    query.cycle_start_time = calculateCycleTime(begin, service_time).begin
    query.cycle_end_time = calculateCycleTime(end, service_time).end
    query.time_config_id = time_config_id
  }
  return query
}

// 返回整理后的地理信息
const getAddress = (address) => {
  const [areaLv1, areaLv2, areaLv3] = address

  // 每个地理标签都要有value
  _.each(areaLv3, (v) => {
    v.value = v.id
  })
  const _areaLv3 = _.groupBy(areaLv3, 'upstream_id') // 3级地理标签,按区分组

  // 3级地理标签 作为 2级地理标签的children.    再把2级地理,按市分组
  const _areaLv2 = _.groupBy(
    _.map(areaLv2, (district) => {
      return {
        value: district.id,
        name: district.name,
        level: district.level,
        upstream_id: district.upstream_id,
        children: _areaLv3[district.id],
      }
    }),
    'upstream_id',
  )

  // 2级地理标签 作为 1级地理标签的children.
  const _areaLv1 = _.map(areaLv1, (city) => {
    return {
      value: city.id,
      name: city.name,
      level: city.level,
      children: _areaLv2[city.id],
    }
  })
  // 加上全部选项

  return _areaLv1
}

// 处理传给后台的搜索条件
function getOrderParams({
  date_type,
  time_config_id,
  begin_time,
  end_time,
  search_text,
  route_id, // 线路
  carrier_id_and_driver_id,
  area_id,
  order_status,
  service_times,
  is_print,
  receive_way,
  pickUpSelected,
  salemenu_id,
  orderType, // 订单类型
  selectedLabel,
  searchType,
  sort_type,
  customized_field,
  client,
  create_user,
}) {
  const searchText = search_text.trim() === '' ? null : search_text.trim()

  let query = {
    search_text: searchType === 1 ? searchText : null,
    user_search_text: searchType === 2 ? searchText : null,
    create_user_id: searchType === 3 ? create_user?.value : null,
    route_id,
    is_print: is_print === '' ? null : is_print,
    order_status: order_status.toString() === '0' ? null : order_status,
    driver_id: carrier_id_and_driver_id[1],
    receive_way: receive_way || null,
    pick_up_st_id: (pickUpSelected && pickUpSelected.value) || null,
    salemenu_id: (salemenu_id && salemenu_id.value) || null,
    address_label_id: selectedLabel?.value,
    order_process_type_id: getOrderTypeId(orderType),
    sort_type: sort_type || null,
    customized_field: _.keys(customized_field).length
      ? JSON.stringify(customized_field)
      : null,
    client: client || null,
  }
  if (carrier_id_and_driver_id[0] === '-1') {
    // 司机未分配筛选
    query.unassigned = '1'
  } else {
    query.carrier_id = carrier_id_and_driver_id[0]
  }

  const area_level = area_id.filter((v) => v.toString() !== '0').length - 1
  if (area_level >= 0) {
    query.area_level = area_level
    query.area_id = area_id[area_level]
  }

  query = setQueryTime(
    query,
    date_type,
    time_config_id,
    begin_time,
    end_time,
    service_times,
  )

  return query
}

// 单据打印
function handleOrderPrint(params) {
  const { URL, order_ids, selectAllType, isSelectAll, filter, ...rest } = params

  // selectAllType 1 非全选 传ids, 2 全选 传搜索条件
  const query =
    isSelectAll && selectAllType === 2
      ? qs.stringify({
          ...rest,
          // 过滤掉值为空的属性, query-string不支持嵌套
          filter: JSON.stringify(
            _.omitBy(getOrderParams({ ...filter }), (value) => !value),
          ),
        })
      : qs.stringify({ order_ids, ...rest })

  openNewTab(`${URL}?${query}`)
}

const getMaxEndConfig = (service_times) => {
  const maxEndConfig = _.maxBy(
    service_times,
    (s) => s.receive_time_limit.e_span_time,
  )
  return maxEndConfig
}

const calculateTimeLimit = (time_config, begin, end) => {
  let isCrossDay // 是否跨天 1表示跨天，0表示不跨天
  let tMax // 当前可选时间的最大值
  let tMin // 当前可选时间的最小值
  const {
    receiveEndSpan,
    e_span_time,
    s_span_time,
  } = time_config.receive_time_limit
  const orderTimeLimitStart = time_config.order_time_limit.start.split(':')
  const orderTimeLimitEnd = time_config.order_time_limit.end.split(':')
  const receiveTimeLimitStart = time_config.receive_time_limit.start.split(':')
  const receiveTimeLimitEnd = time_config.receive_time_limit.end.split(':')

  if (time_config.type !== 2) {
    // 下单
    isCrossDay = time_config.order_time_limit.e_span_time
    tMin = moment(begin)
      .startOf('day')
      .hour(+orderTimeLimitStart[0])
      .minute(+orderTimeLimitStart[1])
    tMax = moment(end)
      .startOf('day')
      .hour(+orderTimeLimitEnd[0])
      .minute(+orderTimeLimitEnd[1])
  } else {
    // 收货
    isCrossDay =
      receiveEndSpan >= 0 ? receiveEndSpan : e_span_time - s_span_time
    tMin = moment(begin)
      .startOf('day')
      .hour(+receiveTimeLimitStart[0])
      .minute(+receiveTimeLimitStart[1])
    tMax = moment(end)
      .startOf('day')
      .hour(+receiveTimeLimitEnd[0])
      .minute(+receiveTimeLimitEnd[1])
  }

  if (isCrossDay && !begin) {
    tMax = tMax.add(1, 'days')
  }

  return {
    isCrossDay: isCrossDay,
    tMin: tMin,
    tMax: tMax,
  }
}

const isUndefinedOrNull = (value) => {
  if (value === null || value === undefined) {
    return true
  } else {
    return false
  }
}
const Utils = {
  calculateCycleTime,
  endDateRanger,
  startDateRanger,
  setQueryTime,
  getAddress,
  getOrderParams,
  handleOrderPrint,
  getMaxEndConfig,
  calculateTimeLimit,
  isUndefinedOrNull,
}

export default Utils
