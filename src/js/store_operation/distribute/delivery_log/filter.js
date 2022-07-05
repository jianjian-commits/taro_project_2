import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  FormItem,
  FormBlock,
  FormButton,
  Cascader,
  MoreSelect,
  BoxForm,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import { observer, inject, Observer } from 'mobx-react'
import { toJS } from 'mobx'
import { dateFilterData } from '../../../common/enum'
import utils from '../util.js'
import moment from 'moment'
import DateFilter from '../../../common/components/date_range_filter'
import { getCycleDateLimit } from '../../../order/components/date_range_limit'

const { endDateRanger } = utils

@inject('store')
@observer
class SearchFilter extends React.Component {
  componentDidMount() {
    const { getRouteList, getDriverList, getServerTimes } = this.props.store
    getDriverList()
    getRouteList()
    getServerTimes()
  }

  handleSearch = () => {
    this.props.store.doFirstRequest()
  }

  handleExport = () => {
    this.props.store.exportExcel()
  }

  handleFilterChange = (e) => {
    const { value, name } = e.target
    this.props.store.setSearchFilter(name, value)
  }

  handleSetFilter(name, value) {
    this.props.store.setSearchFilter(name, value)
  }

  handleWithFilter = (list, query) => {
    return _.filter(list.children, (v) => {
      return v.name.indexOf(query) > -1
    })
  }

  handleDateFilterChangeOnce = (value) => {
    if (value.dateType) {
      this.handleSetFilter('query_type', value.dateType)
    } else if (value.time_config_id) {
      this.handleSetFilter('time_config_id', value.time_config_id)
    } else if (value.begin && value.end) {
      this.handleSetFilter('begin_time', value.begin)
      this.handleSetFilter('end_time', value.end)
    }
  }

  getCycleDateLimits = () => {
    const { filter, service_times } = this.props.store
    const filterData = {
      begin: filter.begin_time,
      end: filter.end_time,
      time_config_id: filter.time_config_id,
      dateType: filter.query_type,
    }
    return getCycleDateLimit(service_times, filterData)
  }

  disabledDates = (d, { begin, end }) => {
    const {
      filter: { query_type, begin_time },
      service_times,
    } = this.props.store

    const maxEndConfig = _.maxBy(
      service_times,
      (s) => s.receive_time_limit.e_span_time,
    )

    const dMax = endDateRanger(
      query_type,
      maxEndConfig && maxEndConfig.receive_time_limit.e_span_time,
      begin_time,
    ).max
    const dMin = moment(begin).subtract(30, 'd')

    if (+moment(begin) === +moment(begin_time)) {
      return !(+moment(d) <= +moment())
    }

    return !(+moment(d) <= +dMax && +moment(d) >= dMin)
  }

  renderCollapseFilter = () => {
    return (
      <Observer>
        {() => {
          const { routeList, carrierDriverList } = this.props.store
          const {
            selected_route,
            carrier_id_and_driver_id,
          } = this.props.store.filter
          return (
            <FormBlock inline col={3}>
              <FormItem label={i18next.t('线路筛选')}>
                <MoreSelect
                  id='route'
                  data={routeList.slice()}
                  selected={selected_route}
                  renderListFilterType='pinyin'
                  onSelect={this.handleSetFilter.bind(this, 'selected_route')}
                  placeholder={i18next.t('搜索')}
                />
              </FormItem>
              <FormItem label={i18next.t('司机筛选')}>
                <Cascader
                  filtrable
                  name='carrier_id_and_driver_id'
                  data={toJS(carrierDriverList)}
                  onChange={this.handleSetFilter.bind(
                    this,
                    'carrier_id_and_driver_id',
                  )}
                  value={carrier_id_and_driver_id}
                />
              </FormItem>
            </FormBlock>
          )
        }}
      </Observer>
    )
  }

  render() {
    const { search_text } = this.props.store.filter
    const { filter, service_times } = this.props.store
    const dateFilterDataTotal = {
      dateFilterData: [...dateFilterData],
      service_times: [...service_times.slice()],
    }
    const filterDatas = {
      begin: filter.begin_time,
      end: filter.end_time,
      time_config_id: filter.time_config_id,
      dateType: filter.query_type,
    }
    const limitDates = [
      this.disabledDates,
      this.getCycleDateLimits,
      this.disabledDates,
    ]

    return (
      <BoxForm
        btnPosition='left'
        labelWidth='100px'
        colWidth='360px'
        onSubmit={this.handleSearch}
      >
        <FormBlock inline col={3}>
          <DateFilter
            data={dateFilterDataTotal}
            filter={filterDatas}
            limitDates={limitDates}
            onDateFilterChange={this.handleDateFilterChangeOnce}
          />

          <FormItem label={i18next.t('搜索')}>
            <input
              type='text'
              name='search_text'
              className='form-control gm-inline-block'
              value={search_text}
              placeholder={i18next.t('请输入订单号，商户名')}
              onChange={this.handleFilterChange}
            />
          </FormItem>
        </FormBlock>
        <BoxForm.More>{this.renderCollapseFilter()}</BoxForm.More>
        <FormButton>
          <Button
            type='primary'
            htmlType='submit'
            className='gm-margin-right-10'
          >
            {i18next.t('搜索')}
          </Button>
          <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
        </FormButton>
      </BoxForm>
    )
  }
}

SearchFilter.propTypes = {
  store: PropTypes.object,
}
export default SearchFilter
