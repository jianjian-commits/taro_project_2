import React from 'react'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import { Observer, observer } from 'mobx-react'
import {
  BoxForm,
  Select,
  Option,
  FormItem,
  FormBlock,
  FormButton,
  FilterSelect,
  Tip,
  Cascader,
  Button,
} from '@gmfe/react'
import moment from 'moment'
import { toJS } from 'mobx'

import {
  INSPECT_STATUS_SKU,
  sortingStatusList,
  SORT_STATUS_ORDER,
  ORDER_PRINT_STATUS,
  COMPONENT_TYPE_SELECT,
} from '../../../common/enum'
import SoringRangeDatePicker from '../sorting_range_date_picker'
import { Customize } from 'common/components/customize'
import orderStore from './order_store'
import store from '../store'

import OrderTypeSelector from '../../../common/components/order_type_selector'

import globalStore from '../../../stores/global'
import { parseCustomizeRadioList } from '../../../common/util'

@observer
class SortingOrderFilter extends React.Component {
  componentDidMount() {
    orderStore.getRouteList()
    orderStore.getDriverList()
  }

  // 运营周期
  handleChangeTimeConfigId = (time_config_id) => {
    orderStore.setFilter('time_config_id', time_config_id)
  }

  // 选择日期
  handleChangeDate = (begin, end) => {
    if (moment(begin).add(31, 'd').isBefore(end)) {
      Tip.warning(i18next.t('时间范围不能超过一个月'))
      return
    }
    orderStore.setFilterDate(begin, end)
  }

  // 搜索框文本
  handleChangeSearchText = (e) => {
    orderStore.setFilter('search', e.target.value)
  }

  // 订单状态
  handleOrderStatusChange = (value) => {
    orderStore.setFilter('status', value)
  }

  // 分拣状态
  handleSortingStatusChange = (value) => {
    orderStore.setFilter('sort_status', value)
  }

  handleWithFilter = (list, query) => {
    return _.filter(list, (v) => v.name.indexOf(query) > -1)
  }

  // 线路筛选
  handleRouteSelect = (selected) => {
    orderStore.setFilter('routeSelected', selected)
  }

  handleDriverChange = (carrier_id_and_driver_id) => {
    orderStore.setFilter('carrier_id_and_driver_id', carrier_id_and_driver_id)
  }

  handleInspectStatusChange = (inspect_status) => {
    orderStore.setFilter('inspect_status', inspect_status)
  }

  handlePrintStatusChange = (print_status) => {
    orderStore.setFilter('print_status', print_status)
  }

  handleFilterChange = (name, value) => {
    orderStore.setFilter(name, value)
  }

  // 搜索
  handleSearch = () => {
    orderStore.pagination && orderStore.pagination.doFirstRequest()
  }

  handleCustomizeInfoChange = (key, value) => {
    const customizedField = {
      ...orderStore.orderFilter.customized_field,
      [key]: value,
    }
    this.handleFilterChange('customized_field', customizedField)
  }

  // 展开
  render() {
    const { serviceTime } = store
    const { carrierDriverList, routeList, orderFilter } = orderStore
    const {
      start_date,
      end_date,
      time_config_id,
      search,
      status,
      carrier_id_and_driver_id,
      routeSelected,
      inspect_status,
      sort_status,
      print_status,
      orderType,
      customized_field,
    } = orderFilter
    const { isCStation } = globalStore.otherInfo
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) =>
        v.permission.read_station_sorting &&
        v.field_type === COMPONENT_TYPE_SELECT,
    )
    return (
      <BoxForm
        labelWidth='90px'
        btnPosition='left'
        colWidth='350px'
        onSubmit={this.handleSearch}
      >
        <FormBlock col={3}>
          <FormItem col={2} label={i18next.t('按运营周期')}>
            <SoringRangeDatePicker
              begin={start_date}
              end={end_date}
              serviceTimes={serviceTime}
              timeConfigId={time_config_id}
              onChangeDate={this.handleChangeDate}
              onChangeTimeConfigId={this.handleChangeTimeConfigId}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              name='orderInput'
              value={search}
              onChange={this.handleChangeSearchText}
              className='form-control'
              placeholder={
                isCStation
                  ? i18next.t('输入订单号、客户名')
                  : i18next.t('输入订单号、商户名、商户ID')
              }
            />
          </FormItem>
        </FormBlock>
        <BoxForm.More>
          <FormBlock col={3}>
            {!isCStation && (
              <FormItem label={i18next.t('线路筛选')}>
                <div style={{ minWidth: '120px' }}>
                  <FilterSelect
                    id='route'
                    list={routeList.slice()}
                    selected={routeSelected}
                    withFilter={this.handleWithFilter}
                    onSelect={this.handleRouteSelect}
                    placeholder={i18next.t('搜索')}
                  />
                </div>
              </FormItem>
            )}
            <FormItem label={i18next.t('订单状态')}>
              <Select onChange={this.handleOrderStatusChange} value={status}>
                {_.map(sortingStatusList, (s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('分拣状态')}>
              <Select
                onChange={this.handleSortingStatusChange}
                value={sort_status}
              >
                {_.map(SORT_STATUS_ORDER, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('司机筛选')}>
              <Cascader
                filtrable
                name='carrier_id_and_driver_id'
                data={toJS(carrierDriverList)}
                onChange={this.handleDriverChange}
                value={carrier_id_and_driver_id.slice()}
                inputProps={{ placeholder: i18next.t('全部司机') }}
              />
            </FormItem>
            <FormItem label={i18next.t('验货状态')}>
              <Select
                value={inspect_status}
                onChange={this.handleInspectStatusChange}
                style={{ minWidth: '120px' }}
              >
                {_.map(INSPECT_STATUS_SKU, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('打印状态')}>
              <Select
                value={print_status}
                onChange={this.handlePrintStatusChange}
                style={{ minWidth: '120px' }}
              >
                {_.map(ORDER_PRINT_STATUS, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.text}
                  </Option>
                ))}
              </Select>
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
            {_.map(infoConfigs, (v) => {
              const radioList = parseCustomizeRadioList(v.radio_list)
              return (
                <FormItem label={v.field_name}>
                  <Observer>
                    {() => (
                      <Customize
                        type={v.field_type}
                        value={customized_field[v.id]}
                        onChange={this.handleCustomizeInfoChange.bind(
                          this,
                          v.id,
                        )}
                        data={radioList}
                      />
                    )}
                  </Observer>
                </FormItem>
              )
            })}
          </FormBlock>
        </BoxForm.More>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
          <BoxForm.More>
            <div className='gm-gap-10' />
            <Button onClick={() => orderStore.reset()}>
              {i18next.t('重置')}
            </Button>
          </BoxForm.More>
        </FormButton>
      </BoxForm>
    )
  }
}

export default SortingOrderFilter
