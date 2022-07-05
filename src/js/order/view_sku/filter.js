import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import {
  FormBlock,
  FormItem,
  Select,
  Option,
  FormButton,
  BoxForm,
  MoreSelect,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'
import { observer, Observer } from 'mobx-react'
import {
  COMPONENT_TYPE_SELECT,
  dateFilterData,
  filterStatusList,
  payStatusList,
  PRICE_TYPES,
  SKU_PACKAGE_STATUS,
  STATUS_OF_STOCK,
  RECEIVE_WAYS,
} from '../../common/enum'
import CategoryPinleiFilter from '../../common/components/category_filter_hoc'
import DateFilter from '../../common/components/date_range_filter'
import { disabledDate, getCycleDateLimit } from '../components/date_range_limit'
import OrderTypeSelector from '../../common/components/order_type_selector'
import { Customize } from '../../common/components/customize'
import globalStore from 'stores/global'

import store from './store'
import { parseCustomizeRadioList } from '../../common/util'

@observer
class ViewSkuFilter extends Component {
  handleFilter = (filter) => {
    store.filterChange(filter)
  }

  handleDateFilterChangeOnce = (value) => {
    if (value.dateType) {
      this.handleSelectChange('dateType', value.dateType)
    } else if (value.time_config_id) {
      this.handleSelectChange('time_config_id', value.time_config_id)
    } else if (value.begin && value.end) {
      this.handleDateChange(value.begin, value.end)
    }
  }

  handleSearch = (e) => {
    e.preventDefault()

    this.handleFilter({
      isAllSelected: false,
      sortType: '',
    })
    return store.doFirstRequest()
  }

  handleSelectChange(name, value) {
    this.handleFilter({ [name]: value })
  }

  handleFilterChange = (e) => {
    const name = e.target.name
    const isBatchRef = name === 'dateType' || name === 'time_config_id'
    if (isBatchRef) {
      this.handleFilter({
        batch_remark: '',
        batchRemarkList: [],
      })
    }
    this.handleFilter({ [e.target.name]: e.target.value })
  }

  handleChangeCategoryFilter = (data) => {
    this.handleFilter({ categoriesSelected: data })
  }

  handleSaleListSelect = (selected) => {
    this.handleFilter({ selected })
  }

  handleDateChange = (begin, end) => {
    store.filterChange({
      batch_remark: '',
      batchRemarkList: [],
    })
    if (moment(begin).isAfter(moment(end))) {
      end = begin
    }

    this.handleFilter({ begin: moment(begin), end: moment(end) })
  }

  handleTaskSelectClick = () => {
    // 获取分拣备注列表
    const { dateType, time_config_id, begin, end } = store.skus.filter
    let query = {}
    if (+dateType === 1) {
      query = {
        query_type: 1,
        start_date: moment(begin).format('YYYY-MM-DD'),
        end_date: moment(end).format('YYYY-MM-DD'),
      }
    } else if (+dateType === 2) {
      query = {
        query_type: 2,
        time_config_id,
        cycle_start_time: moment(begin).format('YYYY-MM-DD HH:mm'),
        cycle_end_time: moment(end).format('YYYY-MM-DD HH:mm'),
      }
    } else if (+dateType === 3) {
      query = {
        query_type: 3,
        receive_start_date: moment(begin).format('YYYY-MM-DD'),
        receive_end_date: moment(end).format('YYYY-MM-DD'),
      }
    }
    store.getBatchList(query).then(() => {
      const batchRemarkList = _.compact(store.batchRemarkList)
      this.handleFilter({ batchRemarkList })
    })
  }

  handleRouteSelect = (selected) => {
    this.handleFilter({
      route_id: selected ? selected.value : null,
      routeSelected: selected,
    })
  }

  disabledDates = (d, { begin, end }) => {
    const { skus } = store
    const { service_times, filter } = skus
    return disabledDate({ service_times, filter }, d, { begin, end })
  }

  getCycleDateLimits = () => {
    const { skus } = store
    const { service_times, filter } = skus
    return getCycleDateLimit(service_times, filter)
  }

  handleCustomizeInfoChange = (key, value) => {
    const customizedField = {
      ...store.skus.filter.customized_field,
      [key]: value,
    }
    this.handleFilter({ customized_field: customizedField })
  }

  handleCustomizeDetailChange = (key, value) => {
    const customizedField = {
      ...store.skus.filter.detail_customized_field,
      [key]: value,
    }
    this.handleFilter({ detail_customized_field: customizedField })
  }

  handleSelectPickUp = (selected) => {
    this.handleFilter({ pickUpSelected: selected })
  }

  handleReceive_way = (receive_way) => {
    this.handleSelectChange('receive_way', receive_way)
    if (receive_way === 1) {
      this.handleFilter({ pickUpSelected: null })
    }
  }

  render() {
    const { skus } = store
    const { routeList, filter, saleListFilter, pickUpList } = skus
    const {
      orderInput,
      categoriesSelected,
      batch_remark,
      is_weigh,
      weighted,
      pay_status,
      status,
      selected,
      batchRemarkList,
      receive_way,
      pickUpSelected,
      is_price_timing,
      routeSelected,
      sku_box_status,
      status_of_stock,
      orderType,
    } = filter
    const saleListFilter2 = [
      { text: i18next.t('全部报价单'), value: null },
      ...saleListFilter.slice(),
    ]
    const priceTypes = [
      { name: i18next.t('全部'), value: null },
      ...PRICE_TYPES,
    ]

    const limitDates = [
      this.disabledDates,
      this.getCycleDateLimits,
      this.disabledDates,
    ]
    // 缺货状态
    const statusOfStock = STATUS_OF_STOCK
    const detailConfigs = globalStore.customizedDetailConfigs.filter(
      (v) =>
        v.permission.read_station_order &&
        v.field_type === COMPONENT_TYPE_SELECT,
    )
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) =>
        v.permission.read_station_order &&
        v.field_type === COMPONENT_TYPE_SELECT,
    )

    const receiveWays = [
      { name: i18next.t('全部'), value: '' },
      ...RECEIVE_WAYS,
    ]
    return (
      <BoxForm
        onSubmit={this.handleSearch}
        labelWidth='100px'
        btnPosition='left'
        colWidth='385px'
      >
        <FormBlock col={3}>
          <Observer>
            {() => {
              const { skus } = store
              const { service_times, filter } = skus
              const { begin, end, dateType, time_config_id } = filter
              const dateFilerDataTotal = {
                dateFilterData: [...dateFilterData],
                service_times: [...service_times.slice()],
              }
              return (
                <DateFilter
                  data={dateFilerDataTotal}
                  filter={{ begin, end, dateType, time_config_id }}
                  onDateFilterChange={this.handleDateFilterChangeOnce}
                  limitDates={limitDates}
                  enabledTimeSelect
                />
              )
            }}
          </Observer>

          <FormItem label={i18next.t('搜索')}>
            <input
              name='orderInput'
              value={orderInput}
              onChange={this.handleFilterChange}
              className='form-control'
              placeholder={i18next.t(
                '输入商品信息，商户信息，订单号或[商品，商户]组合搜索',
              )}
            />
          </FormItem>
        </FormBlock>

        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem label={i18next.t('商品筛选')} col={2}>
              <CategoryPinleiFilter
                selected={categoriesSelected}
                onChange={this.handleChangeCategoryFilter}
              />
            </FormItem>
            <FormItem label={i18next.t('订单状态')}>
              <Select
                value={status}
                onChange={this.handleSelectChange.bind(this, 'status')}
                style={{ minWidth: '120px' }}
              >
                {_.map(filterStatusList, (s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('分拣备注')}>
              <Select
                name='batch_remark'
                value={batch_remark}
                onChange={this.handleSelectChange.bind(this, 'batch_remark')}
                onClick={this.handleTaskSelectClick}
              >
                <Option value=''>{i18next.t('全部分拣备注')}</Option>
                <Option value='batch_remark_is_null'>
                  {i18next.t('无分拣备注')}
                </Option>
                {_.map(batchRemarkList, (v) => (
                  <Option key={v} value={v}>
                    {v}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('计重类型')}>
              <Select
                name='is_weigh'
                value={is_weigh}
                onChange={this.handleSelectChange.bind(this, 'is_weigh')}
              >
                <Option value=''>{i18next.t('全部计重类型')}</Option>
                <Option value={1}>{i18next.t('计重任务')}</Option>
                <Option value={0}>{i18next.t('不计重任务')}</Option>
              </Select>
            </FormItem>
            <FormItem label={i18next.t('称重状态')}>
              <Select
                name='weighted'
                value={weighted}
                onChange={this.handleSelectChange.bind(this, 'weighted')}
              >
                <Option value=''>{i18next.t('全部称重状态')}</Option>
                <Option value={1}>{i18next.t('已称重')}</Option>
                <Option value={0}>{i18next.t('未称重')}</Option>
              </Select>
            </FormItem>
            <FormItem label={i18next.t('支付状态')}>
              <Select
                name='payStatus'
                value={pay_status}
                onChange={this.handleSelectChange.bind(this, 'pay_status')}
                style={{ minWidth: '120px' }}
              >
                {_.map(payStatusList, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('报价单')}>
              <MoreSelect
                id='salemenu_id'
                data={saleListFilter2}
                style={{ minWidth: '120px' }}
                selected={selected}
                onSelect={this.handleSaleListSelect}
                renderListFilterType='pinyin'
                placeholder={i18next.t('全部报价单')}
              />
            </FormItem>
            <FormItem label={i18next.t('线路筛选')}>
              <MoreSelect
                id='route'
                data={routeList.slice()}
                selected={routeSelected}
                onSelect={this.handleRouteSelect}
                renderListFilterType='pinyin'
                placeholder={i18next.t('全部线路')}
              />
            </FormItem>
            <FormItem label={i18next.t('价格类型')}>
              <Select
                value={is_price_timing}
                onChange={this.handleSelectChange.bind(this, 'is_price_timing')}
              >
                {_.map(priceTypes, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('装箱状态')}>
              <Select
                value={sku_box_status}
                onChange={this.handleSelectChange.bind(this, 'sku_box_status')}
              >
                {_.map(SKU_PACKAGE_STATUS, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('缺货状态')}>
              <Select
                name='status_of_stock'
                value={status_of_stock}
                onChange={this.handleSelectChange.bind(this, 'status_of_stock')}
              >
                {_.map(statusOfStock, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('订单类型')}>
              <OrderTypeSelector
                orderType={orderType}
                onChange={(value) =>
                  this.handleSelectChange('orderType', value)
                }
              />
            </FormItem>

            <FormItem label={i18next.t('收货方式')}>
              <Select value={receive_way} onChange={this.handleReceive_way}>
                {_.map(receiveWays, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>

            {receive_way !== 1 ? (
              <FormItem label={i18next.t('自提点')}>
                <MoreSelect
                  data={pickUpList.slice()}
                  selected={pickUpSelected}
                  onSelect={this.handleSelectPickUp}
                  renderListFilterType='pinyin'
                  placeholder={i18next.t('全部自提点')}
                />
              </FormItem>
            ) : null}
            {_.map(infoConfigs, (v) => {
              const radioList = parseCustomizeRadioList(v.radio_list)
              return (
                <FormItem label={v.field_name}>
                  <Observer>
                    {() => (
                      <Customize
                        type={v.field_type}
                        value={filter.customized_field[v.id]}
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
            {_.map(detailConfigs, (v) => {
              const radioList = parseCustomizeRadioList(v.radio_list)
              return (
                <FormItem label={v.field_name}>
                  <Observer>
                    {() => (
                      <Customize
                        type={v.field_type}
                        value={filter.detail_customized_field[v.id]}
                        onChange={this.handleCustomizeDetailChange.bind(
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
          <Button
            type='primary'
            htmlType='submit'
            onClick={this.handleSearch}
            loading={store.buttonDisabled}
          >
            {i18next.t('搜索')}
          </Button>
          <BoxForm.More>
            <div className='gm-gap-10' />
            <Button onClick={() => store.reset()}>{i18next.t('重置')}</Button>
          </BoxForm.More>
        </FormButton>
      </BoxForm>
    )
  }
}

export default ViewSkuFilter
