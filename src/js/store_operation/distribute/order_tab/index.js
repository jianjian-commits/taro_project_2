import { i18next } from 'gm-i18n'
import React from 'react'
import {
  RightSideModal,
  Cascader,
  Tip,
  Dialog,
  ToolTip,
  Flex,
  BoxTable,
  Price,
  ImagePreview,
  Popover,
  Modal,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import {
  selectTableXHOC,
  TableX,
  diyTableXHOC,
  TableXUtil,
} from '@gmfe/table-x'
import { TableUtil } from '@gmfe/table'
import PropTypes from 'prop-types'
import SVGPhoto from 'svg/photo.svg'
import SearchFilter from './search_filter'
import DistributeSchedule from './destribute_schedule'
import _ from 'lodash'
import moment from 'moment'
import Big from 'big.js'
import { connect } from 'react-redux'
import globalStore from '../../../stores/global'
import { findReceiveWayById } from 'common/filter'
import { renderOrderTypeName } from 'common/deal_order_process'
import './reducer.js'
import './actions.js'
import actions from '../../../actions'
import utils from '../util'
import HeaderTip from '../../../common/components/header_tip'

import TableAction from './table_action'
import TableTotalText from 'common/components/table_total_text'
import TableListTips from 'common/components/table_list_tips'
import PopupExportModal from '../popup_export_modal'
import { OrderPrePrintBtn } from 'common/components/common_printer_options'
import SVGPrint from 'svg/print.svg'
import { getCurrentSortType } from '../../../order/util'
import { getFiledData } from 'common/components/customize'
import { observer } from 'mobx-react'
import { COMPONENT_TYPE_TEXT, ORDER_CLIENTS_MAP } from '../../../common/enum'
import FinanceVouCherSet from '../../../order/order_detail/components/finance_voucher_set'

const { getOrderParams, isUndefinedOrNull } = utils
const SelectDiyTable = selectTableXHOC(diyTableXHOC(TableX))

const status = {
  '-1': i18next.t('订单已删除'),
  '1': i18next.t('等待分拣'),
  '5': i18next.t('分拣中'),
  '10': i18next.t('配送中'),
  '15': i18next.t('已签收'),
  '100': i18next.t('已支付'),
}

const FILTER_STORAGE = 'distribute_filterBox_V0.1'

const formatTime = (date) => moment(date).format('MM月DD日 HH时mm分')

const TipPopover = ({ text }) => (
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
        {text || '-'}
      </div>
    }
  >
    <Flex
      flex
      alignCenter
      className='b-ellipsis-order-remark'
      style={{ wordBreak: 'break-all' }}
    >
      {text || '-'}
    </Flex>
  </Popover>
)
TipPopover.propTypes = {
  text: PropTypes.string,
}

@observer
class OrderTab extends React.Component {
  constructor(props) {
    super(props)
    this.pagination = React.createRef()
    this.handleSelect = ::this.handleSelect
    this.handleSaveAssign = ::this.handleSaveAssign
    this.handleAutoAssign = ::this.handleAutoAssign
    this.getOrderByAllDriver = ::this.getOrderByAllDriver
    this.getOrderByDriverId = ::this.getOrderByDriverId
  }

  async componentDidMount() {
    actions.distribute_order_get_route_list()
    actions.distribute_order_get_salemenus()
    // 按运营时间搜索依赖 service_time
    actions.distribute_get_pick_up_list() // 自提点
    await actions.distribute_order_get_service_time()
    await actions.distribute_order_get_driver_list()
    // order 依赖driverList
    actions.distribute_order_get_order_list({ offset: 0 })
    // 这个请求一定要在最后 确保运营时间、司机列表等都拉取到
    this.pagination.current.apiDoFirstRequest()
    actions.distribute_order_get_labels()
    actions.distribute_order_get_labels_create_user()
  }

  getSearchFilter = () => {
    const {
      date_type,
      time_config_id,
      begin_time,
      end_time,
      search_text,
      route_id,
      carrier_id_and_driver_id,
      area_id,
      order_status,
      service_times,
      is_print,
      receive_way,
      pickUpSelected,
      orderType,
      selectedLabel,
      searchType,
      customized_field,
      salemenu_id,
      client,
      create_user,
    } = this.props.distributeOrder
    console.log('this.props.distributeOrder', this.props.distributeOrder)
    const filter = _.omitBy(
      getOrderParams({
        searchType,
        date_type,
        time_config_id,
        begin_time,
        end_time,
        search_text,
        route_id,
        carrier_id_and_driver_id,
        area_id,
        order_status,
        service_times,
        is_print,
        receive_way,
        pickUpSelected,
        orderType,
        selectedLabel,
        customized_field,
        salemenu_id,
        client,
        create_user,
      }),
      (value) => isUndefinedOrNull(value) && !_.isNumber(value),
    )
    return {
      ...filter,
      // !!订单流配置配送任务模块索引，不可改, 仅选择所有页批量打印
      order_process_index: 3,
    }
  }

  handleSelect(selected) {
    let { orderList, selectAllType } = this.props.distributeOrder
    let isSelectAll

    if (selected.length !== orderList.length) {
      isSelectAll = false
      selectAllType = 1
    } else {
      isSelectAll = true
    }

    actions.distribute_order_filter_change({
      isSelectAll,
      selectedRecord: selected,
      selectAllType,
    })
  }

  handleChangeSelectAllType = (bool) => {
    const { orderList } = this.props.distributeOrder
    const selected = _.map(orderList, (order) => order.id)
    actions.distribute_order_filter_change({
      isSelectAll: bool,
      selectedRecord: selected,
    })
    actions.distribute_order_change_select_all_type(bool ? 2 : 1)
  }

  getOrderByDriverId(driver_id) {
    driver_id = Number(driver_id)
    const { driverList } = this.props.distributeOrder
    // 从司机列表内找出承运商
    const carrier_id = _.find(driverList, (driver) => driver.id === driver_id)
      .carrier_id
    actions.distribute_order_filter_change({
      carrier_id_and_driver_id: [carrier_id, driver_id],
    })
    actions.distribute_order_get_order_list({ offset: 0, driver_id })
  }

  getOrderByAllDriver() {
    actions.distribute_order_filter_change({ carrier_id_and_driver_id: [] })
    actions.distribute_order_get_order_list({ offset: 0 })
  }

  handleAutoAssign() {
    Dialog.confirm({
      children: i18next.t('确认按最近一次的规划方式来快速规划司机吗？'),
      onOK: async () => {
        const orderList = await actions.distribute_order_get_all_order_list()

        const isAllHasDriverId = _.every(
          orderList,
          (order) => order.driver_id !== null,
        )
        if (isAllHasDriverId) {
          Tip.warning('没有需要智能规划的订单！')
          return
        }
        // 没有分配司机的订单
        const order_ids = _.reduce(
          orderList,
          (order_ids, driver) => {
            if (!driver.driver_id) {
              order_ids.push(driver.id)
            }
            return order_ids
          },
          [],
        )

        const query = {
          order_ids: JSON.stringify(order_ids),
        }

        await actions.distribute_order_auto_assign(query)

        actions.distribute_order_get_order_list()
        Tip.success(i18next.t('智能规划成功'))
      },
    })
  }

  handleSaveAssign(value, i) {
    const { orderList } = this.props.distributeOrder
    const order = orderList[i]

    // 承运商不保存
    if (value.length === 1) {
      return
    }

    const doSign = async () => {
      const query = {
        order_id: order.id,
        receive_address_id: order.address_id,
        receive_begin_time: order.receive_begin_time,
      }

      // 如果选择了司机(只选择承运商,不做保存处理)
      if (value.length === 2 && value[1] !== '0') {
        query.driver_id = value[1]
        query.operation_type = 1
        // 清除司机
      } else if (value.length === 0) {
        query.driver_id = order.driver_id
        query.operation_type = 0
      }
      await actions.distribute_order_save_assign(query)

      actions.distribute_order_get_order_list()
      Tip.success(i18next.t('司机保存成功'))
    }

    if (order.status === 15) {
      Dialog.confirm({
        children: i18next.t('订单已签收，是否确定修改承运商/司机?'),
        title: i18next.t('提示'),
      }).then(doSign, () => {})
    } else {
      doSign()
    }
  }

  handlePopupOverview() {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      title: i18next.t('进度'),
      style: { width: '300px', overflowY: 'auto' },
      opacityMask: true,
      children: (
        <div>
          <DistributeSchedule
            {...this.props.distributeOrder}
            getOrderByDriverId={this.getOrderByDriverId}
            getOrderByAllDriver={this.getOrderByAllDriver}
          />
        </div>
      ),
    })
  }

  handleBatchModifyDriver = () => {
    const {
      carrierDriverList,
      selectedRecord,
      selectAllType,
      isSelectAll,
    } = this.props.distributeOrder

    const _carrierDriverList = this.formatCarrierDriverList(carrierDriverList)
    const order_ids = JSON.stringify(selectedRecord.slice())

    let driver_id = null
    Dialog.confirm({
      title: '批量修改司机',
      size: 'sm',
      children: (
        <Flex alignCenter>
          <div>{i18next.t('选择司机：')}</div>
          <Cascader
            filtrable
            data={_carrierDriverList}
            valueRender={(value) =>
              value && value.length > 1 ? value[value.length - 1].name : ''
            }
            onChange={(val) => {
              driver_id = val[1]
            }}
          />
        </Flex>
      ),
      onOK: () => {
        if (driver_id) {
          actions
            .distribute_batch_modify_driver({
              order_ids,
              operation_type: 1,
              assign_driver_id: driver_id,
              selectAllType,
              isSelectAll,
            })
            .then(() => {
              actions.distribute_order_get_order_list()
            })
        } else {
          Tip.warning(i18next.t('请选择司机'))
          return false
        }
      },
    })
  }

  formatCarrierDriverList = (list) => {
    return _.map(list, (item) => {
      const children = _.filter(item.children, (child) => {
        return child.state !== 0
      })
      return {
        name: item.name,
        value: item.value,
        children,
      }
    })
  }

  handleExport = () => {
    const { distributeOrder } = this.props
    const { selectAllType, selectedRecord, isSelectAll } = distributeOrder
    let query = null

    // 选择所有页, 传搜索条件
    if (isSelectAll && selectAllType === 2) {
      // 处理搜索条件 过滤掉值为空的属性 area_level为0时不过滤
      query = this.getSearchFilter()
    } else {
      // 非全选, 传id
      query = {
        ids: JSON.stringify(selectedRecord),
      }
    }
    return RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PopupExportModal query={query} closeModal={RightSideModal.hide} />
      ),
    })
  }

  handlePrinterFinance(orderIdList, isSelectAll, selectAllType) {
    const isAll = isSelectAll && selectAllType === 2
    const _id = isAll ? this.getSearchFilter() : JSON.stringify(orderIdList)
    Modal.render({
      title: i18next.t('财务凭证打印设置'),
      size: 'sm',
      children: <FinanceVouCherSet _id={_id} isSelectAll={isAll} />,
      onHide: Modal.hide,
    })
  }

  handleSearch(paginationObj) {
    return actions.distribute_order_get_order_list(paginationObj)
  }

  handleSortClick(field) {
    actions.distribute_order_change_sort_type(field)
    this.pagination.current.apiDoFirstRequest()
  }

  // 输入框
  async handleDeliveryOrder(original, value) {
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
    await this.pagination.current.apiDoCurrentRequest()
    Tip.success(i18next.t('保存成功'))
  }

  render() {
    const {
      pagination,
      orderList,
      carrierDriverList,
      isLoading,
      distributeOrderList,
      in_query,
      selectedRecord,
      selectAllType,
      isSelectAll,
      sort_type,
    } = this.props.distributeOrder

    /* --- 批量打印 --- */
    const selectedOrderList = orderList.filter((order) =>
      _.includes(selectedRecord, order.id),
    )
    // 缺货 或者 库存 不足警告
    const batchMustConfirm = selectedOrderList.some(
      (order) => order.has_unweighted || order.has_out_of_stock,
    )
    /* --- 批量打印 --- */

    const _carrierDriverList = this.formatCarrierDriverList(carrierDriverList)
    const canPrintDistribute = globalStore.hasPermission('get_distribute_print')
    const canExport = globalStore.hasPermission('export_batch_delivery_sheet')

    const tableInfo = [
      {
        label: i18next.t('订单任务列表'),
        content: pagination.count,
      },
    ]

    let tips = ''
    if (in_query) {
      tips = `${orderList[0].id}${i18next.t(
        '不在筛选条件中，已在全部订单中为您找到',
      )}`
    }

    const { isCStation } = globalStore.otherInfo
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) => v.permission.read_station_sorting,
    )
    return (
      <ManagePaginationV2
        id='pagination_in_distribute_order_list'
        onRequest={this.handleSearch}
        ref={this.pagination}
      >
        <>
          <SearchFilter
            search={() => this.pagination.current.apiDoFirstRequest()}
          />

          {in_query && <TableListTips tips={[tips]} />}

          <BoxTable
            info={
              <BoxTable.Info>
                <TableTotalText data={tableInfo} />
              </BoxTable.Info>
            }
            action={
              <TableAction
                onBatchModifyDriver={this.handleBatchModifyDriver}
                onSwitchOrderTabKey={this.props.switchOrderTabKey} // eslint-disable-line
              />
            }
          >
            <SelectDiyTable
              data={orderList.slice()}
              loading={isLoading}
              id={FILTER_STORAGE}
              keyField='id'
              diyGroupSorting={[i18next.t('基础字段')]}
              selected={selectedRecord}
              onSelect={(selected) => this.handleSelect(selected)}
              batchActionBar={
                selectedRecord.length !== 0 ? (
                  <TableXUtil.BatchActionBar
                    toggleSelectAll={(bool) =>
                      this.handleChangeSelectAllType(bool)
                    }
                    onClose={() => this.handleSelect([])}
                    count={
                      selectAllType === 1
                        ? selectedRecord.length
                        : pagination.count
                    }
                    isSelectAll={selectAllType === 2}
                    batchActions={[
                      {
                        name: (
                          <OrderPrePrintBtn
                            orderIdList={selectedRecord}
                            mustConfirm={batchMustConfirm}
                            getFilter={this.getSearchFilter}
                            isSelectAll={isSelectAll}
                            selectAllType={selectAllType}
                            deliveryType={1}
                            sortType={sort_type}
                            showCommonSwitchControl // 查看编辑单据不需要合并打印sid
                          >
                            {i18next.t('批量打印')}
                          </OrderPrePrintBtn>
                        ),
                        onClick: () => {}, // 点击交个 <PrePrintBtn /> 处理
                        type: 'business',
                      },
                      {
                        name: i18next.t('批量修改司机'),
                        onClick: () => this.handleBatchModifyDriver(),
                        type: 'edit',
                      },
                      {
                        name: i18next.t('批量导出'),
                        onClick: () => this.handleExport(),
                        show: canExport,
                        type: 'business',
                      },
                      {
                        name: i18next.t('批量打印财务凭证'),
                        onClick: () =>
                          this.handlePrinterFinance(
                            selectedRecord,
                            isSelectAll,
                            selectAllType,
                          ),
                        // show: canExport,
                        type: 'business',
                      },
                    ]}
                  />
                ) : null
              }
              columns={_.filter(
                [
                  {
                    Header: i18next.t('订单号/分拣序号'),
                    minWidth: 150,
                    id: 'idAndSort',
                    diyEnable: false,
                    diyGroupName: i18next.t('基础字段'),
                    accessor: (d) => <div>{`${d.id}/${d.sort_id || '-'}`}</div>,
                  },
                  {
                    Header: i18next.t('线路'),
                    accessor: 'route_name',
                    diyEnable: false,
                    minWidth: 100,
                    show: !isCStation,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('报价单'),
                    id: 'salemenus',
                    accessor: (d) => <div>{d.salemenus.join(',')}</div>,
                    show: false,
                    minWidth: 80,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('订单来源'),
                    id: 'client',
                    accessor: (d) => (
                      <div>
                        {ORDER_CLIENTS_MAP[d.client] || i18next.t('未知')}
                      </div>
                    ),
                    diyEnable: true,
                    minWidth: 120,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('下单员'),
                    id: 'create_user',
                    accessor: (d) => (
                      <div>{d.create_user || i18next.t('-')}</div>
                    ),
                    diyEnable: true,
                    minWidth: 120,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('账户'),
                    accessor: 'user_name',
                    diyEnable: true,
                    minWidth: 120,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: (
                      <div>
                        {i18next.t('商户自定义编码')}
                        <TableXUtil.SortHeader
                          onClick={this.handleSortClick.bind(
                            this,
                            'res_custom_code',
                          )}
                          type={getCurrentSortType(
                            sort_type,
                            'res_custom_code',
                          )}
                        />
                      </div>
                    ),
                    accessor: 'res_custom_code',
                    diyItemText: i18next.t('商户自定义编码'),
                    diyEnable: true,
                    minWidth: 120,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('公司名'),
                    accessor: 'cname',
                    diyEnable: true,
                    minWidth: 120,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: (
                      <div>
                        {isCStation ? i18next.t('客户名') : i18next.t('商户名')}
                        <TableXUtil.SortHeader
                          onClick={this.handleSortClick.bind(
                            this,
                            'customer_name',
                          )}
                          type={getCurrentSortType(sort_type, 'customer_name')}
                        />
                      </div>
                    ),
                    accessor: 'customer_name',
                    diyItemText: isCStation
                      ? i18next.t('客户名')
                      : i18next.t('商户名'),
                    diyEnable: false,
                    minWidth: 120,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('商户标签'),
                    accessor: 'address_label',
                    diyEnable: false,
                    minWidth: 120,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('地理标签'),
                    id: 'area',
                    minWidth: 120,
                    show: false,
                    diyGroupName: i18next.t('基础字段'),
                    accessor: (d) => <div>{d.area || i18next.t('未知')}</div>,
                  },
                  {
                    Header: i18next.t('配送地址'),
                    minWidth: 150,
                    diyEnable: false,
                    accessor: 'receive_address',
                    diyGroupName: i18next.t('基础字段'),
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
                    minWidth: 120,
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
                                  initialVal={
                                    original.delivery_order_sequence || null
                                  }
                                  onSave={(value) =>
                                    this.handleDeliveryOrder(original, value)
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
                    Header: i18next.t('收货时间'),
                    id: 'receive',
                    minWidth: 150,
                    show: false,
                    diyGroupName: i18next.t('基础字段'),
                    accessor: (d) => (
                      <div>{`${formatTime(d.receive_begin_time)} - ${formatTime(
                        d.receive_end_time,
                      )}`}</div>
                    ),
                  },
                  {
                    Header: i18next.t('金额'),
                    id: 'total_price',
                    minWidth: 80,
                    show: false,
                    diyGroupName: i18next.t('基础字段'),
                    accessor: (d) => (
                      <div>
                        {Big(d.total_price).div(100).toFixed(2)}
                        {Price.getUnit(d.fee_type)}
                      </div>
                    ),
                  },
                  {
                    Header: i18next.t('订单状态'),
                    id: 'status',
                    minWidth: 80,
                    show: false,
                    diyGroupName: i18next.t('基础字段'),
                    accessor: (d) => <div>{status[d.status]}</div>,
                  },
                  {
                    Header: i18next.t('订单类型'),
                    id: 'order_process_name',
                    minWidth: 80,
                    show: !isCStation,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { original } }) => (
                      <div>
                        {renderOrderTypeName(original.order_process_name)}
                      </div>
                    ),
                  },
                  {
                    Header: i18next.t('承运商/司机'),
                    accessor: 'driver',
                    diyEnable: false,
                    minWidth: 150,
                    diyGroupName: i18next.t('基础字段'),
                    Cell: ({ row: { index, original } }) => {
                      const {
                        carrier_name,
                        driver_name,
                        driver_status,
                        driver_id,
                        status,
                      } = original
                      const text =
                        driver_status === 0 ? i18next.t('(停用)') : ''
                      return (
                        <Cascader
                          filtrable
                          inputProps={{
                            className: +status === 15 ? 'gm-text-desc' : '',
                          }}
                          key={`${driver_id}_${index}`}
                          data={_carrierDriverList}
                          valueRender={() =>
                            driver_id
                              ? `${carrier_name || ''},${
                                  driver_name || ''
                                }${text}`
                              : undefined
                          }
                          onChange={(value) =>
                            this.handleSaveAssign(value, index)
                          }
                        />
                      )
                    },
                  },
                  {
                    Header: (
                      <div>
                        {i18next.t('打印状态')}
                        <ToolTip
                          popup={
                            <div className='gm-padding-5'>
                              {i18next.t('记录配送单打印次数')}
                            </div>
                          }
                        />
                      </div>
                    ),
                    id: 'print_times',
                    diyItemText: i18next.t('打印状态'),
                    minWidth: 80,
                    show: false,
                    diyGroupName: i18next.t('基础字段'),
                    accessor: (d) => {
                      const v = d.print_times
                      return v
                        ? `${i18next.t('已打印')}(${v})`
                        : i18next.t('未打印')
                    },
                  },
                  {
                    Header: i18next.t('收货方式'),
                    id: 'receive_way',
                    minWidth: 80,
                    show: false,
                    diyGroupName: i18next.t('基础字段'),
                    accessor: (d) => (
                      <div>{findReceiveWayById(d.receive_way) || '-'}</div>
                    ),
                  },
                  {
                    Header: i18next.t('自提点'),
                    accessor: 'pick_up_st_name',
                    show: false,
                    minWidth: 100,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('自提点联系方式'),
                    accessor: 'pick_up_st_phone',
                    show: false,
                    minWidth: 80,
                    diyGroupName: i18next.t('基础字段'),
                  },
                  {
                    Header: i18next.t('订单备注'),
                    id: 'remark',
                    diyGroupName: i18next.t('基础字段'),
                    minWidth: 80,
                    accessor: (d) => <TipPopover text={d.remark || '-'} />,
                  },
                  {
                    Header: i18next.t('查看图片'),
                    diyEnable: false,
                    minWidth: 60,
                    id: 'img',
                    diyGroupName: i18next.t('基础字段'),
                    accessor: (d) =>
                      d.receive_img_url ? (
                        <SVGPhoto
                          className='gm-cursor text-primary gm-text-16'
                          onClick={() =>
                            ImagePreview({
                              images: [d.receive_img_url],
                              index: 0,
                            })
                          }
                        />
                      ) : null,
                  },
                  ..._.map(infoConfigs, (v) => ({
                    Header: v.field_name,
                    diyGroupName: i18next.t('基础字段'),
                    minWidth: 100,
                    accessor: `customized_field.${v.id}`,
                    Cell: ({ row: { original } }) => {
                      if (v.field_type === COMPONENT_TYPE_TEXT) {
                        return (
                          <TipPopover
                            text={getFiledData(v, original.customized_field)}
                          />
                        )
                      }
                      return (
                        <div>{getFiledData(v, original.customized_field)}</div>
                      )
                    },
                  })),
                  canPrintDistribute && {
                    Header: i18next.t('单据打印'),
                    id: 'print_actions',
                    diyEnable: false,
                    diyGroupName: i18next.t('基础字段'),
                    width: 80,
                    accessor: (order) => {
                      // 缺货 或者 库存不足 都confirm提醒
                      const mustConfirm =
                        order.has_unweighted || order.has_out_of_stock
                      const orderIdList = [order.id]
                      const curAddressId = order.address_id?.[0]
                      return (
                        <TableXUtil.OperationCell>
                          <OrderPrePrintBtn
                            orderIdList={orderIdList}
                            mustConfirm={mustConfirm}
                            curAddressId={curAddressId}
                            deliveryType={1}
                            showCommonSwitchControl // 查看编辑单据不需要合并打印配送单
                          >
                            <span className='gm-text-14 gm-text-hover-primary'>
                              <SVGPrint />
                            </span>
                          </OrderPrePrintBtn>
                        </TableXUtil.OperationCell>
                      )
                    },
                  },
                ],
                (_) => _,
              )}
            />
          </BoxTable>

          {!_.isEmpty(distributeOrderList) && (
            <div
              className='b-overview gm-border gm-padding-5 '
              onClick={() => this.handlePopupOverview()}
            >
              {i18next.t('总览')}
            </div>
          )}
        </>
      </ManagePaginationV2>
    )
  }
}

OrderTab.propTypes = {
  distributeOrder: PropTypes.object,
  global: PropTypes.object,
  switchOrderTabKey: PropTypes.func,
}

export default connect((state) => ({
  distributeOrder: state.distributeOrder,
}))(OrderTab)
