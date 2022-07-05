import { t } from 'gm-i18n'
import { purchaseTaskSearchDateTypes } from '../../common/enum'
import _ from 'lodash'
import moment from 'moment'
import { calculateCycleTime, isEndOfDay } from '../../common/util'
import { Request } from '@gm-common/request'
import globalStore from '../../stores/global'

function getSearchOption(
  purchase_task,
  page = { limit: 10 },
  isSearchForSupplierBar,
) {
  const {
    categoryFilter,
    orderStatus,
    time_config_id,
    taskStatus,
    supplier,
    route_id,
    route_ids,
    purchaser,
    search_text,
    begin,
    end,
    dateType,
    sortStatus,
    siteTask,
    has_created_sheet,
    source_type,
    addressLabel,
    addresses,
    operateStatus,
    changeOption,
    client, // 订单来源
  } = purchase_task.headerFilter
  const serviceTimes = purchase_task.serviceTimes
  const category1_ids = _.map(categoryFilter.category1_ids, (cate) => cate.id)
  const category2_ids = _.map(categoryFilter.category2_ids, (cate) => cate.id)
  const pinlei_ids = _.map(categoryFilter.pinlei_ids, (cate) => cate.id)

  const service_time = _.find(serviceTimes, (s) => s._id === time_config_id)
  const query = {
    q_type: Number(dateType),
    q: search_text && search_text.trim(),
    category1_ids: category1_ids.length ? JSON.stringify(category1_ids) : null,
    category2_ids: category2_ids.length ? JSON.stringify(category2_ids) : null,
    pinlei_ids: pinlei_ids.length ? JSON.stringify(pinlei_ids) : null,
    status: taskStatus || null,
    order_status:
      orderStatus && orderStatus.length
        ? JSON.stringify(orderStatus.map((status) => status.id))
        : null,
    settle_supplier_ids: JSON.stringify(_.map(supplier, (o) => o.value)),
    route_id,
    route_ids,
    purchaser_id: purchaser && purchaser.id, // 采购员筛选
    source_type: source_type,
    address_label_id: addressLabel && Number(addressLabel.value), // 商户标签
    address_ids: JSON.stringify(_.map(addresses, (o) => o.value)), // 商户
    is_new_ui: 1, // 采购任务搜索，时间参数带上了时分，为了兼容老UI，传这个参数给后台
    client, // 订单来源
  }

  // 分拣状态--全部不传
  sortStatus && (query.weight_status = +sortStatus)

  // 站点任务---一乙定制
  siteTask && (query.address_id = siteTask)

  // 是否生成采购单
  has_created_sheet !== '' && (query.has_created_sheet = has_created_sheet)

  // 运营周期不需要做这一步处理 新接口时分后面加了秒
  if (
    Number(dateType) === purchaseTaskSearchDateTypes.ORDER.type ||
    Number(dateType) === purchaseTaskSearchDateTypes.RECEIVE.type
  ) {
    // 针对选择的结束时间需要多做一步处理, 当选择 24:00 时需要转换成 第二天00:00 传给后台
    const beginTime = isEndOfDay(begin)
    const endTime = isEndOfDay(end)
    query.begin_time = moment(beginTime).format('YYYY-MM-DD HH:mm:ss')
    query.end_time = moment(endTime).format('YYYY-MM-DD HH:mm:ss')
    query.time_config_id = operateStatus || ''
  } else {
    query.begin_time = calculateCycleTime(begin, service_time).begin + ':00'
    query.end_time = calculateCycleTime(end, service_time).end + ':00'
    query.time_config_id = time_config_id
  }

  if (changeOption === '1') query.purchase_change_release = 1

  if (!isSearchForSupplierBar) {
    return {
      ...query,
      ...page,
    }
  } else {
    // 如果是总览的 需要清空供应商的id 保持一致不变化
    query.settle_supplier_ids = null
  }

  return query
}

const isNBLAGroupID = (id) => id === 716

function getPurchaseTemList() {
  return Request('/fe/purchase_tpl/list')
    .get()
    .then((json) => {
      return _.map(json.data, (o) => {
        return {
          type: o.id,
          name: o.content.name,
        }
      })
    })
}

const purchaseDefaultPriceKey = {
  0: '',
  1: 'last_quote_price',
  2: 'last_purchase_price',
  3: 'last_in_stock_price',
  4: 'stock_avg_price',
  5: 'latest_quote_price',
  6: 'latest_in_stock_price',
}

const getPurchasePrice = (sku) => {
  const type =
    purchaseDefaultPriceKey[globalStore.otherInfo.purchaseSheetRefPrice]

  return sku[type] || 0
}

const ROOT_KEY = 'list_sort_type_purchase_task_detail'

const getStatusLable = (status) => {
  let statusName, statusClass
  switch (status) {
    case 1:
      statusName = t('未发')
      statusClass = 'purchaseStatusBgUnpublished'
      break
    case 2:
      statusName = t('已发')
      statusClass = 'purchaseStatusBgRelease'
      break
    case 3:
      statusName = t('完成')
      statusClass = 'purchaseStatusBgDone'
      break
    default:
      break
  }
  return { statusName, statusClass }
}

export {
  getSearchOption,
  isNBLAGroupID,
  getPurchaseTemList,
  purchaseDefaultPriceKey,
  getPurchasePrice,
  ROOT_KEY,
  getStatusLable,
}
