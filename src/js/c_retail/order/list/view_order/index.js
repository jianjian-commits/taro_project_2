import { i18next } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import moment from 'moment'
import { observer } from 'mobx-react'

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

import { orderState, payState, findReceiveWayById } from 'common/filter'
import { getCurrentSortType } from '../../../../order/util'

import { copywriterByTaxRate } from 'common/service'
import { searchDateTypes, dateFilterData, editStatusArr } from 'common/enum'
import TableListTips from 'common/components/table_list_tips'

import ViewOrderFilter from './view_order_filter'
import SAction from './sheet_action'
import BoxAction from './box_action'
import StateContainer from '../../../../order/components/state_container'
import TableTotalText from 'common/components/table_total_text'
import OrderId from './order_id'

import store from './store'

const SelectTableX = selectTableXHOC(
  diyTableXHOC(fixedColumnsTableXHOC(TableX))
)

@observer
class OrderListView extends React.Component {
  constructor(props) {
    super(props)
    this.selectRef = React.createRef(null)
    this.selectionRef = React.createRef(null)
    this.refPagination = React.createRef(null)
  }

  handleInitQuery = (query) => {
    store.reset()
    for (const key in query) {
      store.filterChange({
        [key]: query[key],
      })
    }
  }

  componentDidMount() {
    // 零售模块运营报表跳转
    const { state } = this.props.location
    state && this.handleInitQuery(state)

    // 拿到零售运营时间
    store.fetchStationServiceTime().then(() => {
      // 运营时间用于判断收货日期的最大限制
      store.setDoFirstRequest(this.refPagination.current.apiDoFirstRequest)
      this.refPagination.current.apiDoFirstRequest()
    })
    // 自提点
    store.getPickUpList()
    // 社区店
    store.getShopList()
  }

  handleSelect = (selected) => {
    store.orderSelect(selected)
  }

  handlePage = (page) => {
    const { sortType } = store.orders.filter
    const searchData = Object.assign({}, store.searchData, {
      sort_type: sortType === '' ? null : sortType,
    })
    return store.orderListSearch(searchData, page)
  }

  handleSingleOrderStatusChange(index, value) {
    store.orderSingleStatusChange(index, value)
  }

  isOrderDisabled = (order) => {
    return order.status === 15
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
    const { filter, in_query, total_sale_money_with_freight_dict } = orders
    const { dateType, in_query_search_text, sortType } = filter
    const dateTypeName = _.find(
      dateFilterData,
      (t) => t.type === dateType
    ).name.slice(-4)
    // date 分为按下单日期、按收货日期，收货日期需要特殊区分
    const dateName = dateType === '3' ? 'receive_begin_time' : 'date'
    const list = orders.list.slice()

    return (
      <div className='b-order-sort-table-wrap'>
        <ViewOrderFilter />

        {in_query && (
          <TableListTips
            tips={[
              in_query_search_text +
                i18next.t('不在筛选条件中，已在全部订单中为您找到'),
            ]}
          />
        )}

        <BoxTable
          info={
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
                      _.map(
                        total_sale_money_with_freight_dict,
                        (v, i) => Price.getCurrency(i) + v
                      ),
                      ', '
                    ),
                  },
                ]}
              />
            </BoxTable.Info>
          }
          action={<BoxAction />}
        >
          <ManagePagination
            onRequest={this.handlePage}
            ref={this.refPagination}
            id='pagination_in_view_c_order'
          >
            <SelectTableX
              id='c_order_select'
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
                  width: 130,
                  diyEnable: false,
                  fixed: 'left',
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ row: { original, index } }) => (
                    <OrderId sku={original} index={index} />
                  ),
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
                    if (dateType === searchDateTypes.RECEIVE.type) {
                      return (
                        <div>
                          {moment(order.receive_begin_time).format(
                            'YYYY-MM-DD'
                          )}
                        </div>
                      )
                    } else {
                      return (
                        <div>
                          {moment(order.date_time_str).format(
                            'YYYY-MM-DD HH:mm:ss'
                          )}
                        </div>
                      )
                    }
                  },
                },
                {
                  Header: (
                    <div>
                      {i18next.t('客户名')}
                      <TableXUtil.SortHeader
                        onClick={this.handleSortClick.bind(this, 'addr')}
                        type={getCurrentSortType(sortType, 'addr')}
                      />
                    </div>
                  ),
                  diyItemText: i18next.t('客户名'),
                  accessor: 'customer',
                  minWidth: 160,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ row: { original: order } }) => {
                    return <div>{order.customer.extender.resname}</div>
                  },
                },
                {
                  Header: i18next.t('收货方式'),
                  accessor: 'receive_way',
                  minWidth: 70,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ row: { original: order } }) => {
                    return (
                      <div>
                        {findReceiveWayById(order.customer.receive_way) || '-'}
                      </div>
                    )
                  },
                },
                {
                  Header: i18next.t('自提点'),
                  accessor: 'pick_up_st_name',
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ row: { original: order } }) => {
                    return <div>{order.customer.pick_up_st_name || '-'}</div>
                  },
                },
                {
                  Header: i18next.t('下单原价'),
                  accessor: 'origin_total_price',
                  minWidth: 80,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ row: { original } }) => (
                    <div>
                      {original.origin_total_price +
                        Price.getUnit(original.fee_type)}
                    </div>
                  ),
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
                  Cell: ({ row: { original } }) => (
                    <div>
                      {original.total_price + Price.getUnit(original.fee_type)}
                    </div>
                  ),
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
                  Cell: ({ row: { original } }) => (
                    <div>
                      {original.real_money + Price.getUnit(original.fee_type)}
                    </div>
                  ),
                },
                {
                  Header: i18next.t('销售额(不含运费)'),
                  accessor: 'sale_money',
                  minWidth: 120,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ row: { original } }) => (
                    <div>
                      {original.sale_money + Price.getUnit(original.fee_type)}
                    </div>
                  ),
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
                  Cell: ({ row: { original } }) => (
                    <div>
                      {original.freight + Price.getUnit(original.fee_type)}
                    </div>
                  ),
                },
                {
                  Header: copywriterByTaxRate(
                    i18next.t('销售额(含运费)'),
                    i18next.t('销售额(含税、运)')
                  ),
                  accessor: 'sale_money_with_freight',
                  minWidth: 120,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ row: { original } }) => (
                    <div>
                      {original.sale_money_with_freight +
                        Price.getUnit(original.fee_type)}
                    </div>
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
                              index
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
                              }
                            )}
                          </Select>
                        </div>
                      )
                    }
                    return (
                      <StateContainer status={order.status}>
                        <span className='gm-text'>{`${orderState(
                          order.status
                        )}(${order.sort_id || '-'})`}</span>
                      </StateContainer>
                    )
                  },
                },
                {
                  Header: i18next.t('支付状态'),
                  accessor: 'pay_status',
                  minWidth: 70,
                  diyEnable: false,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ row: { original } }) => (
                    <div>{payState(original.pay_status)}</div>
                  ),
                },
                {
                  Header: i18next.t('司机'),
                  accessor: 'driver_name',
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
                  Cell: ({ row: { original } }) => (
                    <div>
                      {original.print_times
                        ? `${i18next.t('已打印')}(${original.print_times})`
                        : i18next.t('未打印')}
                    </div>
                  ),
                },
                {
                  Header: i18next.t('订单备注'),
                  accessor: 'remark',
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                },
                {
                  Header: i18next.t('社区店名称'),
                  accessor: 'community_name',
                  minWidth: 70,
                  diyGroupName: i18next.t('基础字段'),
                },
                {
                  Header: i18next.t('团长名称'),
                  accessor: 'distributor_name',
                  minWidth: 70,
                  diyGroupName: i18next.t('基础字段'),
                },
                {
                  Header: i18next.t('团长账户'),
                  accessor: 'distributor_username',
                  minWidth: 70,
                  diyGroupName: i18next.t('基础字段'),
                },
                {
                  Header: i18next.t('打印时间'),
                  accessor: 'last_print_time',
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ row: { original } }) => {
                    const last_operate_time = original.last_operate_time
                    const isBefore = moment(original.last_print_time).isBefore(
                      moment(last_operate_time)
                    )
                    const _print_time =
                      original.last_print_time === '-'
                        ? '-'
                        : moment(original.last_print_time).format(
                            'YYYY-MM-DD HH:mm:ss'
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
                                '订单已发生变动，请确认是否需要重新打印配送单'
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
                          'YYYY-MM-DD HH:mm:ss'
                        )}
                      </span>
                    ) : (
                      <span>-</span>
                    )
                  },
                },
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
      </div>
    )
  }
}

export default OrderListView
