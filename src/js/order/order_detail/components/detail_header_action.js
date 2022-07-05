import { i18next } from 'gm-i18n'
import React, { useState } from 'react'
import { Popover, Dialog, Tip, FunctionSet, Button, Modal } from '@gmfe/react'
import ShareQrcode from './share_qrcode'
import qs from 'query-string'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import {
  isSkuInValid,
  isOrderInvalid,
  isNoAvailReceiveTime,
  isLK,
} from '../../util'
import { isOrderDistributing } from '../util'
import globalStore from '../../../stores/global'
import orderDetailStore from '../../store'
import { gioTrackEvent, history } from '../../../common/service'
import { openNewTab } from '../../../common/util'
import { OrderPrePrintBtn } from 'common/components/common_printer_options'
import FinanceVouCherSet from './finance_voucher_set'

const DetailHeaderAction = observer((props) => {
  const { query, repair } = props
  const { orderDetail, skusQuantity } = orderDetailStore
  const {
    viewType,
    time_config_info,
    date_time,
    _id,
    freeze,
    pay_status,
    settle_way,
    details,
    customer,
  } = orderDetail

  const [isSaving, setSaving] = useState(false)
  const [isCreateContinueSaving, setCreateContinueSaving] = useState(false)

  // 是否存在称重商品当前尚未称重
  const hasUnWeightSku = _.some(
    orderDetail.details,
    (sku) => sku.is_weigh && !sku.weighted,
  )

  const handleCancel = () => {
    if (viewType === 'create') {
      const eventId = repair
        ? 'station_order_repaire_cancel'
        : 'station_order_cancel'
      gioTrackEvent(eventId, 1, {})

      history.goBack()
    } else if (viewType === 'edit') {
      // 取消修改后,重新拉取数据
      orderDetailStore.get(_id)
    }
  }

  const handleConfirmCancel = () => {
    Dialog.confirm({
      title: i18next.t('提示'),
      children: i18next.t('确认放弃此次修改吗？'),
      disableMaskClose: true,
    }).then(() => {
      handleCancel()
    })
  }

  const handleSave = async (continueCreate = false) => {
    if (continueCreate) {
      const eventId = repair
        ? 'station_order_repaire_save_repaire'
        : 'station_order_new_save_new'
      gioTrackEvent(eventId, 1, {})
    } else {
      if (viewType === 'create') {
        const eventId = repair
          ? 'station_order_repaire_save'
          : 'station_order_new_save'
        gioTrackEvent(eventId, 1, {})
      }
    }

    if (viewType === 'create') {
      try {
        const result = await orderDetailStore.save(continueCreate)
        const orderId =
          result.data.new_order_ids[0] || result.data.update_order_ids[0]

        if (orderId && !continueCreate) {
          history.replace(
            '/order_manage/order/list/detail?' + qs.stringify({ id: orderId }),
          )
        }
      } finally {
        !continueCreate && setSaving(false)
        continueCreate && setCreateContinueSaving(false)
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
                    { num: json.data.max_discount_percent },
                  ) +
                  '%，' +
                  i18next.t(
                    '保存后该笔订单将按原价计算销售额，优惠券返还至用户账户，是否继续保存？',
                  ),
                title: i18next.t('提示'),
              }).then(
                () => {
                  orderDetailStore.update()
                },
                () => {
                  console.log('reject')
                },
              )
            } else {
              orderDetailStore.update()
            }
          })
        } else {
          await orderDetailStore.update()
        }
      } finally {
        setSaving(false)
      }
    }
  }

  const handleOrderConfirm = (continueCreate = false) => {
    !continueCreate && setSaving(true)
    continueCreate && setCreateContinueSaving(true)
    const { details: skus } = orderDetail
    // 过滤空行
    const skuData = _.filter(skus, (sku) => sku.id !== null)
    const needTipSku = _.find(skuData, (sku) => {
      return !+sku.sale_price || sku.is_price_timing
    })
    const action = () => {
      if (!needTipSku) {
        handleSave(continueCreate)
      } else {
        Dialog.confirm({
          children: (
            <div>
              {i18next.t('存在销售价为0元或为时价的商品，确定要保存吗？')}
            </div>
          ),
        })
          .then(() => {
            handleSave(continueCreate)
          })
          .catch(() => {
            !continueCreate && setSaving(false)
            continueCreate && setCreateContinueSaving(false)
          })
      }
    }
    orderDetailStore
      .checkHasOut(_id)
      .then((res) => {
        // 已出库
        if (res.data.has_out_stock) {
          Dialog.confirm({
            title: i18next.t(`修改提醒`),
            children: i18next.t(
              `此订单关联出库单${_id}已出库，建议将关联出库单冲销后再修改订单，避免订单出库单数据不一致`,
            ),
          }).then(() => {
            action()
          })
        } else {
          action()
        }
      })
      .catch(() => {
        !continueCreate && setSaving(false)
        continueCreate && setCreateContinueSaving(false)
      })
  }

  const handleEditClick = (repair) => {
    orderDetailStore.checkHasOut(_id).then((res) => {
      // 已出库
      if (res.data.has_out_stock) {
        Dialog.confirm({
          title: i18next.t(`修改提醒`),
          children: i18next.t(
            `此订单关联出库单${_id}已出库，建议将关联出库单冲销后再修改订单，避免订单出库单数据不一致`,
          ),
          onOK: () => {
            orderDetailStore.editableToggle(repair)
          },
        })
      } else {
        // 当商品为【未称重】时，点击【修改】出库数应该为： ''
        orderDetailStore.editableToggle(repair)
      }
    })
  }

  const renderEditBtn = (orderDetail) => {
    // 原来逻辑保留
    return orderDetail.status <= 5 ? (
      <Button
        type='primary'
        onClick={() => handleEditClick(false)}
        className='gm-margin-lr-10'
      >
        {i18next.t('修改')}
      </Button>
    ) : null
  }

  // 商品异常
  const handleProductAbnormal = (id) => {
    history.push(
      `/order_manage/order/list/after_sales?${qs.stringify({
        id,
        search: query.search,
        offset: query.offset,
      })}`,
    )
  }

  // 非商品异常
  const handleNonProductAbnormal = (id) => {
    history.push(
      `/order_manage/order/list/non_product_abnormal?${qs.stringify({
        id,
        search: query.search,
        offset: query.offset,
      })}`,
    )
  }

  const handleEditDelivery = (order_id) => {
    openNewTab(`#/order_manage/order/list/edit_delivery?order_id=${order_id}`)
  }

  const handlePrintReport = (id) => {
    const isViewPesticidePermission = globalStore.hasPermission(
      'view_pesticidedetect',
    )
    if (isViewPesticidePermission) {
      openNewTab(`#/order_manage/order/report_print?${qs.stringify({ id })}`)
    } else {
      Tip.info(i18next.t('没有权限'))
    }
  }

  // 分享配送单
  const handleShareQrcode = (resname, _id) => {
    // 根据订单id获取token
    orderDetailStore.orderPrinterGetShareToken(_id).then((json) => {
      const query = {
        group_id: globalStore.groupId,
        order_id: _id,
        station_id: globalStore.stationId,
        token: json.data.token,
        user_name: globalStore.user.name,
      }
      Dialog.dialog({
        title: i18next.t('配送单分享'),
        children: (
          <ShareQrcode
            shareName={`${resname}（${_id}）`}
            shareUrlParam={query}
          />
        ),
        OKBtn: false,
        size: 'md',
      })
    })
  }

  const handlePrintFinanceVoucher = (_id) => {
    Modal.render({
      title: i18next.t('财务凭证打印设置'),
      size: 'sm',
      children: <FinanceVouCherSet _id={JSON.stringify([_id])} />,
      onHide: Modal.hide,
    })
    // openNewTab(`#/system/setting/finance_voucher_printer/print?order_id=${_id}`)
  }

  const getDisabledAfterSaleTip = () => {
    if (freeze) {
      return i18next.t('订单已锁定，请解锁后再进行售后操作')
    }

    if (pay_status === 1 && settle_way === 2) {
      return i18next.t('先款后货订单未支付，无法进行售后操作')
    }

    return null
  }

  // 无商品时不可保存
  const skuData = _.filter(details, (sku) => sku.id !== null)

  const disabled =
    !time_config_info ||
    isSaving ||
    isCreateContinueSaving ||
    !!isOrderInvalid(orderDetail, skusQuantity) ||
    (!repair && isNoAvailReceiveTime(time_config_info, date_time)) ||
    skuData.length === 0

  const is_view_pesticidedetect = globalStore.hasPermission(
    'view_pesticidedetect',
  )
  const isOldOrderEditable = globalStore.hasPermission('edit_old_order_change')
  const canEditDistribute = globalStore.hasPermission('distribution_order_edit')
  const isEditOrder = globalStore.hasPermission('edit_order')
  const addException = globalStore.hasPermission('add_exception')
  const canShareQrCode = globalStore.hasPermission('get_distribute_order_share')

  const isSaleAfterDisabled = !!(
    freeze ||
    (pay_status === 1 && settle_way === 2)
  )

  return (
    <div className='gm-margin-top-5'>
      {viewType !== 'view' ? (
        <div style={{ textAlign: 'right' }}>
          <Button onClick={handleConfirmCancel}>{i18next.t('取消')}</Button>
          <Button
            type='primary'
            onClick={() => handleOrderConfirm(false)}
            className='gm-margin-left-10'
            title={isSkuInValid(orderDetail) || ''}
            loading={isSaving}
            disabled={disabled}
          >
            {i18next.t('保存')}
          </Button>
          {viewType === 'create' ? (
            <Button
              type='primary'
              plain={!disabled}
              onClick={() => handleOrderConfirm(true)}
              className='gm-margin-left-10'
              title={isSkuInValid(orderDetail) || ''}
              loading={isCreateContinueSaving}
              disabled={disabled}
            >
              {repair ? i18next.t('保存并补录') : i18next.t('保存并新建')}
            </Button>
          ) : null}
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
                  type='primary'
                  onClick={() => handleEditClick(true)}
                  className='gm-margin-right-10'
                >
                  {i18next.t('追加修改')}
                </Button>
              </div>
            </Popover>
          ) : null}
          {isEditOrder && renderEditBtn(orderDetail)}

          <OrderPrePrintBtn
            mustConfirm={hasUnWeightSku}
            curAddressId={orderDetail.customer?.address_id}
            orderIdList={[orderDetail._id]}
            deliveryType={1}
            showCommonSwitchControl // 查看编辑单据不需要合并打印配送单
          >
            <Button>{i18next.t('打印')}</Button>
          </OrderPrePrintBtn>

          <div className='gm-gap-10' />

          <FunctionSet
            data={[
              {
                text: (
                  <span title={getDisabledAfterSaleTip()}>
                    {i18next.t('售后')}
                  </span>
                ),
                show: addException && viewType === 'view' && !isLK(_id),
                disabled: isSaleAfterDisabled,
                children: isSaleAfterDisabled
                  ? null
                  : [
                      {
                        text: i18next.t('商品异常'),
                        onClick: () => handleProductAbnormal(_id),
                      },
                      {
                        text: i18next.t('非商品异常'),
                        onClick: () => handleNonProductAbnormal(_id),
                      },
                    ],
              },
              {
                text: i18next.t('编辑配送单'),
                show: canEditDistribute,
                onClick: () => handleEditDelivery(_id),
              },
              {
                text: i18next.t('录入检测报告'),
                show: is_view_pesticidedetect,
                onClick: () => handlePrintReport(_id),
              },
              {
                text: i18next.t('分享'),
                show: canShareQrCode,
                onClick: () =>
                  handleShareQrcode(customer.extender.resname, _id),
              },
              {
                text: i18next.t('打印财务付款凭证'),
                show: true,
                onClick: () => handlePrintFinanceVoucher(_id),
              },
            ]}
            right
          />
        </div>
      )}
    </div>
  )
})

DetailHeaderAction.displayName = 'DetailHeaderAction'

DetailHeaderAction.propTypes = {
  query: PropTypes.object,
  repair: PropTypes.boo,
}

DetailHeaderAction.defaultProps = {
  repair: false,
}

export default DetailHeaderAction
