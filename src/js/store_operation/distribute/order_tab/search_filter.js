import { i18next } from 'gm-i18n'
import React from 'react'
import {
  FormItem,
  FormBlock,
  FormButton,
  Cascader,
  Select,
  MoreSelect,
  BoxForm,
  Button,
  Flex,
} from '@gmfe/react'
import _ from 'lodash'
import { connect } from 'react-redux'
import {
  searchDateTypes,
  filterStatusList,
  PRINT_STATUS,
  RECEIVE_WAYS,
  dateFilterData,
  ORDER_CLIENTS,
  COMPONENT_TYPE_SELECT,
} from '../../../common/enum'
import utils from '../util.js'
import './reducer.js'
import './actions.js'
import actions from '../../../actions'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Customize } from 'common/components/customize'
import DateFilter from '../../../common/components/date_range_filter'
import { getCycleDateLimit } from '../../../order/components/date_range_limit'
import OrderTypeSelector from '../../../common/components/order_type_selector'

import globalStore from 'stores/global'
import { parseCustomizeRadioList } from '../../../common/util'
const { endDateRanger, startDateRanger, getMaxEndConfig } = utils

class SearchFilter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      routeSelected: { value: '', text: i18next.t('全部线路') },
      searchTypeData: [
        { text: i18next.t('按订单号/商户名'), value: 1 },
        { text: i18next.t('按账户/公司名'), value: 2 },
        { text: i18next.t('按下单员'), value: 3 },
      ],
    }
    this.handleDriverChange = ::this.handleDriverChange
    this.handleSelectArea = ::this.handleSelectArea
    this.handleSearch = ::this.handleSearch
    this.handleFilterChange = ::this.handleFilterChange
  }

  handleFilterChange(field, value) {
    actions.distribute_order_filter_change({ [field]: value })
  }

  handleDriverChange(carrier_id_and_driver_id) {
    actions.distribute_order_select_carrier_and_driver(carrier_id_and_driver_id)
  }

  handleSelectArea(areaId) {
    actions.distribute_order_select_area(areaId)
  }

  handleSearch() {
    const { search } = this.props
    search()
  }

  handleCustomizeInfoChange(key, value) {
    const { customized_field } = this.props.distributeOrder
    const customizedField = {
      ...customized_field,
      [key]: value,
    }
    actions.distribute_order_filter_change({
      customized_field: customizedField,
    })
  }

  handleResetFilter = () => {
    this.setState({
      routeSelected: { value: '', text: i18next.t('全部线路') },
    })
    actions.distribute_order_reset_filter()
  }

  getCycleDateLimits = () => {
    const {
      begin_time,
      end_time,
      time_config_id,
      date_type,
      service_times,
    } = this.props.distributeOrder
    const filter = {
      begin: begin_time,
      end: end_time,
      time_config_id: time_config_id,
      dateType: date_type,
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
    } = this.props.distributeOrder

    let maxSpanEnd = null
    const maxEndConfig = getMaxEndConfig(service_times)

    if (date_type === searchDateTypes.CYCLE.type) {
      const currentServiceTime = _.find(
        service_times,
        (s) => s._id === time_config_id,
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
    const { date_type, begin_time, service_times } = this.props.distributeOrder

    const _begin = moment(begin).format('YYYY-MM-DD')
    const _initBegin = moment(begin_time).format('YYYY-MM-DD')
    const maxSpanEnd = this.getMaxSpanEnd()

    if (+moment(_begin) === +moment(_initBegin)) {
      const initMax = startDateRanger(date_type, maxSpanEnd, begin_time).max
      return !(+moment(d) <= +initMax)
    }

    const maxEndConfig = _.maxBy(
      service_times,
      (s) => s.receive_time_limit.e_span_time,
    )
    const dMax = endDateRanger(
      date_type,
      maxEndConfig && maxEndConfig.receive_time_limit.e_span_time,
      begin,
    ).max
    const dMin = moment(begin).subtract(30, 'd')

    return !(+moment(d) <= +dMax && +moment(d) >= +dMin)
  }

  handleWithFilter = (list, query) => {
    if (!query) {
      return list
    }

    return _.filter(list.children, (v) => {
      return v.text.indexOf(query) > -1
    })
  }

  handleRouteSelect = (selected) => {
    this.setState({
      routeSelected: selected,
    })
    actions.distribute_order_select_route(selected.value)
  }

  handleChangeSearchType = (selected) => {
    actions.distribute_order_change_search_type(selected)
  }

  handleChangeMerchantLabel = (selectedLabel) => {
    actions.distribute_order_change_label(selectedLabel)
  }

  renderCollapseFilter = () => {
    const {
      is_print,
      area_id,
      address,
      routeList,
      carrierDriverList,
      salemenus,
      carrier_id_and_driver_id,
      order_status,
      salemenu_id,
      pickUpList,
      pickUpSelected,
      receive_way,
      orderType,
      selectedLabel,
      labelList,
      customized_field,
    } = this.props.distributeOrder
    const carrierDriverList2 = carrierDriverList.slice()
    carrierDriverList2.unshift({ value: '-1', name: i18next.t('未分配') })
    const receiveWays = [
      { name: i18next.t('全部'), value: '' },
      ...RECEIVE_WAYS,
    ]

    const { isCStation } = globalStore.otherInfo
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) =>
        v.permission.read_station_delivery &&
        v.field_type === COMPONENT_TYPE_SELECT,
    )
    return (
      <FormBlock col={3}>
        <FormItem label={i18next.t('订单状态')}>
          <Select
            data={_.map(filterStatusList, ({ name, id }) => ({
              text: name,
              value: id,
            }))}
            onChange={this.handleFilterChange.bind(this, 'order_status')}
            value={order_status}
          />
        </FormItem>
        {!isCStation && (
          <FormItem label={i18next.t('线路筛选')}>
            <MoreSelect
              id='route'
              data={routeList}
              selected={this.state.routeSelected}
              // renderListFilter={this.handleWithFilter} // eslint-disable-line
              onSelect={this.handleRouteSelect}
              placeholder={i18next.t('搜索')}
              renderListFilterType='pinyin'
            />
          </FormItem>
        )}
        <FormItem label={i18next.t('司机筛选')}>
          <Cascader
            filtrable
            name='carrier_id_and_driver_id'
            data={carrierDriverList2}
            onChange={this.handleDriverChange}
            value={carrier_id_and_driver_id}
          />
        </FormItem>
        <FormItem label={i18next.t('地理标签')}>
          <Cascader
            filtrable
            name='area_id'
            data={address}
            value={area_id}
            onChange={this.handleSelectArea}
          />
        </FormItem>
        <FormItem label={i18next.t('打印状态')}>
          <Select
            onChange={this.handleFilterChange.bind(this, 'is_print')}
            value={is_print}
            data={_.map(PRINT_STATUS, (s) => ({
              text: s.name,
              value: s.value,
            }))}
          />
        </FormItem>
        <FormItem label={i18next.t('收货方式')}>
          <Select
            value={receive_way}
            onChange={this.handleFilterChange.bind(this, 'receive_way')}
            data={_.map(receiveWays, (s) => ({ text: s.name, value: s.value }))}
          />
        </FormItem>
        <FormItem label={i18next.t('自提点')}>
          <MoreSelect
            data={pickUpList}
            selected={pickUpSelected}
            onSelect={this.handleFilterChange.bind(this, 'pickUpSelected')}
            renderListFilterType='pinyin'
            placeholder={i18next.t('全部自提点')}
          />
        </FormItem>
        {!isCStation && (
          <FormItem label={i18next.t('报价单')}>
            <MoreSelect
              data={salemenus}
              selected={salemenu_id}
              onSelect={this.handleFilterChange.bind(this, 'salemenu_id')}
              renderListFilterType='pinyin'
              placeholder={i18next.t('全部报价单')}
            />
          </FormItem>
        )}
        {!isCStation && (
          <FormItem label={i18next.t('订单类型')}>
            <OrderTypeSelector
              orderType={orderType}
              onChange={(value) => this.handleFilterChange('orderType', value)}
            />
          </FormItem>
        )}
        <FormItem label={i18next.t('商户标签')}>
          <MoreSelect
            data={labelList}
            selected={selectedLabel}
            onSelect={this.handleChangeMerchantLabel}
            renderListFilterType='pinyin'
            placeholder={i18next.t('全部标签')}
          />
        </FormItem>
        {_.map(infoConfigs, (v) => {
          const radioList = parseCustomizeRadioList(v.radio_list)
          return (
            <FormItem label={v.field_name}>
              <Customize
                type={v.field_type}
                value={customized_field[v.id]}
                onChange={this.handleCustomizeInfoChange.bind(this, v.id)}
                data={radioList}
              />
            </FormItem>
          )
        })}
      </FormBlock>
    )
  }

  render() {
    const {
      date_type,
      begin_time,
      end_time,
      time_config_id,
      search_text,
      create_user,
      service_times,
      searchType,
      client,
      createUserList,
    } = this.props.distributeOrder
    const dateFilterDataTotal = {
      dateFilterData: [...dateFilterData],
      service_times: [...service_times.slice()],
    }

    const filter = {
      begin: begin_time,
      end: end_time,
      time_config_id: time_config_id,
      dateType: date_type,
    }

    const limitDates = [
      this.disabledDates,
      this.getCycleDateLimits,
      this.disabledDates,
    ]
    const { isCStation } = globalStore.otherInfo
    const { searchTypeData } = this.state

    return (
      <BoxForm
        labelWidth='100px'
        colWidth='360px'
        onSubmit={this.handleSearch}
        btnPosition='left'
      >
        <FormBlock col={3}>
          <DateFilter
            data={dateFilterDataTotal}
            filter={filter}
            limitDates={limitDates}
            onDateFilterChange={this.handleDateFilterChangeOnce}
          />
          <FormItem>
            <Flex>
              <Select
                style={{ minWidth: '100px' }}
                className='gm-inline-block'
                clean
                data={searchTypeData}
                value={searchType}
                onChange={(v) => this.handleChangeSearchType(v)}
              />
              <>
                {searchType === 3 ? (
                  <MoreSelect
                    id='orderInput'
                    data={createUserList || []}
                    style={{ width: '250px' }}
                    selected={create_user}
                    onSelect={(selected) => {
                      this.handleFilterChange('create_user', selected)
                    }}
                    renderListFilterType='pinyin'
                    placeholder={i18next.t('请选择下单员')}
                  />
                ) : (
                  <input
                    name='orderInput'
                    className='gm-inline-block form-control gm-flex-flex'
                    style={{ width: '250px' }}
                    value={search_text}
                    onChange={(e) =>
                      this.handleFilterChange('search_text', e.target.value)
                    }
                    placeholder={
                      searchType === 1
                        ? isCStation
                          ? i18next.t('请输入订单号，客户名')
                          : i18next.t('请输入订单号，商户名')
                        : i18next.t('请输入账户，公司名')
                    }
                  />
                )}
              </>
            </Flex>
          </FormItem>
          <FormItem label={i18next.t('订单来源')}>
            <Select
              value={client}
              onChange={this.handleFilterChange.bind(this, 'client')}
              data={_.map(
                [{ name: i18next.t('全部'), value: null }, ...ORDER_CLIENTS],
                (s) => ({
                  text: s.name,
                  value: s.value,
                }),
              )}
            />
          </FormItem>
        </FormBlock>
        <BoxForm.More>{this.renderCollapseFilter()} </BoxForm.More>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <BoxForm.More>
            <Button onClick={this.handleResetFilter}>
              {i18next.t('重置')}
            </Button>
          </BoxForm.More>
        </FormButton>
      </BoxForm>
    )
  }
}

SearchFilter.propTypes = {
  distributeOrder: PropTypes.object,
  search: PropTypes.func,
}

export default connect((state) => ({
  distributeOrder: state.distributeOrder,
}))(SearchFilter)
