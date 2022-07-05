/**
 * 为了简化filter重复劳动,抽象出这个东西
 */
import { action, extendObservable } from 'mobx'
import _ from 'lodash'

export default class ObservableFilter {
  constructor(filter) {
    const filterObj = filter.reduce((acc, cur) => {
      const { key, initial_value } = cur
      acc[key] = initial_value
      return acc
    }, {})
    extendObservable(this, filterObj)

    this._original_filter = filter
  }

  get requestParams() {
    return this._original_filter.reduce((acc, cur) => {
      const { key, value_for_request } = cur

      let value
      if (_.isFunction(value_for_request)) {
        value = value_for_request(this[key], this)
      } else if (!_.isUndefined(value_for_request)) {
        value = value_for_request
      } else {
        value = this[key] === ObservableFilter.NULL ? null : this[key]
      }

      acc[key] = value
      return acc
    }, {})
  }

  @action.bound
  set(key, value) {
    this[key] = value
  }

  // 这个字段用于替代null => 1. null直接传个组件会警告 2.null在某些场景会报错
  static NULL = '__FILTER__NULL__'
}
