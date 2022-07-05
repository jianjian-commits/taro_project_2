import { i18next } from 'gm-i18n'
import React from 'react'
import { Box, Form, FormItem, FormButton, FormBlock, Button } from '@gmfe/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import moment from 'moment'

import DateFilter from '../../../common/components/date_range_filter'
import { getCycleDateLimit } from '../../../order/components/date_range_limit'
import OrderTypeSelector from '../../../common/components/order_type_selector'
import utils from '../util'
import { searchDateTypes, dateFilterData } from '../../../common/enum'
import LineTaskStore from './store'

import globalStore from 'stores/global'

const { endDateRanger, startDateRanger, getMaxEndConfig } = utils

@observer
class SearchFilter extends React.Component {
  handleFilterChange = (name, value) => {
    this.handleSelectChange(name, value)
  }

  handleSearch = () => {
    LineTaskStore.doFirstRequest()
  }

  handleSelectChange(name, value) {
    LineTaskStore.filterChange({ [name]: value })
  }

  handleDateFilterChangeOnce = (value) => {
    if (value.dateType) {
      this.handleSelectChange('dateType', value.dateType)
    } else if (value.time_config_id) {
      this.handleSelectChange('time_config_id', value.time_config_id)
    } else if (value.begin && value.end) {
      this.handleSelectChange('begin', value.begin)
      this.handleSelectChange('end', value.end)
    }
  }

  getCycleDateLimits = () => {
    const { filter, service_times } = LineTaskStore
    return getCycleDateLimit(service_times, filter)
  }

  getMaxSpanEnd = () => {
    const { filter, service_times } = LineTaskStore
    const { dateType, time_config_id } = filter

    let maxSpanEnd = null
    const maxEndConfig = getMaxEndConfig(service_times)

    if (dateType === searchDateTypes.CYCLE.type) {
      maxSpanEnd = _.find(service_times, (s) => s._id === time_config_id)
        .receive_time_limit.e_span_time
    } else if (
      dateType === searchDateTypes.RECEIVE.type ||
      dateType === searchDateTypes.ORDER.type
    ) {
      maxSpanEnd = maxEndConfig && maxEndConfig.receive_time_limit.e_span_time
    }
    return maxSpanEnd
  }

  disabledDates = (d, { begin, end }) => {
    const { filter, service_times } = LineTaskStore
    const { dateType: date_type, begin: start_date } = filter

    const _begin = moment(begin).format('YYYY-MM-DD')
    const _initBegin = moment(start_date).format('YYYY-MM-DD')
    const maxSpanEnd = this.getMaxSpanEnd()

    if (+moment(_begin) === +moment(_initBegin)) {
      const initMax = startDateRanger(date_type, maxSpanEnd, start_date).max
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

  render() {
    const { service_times, filter } = LineTaskStore
    const { q, orderType } = filter
    const dateFilterDataTotal = {
      dateFilterData: [...dateFilterData],
      service_times: [...service_times.slice()],
    }
    const limitDates = [
      this.disabledDates,
      this.getCycleDateLimits,
      this.disabledDates,
    ]
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
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                name='search_text'
                value={q}
                placeholder='输入线路名搜索'
                onChange={(e) => this.handleFilterChange('q', e.target.value)}
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

export default SearchFilter
