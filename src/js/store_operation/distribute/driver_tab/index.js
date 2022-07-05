import { i18next } from 'gm-i18n'
import React from 'react'
import { RightSideModal, Pagination, Flex, Price, Popover,Tip } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import {
  expandTableXHOC,
  selectTableXHOC,
  subTableXHOC,
  TableX,
  TableXUtil,
} from '@gmfe/table-x'
import HeaderTip from '../../../common/components/header_tip'
import { TableUtil } from '@gmfe/table'
import { connect } from 'react-redux'
import Big from 'big.js'
import _ from 'lodash'
import SearchFilter from './search_filter'
import './reducer.js'
import './actions.js'
import actions from '../../../actions'
import moment from 'moment'
import ProductSheetModal from './product_sheet_modal'
import globalStore from '../../../stores/global'
import { FEE_LIST } from '../../../common/enum'
import PropTypes from 'prop-types'

import {
  CommonPrePrintBtn,
  printerOptionsStore,
} from 'common/components/common_printer_options'
import PopupExportModal from '../popup_export_modal'
import SVGPrint from 'svg/print.svg'
import DriverPrintModal from './driver_print_modal'

const ExpandTable = expandTableXHOC(TableX)
const ExpandSelectTable = selectTableXHOC(ExpandTable)
const SubTable = subTableXHOC(TableX)

const formatTime = (date) => moment(date).format('MM-DD HH:mm')
const fetchSubTableData = (order_ids, index) => {
  actions.distribute_driver_get_driver_order_list_task(order_ids, {}, index)
  actions.set_driver_order_task_list_loading(true)
}
const handleOrder = (order_id) => {
  RightSideModal.render({
    title: i18next.t('商品明细'),
    onHide: RightSideModal.hide,
    children: <ProductSheetModal orderId={order_id} />,
  })
}

const RowRender = (props) => {
  const { index } = props
  const { driverOrder, isLoading, driverTaskList } = props.distributeDriver
  const { order_ids } = driverTaskList[index]

  const list = driverOrder.driverOrderListTask[index] || []
  const pagination = driverOrder.paginationTask[index] || {
    offset: 0,
    limit: 10,
  }

  const handlePageChange = React.useCallback(
    (pagination) => {
      actions.distribute_driver_get_driver_order_list_task(
        order_ids,
        pagination,
        index,
      )
    },
    [order_ids, pagination, index],
  )
  // 输入框
  const handleDeliveryOrderTask = async (original, value) => {
    if (original.delivery_order_sequence === value) {
      return
    }
    if (value === '') {
      // 不传
      value = null
    }
    const address_id = original.address_id[0]
    await actions.distribute_edit_deliver_order({
      address_id: address_id,
      delivery_order_sequence: value,
    })
    await actions.distribute_driver_get_driver_order_list_task(
      order_ids,
      pagination,
      index,
    )
    Tip.success(i18next.t('保存成功'))
  }

  React.useEffect(() => fetchSubTableData(order_ids, index), [order_ids, index])
  const { isCStation } = globalStore.otherInfo

  return (
    <>
      <SubTable
        data={list.slice()}
        loading={isLoading}
        style={{ borderBottom: 'none' }}
        columns={[
          {
            Header: i18next.t('订单号'),
            id: 'id',
            // eslint-disable-next-line react/prop-types
            accessor: ({ id }) => (
              <div
                onClick={() => handleOrder(id)}
                className='gm-cursor gm-text-primary'
              >
                {id}
              </div>
            ),
          },
          {
            Header: i18next.t('线路'),
            show: !isCStation,
            accessor: 'route_name',
          },
          {
            Header: isCStation ? i18next.t('客户名') : i18next.t('商户名'),
            accessor: 'customer_name',
          },
          {
            Header: i18next.t('地理标签'),
            accessor: 'area',
          },
          {
            Header: i18next.t('配送地址'),
            accessor: 'receive_address',
          },
          // 配送顺序
          {
            Header: (
              <HeaderTip
                title={i18next.t('配送顺序')}
                tip={i18next.t(
                  '1.表示任务在司机端和司机任务单中展示的顺序，司机按此顺序进行配送；2.数字越小越靠前（最小填1）3.设置后系统会记住当前商户的排序号，同商户的订单，排序号一致',
                )}
              />
            ),
            diyItemText: i18next.t('配送顺序'),
            accessor: 'delivery_order_sequence',
            diyGroupName: i18next.t('基础字段'),
            Cell: ({ row: { original } }) => {
              return (
                <Flex>
                  <span>
                    {original.delivery_order_sequence ?? '未设置'}
                    &nbsp;
                  </span>
                  <TableUtil.EditButton
                    popupRender={(closePopup) => {
                      return (
                        <TableUtil.EditContentInputNumber
                          min={1}
                          max={999999999}
                          initialVal={original.delivery_order_sequence || null}
                          onSave={(value) =>
                            handleDeliveryOrderTask(original, value)
                          }
                          closePopup={closePopup}
                        />
                      )
                    }}
                  />
                </Flex>
              )
            },
          },
          {
            Header: i18next.t('销售额（不含运费）'),
            id: 'sale_money',
            accessor: ({ sale_money, fee_type }) =>
              Big(sale_money).div(100).toFixed(2) + Price.getUnit(fee_type),
          },
          {
            Header: i18next.t('收货时间'),
            id: 'receive',
            // eslint-disable-next-line react/prop-types
            accessor: ({ receive_begin_time, receive_end_time }) => (
              <div>{`${formatTime(receive_begin_time)} - ${formatTime(
                receive_end_time,
              )}`}</div>
            ),
          },
          {
            Header: i18next.t('装车状态'),
            id: 'inspect_status',
            accessor: ({ inspect_status }) =>
              inspect_status === 2 ? i18next.t('已装车') : i18next.t('未装车'),
          },
          {
            Header: i18next.t('装车人'),
            accessor: 'inspector',
          },
          {
            Header: i18next.t('装车时间'),
            id: 'inspect_time',
            accessor: ({ inspect_time }) =>
              inspect_time &&
              moment(inspect_time).format('YYYY-MM-DD hh:mm:ss'),
          },
          {
            Header: i18next.t('订单备注'),
            id: 'remark',
            accessor: (d) => (
              <Popover
                showArrow
                center
                type='hover'
                popup={
                  <div
                    className='gm-bg gm-padding-10'
                    style={{
                      width: '200px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {d.remark || '-'}
                  </div>
                }
              >
                <Flex
                  flex
                  alignCenter
                  className='b-ellipsis-order-remark'
                  style={{ wordBreak: 'break-all' }}
                >
                  {d.remark || '-'}
                </Flex>
              </Popover>
            ),
          },
        ]}
      />
      <Flex
        justifyEnd
        style={{
          background: '#F7F8FA',
          border: '1px solid #56A3F2',
          borderTop: 'none',
        }}
        className='gm-padding-tb-10 gm-padding-right-20'
      >
        <Pagination data={pagination} toPage={handlePageChange} />
      </Flex>
    </>
  )
}

const Sub = connect((state) => ({
  distributeDriver: state.distributeDriver,
}))(RowRender)

RowRender.propTypes = {
  distributeDriver: PropTypes.object,
  index: PropTypes.number,
}

class DriverTab extends React.Component {
  constructor(props) {
    super(props)
    this.pagination = React.createRef()
  }

  async componentDidMount() {
    this.pagination.current.apiDoFirstRequest()
    // 按运营时间搜索 依赖 service_times
    await actions.distribute_driver_initial_service_times()
    actions.distribute_driver_get_driver_task_list()
  }

  handleSelect = (selected) => {
    actions.set_driver_order_task_list_selected(selected)
  }

  handleSearch(params) {
    return actions.distribute_driver_get_driver_task_list(params)
  }

  handleExport = () => {
    // 获取当前勾选下的所有订单号
    const { driverTaskList, driverOrder } = this.props.distributeDriver
    const { selectedDriverOrderTaskList } = driverOrder
    const select_driver = _.filter(
      driverTaskList,
      (d) =>
        _.findIndex(
          selectedDriverOrderTaskList,
          (item) => item === d.driver_id,
        ) !== -1,
    )
    const order_ids = _.flatten(_.map(select_driver, (item) => item.order_ids))
    const query = {
      ids: JSON.stringify(order_ids),
    }
    return RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PopupExportModal query={query} closeModal={RightSideModal.hide} />
      ),
    })
  }

  render() {
    const {
      driverTaskList,
      driverOrder: { selectedDriverOrderTaskList },
    } = this.props.distributeDriver
    const canPrintDistribute = globalStore.hasPermission('get_distribute_print')
    const canPrintDriverTask = globalStore.hasPermission('print_driver_tasks')
    const canExport = globalStore.hasPermission('export_batch_delivery_sheet')

    // 批量打印的司机名单
    const selectedDriverList = _.filter(
      driverTaskList,
      (v) =>
        _.findIndex(
          selectedDriverOrderTaskList,
          (item) => item === v.driver_id,
        ) !== -1,
    )

    const orderIdList = _.reduce(
      selectedDriverList,
      (result, driver) => result.concat(driver.order_ids),
      [],
    )

    // 批量打印司机装车单和任务单
    const driverOrderObj = _.reduce(
      selectedDriverList,
      (result, driver) => {
        result[driver.driver_id] = driver.order_ids
        return result
      },
      {},
    )

    const batchMustConfirm = selectedDriverList.some(
      (driver) => driver.has_unweighted || driver.has_out_of_stock,
    )

    return (
      <ManagePaginationV2
        id='pagination_in_distribute_driver_list'
        onRequest={this.handleSearch}
        ref={this.pagination}
      >
        <SearchFilter
          search={() => this.pagination.current.apiDoFirstRequest()}
        />

        <ExpandSelectTable
          data={driverTaskList.slice()}
          keyField='driver_id'
          selected={selectedDriverOrderTaskList.slice()}
          onSelect={this.handleSelect}
          batchActionBar={
            selectedDriverOrderTaskList.length !== 0 ? (
              <TableXUtil.BatchActionBar
                pure
                onClose={() => actions.set_driver_order_task_list_selected([])}
                batchActions={[
                  {
                    name: (
                      <CommonPrePrintBtn
                        mustConfirm={batchMustConfirm}
                        goToPrint={() =>
                          printerOptionsStore.driverGotoPrint({
                            orderIdList,
                            driverOrderObj,
                          })
                        }
                        PrinterOptionsModal={
                          <DriverPrintModal
                            goToPrint={() =>
                              printerOptionsStore.driverGotoPrint({
                                orderIdList,
                                driverOrderObj,
                              })
                            }
                          />
                        }
                      >
                        {i18next.t('批量打印')}
                      </CommonPrePrintBtn>
                    ),
                    onClick: () => {},
                    type: 'business',
                  },
                  {
                    name: '批量导出',
                    onClick: () => this.handleExport(),
                    show: canExport,
                    type: 'business',
                  },
                ]}
                count={selectedDriverOrderTaskList.length}
              />
            ) : null
          }
          columns={[
            {
              Header: i18next.t('司机名'),
              accessor: 'driver_name',
            },
            {
              Header: i18next.t('承运商'),
              accessor: 'carrier_name',
            },
            {
              Header: i18next.t('配送商户数'),
              accessor: 'customer_count',
            },
            {
              Header: i18next.t('订单数'),
              accessor: 'order_count',
            },
            {
              Header: i18next.t('销售额（不含运费）'),
              id: 'sale_money_dict',
              accessor: ({ sale_money_dict }) => {
                const length = _.keys(sale_money_dict).length
                return (
                  <div>
                    {_.map(sale_money_dict, (val, k) => {
                      const fee = _.find(FEE_LIST, (v) => v.value === k) || {
                        name: i18next.t('未知'),
                      }

                      return (
                        <div key={k}>
                          {length > 1 ? `${fee.name}: ` : ''}
                          {Big(val).div(100).toFixed(2) + Price.getUnit(k)}
                        </div>
                      )
                    })}
                  </div>
                )
              },
            },
            {
              Header: i18next.t('单据打印'),
              id: 'print_action',
              width: 80,
              show: canPrintDistribute || canPrintDriverTask,
              accessor: (driver) => {
                const mustConfirm =
                  driver.has_unweighted || driver.has_out_of_stock
                const goToPrint = () =>
                  printerOptionsStore.driverGotoPrint({
                    orderIdList: driver.order_ids,
                    driverOrderObj: { [driver.driver_id]: driver.order_ids },
                  })
                return (
                  <TableXUtil.OperationCell>
                    <CommonPrePrintBtn
                      mustConfirm={mustConfirm}
                      goToPrint={goToPrint}
                      PrinterOptionsModal={
                        <DriverPrintModal goToPrint={goToPrint} />
                      }
                    >
                      <span className='gm-text-14 gm-text-hover-primary'>
                        <SVGPrint />
                      </span>
                    </CommonPrePrintBtn>
                  </TableXUtil.OperationCell>
                )
              },
            },
          ]}
          SubComponent={({ index }) => <Sub index={index} />}
        />
      </ManagePaginationV2>
    )
  }
}

RowRender.propTypes = {
  distributeDriver: PropTypes.object,
  index: PropTypes.number,
  row: PropTypes.object,
}

DriverTab.propTypes = {
  distributeDriver: PropTypes.object,
}

export default connect((state) => ({
  distributeOrder: state.distributeOrder,
  distributeDriver: state.distributeDriver,
}))(DriverTab)
