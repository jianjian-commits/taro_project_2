import moment from 'moment'
import _ from 'lodash'
import DataCenter from './data_center'

export const stringifyParamsAndFormatDate = (params) => {
  return _.reduce(
    params,
    (t, v, k) => {
      if (k === 'time_range') {
        v = v.map((i) => ({
          ...i,
          begin_time: moment(i.begin_time).format('YYYY-MM-DD 00:00'),
          end_time: moment(i.end_time).format('YYYY-MM-DD 23:59'),
        }))
      }
      return { ...t, [k]: JSON.stringify(v) }
    },
    {},
  )
}

/**
 *  数据面板的接口使用新架构模式，接口参数太杂，参数容易变成一坨一坨的大对象
 *  所以增强Request的能力
 */
class EnhanceRequest extends DataCenter {
  constructor(request, url) {
    super()
    this.url = url
    this.requestInstance = request('/' + url)

    // 参数
    this._group_by_fields = undefined
    this._order_by_fields = undefined
    this._time_range = undefined
    this._filter = undefined
    this._limit = undefined
    this._time_field = undefined
  }

  /**
   * 通用参数
   * @param {objet} params
   */
  common(params = {}) {
    this.params = _.cloneDeep(params)
    this._group_by_fields = this.params.query_expr.group_by_fields
    this._order_by_fields = this.params.query_expr.order_by_fields
    this._filter = this.params.query_expr.filter
    this._time_range = this.params.time_range[1]
    this._time_field = this.params?.time_range[0]?.time_field || 'order_time'
    this._limit = this.params.query_expr.limit

    return this
  }

  /**
   *
   * @param {object} v
   */
  time_range(v) {
    this._time_range = v
    if (!this.params?.time_range) _.setWith(this.params, '[time_range]', [v])
    else this.params.time_range.push(v)
    return this
  }

  filter(v) {
    this.params.query_expr.filter.push(v)
    this._filter = this.params.query_expr.filter
    return this
  }

  limit(v) {
    this.params.query_expr.limit = v

    this._limit = this.params.query_expr.limit
    return this
  }

  offset(v) {
    this.params.query_expr.offset = v

    this._offset = this.params.query_expr.offset
    return this
  }

  group_by_fields(v) {
    this._group_by_fields = v
    _.setWith(this.params, '[query_expr][group_by_fields]', v)
    return this
  }

  order_by_fields(v) {
    this._order_by_fields = v
    _.setWith(this.params, '[query_expr][order_by_fields]', v)
    return this
  }

  data(params) {
    if (!this.params) this.params = {}
    this.requestInstance.data(
      stringifyParamsAndFormatDate(_.merge(this.params, params)),
    )
    this.isSetData = true
    return this
  }

  post() {
    if (!this.isSetData)
      this.requestInstance.data(stringifyParamsAndFormatDate(this.params))
    return this.requestInstance.post().then((data) => {
      return this.process(data)
    })
  }

  get() {
    if (!this.isSetData)
      this.requestInstance.data(stringifyParamsAndFormatDate(this.params))
    return this.requestInstance.get().then((data) => {
      return this.process(data)
    })
  }
}

export const enhanceRequest = (fn) => (url) => new EnhanceRequest(fn, url)
