import { i18next } from 'gm-i18n'
import { Price } from '@gmfe/react'
import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import util from '../util'

const today = moment().startOf('day')
const { calculateCycleTime } = util

const replaceNullOrUndefined = (value, replaceTo) =>
  _.isNull(value) || _.isUndefined(value) ? replaceTo : value

const getXlsxJson = (json) => {
  const { distribution_list, sku_details, exception_sku_details } = json.data
  // 异常
  const exception = _.map(exception_sku_details, (sku) => {
    return {
      [i18next.t('商品名')]: sku.sku_name,
      [i18next.t('异常原因')]: sku.abnormal_reason,
      [i18next.t('异常描述')]: sku.abnormal_desc,
      [i18next.t('异常/退货数量')]:
        (sku.abnormal_nums || '-') +
        replaceNullOrUndefined(sku.std_unit_name, ''),
      [i18next.t('异常/退货余额')]: sku.abnormal_money,
    }
  })
  // 商品明细
  const detail = _.map(sku_details, (item) => {
    return {
      [i18next.t('下单日期')]: moment(item.order_time).format('YYYY-MM-DD'),
      [i18next.t('出库日期')]:
        item.distribute_time &&
        moment(item.distribute_time).format('YYYY-MM-DD'),
      [i18next.t('收货日期')]:
        item.receiver_end_time &&
        moment(item.receiver_end_time).format('YYYY-MM-DD'),
      [i18next.t('运营配置名称')]: item.time_config_name,
      [i18next.t('订单号')]: item.order_id,
      [i18next.t('服务站点ID')]: item.station_id,
      [i18next.t('服务站点名称')]: item.station_name,
      [i18next.t('商户ID')]: item.res_id,
      [i18next.t('商户名称')]: item.res_name,
      [i18next.t('一级分类')]: item.category_1_name,
      [i18next.t('二级分类')]: item.category_2_name,
      [i18next.t('自定义编码')]: item.custom_id,
      [i18next.t('商品名')]: item.sku_name,
      [i18next.t('规格')]:
        item.sale_ratio + item.std_unit_name + '/' + item.sale_unit_name,
      [i18next.t('单价')]: item.unit_price,
      [i18next.t('单位(基本单位)')]: `${Price.getUnit() + '/'}${
        item.std_unit_name
      }`,
      [i18next.t('下单数(销售单位)')]: item.order_count,
      [i18next.t('销售单位')]: item.sale_unit_name,
      [i18next.t('下单数(基本单位)')]: Big(item.order_count)
        .times(item.sale_ratio)
        .valueOf(),
      [i18next.t('基本单位')]: item.std_unit_name,
      [i18next.t('出库数(基本单位)')]: Big(item.out_stock_nums)
        .times(item.sale_ratio)
        .valueOf(),
      [i18next.t('下单金额(成交)')]: Big(item.order_count)
        .times(item.sale_ratio)
        .times(item.unit_price)
        .toFixed(2),
      [i18next.t('出库金额')]: Big(item.out_stock_nums)
        .times(item.sale_ratio)
        .times(item.unit_price)
        .toFixed(2),
      [i18next.t('商品备注')]: item.merchandise_remark,
    }
  })

  // 订单明细
  const order = _.map(distribution_list, (item) => {
    return {
      [i18next.t('下单日期')]: moment(item.order_time).format('YYYY-MM-DD'),
      [i18next.t('出库日期')]:
        item.distribute_time &&
        moment(item.distribute_time).format('YYYY-MM-DD'),
      [i18next.t('收货日期')]:
        item.receiver_end_time &&
        moment(item.receiver_end_time).format('YYYY-MM-DD'),
      [i18next.t('运营配置名称')]: item.time_config_name,
      [i18next.t('订单号')]: item.order_id,
      [i18next.t('服务站点ID')]: item.station_id,
      [i18next.t('服务站点名称')]: item.station_name,
      [i18next.t('商户ID')]: item.res_id,
      [i18next.t('商户名称')]: item.res_name,
      [i18next.t('下单金额(成交)')]: item.total_order_money,
      [i18next.t('出库金额')]: item.total_outstock_money,
      [i18next.t('异常/退货金额')]: item.total_exception_money,
      [i18next.t('销售额(不含运费)')]: Big(item.total_outstock_money)
        .add(item.total_exception_money || 0)
        .toFixed(2),
      [i18next.t('运费')]: item.freight,
      [i18next.t('销售额(含运费)')]: Big(item.total_outstock_money)
        .add(item.freight)
        .add(item.total_exception_money || 0)
        .toFixed(2),
      [i18next.t('配送司机')]: item.driver_name,
      [i18next.t('打印时间')]: moment(item.print_time).format(
        'YYYY-MM-DD HH:mm:ss'
      ),
      [i18next.t('操作人')]: item.operator,
    }
  })
  return [order, detail, exception]
}

const getReqParams = (store, new_pagination = {}) => {
  const service_times = store.service_times
  const pagination = store.pagination
  const {
    begin_time,
    end_time,
    date_type,
    search_text,
    time_config_id,
  } = store.filter

  let reqParams = {
    search_text: search_text.trim() || null,
  }
  const begin = moment(begin_time).format('YYYY-MM-DD')
  const end = moment(end_time).format('YYYY-MM-DD')
  // 按下单时间搜索
  if (date_type === '1') {
    reqParams.order_time_begin = begin
    reqParams.order_time_end = end
  }
  // 按收货时间
  if (date_type === '3') {
    reqParams.receive_begin_time = begin
    reqParams.receive_end_time = end
  }
  // 按运营时间
  if (date_type === '2') {
    const service_time = _.find(service_times, (s) => s._id === time_config_id)
    reqParams.cycle_start_time = calculateCycleTime(begin, service_time).begin
    reqParams.cycle_end_time = calculateCycleTime(end, service_time).end
    reqParams.time_config_id = time_config_id
  }

  return Object.assign(reqParams, pagination, new_pagination)
}

class EditLogStore {
  @observable service_times = []
  @observable filter = {
    date_type: '1', // 1:下单 2:运营 3:收货
    time_config_id: '',
    begin_time: today,
    end_time: today,
    search_text: '',
  }
  @observable pagination = {
    offset: 0,
    limit: 10,
  }
  @observable list = []

  @action
  fetchEditLog(new_pagination = {}) {
    const req = getReqParams(this, new_pagination)
    Request('/station/transport/distribution_order/list')
      .data(req)
      .get()
      .then(
        action('getEditLog', (json) => {
          this.pagination = {
            ...this.pagination,
            ...new_pagination,
          }

          this.list = json.data
        })
      )
  }

  @action
  getServerTimes() {
    Request('/service_time/list')
      .get()
      .then(
        action('getServerTimes', (json) => {
          this.service_times = json.data
          this.filter = {
            ...this.filter,
            time_config_id: (json.data[0] && json.data[0]._id) || '',
          }
        })
      )
  }

  @action
  setSearchFilter(key, value) {
    this.filter[key] = value
  }

  @action
  singleExport(id) {
    return Request('/station/transport/distribution_order/get')
      .data({ id })
      .get()
      .then((json) => {
        return getXlsxJson(json)
      })
  }

  @action
  batchExport() {
    const req = getReqParams(this)
    return Request('/station/transport/distribution_order/export')
      .data(req)
      .get()
      .then((json) => {
        return getXlsxJson(json)
      })
  }
}

const editLogStore = new EditLogStore()
export default editLogStore
