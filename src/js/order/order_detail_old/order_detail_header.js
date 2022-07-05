// 暂时应用于移动端，后续废弃
import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  Flex,
  DropDown,
  DropDownItem,
  DropDownItems,
  Loading,
  Dialog,
  Modal,
  RightSideModal,
  Popover,
  FilterSelect,
  Tip,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import qs from 'query-string'
import moment from 'moment'
import classNames from 'classnames'
import { pinYinFilter } from '@gm-common/tool'

import {
  convertNumber2Sid,
  orderStateIcon,
  orderState,
  findReceiveWayById,
} from '../../common/filter'
import { editStatusArr } from '../../common/enum'
import { history, changeDomainName, gioTrackEvent } from '../../common/service'
import globalStore from '../../stores/global'
import { openNewTab, resNameSortByFirstWord } from '../../common/util'
import PrintModal from '../../store_operation/distribute/order_tab/popup_print_modal'
import RemarkInput from '../components/remark_input'

import {
  isStation,
  isCustomerValid,
  isOrderTimeValid,
  isSkuInValid,
  isLK,
  isNoAvailReceiveTime,
} from '../util'
import { isOrderInvalidOld } from './util'
import ReceiveTime from './receive_time_old'
import ReceiveTimeRepair from './repair_receive_time_old'
import RepairOrderTime from './repair_order_time_old'
import { CustomerMsg } from './fragments'

import orderDetailStore from './detail_store_old'
import HeaderNav from './detail_header_nav_old'

const isOrderDistributing = (order) => {
  return order.status === 15 || order.status === 10
}

class OrderDetailHeader extends React.Component {
  constructor(props) {
    super(props)
    this.ostatus = 0
    this.state = {
      customerList: [],
      isSaving: false,
      isCustomerRefreshing: false,
      address_id: '', // 传给后端的商户id
    }
  }

  componentDidMount() {
    // 只有新建拉取商户列表
    if (this.props.orderDetail.viewType === 'create') {
      orderDetailStore.customerSearch().then((list) =>
        this.setState({
          customerList: resNameSortByFirstWord(list).slice(0, 50),
        })
      )
    }
  }

  handleConfirmCancel = () => {
    Dialog.confirm({
      title: i18next.t('提示'),
      children: i18next.t('确认放弃此次修改吗？'),
      disableMaskClose: true,
    }).then(() => {
      this.handleCancel()
    })
  }

  handleCancel = () => {
    const { viewType } = this.props.orderDetail
    if (viewType === 'create') {
      // 发生取消请求打点
      const eventId = this.props.repair
        ? 'station_order_repaire_cancel'
        : 'station_order_cancel'
      gioTrackEvent(eventId, 1, {})
      history.goBack()
    } else if (viewType === 'edit') {
      // 取消修改后,重新拉取数据
      orderDetailStore.get(this.props.orderDetail._id)
    } else if (viewType === 'batch') {
      const orders = this.props.orderBatch.details
      const customer = orders[this.props.batchOrderIndex].customer

      Modal.confirm({
        title: i18next.t('KEY99', {
          VAR1: customer.resname || convertNumber2Sid(customer.address_id),
        }) /* src:`是否移除“${customer.resname || convertNumber2Sid(customer.address_id)}”的待提交订单？` => tpl:是否移除“${VAR1}”的待提交订单？ */,
        children: i18next.t('点击“确认”，将该订单从待提交任务中移除。'),
        okBtnClassName: 'gm-btn-danger',
        onOk: this.props.onSingleOrderCancel,
        onCancel: _.noop,
      })
    }
  }

  handleOrderConfirm = () => {
    const { orderDetail } = this.props
    const { details: skus } = orderDetail
    const needTipSku = _.find(skus, (sku) => {
      return !+sku.sale_price || sku.is_price_timing
    })
    if (!needTipSku) {
      this.handleSave()
    } else {
      Dialog.confirm({
        children: (
          <div>
            {i18next.t('存在销售价为0元或为时价的商品，确定要保存吗？')}
          </div>
        ),
        onOK: () => {
          this.handleSave()
        },
      })
    }
  }

  handleSave = async () => {
    const { orderDetail } = this.props
    const { viewType } = orderDetail
    this.setState({
      isSaving: true,
    })
    // 发送保存请求事件打点
    if (viewType === 'create') {
      const eventId = this.props.repair
        ? 'station_order_repaire_save'
        : 'station_order_new_save'
      gioTrackEvent(eventId, 1, {})
    }

    if (viewType === 'create' || viewType === 'batch') {
      try {
        const result = await orderDetailStore.save(this.props.batchOrderIndex)
        const orderId =
          result.data.new_order_ids[0] || result.data.update_order_ids[0]

        if (orderId) {
          if (viewType === 'batch') {
            Modal.success({
              title: i18next.t('KEY100', {
                VAR1: orderId,
              }) /* src:`已生成订单${orderId}` => tpl:已生成订单${VAR1} */,
              children: i18next.t('点击“确认”，将该订单从待提交任务中移除。'),
              onOk: () => this.props.onSingleOrderCancel(orderId),
            })
          } else {
            history.replace(
              '/order_manage/order/list/detail?' + qs.stringify({ id: orderId })
            )
          }
        }
      } finally {
        this.setState({
          isSaving: false,
        })
      }
    } else if (viewType === 'edit') {
      try {
        if (orderDetail.coupon_amount !== 0) {
          // 有使用优惠券
          await orderDetailStore.checkReturnCoupon().then((json) => {
            if (json.data.max_discount_percent) {
              Dialog.confirm({
                children:
                  i18next.t(
                    /* src:`当前优惠比例已小于订单可享受的最大优惠比例${json.data.max_discount_percent}` => tpl:当前优惠比例已小于订单可享受的最大优惠比例${num} */ 'coupon_order_edit_abnormal_rate',
                    { num: json.data.max_discount_percent }
                  ) +
                  '%，' +
                  i18next.t(
                    '保存后该笔订单将按原价计算销售额，优惠券返还至用户账户，是否继续保存？'
                  ),
                title: i18next.t('提示'),
              }).then(
                () => {
                  orderDetailStore.update()
                },
                () => {
                  console.log('reject')
                }
              )
            } else {
              orderDetailStore.update()
            }
          })
        } else {
          await orderDetailStore.update()
        }
      } finally {
        this.setState({
          isSaving: false,
        })
      }
    }
  }

  handlePrint = async () => {
    // 是否存在称重商品当前尚未称重
    const unWeightedSku = _.find(
      this.props.orderDetail.details,
      (sku) => sku.is_weigh && !sku.weighted
    )
    let confirm = false

    if (unWeightedSku) {
      confirm = await Dialog.confirm({
        children: i18next.t('存在称重商品未称重或已缺货，确定要打印吗？'),
      })
        .then(() => {
          return true
        })
        .catch(() => {
          return false
        })
    }

    if (!unWeightedSku || confirm) {
      const { _id } = this.props.orderDetail
      const addressId = this.props.orderDetail.customer?.address_id

      if (globalStore.isMalaysia()) {
        openNewTab(
          `#/system/setting/distribute_templete/malay_print?${qs.stringify({
            order_ids: _id,
          })}`
        )
      } else {
        RightSideModal.render({
          onHide: RightSideModal.hide,
          style: { width: '300px' },
          children: (
            <PrintModal
              curOrderId={_id}
              curAddressId={addressId}
              closeModal={RightSideModal.hide}
            />
          ),
        })
      }
    }
  }

  handlePrintReport = (id) => {
    const isViewPesticidePermission = globalStore.hasPermission(
      'view_pesticidedetect'
    )
    if (isViewPesticidePermission) {
      openNewTab(`#/order_manage/order/report_print?${qs.stringify({ id })}`)
    } else {
      Tip.info(i18next.t('没有权限'))
    }
  }

  handleSearch = (value) => {
    const { customers, customersNoMore } = this.props.orderDetail

    if (customersNoMore) {
      this.setState({
        customerList: resNameSortByFirstWord(
          pinYinFilter(customers, value, (value) => value.resname)
        ).slice(0, 50),
      })
    } else {
      return orderDetailStore
        .customerSearch(value)
        .then((list) =>
          this.setState({ customerList: resNameSortByFirstWord(list) })
        )
    }
  }

  handleSelect = async (newCustomer) => {
    const { customer, details } = this.props.orderDetail

    if (customer && newCustomer && customer.id === newCustomer.id) return
    if (!details.length) {
      await orderDetailStore.customerSelect(newCustomer)
      newCustomer && (await this.handleCustmoerStatusRefresh())
      // 获取商户上一次订单的备注
      await orderDetailStore.getLastOrderRemark(newCustomer.address_id)
      return
    }

    Dialog.confirm({
      title: i18next.t('警告'),
      children: i18next.t('更换商户将清空商品列表，是否继续？'),
      disableMaskClose: true,
      onOK: async () => {
        await orderDetailStore.customerSelect(newCustomer)
        newCustomer && (await this.handleCustmoerStatusRefresh())
      },
    })
  }

  handleServiceTimeChange = (e) => {
    const { details, time_config_info, serviceTimes } = this.props.orderDetail
    const serviceTime = _.find(
      serviceTimes,
      (time) => time._id === e.target.value
    )
    if (!time_config_info || !details.length) {
      orderDetailStore.serviceTimeChange(serviceTime)
      return
    }

    Dialog.confirm({
      title: i18next.t('警告'),
      children: i18next.t('切换运营时间将清空商品列表，是否继续？'),
      disableMaskClose: true,
      onOK: async () => {
        orderDetailStore.serviceTimeChange(serviceTime)
      },
    })
  }

  renderServiceTimeSelector = () => {
    const {
      viewType,
      customer,
      time_config_info,
      serviceTimes,
      serviceTimesLoading,
    } = this.props.orderDetail

    if (viewType !== 'create') {
      return (time_config_info && time_config_info.name) || '-'
    }

    if (serviceTimesLoading) {
      return <Loading size={20} />
    } else {
      return (
        <select
          value={(time_config_info && time_config_info._id) || ''}
          onChange={this.handleServiceTimeChange}
          className='form-control input-sm'
          disabled={!isCustomerValid(customer)}
          style={{ width: '120px' }}
        >
          <option value=''>{i18next.t('请选择运营时间')}</option>
          {_.map(serviceTimes, (serviceTime) => {
            return (
              <option key={serviceTime._id} value={serviceTime._id}>
                {serviceTime.name}
              </option>
            )
          })}
        </select>
      )
    }
  }

  renderServiceTimeError = () => {
    const { repair, orderDetail } = this.props
    const {
      viewType,
      customer,
      serviceTimes,
      time_config_info,
      currentTime,
      serviceTimesLoading,
      date_time,
    } = orderDetail
    if (serviceTimesLoading) {
      return null
    } else if (
      viewType === 'create' &&
      customer &&
      serviceTimes &&
      !serviceTimes.length
    ) {
      return (
        <span className='gm-text-red'>
          &nbsp;&nbsp;{i18next.t('商户未绑定有效报价单')}
        </span>
      )
    } else if (time_config_info && time_config_info.order_time_limit) {
      const {
        start,
        end,
        e_span_time,
        s_span_time,
      } = time_config_info.order_time_limit

      if (
        !repair &&
        !isOrderTimeValid(
          viewType,
          currentTime,
          start,
          end,
          e_span_time,
          s_span_time
        )
      ) {
        return (
          <span className='gm-text-red'>
            &nbsp;&nbsp;{i18next.t('当前时间无法下单')}
          </span>
        )
      }
      if (
        viewType !== 'view' &&
        !repair &&
        isNoAvailReceiveTime(time_config_info, date_time)
      ) {
        return (
          <span className='gm-text-red'>
            &nbsp;&nbsp;{i18next.t('无可用收货时间')}
          </span>
        )
      }
    }
  }

  handleStatusChange = (e) => {
    orderDetailStore.receiveChange({ status: +e.target.value })
  }

  handleCommentChange = (e) => {
    const newRemark = e.target.value
    if (this.props.batch) {
      orderDetailStore.receiveChangeBatch(
        { remark: newRemark },
        this.props.batchOrderIndex
      )
      return
    }
    orderDetailStore.receiveChange({ remark: newRemark })
  }

  handleLastRemarkSelect(last_remark) {
    orderDetailStore.selectLastRemark(last_remark)
  }

  renderReceiveTime = () => {
    const { orderDetail, repair } = this.props
    const { viewType, customer, time_config_info } = orderDetail

    if (
      viewType === 'view' ||
      isOrderDistributing(orderDetail) ||
      (time_config_info &&
        (time_config_info.type === 0 /* 默认运营时间 */ ||
          time_config_info.pstatus === 1)) /* 运营时间被删除了 */
    ) {
      return (
        <Flex alignCenter className='gm-padding-5'>
          <Flex className='b-order-detail-header-label gm-text-desc'>
            {i18next.t('收货时间')}：
          </Flex>
          <Flex flex alignCenter>
            {customer
              ? `${customer.receive_begin_time}~${customer.receive_end_time}`
              : '-'}
          </Flex>
        </Flex>
      )
    }

    if (time_config_info && repair) {
      return <ReceiveTimeRepair order={orderDetail} />
    } else {
      return (
        <ReceiveTime
          order={orderDetail}
          batch={this.props.batch}
          batchOrderIndex={this.props.batchOrderIndex}
        />
      )
    }
  }

  renderOrderComment() {
    const { orderDetail, repair } = this.props
    const { viewType, time_config_info, date_time } = orderDetail

    if (viewType === 'view') {
      return (
        <Flex flex alignCenter style={{ wordBreak: 'break-all' }}>
          {orderDetail.remark || '-'}
        </Flex>
      )
    }
    const disabled =
      !time_config_info ||
      (!repair && isNoAvailReceiveTime(time_config_info, date_time))

    return (
      <Flex flex alignCenter>
        <RemarkInput
          spu_remark={disabled ? '' : orderDetail.last_remark}
          onSelect={this.handleLastRemarkSelect.bind(this)}
        >
          <input
            type='text'
            value={orderDetail.remark || ''}
            placeholder={
              disabled
                ? ''
                : i18next.t('输入商家对订单的特殊要求（30个字以内）')
            }
            maxLength={30}
            className='form-control input-sm'
            onChange={this.handleCommentChange}
            disabled={disabled}
          />
        </RemarkInput>
      </Flex>
    )
  }

  renderOrderStatus = () => {
    const { orderDetail, repair } = this.props
    const isStatusEditable = globalStore.hasPermission('edit_order_status')
    const { viewType, status } = orderDetail
    this.ostatus = this.ostatus || status
    if (
      !repair &&
      isStatusEditable &&
      viewType === 'edit' &&
      this.ostatus < 15
    ) {
      return (
        <select
          className='form-control input-sm gm-margin-left-10 gm-inline-block'
          style={{ width: '95px' }}
          value={status}
          onChange={this.handleStatusChange}
        >
          {status === 1 ? (
            <option value={1}>{i18next.t('等待分拣')}</option>
          ) : null}
          {_.map(
            _.filter(editStatusArr, (v) => v.id >= this.ostatus),
            (val) => {
              return (
                <option value={val.id} key={val.id}>
                  {val.text}
                </option>
              )
            }
          )}
        </select>
      )
    } else if (orderDetail._id) {
      return (
        <Popover
          showArrow
          left
          top
          type='hover'
          popup={
            <div
              className='gm-bg gm-border gm-padding-5'
              style={{ width: '220px' }}
            >
              {i18next.t('订单状态')}：{orderState(orderDetail.status)}
              {i18next.t('，分拣序号')}：{orderDetail.sort_id}
            </div>
          }
        >
          <div className='gm-inline-block'>
            <i
              className={`glyphicon ${orderStateIcon(
                orderDetail.status
              )} gm-text-desc`}
            />
            <span className='gm-text-desc' style={{ fontSize: '12px' }}>
              {orderState(orderDetail.status)}({orderDetail.sort_id || '-'})
            </span>
          </div>
        </Popover>
      )
    }
  }

  handleCustmoerStatusRefresh = async () => {
    const { customer } = this.props.orderDetail

    this.setState({ isCustomerRefreshing: true })

    try {
      await orderDetailStore.customerStatusRefesh(
        customer.address_id,
        this.props.batchOrderIndex
      )
    } finally {
      this.setState({ isCustomerRefreshing: false })
    }
  }

  handleToCustomerManage(customer) {
    openNewTab(
      changeDomainName('station', 'manage') +
        `/#/customer_manage/customer/manage/${convertNumber2Sid(
          customer.address_id
        )}`
    )
  }

  handleEditClick(repair) {
    // 当商品为【未称重】时，点击【修改】出库数应该为： ''
    orderDetailStore.editableToggle(repair)
  }

  handleAfterSales(id) {
    history.push(
      `/order_manage/order/list/after_sales?${qs.stringify({
        id,
        search: this.props.query.search,
        offset: this.props.query.offset,
      })}`
    )
  }

  renderListCell(customer) {
    return `${customer.name}(${convertNumber2Sid(customer.address_id)}/${
      customer.username
    })`
  }

  renderCustomer = () => {
    const { orderDetail } = this.props
    const { customerList, isCustomerRefreshing } = this.state
    const { viewType, customer, fee_type } = orderDetail
    const resname = customer && customer.extender && customer.extender.resname
    const customerSelected =
      _.find(customerList, (item) => customer && item.id === customer.id) ||
      customer

    const customerInfo = (
      <a
        href={
          changeDomainName('station', 'manage') +
          `/#/customer_manage/customer/manage/${
            customer && convertNumber2Sid(customer.address_id)
          }`
        }
        rel='noopener noreferrer'
        target='_blank'
      >
        {customer
          ? `${resname}/${
              isStation(customer.address_id)
                ? customer.address_id
                : convertNumber2Sid(customer.address_id)
            }`
          : '-'}
      </a>
    )

    if (viewType === 'edit' || viewType === 'view') {
      return customerInfo
    } else if (viewType === 'create' || viewType === 'batch') {
      return (
        <Flex flex>
          <Flex flex className='gm-padding-right-5'>
            {viewType === 'create' && (
              <div style={{ width: '100%' }}>
                <FilterSelect
                  id='customerList'
                  list={customerList}
                  selected={customerSelected}
                  onSearch={this.handleSearch}
                  onSelect={this.handleSelect}
                  placeholder={i18next.t('输入商户名、商户ID或商户账号搜索')}
                  renderItemName={this.renderListCell}
                  isScrollToSelected
                />
              </div>
            )}
            {viewType === 'batch' && (
              <Flex className={classNames({ 'gm-text-red': !resname })}>
                {resname ? customerInfo : i18next.t('商户不存在')}
              </Flex>
            )}
          </Flex>
          {customer && resname ? (
            <Flex alignCenter>
              <i className='ifont ifont-binding-status gm-padding-lr-5' />
              <Popover
                showArrow
                type='hover'
                left
                top
                popup={<CustomerMsg customer={customer} feeType={fee_type} />}
              >
                <div
                  onClick={this.handleToCustomerManage.bind(null, customer)}
                  className={classNames('gm-cursor', {
                    'gm-text-red': !isCustomerValid(customer),
                    'text-primary': [11, 12].includes(
                      customer.customer_credit_type
                    ), // 11: 白名单 12: 信用额度内
                  })}
                >
                  {customer.msg || '-'}
                </div>
              </Popover>
              <Popover
                showArrow
                type='hover'
                left
                top
                popup={
                  <div
                    className='gm-bg gm-border gm-padding-5'
                    style={{ width: '100px' }}
                  >
                    {i18next.t('刷新账户状态')}
                  </div>
                }
              >
                <i
                  className={classNames(
                    'ifont ifont-refresh gm-padding-lr-5 gm-cursor',
                    { 'ifont-spin': isCustomerRefreshing }
                  )}
                  onClick={this.handleCustmoerStatusRefresh}
                />
              </Popover>
            </Flex>
          ) : null}
        </Flex>
      )
    }
  }

  renderEditBtn = (orderDetail) => {
    // 原来逻辑保留
    return orderDetail.status <= 5 ? (
      <Button
        type='primary'
        onClick={this.handleEditClick.bind(this, false)}
        className='gm-margin-top-5 gm-margin-left-5'
      >
        {i18next.t('修改')}
      </Button>
    ) : null
  }

  handleEditDelivery(order_id) {
    openNewTab(`#/order_manage/order/list/edit_delivery?order_id=${order_id}`)
  }

  renderOrderTime = () => {
    const { repair, orderDetail } = this.props
    if (repair) {
      return <RepairOrderTime orderDetail={orderDetail} />
    }
    return orderDetail.date_time
      ? moment(orderDetail.date_time).format('YYYY-MM-DD HH:mm:ss')
      : '-'
  }

  render() {
    const { orderDetail, repair, query } = this.props
    const is_view_pesticidedetect = globalStore.hasPermission(
      'view_pesticidedetect'
    )
    const isOldOrderEditable = globalStore.hasPermission(
      'edit_old_order_change'
    )
    const canEditDistribute = globalStore.hasPermission(
      'distribution_order_edit'
    )
    const isEditOrder = globalStore.hasPermission('edit_order')
    const addException = globalStore.hasPermission('add_exception')
    const {
      viewType,
      customer,
      _id,
      freeze,
      pay_status,
      settle_way,
      time_config_info,
      date_time,
    } = orderDetail
    const disabled =
      !!isOrderInvalidOld(orderDetail) ||
      this.state.isSaving ||
      !time_config_info ||
      (!repair && isNoAvailReceiveTime(time_config_info, date_time))
    const customerReceiveWay = customer && customer.receive_way
    const receiveWay =
      viewType === 'create' || viewType === 'batch' ? 1 : customerReceiveWay
    return (
      <Flex className='b-order-detail-header gm-padding-tb-10 gm-border-bottom'>
        <HeaderNav query={query} viewType={viewType}>
          <Flex flex={1} column className='gm-padding-left-15'>
            <Flex alignCenter className='gm-padding-5'>
              <Flex className='b-order-detail-header-label gm-text-desc'>
                {i18next.t('商户')}：
              </Flex>
              <Flex flex alignCenter>
                {this.renderCustomer()}
              </Flex>
            </Flex>
            <Flex alignCenter className='gm-padding-5'>
              <Flex className='b-order-detail-header-label gm-text-desc'>
                {i18next.t('运营时间')}：
              </Flex>
              <Flex flex alignCenter>
                {this.renderServiceTimeSelector()}
                {this.renderServiceTimeError()}
              </Flex>
            </Flex>

            {this.renderReceiveTime()}

            <Flex alignCenter className='gm-padding-5'>
              <Flex className='b-order-detail-header-label gm-text-desc'>
                {i18next.t('订单备注')}：
              </Flex>
              {this.renderOrderComment()}
            </Flex>

            <Flex alignCenter className='gm-padding-5'>
              <Flex className='b-order-detail-header-label gm-text-desc'>
                {i18next.t('下单时间')}：
              </Flex>
              {this.renderOrderTime()}
            </Flex>
          </Flex>

          <Flex
            flex={1}
            column
            className='b-order-detail-header-right gm-padding-lr-15'
          >
            <Flex alignCenter className='gm-padding-5'>
              <Flex className='b-order-detail-header-label gm-text-desc'>
                {i18next.t('订单号')}：
              </Flex>
              <Flex flex alignCenter>
                {orderDetail._id || '-'}&nbsp;&nbsp;
                {this.renderOrderStatus()}
              </Flex>
            </Flex>
            <Flex alignCenter className='gm-padding-5'>
              <Flex className='b-order-detail-header-label gm-text-desc'>
                {i18next.t('收货人')}：
              </Flex>
              <Flex flex alignCenter>
                {customer
                  ? `${customer.receiver_name}（${customer.receiver_phone}）`
                  : '-'}
              </Flex>
            </Flex>
            <Flex alignCenter className='gm-padding-5'>
              <Flex className='b-order-detail-header-label gm-text-desc'>
                {i18next.t('地址')}：
              </Flex>
              <Flex flex alignCenter>
                <div>
                  {customer && (
                    <span
                      className='label label-primary gm-text-12'
                      style={{ padding: '1px 2px', marginRight: '2px' }}
                    >
                      {findReceiveWayById(receiveWay) || i18next.t('未知')}
                    </span>
                  )}
                  {customer ? customer.address : '-'}
                </div>
              </Flex>
            </Flex>
            <Flex className='gm-padding-5' alignCenter>
              <Flex className='b-order-detail-header-label gm-text-desc'>
                {i18next.t('最后操作')}：
              </Flex>
              <Flex flex alignCenter>
                {orderDetail.last_op_user || '-'}(
                {orderDetail.last_op_time
                  ? moment(orderDetail.last_op_time).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )
                  : '-'}
                )
              </Flex>
            </Flex>

            <Flex justifyEnd>
              {viewType !== 'view' ? (
                <div style={{ textAlign: 'right' }}>
                  <Button
                    onClick={this.handleConfirmCancel}
                    className='gm-margin-top-5'
                  >
                    {i18next.t('取消')}
                  </Button>
                  <Button
                    type='primary'
                    onClick={this.handleOrderConfirm}
                    className='gm-margin-left-5 gm-margin-top-5'
                    title={isSkuInValid(orderDetail) || ''}
                    loading={this.state.isSaving}
                    disabled={disabled}
                  >
                    {i18next.t('保存')}
                  </Button>
                </div>
              ) : (
                <div style={{ textAlign: 'right' }}>
                  {isOldOrderEditable &&
                  isOrderDistributing(orderDetail) &&
                  !isLK(_id) ? (
                    <Popover
                      showArrow
                      arrowBorderColor='#5a5a5a'
                      arrowBgColor='#5a5a5a'
                      type='hover'
                      left
                      top
                      popup={
                        <div
                          style={{
                            padding: '2px',
                            width: '200px',
                            color: '#fff',
                            background: '#5a5a5a',
                          }}
                        >
                          {i18next.t('修改已配送订单，请谨慎操作！')}
                        </div>
                      }
                    >
                      <div style={{ display: 'inline-block' }}>
                        <Button
                          type='danger'
                          plain
                          onClick={this.handleEditClick.bind(this, true)}
                          className='gm-margin-top-5'
                        >
                          {i18next.t('追加修改')}
                        </Button>
                      </div>
                    </Popover>
                  ) : null}
                  {isEditOrder && this.renderEditBtn(orderDetail)}
                  {addException && viewType === 'view' && !isLK(_id) ? (
                    <Button
                      type='primary'
                      plain
                      onClick={this.handleAfterSales.bind(this, _id)}
                      disabled={
                        !!(freeze || (pay_status === 1 && settle_way === 2))
                      }
                      className='gm-margin-left-10 gm-margin-top-5'
                    >
                      {i18next.t('售后')}
                    </Button>
                  ) : null}
                  {is_view_pesticidedetect || canEditDistribute ? (
                    <DropDown
                      split
                      cartClassName='gm-btn gm-btn-primary gm-btn-plain gm-margin-top-5 b-order-report'
                      popup={
                        <DropDownItems>
                          {canEditDistribute && (
                            <DropDownItem
                              onClick={this.handleEditDelivery.bind(
                                this,
                                orderDetail._id
                              )}
                            >
                              {i18next.t('编辑配送单')}
                            </DropDownItem>
                          )}
                          {is_view_pesticidedetect && (
                            <DropDownItem
                              onClick={this.handlePrintReport.bind(
                                this,
                                orderDetail._id
                              )}
                            >
                              {i18next.t('录入检测报告')}
                            </DropDownItem>
                          )}
                        </DropDownItems>
                      }
                      style={{
                        marginLeft: '5px',
                      }}
                    >
                      <Button
                        type='primary'
                        plain
                        onClick={this.handlePrint}
                        className='gm-margin-left-5 gm-margin-top-5'
                      >
                        {i18next.t('打印')}
                      </Button>
                    </DropDown>
                  ) : (
                    <Button
                      type='primary'
                      plain
                      onClick={this.handlePrint}
                      className='gm-margin-left-5 gm-margin-top-5'
                    >
                      {i18next.t('打印')}
                    </Button>
                  )}
                </div>
              )}
            </Flex>
          </Flex>
        </HeaderNav>
      </Flex>
    )
  }
}

OrderDetailHeader.propTypes = {
  repair: PropTypes.bool.isRequired,
  batch: PropTypes.bool,
  batchOrderIndex: PropTypes.number,
  onSingleOrderCancel: PropTypes.func,
  orderDetail: PropTypes.object,
  orderBatch: PropTypes.object,
}

OrderDetailHeader.defaultProps = {
  repair: false,
  batch: false,
  onSingleOrderCancel: _.noop,
}

export default OrderDetailHeader
