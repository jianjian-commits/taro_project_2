import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Form,
  FormItem,
  FormButton,
  FormBlock,
  MoreSelect,
  Box,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'
import { connect } from 'react-redux'
import { pinYinFilter } from '@gm-common/tool'
import PropTypes from 'prop-types'

import utils from '../util'
import { searchDateTypes, dateFilterData } from '../../../common/enum'
import './reducer.js'
import './actions.js'
import actions from '../../../actions'
import DateFilter from '../../../common/components/date_range_filter'
import { getCycleDateLimit } from '../../../order/components/date_range_limit'
import OrderTypeSelector from '../../../common/components/order_type_selector'

import globalStore from 'stores/global'

const { endDateRanger, startDateRanger, getMaxEndConfig } = utils
const doFilter = (list, query) =>
  pinYinFilter(list, query, (value) => value.name)

class SearchFilter extends React.Component {
  handleSelectCarrier = (carrier) => {
    actions.distribute_driver_selected_carrier(carrier)
  }

  handleFilterChange(name, value) {
    actions.distribute_driver_filter_change({ [name]: value })
  }

  handleSearch = () => {
    const { search } = this.props
    search()
  }

  getCycleDateLimits = () => {
    const {
      date_type,
      begin_time,
      end_time,
      time_config_id,
      service_times,
    } = this.props.distributeDriver
    const filter = {
      begin: begin_time,
      end: end_time,
      dateType: date_type,
      time_config_id: time_config_id,
    }
    return getCycleDateLimit(service_times, filter)
  }

  handleDateFilterChangeOnce = (value) => {
    if (value.dateType) {
      this.handleFilterChange('date_type', value.dateType)
    } else if (value.time_config_id) {
      this.handleFilterChange('time_config_id', value.time_config_id)
    } else if (value.begin && value.end) {
      this.handleFilterChange('begin_time', value.begin)
      this.handleFilterChange('end_time', value.end)
    }
  }

  getMaxSpanEnd = () => {
    const {
      date_type,
      service_times,
      time_config_id,
    } = this.props.distributeDriver

    const maxEndConfig = getMaxEndConfig(service_times)
    let maxSpanEnd = null

    if (date_type === searchDateTypes.CYCLE.type) {
      const currentServiceTime = _.find(
        service_times,
        (s) => s._id === time_config_id
      )
      maxSpanEnd =
        currentServiceTime && currentServiceTime.receive_time_limit.e_span_time
    } else if (
      date_type === searchDateTypes.RECEIVE.type ||
      date_type === searchDateTypes.ORDER.type
    ) {
      maxSpanEnd = maxEndConfig && maxEndConfig.receive_time_limit.e_span_time
    }
    return maxSpanEnd
  }

  disabledDates = (d, { begin, end }) => {
    const { date_type, begin_time, service_times } = this.props.distributeDriver

    const _begin = moment(begin).format('YYYY-MM-DD')
    const _initBegin = moment(begin_time).format('YYYY-MM-DD')
    const maxSpanEnd = this.getMaxSpanEnd()

    if (+moment(_begin) === +moment(_initBegin)) {
      const initMax = startDateRanger(date_type, maxSpanEnd, begin_time).max
      return !(+moment(d) <= +initMax)
    }

    const maxEndConfig = _.maxBy(
      service_times,
      (s) => s.receive_time_limit.e_span_time
    )
    const dMax = endDateRanger(
      date_type,
      maxEndConfig && maxEndConfig.receive_time_limit.e_span_time,
      begin
    ).max
    const dMin = moment(begin).subtract(30, 'd')

    return !(+moment(d) <= +dMax && +moment(d) >= +dMin)
  }

  justArrayObject = (list) => {
    const result = []
    list.map((item) =>
      result.push(
        Object.assign(
          {},
          {
            value: item.id,
            text: item.name,
          }
        )
      )
    )
    return result
  }

  render() {
    const {
      selected_carrier,
      date_type,
      begin_time,
      end_time,
      time_config_id,
      service_times,
      orderType,
    } = this.props.distributeDriver
    const { carrierList } = this.props.distributeOrder // 承运商列表
    const filter = {
      begin: begin_time,
      end: end_time,
      dateType: date_type,
      time_config_id: time_config_id,
    }
    const dateFilterDataTotal = {
      dateFilterData: [...dateFilterData],
      service_times: [...service_times],
    }
    const limitDates = [
      this.disabledDates,
      this.getCycleDateLimits,
      this.disabledDates,
    ]
    const carrierListData = this.justArrayObject(carrierList)
    const { isCStation } = globalStore.otherInfo

    return (
      <Box hasGap>
        <Form
          inline
          onSubmit={this.handleSearch}
          labelWidth='90px'
          colWidth='360px'
        >
          <FormBlock col={3}>
            <DateFilter
              data={dateFilterDataTotal}
              filter={filter}
              limitDates={limitDates}
              onDateFilterChange={this.handleDateFilterChangeOnce}
            />
            <FormItem label={i18next.t('承运商')}>
              <MoreSelect
                id='carrier_id'
                data={carrierListData}
                selected={selected_carrier}
                placeholder={i18next.t('全部承运商')}
                renderListFilter={doFilter}
                onSelect={this.handleSelectCarrier}
              />
            </FormItem>
            {!isCStation && (
              <FormItem label={i18next.t('订单类型')}>
                <OrderTypeSelector
                  orderType={orderType}
                  onChange={(value) =>
                    this.handleFilterChange('orderType', value)
                  }
                />
              </FormItem>
            )}
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
            </FormButton>
          </FormBlock>
        </Form>
      </Box>
    )
  }
}

SearchFilter.propTypes = {
  distributeDriver: PropTypes.object,
  distributeOrder: PropTypes.object,
  search: PropTypes.func,
}

export default connect((state) => ({
  distributeDriver: state.distributeDriver,
  distributeOrder: state.distributeOrder,
}))(SearchFilter)
