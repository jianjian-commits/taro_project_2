import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import {
  FormBlock,
  FormItem,
  Select,
  Option,
  FormButton,
  Cascader,
  RightSideModal,
  MoreSelect,
  BoxForm,
  DropDown,
  DropDownItems,
  DropDownItem,
  Modal,
  Storage,
  Button,
  Flex,
} from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'
import { toJS } from 'mobx'
import { observer, Observer } from 'mobx-react'
import {
  dateFilterData,
  filterStatusList,
  payStatusList,
  PRINT_STATUS,
  REMARK_STATUS,
  INSPECT_STATUS,
  ORDER_CLIENTS,
  OUT_STOCK_STATUS,
  RECEIVE_WAYS,
  ORDER_SEARCH_TYPE,
  ORDER_BOX_STATUS,
  COMPONENT_TYPE_SELECT,
} from '../../common/enum'
import { transformPostArea } from '../util'
import { getExportInfo, getRequestField } from '../../common/diy_export_key'
import AreaSelect from '../../common/components/area_select'
import TextTip from '../../common/components/text_tip'
import DiyTabModal from '../../common/components/diy_tab_modal'
import TaskList from '../../task/task_list'
import store from './store'

import DateFilter from '../../common/components/date_range_filter'
import { disabledDate, getCycleDateLimit } from '../components/date_range_limit'
import OrderTypeSelector from '../../common/components/order_type_selector'
import { Customize } from '../../common/components/customize'
import globalStore from 'stores/global'
import { parseCustomizeRadioList } from '../../common/util'
import SearchTypeFilter from '../components/view_order_filter'

const More = BoxForm.More
const searchText = [
  '',
  i18next.t('输入订单号、商户信息搜索'),
  i18next.t('输入订单号搜索'),
  i18next.t('输入商户信息搜索'),
  i18next.t('输入订单备注信息搜索'),
]

const exportHash = 'v1'
@observer
class ViewOrderFilter extends Component {
  constructor(props) {
    super()
  }

  componentDidMount() {
    store.getUserList()
  }

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
    this.handleFilter({ sortType: '' })
    store.doFirstRequest()
  }

  handleSelectChange(name, value) {
    if (name === 'searchType') {
      value === 5
        ? this.handleFilter({ orderInput: null })
        : this.handleFilter({ create_user_id: null })
    }
    this.handleFilter({ [name]: value })
  }

  handleCitySelect = (citySelected) => {
    this.handleFilter({
      search_area: transformPostArea(citySelected),
    })
  }

  handleSaleListSelect = (selected) => {
    this.handleFilter({ selected })
  }

  handleDriverChange = (carrier_id_and_driver_id) => {
    store.driverSelect(carrier_id_and_driver_id)
  }

  handleDateChange = (begin, end) => {
    if (moment(begin).isAfter(moment(end))) {
      end = begin
    }
    this.handleFilter({ begin, end })
  }

  handleExport = () => {
    const params = store.searchData
    !this.props?.type && store.doFirstRequest()
    this.orderListExport(params)
  }

  handleExportYongYou = () => {
    const params = store.searchData
    !this.props?.type && store.doFirstRequest()
    this.orderListExport(Object.assign(params, { format: 'yongyou' }))
  }

  orderListExport(data) {
    // 订单商品导出自定义
    if (data.format !== 'yongyou') {
      const tempOrders = getRequestField('order', false, exportHash)
      const tempProducts = getRequestField('spu', false, exportHash)
      const customizedField = []
      const detailCustomizedField = []
      const orders = []
      const products = []
      _.forEach(tempOrders, (v) => {
        const s = v.split('.')
        if (s.length === 2 && s[0] === 'customized_field') {
          customizedField.push(s[1])
        } else {
          orders.push(v)
        }
      })
      _.forEach(tempProducts, (v) => {
        const s = v.split('.')
        if (s.length === 2 && s[0] === 'detail_customized_field') {
          detailCustomizedField.push(s[1])
        } else {
          products.push(v)
        }
      })

      Object.assign(data, {
        export_fields: JSON.stringify({
          orders: orders,
          products: products,
          customized_field: customizedField.length
            ? customizedField
            : undefined,
          detail_customized_field: detailCustomizedField.length
            ? detailCustomizedField
            : undefined,
        }),
      })
    }

    // 导出都走异步形式
    store.orderListExport(data).then((res) => {
      if (res.data && res.data.async === 1) {
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      }
    })
  }

  handleRouteSelect = (selected) => {
    this.handleFilter({
      routeSelected: selected,
      route_id: selected ? selected.value : null,
    })
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

  disabledDates = (d, { begin, end }) => {
    const dealy = this.props?.type === 'history' ? 'history' : ''
    const { orders } = store
    const { service_times, filter } = orders
    return disabledDate({ service_times, filter }, d, { begin, end }, dealy)
  }

  getCycleDateLimits = () => {
    const dealy = this.props?.type === 'history' ? 'history' : ''
    const { orders } = store
    const { service_times, filter } = orders
    return getCycleDateLimit(service_times, filter, dealy)
  }

  handleShowSetModal = () => {
    const exportInfo = getExportInfo('order&&spu')
    const exportTabTitle = [i18next.t('订单明细'), i18next.t('商品明细')]

    Modal.render({
      disableMaskClose: true,
      title: i18next.t('导出设置'),
      noContentPadding: true,
      size: 'lg',
      onHide: Modal.hide,
      children: (
        <DiyTabModal
          exportInfo={exportInfo}
          tabTitle={exportTabTitle}
          onSave={this.handleColumnsSave}
          hash={exportHash}
        />
      ),
    })
  }

  handleColumnsSave = (newColumns) => {
    console.log('newColumns:', newColumns)
    _.each(newColumns, (item, key) => {
      Storage.set(key + exportHash, newColumns[key])
    })
  }

  handleCustomizeInfoChange = (key, value) => {
    const customizedField = {
      ...store.orders.filter.customized_field,
      [key]: value,
    }
    this.handleFilter({ customized_field: customizedField })
  }

  render() {
    const {
      orders,
      carrierDriverList,
      carrier_id_and_driver_id,
      merchantLabels,
      handleChangeLabel,
    } = store
    const { filter, routeList, pickUpList, saleListFilter } = orders
    const {
      orderStatus,
      orderInput,
      payStatus,
      selected,
      is_print,
      has_remark,
      is_inspect,
      order_client,
      stockType,
      receive_way,
      pickUpSelected,
      routeSelected,
      searchType,
      order_box_status,
      orderType,
      selectedLabel,
      create_user_id,
    } = filter

    const carrierDriverList2 = toJS(carrierDriverList)
    const saleListFilter2 = [
      { text: i18next.t('全部报价单'), value: null },
      ...saleListFilter.slice(),
    ]
    const orderClients = [
      { name: i18next.t('全部来源'), value: null },
      ...ORDER_CLIENTS,
    ]
    const outStockStatus = [
      { name: i18next.t('全部状态'), value: null },
      ...OUT_STOCK_STATUS,
    ]
    const receiveWays = [
      { name: i18next.t('全部'), value: '' },
      ...RECEIVE_WAYS,
    ]

    const limitDates = [
      this.disabledDates,
      this.getCycleDateLimits,
      this.disabledDates,
    ]
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) =>
        v.permission.read_station_order &&
        v.field_type === COMPONENT_TYPE_SELECT,
    )

    return (
      <BoxForm
        btnPosition='left'
        labelWidth='100px'
        colWidth='385px'
        onSubmit={this.handleSearch}
      >
        <FormBlock col={3}>
          <Observer>
            {() => {
              const {
                begin,
                end,
                dateType,
                time_config_id,
              } = store.orders.filter
              const service_times = store.orders.service_times
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
          <FormItem>
            <Flex>
              <Select
                clean
                style={{ minWidth: '100px' }}
                className='gm-inline-block'
                data={ORDER_SEARCH_TYPE}
                value={searchType}
                onChange={this.handleSelectChange.bind(this, 'searchType')}
              />
              <SearchTypeFilter
                searchType={searchType}
                searchText={searchText}
                selected={create_user_id}
                value={searchType === 5 ? store.userInfo : orderInput}
                onDataChange={this.handleSelectChange.bind(this)}
              />
            </Flex>
          </FormItem>
        </FormBlock>

        <More>
          <FormBlock col={3}>
            <FormItem label={i18next.t('订单状态')}>
              <Select
                name='orderStatus'
                style={{ minWidth: '120px' }}
                value={orderStatus}
                onChange={this.handleSelectChange.bind(this, 'orderStatus')}
              >
                {_.map(filterStatusList, (s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('支付状态')}>
              <Select
                name='payStatus'
                value={payStatus}
                style={{ minWidth: '120px' }}
                onChange={this.handleSelectChange.bind(this, 'payStatus')}
              >
                {_.map(payStatusList, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('地理标签')}>
              <AreaSelect onSelect={this.handleCitySelect} />
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
            <FormItem label={i18next.t('司机筛选')}>
              <Cascader
                filtrable
                name='carrier_id_and_driver_id'
                data={carrierDriverList2}
                onChange={this.handleDriverChange}
                inputProps={{ placeholder: i18next.t('全部司机') }}
                value={carrier_id_and_driver_id.slice()}
              />
            </FormItem>
            <FormItem label={i18next.t('打印状态')}>
              <Select
                value={is_print}
                onChange={this.handleSelectChange.bind(this, 'is_print')}
              >
                {_.map(PRINT_STATUS, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('装车状态')}>
              <Select
                value={is_inspect}
                onChange={this.handleSelectChange.bind(this, 'is_inspect')}
              >
                {_.map(INSPECT_STATUS, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('订单来源')}>
              <Select
                value={order_client}
                onChange={this.handleSelectChange.bind(this, 'order_client')}
              >
                {_.map(orderClients, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('出库状态')}>
              <Select
                value={stockType}
                onChange={this.handleSelectChange.bind(this, 'stockType')}
              >
                {_.map(outStockStatus, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('订单备注')}>
              <Select
                value={has_remark}
                onChange={this.handleSelectChange.bind(this, 'has_remark')}
              >
                {_.map(REMARK_STATUS, (s) => (
                  <Option key={s.value} value={s.value}>
                    {s.name}
                  </Option>
                ))}
              </Select>
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
            <FormItem label={i18next.t('集包状态')}>
              <Select
                value={order_box_status}
                onChange={this.handleSelectChange.bind(
                  this,
                  'order_box_status',
                )}
              >
                {_.map(ORDER_BOX_STATUS, (s) => (
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
            <FormItem label={i18next.t('订单类型')}>
              <OrderTypeSelector
                orderType={orderType}
                onChange={(value) =>
                  this.handleSelectChange('orderType', value)
                }
              />
            </FormItem>
            <FormItem label={i18next.t('商户标签')}>
              <MoreSelect
                data={merchantLabels.slice()}
                selected={selectedLabel}
                onSelect={handleChangeLabel}
                renderListFilterType='pinyin'
                placeholder={i18next.t('全部标签')}
              />
            </FormItem>
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
          </FormBlock>
        </More>

        <FormButton>
          {!this.props?.type && (
            <Button
              type='primary'
              htmlType='submit'
              onClick={this.handleSearch}
              loading={store.buttonDisabled}
            >
              {i18next.t('搜索')}
            </Button>
          )}

          <BoxForm.More>
            <div className='gm-gap-10' />
            <Button onClick={() => store.reset()}>{i18next.t('重置')}</Button>
          </BoxForm.More>
          <div className='gm-gap-10' />
          <DropDown
            split
            popup={
              <DropDownItems>
                <DropDownItem
                  className='b-order-export'
                  onClick={this.handleExportYongYou}
                >
                  {i18next.t('导出(用友格式)')}
                </DropDownItem>
              </DropDownItems>
            }
          >
            <TextTip
              content={
                <>
                  <a className='gm-cursor' onClick={this.handleShowSetModal}>
                    {i18next.t('点此设置')}
                  </a>
                  ，{i18next.t('自定义导出字段')}
                </>
              }
            >
              <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
            </TextTip>
          </DropDown>
        </FormButton>
      </BoxForm>
    )
  }
}

export default ViewOrderFilter
