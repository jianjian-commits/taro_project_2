import { i18next } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import moment from 'moment'
import { observer } from 'mobx-react'
import qs from 'query-string'
import Big from 'big.js'
import {
  Popover,
  ToolTip,
  Price,
  BoxTable,
  Select,
  Option,
  Flex,
} from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import {
  TableX,
  selectTableXHOC,
  diyTableXHOC,
  TableXUtil,
  fixedColumnsTableXHOC,
} from '@gmfe/table-x'

import {
  orderState,
  convertNumber2Sid,
  cycleDateRangePickerInputValue,
  payState,
  findReceiveWayById,
  orderPackageStatus,
} from '../../common/filter'
import { isOld, getCurrentSortType } from '../util'

import {
  changeDomainName,
  copywriterByTaxRate,
  gioTrackEvent,
  history,
} from '../../common/service'
import {
  searchDateTypes,
  dateFilterData,
  editStatusArr,
  OUT_STOCK_STATUS,
  COMPONENT_TYPE_TEXT,
} from '../../common/enum'
import {
  renderOrderTypeName,
  getOrderTypeId,
} from '../../common/deal_order_process'
import TableListTips from '../../common/components/table_list_tips'
import { getFiledData } from 'common/components/customize'
import Tag from 'common/components/tag'

import BatchImportDialog from '../batch/import_dialog'
import ViewOrderFilter from './filter'
import SAction from './sheet_action'
import BoxAction from './box_action'
import StateContainer from '../components/state_container'

import globalStore from '../../stores/global'
import store from './store'

// 暂时应用于移动端，后续废弃
import BatchImportDialogOld from '../order_detail_old/import_batch_old'
import TableTotalText from 'common/components/table_total_text'

const SelectTableX = selectTableXHOC(
  diyTableXHOC(fixedColumnsTableXHOC(TableX)),
)

@observer
class OrderListView extends React.Component {
  constructor() {
    super()
    this.state = {
      uploadShow: false,
    }
    this.selectRef = React.createRef(null)
    this.selectionRef = React.createRef(null)
    this.refPagination = React.createRef(null)
  }

  componentDidMount() {
    // 首页跳转过来带参数搜索
    const { state } = this.props.location
    state && this.handleInitQuery(state)

    store.getPickUpList() // 自提点
    store.fetchStationServiceTime().then(() => {
      // 需要运营时间返回 因为可能是按运营周期搜索
      store.setDoFirstRequest(this.refPagination.current.apiDoFirstRequest)
      this.refPagination.current.apiDoFirstRequest()
    })
    store.getRouteList()
    store.getStatusServiceTime().then((json) => {
      if (json.data && json.data.length > 0) {
        const defaultTimeId = json.data[0]._id
        store.getStatusTaskCycle(defaultTimeId)
      }
    })
    // 报价单
    store.getSaleList()
    // 司机
    store.getDriverList()
    // 商户标签
    store.getMerchantLabels()
  }

  componentWillUnmount() {
    store.resetAll()
  }

  handleInitQuery(query) {
    store.reset()
    for (const key in query) {
      store.filterChange({
        [key]: query[key],
      })
    }
  }

  handleSelect = (selected) => {
    store.orderSelect(selected)
  }

  handleOrderAbnormal(id) {
    // 跳转到MA的异常订单 详情页
    window.open(
      `${changeDomainName(
        'station',
        'manage',
      )}/#/order_manage/order/pl_order/${id}`,
    )
  }

  handlePage = (page) => {
    const { sortType, orderType } = store.orders.filter
    let searchData = Object.assign({}, store.searchData, {
      sort_type: sortType === '' ? null : sortType,
    })

    const order_process_type_id = getOrderTypeId(orderType)
    if (order_process_type_id !== null) {
      searchData = {
        ...searchData,
        order_process_type_id,
      }
    }
    return store.orderListSearch(searchData, page, this.props?.type)
  }

  handleSingleOrderStatusChange(index, value) {
    store.orderSingleStatusChange(index, value)
  }

  isOrderDisabled = (order) => {
    return order.status === 15
  }

  handleOrderUploadToggle = () => {
    if (!this.state.uploadShow) {
      gioTrackEvent('station_order_list_batch', 1, {})
    }
    this.setState({
      uploadShow: !this.state.uploadShow,
    })
  }

  filterZero = (obj = {}) => {
    if (!(obj instanceof Object)) return {}
    Object.keys(obj)?.length > 0 &&
      Object.keys(obj).forEach((item) => {
        obj?.[item] === 0 && delete obj?.[item]
      })
    return obj
  }

  handleEditOldOrder = () => {
    gioTrackEvent('order_make_up')
    history.push('/order_manage/order/repair/create?repair=true')
  }

  handleGetHistoryData = (e) => {
    e.preventDefault()
    window.open('#/order_manage/order/list/history')
  }

  handleSortClick(name) {
    const { sortType } = store.orders.filter
    let sortTypeName = ''

    if (sortType) {
      const isDesc = sortType.indexOf('_desc') > -1
      const isCurrentName = sortType.indexOf(name) > -1

      if (isCurrentName) {
        sortTypeName = isDesc ? name + '_asc' : ''
      } else {
        sortTypeName = name + '_desc'
      }
    } else {
      sortTypeName = name + '_desc'
    }
    store.filterChange({
      sortType: sortTypeName,
    })
    this.refPagination.current.apiDoFirstRequest()
  }

  apiDoSelectFocus = () => {
    this.selectionRef.current.scrollIntoView({
      behavior: 'instant',
      inline: 'center',
      block: 'nearest',
    })
    this.selectRef.current.apiDoFocus()
  }

  render() {
    const {
      orders,
      selectedOrders: { selected },
    } = store
    const {
      filter,
      service_times,
      in_query,
      total_sale_money_with_freight_dict,
      total_outstock_price_dict,
      // total_sale_money_without_tax_dict,
      total_sale_money_with_freight_tax_dict,
    } = orders
    const outstock_dict = this.filterZero(total_outstock_price_dict)
    const sale_money_with_freight_tax = this.filterZero(
      total_sale_money_with_freight_tax_dict,
    )
    const { dateType, in_query_search_text, sortType } = filter
    const dateTypeName = _.find(
      dateFilterData,
      (t) => t.type === dateType,
    ).name.slice(-4)
    // date 分为按下单日期、按运营周期、按收货日期，后台判断下单日期和运营日期排序一样，但收货日期需要特殊区分
    const dateName = dateType === '3' ? 'receive_begin_time' : 'date'
    const isBatchOrderEditable = globalStore.hasPermission('add_batchorders')
    const list = orders.list.slice()
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) => v.permission.read_station_order,
    )

    return (
      <div className='b-order-sort-table-wrap gm-table-auto-scroll'>
        <ViewOrderFilter type={this.props?.type || ''} />

        {in_query && (
          <TableListTips
            tips={[
              in_query_search_text +
                i18next.t('不在筛选条件中，已在全部订单中为您找到'),
            ]}
          />
        )}
        {!this.props?.type && (
          <BoxTable
            info={
              <>
                <BoxTable.Info>
                  <TableTotalText
                    data={[
                      {
                        label: i18next.t('订单总数'),
                        content: orders.pagination.count,
                      },
                      {
                        label: i18next.t('下单金额'),
                        content: _.join(
                          _.map(total_sale_money_with_freight_dict, (v, i) =>
                            !v ? null : Price.getCurrency(i) + v,
                          ),
                          ', ',
                        ),
                      },

                      {
                        label: i18next.t('出库金额'),
                        content: _.join(
                          _.map(
                            outstock_dict,
                            (v, i) => Price.getCurrency(i) + v,
                          ),
                          ', ',
                        ),
                      },
                      {
                        label: i18next.t('销售额(含运、税)'),
                        content: _.join(
                          _.map(
                            sale_money_with_freight_tax,
                            (v, i) => Price.getCurrency(i) + v,
                          ),
                          ', ',
                        ),
                      },
                    ]}
                  />
                </BoxTable.Info>
                {!store.type && (
                  <BoxTable.Info>
                    <a
                      onClick={this.handleGetHistoryData}
                      className='gm-margin-left-20 gm-cursor gm-text-14'
                    >
                      {i18next.t('历史数据')}
                    </a>
                  </BoxTable.Info>
                )}
              </>
            }
            action={
              <BoxAction
                orders={orders}
                selectedIds={selected.slice()}
                onOrderUploadToggle={this.handleOrderUploadToggle}
              />
            }
          >
            <ManagePagination
              onRequest={this.handlePage}
              ref={this.refPagination}
              id='pagination_in_view_order'
            >
              <SelectTableX
                id='order_select'
                data={list}
                keyField='id'
                diyGroupSorting={[i18next.t('基础字段')]}
                loading={orders.loading}
                fixedSelect
                selected={selected.slice()}
                onSelect={this.handleSelect}
                isSelectorDisable={this.isOrderDisabled}
                columns={[
                  {
                    Header: i18next.t('订单号'),
                    accessor: 'id',
                    width: 150,
                    diyEnable: false,
                    fixed: 'left',
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original, index } }) => {
                      // const isAbnorma = isAbnormalOrder(original)
                      const isAbnorma =
                        !_.isEmpty(original.abnormals) ||
                        !Big(original.refund_kind || 0).eq(0)
                      const noPay = original.pay_status === 5
                      const hasTip = isAbnorma || noPay

                      return (
                        <div style={{ width: '150px' }}>
                          {original.has_present_sku ? (
                            <div>
                              <Tag color='#FF6100' round>
                                {i18next.t('有赠品')}
                              </Tag>
                            </div>
                          ) : null}
                          <a
                            href={`#/order_manage/order/list/detail?${qs.stringify(
                              {
                                id: original.id,
                                offset: orders.pagination.offset + index,
                                search: qs.stringify({
                                  ...store.searchData,
                                  sort_type: sortType === '' ? null : sortType,
                                }),
                              },
                            )}`}
                            style={{ textDecoration: 'underline' }}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            {original.id}
                          </a>
                          {hasTip ? (
                            <Popover
                              showArrow
                              type='hover'
                              left
                              bottom
                              style={{
                                marginLeft: '-3px',
                                marginTop: '3px',
                                fontSize: '12px',
                              }}
                              popup={
                                <div>
                                  {isAbnorma ? (
                                    <div
                                      style={{ minWidth: '130px' }}
                                      className='gm-padding-10 gm-bg'
                                    >
                                      {/* 只有一条时，没有序号 */}
                                      {noPay ? '1.' : ''}
                                      {i18next.t('该订单存在售后异常')}
                                    </div>
                                  ) : null}
                                  {noPay ? (
                                    <div
                                      style={{ minWidth: '130px' }}
                                      className='gm-padding-10 gm-bg'
                                    >
                                      {/* 只有一条时，没有序号 */}
                                      {isAbnorma ? '2.' : ''}
                                      {i18next.t('该订单未完成支付')}
                                    </div>
                                  ) : null}
                                </div>
                              }
                            >
                              <span
                                onClick={this.handleOrderAbnormal.bind(
                                  this,
                                  original.id,
                                )}
                                style={{ cursor: 'pointer' }}
                              >
                                <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
                              </span>
                            </Popover>
                          ) : null}
                        </div>
                      )
                    },
                  },
                  {
                    Header: (
                      <div>
                        {dateTypeName}
                        <TableXUtil.SortHeader
                          onClick={this.handleSortClick.bind(this, dateName)}
                          type={getCurrentSortType(sortType, dateName)}
                        />
                      </div>
                    ),
                    accessor: 'date_time_str',
                    minWidth: 160,
                    diyItemText: dateTypeName,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original: order } }) => {
                      if (dateType === searchDateTypes.CYCLE.type) {
                        const date =
                          order.time_config_info.type !== 2
                            ? order.date_time_str
                            : order.receive_begin_time
                        return cycleDateRangePickerInputValue(
                          date,
                          order.time_config_info,
                        )
                      } else if (dateType === searchDateTypes.RECEIVE.type) {
                        return moment(order.receive_begin_time).format(
                          'YYYY-MM-DD',
                        )
                      } else {
                        return moment(order.date_time_str).format(
                          'YYYY-MM-DD HH:mm:ss',
                        )
                      }
                    },
                  },
                  {
                    Header: i18next.t('线路'),
                    accessor: 'route_name',
                    minWidth: 90,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: (
                      <div>
                        {i18next.t('商户名/ID')}
                        <TableXUtil.SortHeader
                          onClick={this.handleSortClick.bind(this, 'addr')}
                          type={getCurrentSortType(sortType, 'addr')}
                        />
                      </div>
                    ),
                    diyItemText: i18next.t('商户名/ID'),
                    accessor: 'customer',
                    minWidth: 160,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original: order } }) => {
                      return (
                        <div>
                          {order.customer.extender.resname}
                          <span className='b-sheet-item-disable'>
                            {convertNumber2Sid(order.customer.address_id)}
                          </span>
                        </div>
                      )
                    },
                  },
                  {
                    Header: i18next.t('商户标签'),
                    accessor: 'address_label',
                    diyEnable: false,
                    minWidth: 120,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original: order } }) => {
                      return <div>{order.customer.address_label || '-'}</div>
                    },
                  },
                  {
                    Header: i18next.t('收货方式'),
                    accessor: 'receive_way',
                    minWidth: 70,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original: order } }) => {
                      return (
                        findReceiveWayById(order.customer.receive_way) || '-'
                      )
                    },
                  },
                  {
                    Header: i18next.t('自提点'),
                    accessor: 'pick_up_st_name',
                    minWidth: 100,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original: order } }) => {
                      return order.customer.pick_up_st_name || '-'
                    },
                  },
                  {
                    Header: i18next.t('订单类型'),
                    accessor: 'order_process_name',
                    minWidth: 100,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) => {
                      return (
                        <div>
                          {renderOrderTypeName(original.order_process_name)}
                        </div>
                      )
                    },
                  },
                  {
                    Header: i18next.t('下单原价'),
                    accessor: 'origin_total_price',
                    minWidth: 80,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.origin_total_price +
                      Price.getUnit(original.fee_type),
                  },
                  {
                    Header: i18next.t('总下单数'),
                    accessor: 'number_of_sku',
                    minWidth: 80,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('商品种类数'),
                    accessor: 'kind_of_sku',
                    minWidth: 80,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('商户自定义编码'),
                    accessor: 'res_custom_code',
                    minWidth: 80,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original: order } }) => {
                      return order.customer.extender.res_custom_code || '-'
                    },
                  },
                  {
                    Header: (
                      <div>
                        <div className='gm-inline-block'>
                          {i18next.t('下单金额')}
                        </div>
                        <TableXUtil.SortHeader
                          onClick={this.handleSortClick.bind(this, 'price')}
                          type={getCurrentSortType(sortType, 'price')}
                        />
                      </div>
                    ),
                    accessor: 'total_price',
                    minWidth: 85,
                    diyItemText: i18next.t('下单金额'),
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.total_price + Price.getUnit(original.fee_type),
                  },
                  {
                    Header: i18next.t('优惠金额'),
                    accessor: 'coupon_amount',
                    minWidth: 70,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) => (
                      <div>
                        {original.coupon_amount === '0.00'
                          ? '0.00'
                          : original.coupon_amount}
                        {Price.getUnit(original.fee_type)}
                      </div>
                    ),
                  },
                  {
                    Header: i18next.t('出库金额'),
                    accessor: 'real_money',
                    minWidth: 70,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.real_money + Price.getUnit(original.fee_type),
                  },
                  globalStore.isHuaKang() && {
                    Header: i18next.t('验货金额'),
                    accessor: 'total_actual_price',
                    minWidth: 90,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.total_actual_price +
                      Price.getUnit(original.fee_type),
                  },
                  globalStore.isHuaKang() && {
                    Header: i18next.t('售后出库金额'),
                    accessor: 'total_after_sale_outstock_price',
                    minWidth: 90,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.total_after_sale_outstock_price +
                      Price.getUnit(original.fee_type),
                  },
                  globalStore.isHuaKang() && {
                    Header: i18next.t('自采金额'),
                    accessor: 'total_self_acquisition_price',
                    minWidth: 90,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.total_self_acquisition_price +
                      Price.getUnit(original.fee_type),
                  },
                  globalStore.isHuaKang() && {
                    Header: i18next.t('销售出库金额（总）'),
                    accessor: 'total_sale_outstock_price',
                    minWidth: 100,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.total_sale_outstock_price +
                      Price.getUnit(original.fee_type),
                  },
                  globalStore.hasViewTaxRate() && {
                    Header: i18next.t('销售额(不含税、运)'),
                    accessor: 'sale_money_without_tax',
                    minWidth: 130,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.sale_money_without_tax +
                      Price.getUnit(original.fee_type),
                  },
                  globalStore.hasViewTaxRate() && {
                    Header: i18next.t('订单税额'),
                    accessor: 'order_tax',
                    minWidth: 70,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.order_tax + Price.getUnit(original.fee_type),
                  },
                  {
                    Header: i18next.t('销售额(不含运费)'),
                    accessor: 'sale_money',
                    minWidth: 120,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.sale_money + Price.getUnit(original.fee_type),
                  },
                  {
                    Header: (
                      <div>
                        {i18next.t('运费')}
                        <TableXUtil.SortHeader
                          onClick={this.handleSortClick.bind(this, 'freight')}
                          type={getCurrentSortType(sortType, 'freight')}
                        />
                      </div>
                    ),
                    accessor: 'freight',
                    minWidth: 60,
                    diyItemText: i18next.t('运费'),
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.freight + Price.getUnit(original.fee_type),
                  },
                  {
                    Header: copywriterByTaxRate(
                      i18next.t('销售额(含运费)'),
                      i18next.t('销售额(含税、运)'),
                    ),
                    accessor: 'sale_money_with_freight',
                    minWidth: 120,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.sale_money_with_freight +
                      Price.getUnit(original.fee_type),
                  },
                  globalStore.hasPermission('distribution_order_search') && {
                    Header: i18next.t('编辑状态'),
                    accessor: 'delivery_edit_status',
                    show: false,
                    minWidth: 80,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.delivery_edit_status ? (
                        <a
                          href={`#/order_manage/order/list/edit_delivery?order_id=${original.id}`}
                          style={{ textDecoration: 'underline' }}
                          rel='noopener noreferrer'
                          target='_blank'
                        >
                          已编辑
                        </a>
                      ) : (
                        '未编辑'
                      ),
                  },
                  {
                    Header: (
                      <div>
                        <div className='gm-inline-block'>
                          {i18next.t('订单状态')}
                        </div>
                        <TableXUtil.SortHeader
                          onClick={this.handleSortClick.bind(this, 'status')}
                          type={getCurrentSortType(sortType, 'status')}
                        />
                      </div>
                    ),
                    accessor: 'status',
                    minWidth: 120,
                    diyEnable: false,
                    diyItemText: i18next.t('订单状态'),
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original: order, index } }) => {
                      const tmpArr = [...editStatusArr]
                      if (order.status === 1) {
                        tmpArr.unshift({
                          id: 1,
                          text: i18next.t('等待分拣'),
                        })
                      }
                      if (order.edit) {
                        return (
                          <div ref={this.selectionRef}>
                            <Select
                              ref={this.selectRef}
                              value={order.status_tmp}
                              style={{ minWidth: '80px' }}
                              onChange={this.handleSingleOrderStatusChange.bind(
                                this,
                                index,
                              )}
                            >
                              {_.map(
                                _.filter(tmpArr, (v) => v.id >= order.status),
                                (item) => {
                                  return (
                                    <Option value={item.id} key={item.id}>
                                      {item.text}
                                    </Option>
                                  )
                                },
                              )}
                            </Select>
                          </div>
                        )
                      }
                      return (
                        <StateContainer status={order.status}>
                          <span className='gm-text'>{`${orderState(
                            order.status,
                          )}(${order.sort_id || '-'})`}</span>
                        </StateContainer>
                      )
                    },
                  },
                  {
                    Header: i18next.t('装车状态'),
                    accessor: 'inspect_status',
                    minWidth: 70,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.inspect_status === 2
                        ? i18next.t('已装车')
                        : i18next.t('未装车'),
                  },
                  {
                    Header: i18next.t('支付状态'),
                    accessor: 'pay_status',
                    minWidth: 70,
                    diyEnable: false,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      payState(original.pay_status),
                  },
                  {
                    Header: i18next.t('司机'),
                    accessor: 'driver_name',
                    minWidth: 70,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('订单来源'),
                    accessor: 'client_desc',
                    minWidth: 70,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: (
                      <div>
                        {i18next.t('打印状态')}
                        <ToolTip
                          popup={
                            <div className='gm-padding-10'>
                              {i18next.t('记录配送单打印次数')}
                            </div>
                          }
                        />
                      </div>
                    ),
                    diyItemText: i18next.t('打印状态'),
                    accessor: 'print_times',
                    minWidth: 80,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) =>
                      original.print_times
                        ? `${i18next.t('已打印')}(${original.print_times})`
                        : i18next.t('未打印'),
                  },
                  {
                    Header: i18next.t('出库状态'),
                    accessor: 'outstock_status',
                    minWidth: 70,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) => {
                      const target = _.find(
                        OUT_STOCK_STATUS,
                        (d) => d.value === original.outstock_status,
                      )
                      return target ? target.name : '-'
                    },
                  },
                  {
                    Header: i18next.t('订单备注'),
                    id: 'remark',
                    minWidth: 100,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) => {
                      return (
                        <Popover
                          showArrow
                          center
                          type='hover'
                          popup={
                            <div
                              className='gm-bg gm-padding-10'
                              style={{ width: '200px', wordBreak: 'break-all' }}
                            >
                              {original.remark || '-'}
                            </div>
                          }
                        >
                          <span className='b-ellipsis-order-remark'>
                            {original.remark || '-'}
                          </span>
                        </Popover>
                      )
                    },
                  },
                  {
                    Header: i18next.t('集包状态'),
                    accessor: 'order_box_status',
                    minWidth: 70,
                    show: false,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) => {
                      return (
                        <span>
                          {orderPackageStatus(original.order_box_status)}
                        </span>
                      )
                    },
                  },
                  {
                    Header: i18next.t('下单员'),
                    accessor: 'create_user',
                    minWidth: 90,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('打印时间'),
                    accessor: 'last_print_time',
                    minWidth: 100,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) => {
                      const last_operate_time = original.last_operate_time
                      const isBefore = moment(
                        original.last_print_time,
                      ).isBefore(moment(last_operate_time))
                      const _print_time =
                        original.last_print_time === '-'
                          ? '-'
                          : moment(original.last_print_time).format(
                              'YYYY-MM-DD HH:mm:ss',
                            )

                      if (original.last_print_time !== '-' && isBefore) {
                        return (
                          <Popover
                            showArrow
                            type='hover'
                            right
                            popup={
                              <div
                                style={{ width: '160px', fontSize: '12px' }}
                                className='gm-padding-10 gm-bg'
                              >
                                {i18next.t(
                                  '订单已发生变动，请确认是否需要重新打印配送单',
                                )}
                              </div>
                            }
                          >
                            <span className='gm-text-red'>{_print_time}</span>
                          </Popover>
                        )
                      } else {
                        return <span>{_print_time}</span>
                      }
                    },
                  },
                  {
                    Header: i18next.t('最后操作时间'),
                    accessor: 'last_operate_time',
                    minWidth: 120,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) => {
                      return original.last_operate_time ||
                        original.last_operate_time !== '-' ? (
                        <span>
                          {moment(original.last_operate_time).format(
                            'YYYY-MM-DD HH:mm:ss',
                          )}
                        </span>
                      ) : (
                        '-'
                      )
                    },
                  },
                  ..._.map(infoConfigs, (v) => ({
                    Header: v.field_name,
                    minWidth: 100,
                    accessor: `customized_field.${v.id}`,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: (cellProps) => {
                      const order = cellProps.row.original
                      const text = getFiledData(v, order.customized_field)
                      if (v.field_type !== COMPONENT_TYPE_TEXT) {
                        return <div>{text}</div>
                      }
                      return (
                        <Popover
                          showArrow
                          center
                          type='hover'
                          popup={
                            <div
                              className='gm-bg gm-padding-10'
                              style={{ width: '200px', wordBreak: 'break-all' }}
                            >
                              {text}
                            </div>
                          }
                        >
                          <span className='b-ellipsis-order-remark'>
                            {text}
                          </span>
                        </Popover>
                      )
                    },
                  })),
                  {
                    width: 110,
                    diyGroupName: i18next.t('基础字段'),
                    Header: TableXUtil.OperationHeader,
                    dragField: true,
                    diyEnable: false,
                    id: 'action',
                    fixed: 'right',
                    diyItemText: '操作',
                    Cell: ({ row: { original, index } }) => (
                      <Flex justifyCenter>
                        <SAction
                          order={original}
                          index={index}
                          apiDoSelectFocus={this.apiDoSelectFocus}
                        />
                      </Flex>
                    ),
                  },
                ].filter((_) => _)}
              />
            </ManagePagination>
          </BoxTable>
        )}

        {isOld() && isBatchOrderEditable ? (
          <BatchImportDialogOld
            show={this.state.uploadShow}
            service_times={service_times.slice()}
            onHide={this.handleOrderUploadToggle}
          />
        ) : (
          isBatchOrderEditable && (
            <BatchImportDialog
              show={this.state.uploadShow}
              service_times={service_times.slice()}
              onHide={this.handleOrderUploadToggle}
            />
          )
        )}
      </div>
    )
  }
}

export default OrderListView
