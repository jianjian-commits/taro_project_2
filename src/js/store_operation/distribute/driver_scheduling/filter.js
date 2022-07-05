import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  FormItem,
  FormBlock,
  FormButton,
  Cascader,
  Select,
  Option,
  BoxForm,
  Button,
  MoreSelect,
  DateRangePicker,
} from '@gmfe/react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import utils from '../util.js'
import { cycleDateRangePickerInputValueV2 } from '../../../common/filter'
import PropTypes from 'prop-types'
import moment from 'moment'
import { getLocale } from '@gmfe/locales'

import globalStore from 'stores/global'

const { calculateTimeLimit } = utils

@inject('store')
@observer
class DateSelector extends React.Component {
  renderDateRangePickerInputValue = (begin, end) => {
    const {
      service_times,
      filter: { time_config_id },
      isChangeCal,
    } = this.props.store
    const time = _.find(service_times, (v) => v._id === time_config_id)

    return cycleDateRangePickerInputValueV2(begin, end, time, isChangeCal)
  }

  handleDatePicked = (beginTime, endTime) => {
    this.props.store.setFilter('begin_time', beginTime)
    this.props.store.setFilter('end_time', endTime)
    this.props.store.setChange('isChangeCal', true)
  }

  handleFilterChange(key, selected) {
    this.props.store.setFilter(key, selected)
    this.props.store.handleInitTime()
    this.props.store.setChange('isChangeCal', false)
  }

  limitDate = (d, { begin, end }) => {
    const {
      service_times,
      filter: { time_config_id },
    } = this.props.store
    const time = _.find(service_times, (v) => v._id === time_config_id)
    const timeLimit = calculateTimeLimit(time, begin, end)

    const dMax = moment(begin).add(1, 'day')
    const dMin = moment(begin).subtract(1, 'day')

    if (begin && end === null) {
      if (!timeLimit.isCrossDay) {
        // 下单/收货当天的话限制只能选当天
        return !(moment(d) <= moment(begin) && moment(d) >= moment(begin))
      }
      return !(moment(d) <= +dMax && moment(d) >= +dMin)
    }

    return false
  }

  limitTime = (d, { begin, end }, type) => {
    const {
      service_times,
      filter: { time_config_id },
    } = this.props.store
    const time = _.find(service_times, (v) => v._id === time_config_id)
    const timeLimit = calculateTimeLimit(time, begin, end)
    const isSameDay =
      moment(begin).format('YYYY-MM-DD') === moment(end).format('YYYY-MM-DD')
    const isSameHourAndMinute =
      timeLimit.tMax.format('HH:mm') === timeLimit.tMin.format('HH:mm')

    if (!time) {
      return null
    }

    if (timeLimit.isCrossDay) {
      // 处理跨天
      if (type === 'begin') {
        // 处理开始时间
        if (isSameDay) {
          // 跨天的情况下选的是同一天
          return !(moment(d) <= timeLimit.tMax || moment(d) >= timeLimit.tMin)
        }
        // 跨天的情况下选的是不同天
        return !(moment(d) >= timeLimit.tMin)
      } else {
        // 处理结束时间
        if (moment(begin).isSameOrBefore(timeLimit.tMax)) {
          // 小时和分钟相同且所选时间大于等于最大可选时间
          if (isSameHourAndMinute && !moment(begin).isBefore(timeLimit.tMax)) {
            return false
          }
          return !(moment(d) <= timeLimit.tMax)
        }
        return false
      }
    } else {
      // 不跨天
      return !(moment(d) >= timeLimit.tMin && moment(d) <= timeLimit.tMax)
    }
  }

  render() {
    const {
      filter: { begin_time, end_time, time_config_id },
      service_times,
    } = this.props.store
    const quickList = [
      {
        range: [
          [0, 'day'],
          [0, 'day'],
        ],
        text: getLocale('今天'),
      },
      {
        range: [
          [-1, 'day'],
          [-1, 'day'],
        ],
        text: getLocale('昨天'),
      },
    ]

    if (!service_times.length) return null

    return (
      <Flex row>
        <Select
          name='time_config_id'
          value={time_config_id}
          onChange={this.handleFilterChange.bind(this, 'time_config_id')}
          className='gm-margin-right-5'
        >
          {_.map(service_times, (s) => (
            <Option key={s._id} value={s._id}>
              {s.name}
            </Option>
          ))}
        </Select>
        <Flex flex none row>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            renderDate={this.renderDateRangePickerInputValue}
            onChange={this.handleDatePicked}
            customQuickSelectList={quickList}
            style={{ width: '400px' }}
            disabledDate={this.limitDate}
            enabledTimeSelect
            beginTimeSelect={{
              disabledSpan: (d, { begin, end }) => {
                return this.limitTime(d, { begin, end }, 'begin')
              },
            }}
            endTimeSelect={{
              disabledSpan: (d, { begin, end }) => {
                return this.limitTime(d, { begin, end }, 'end')
              },
            }}
          />
        </Flex>
      </Flex>
    )
  }
}

DateSelector.propTypes = {
  store: PropTypes.object,
}

@inject('store')
@observer
class Filter extends React.Component {
  handleWithFilter = (list, query) => {
    const result = []
    _.each(list, (v) => {
      const arr = _.filter(v.children, (item) => item.text.indexOf(query) > -1)
      if (arr.length) {
        result.push({
          ...v,
          children: arr,
        })
      }
    })

    return result
  }

  handleFilterChange(key, selected) {
    this.props.store.setFilter(key, selected)
  }

  handleSearch = () => {
    this.props.store.getOrderList()
  }

  render() {
    const {
      filter: { area_id, selected_route, carrier_id_and_driver_id },
      address,
      routeList,
      carrierDriverList,
    } = this.props.store

    const _route_list = _.map(routeList, (route) => {
      return { value: route.value, text: route.name }
    })
    const { isCStation } = globalStore.otherInfo

    return (
      <BoxForm
        btnPosition='left'
        onSubmit={this.handleSearch}
        labelWidth='80px'
        colWidth='360px'
      >
        <FormBlock col={3}>
          <FormItem label={i18next.t('运营周期')} col={2}>
            <DateSelector />
          </FormItem>

          {!isCStation && (
            <FormItem label={i18next.t('线路筛选')}>
              <MoreSelect
                placeholder={i18next.t('搜索')}
                data={_route_list}
                selected={selected_route}
                onSelect={this.handleFilterChange.bind(this, 'selected_route')}
                renderListFilter={this.handleWithFilter}
              />
            </FormItem>
          )}
        </FormBlock>

        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem label={i18next.t('司机筛选')}>
              <Cascader
                filtrable
                name='carrier_id_and_driver_id'
                data={toJS(carrierDriverList)}
                onChange={this.handleFilterChange.bind(
                  this,
                  'carrier_id_and_driver_id'
                )}
                value={carrier_id_and_driver_id.slice()}
              />
            </FormItem>

            <FormItem label={i18next.t('地理标签')}>
              <Cascader
                filtrable
                name='area_id'
                data={toJS(address)}
                value={area_id.slice()}
                onChange={this.handleFilterChange.bind(this, 'area_id')}
              />
            </FormItem>
          </FormBlock>
        </BoxForm.More>

        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
        </FormButton>
      </BoxForm>
    )
  }
}

Filter.propTypes = {
  store: PropTypes.object,
}

export default Filter
