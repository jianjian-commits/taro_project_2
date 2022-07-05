import React, { useState } from 'react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Input, FunctionSet } from '@gmfe/react'
import { TableXUtil } from '@gmfe/table-x'

import { isLK } from '../util'
import { history } from '../../common/service'
import SVGMore from 'svg/more.svg'
import SVGPen from 'svg/pen.svg'

import store from './store'
import orderStore from '../store'
import globalStore from '../../stores/global'
import { copyOrderTip } from '../util'

const { OperationIconTip } = TableXUtil

const SheetAction = (props) => {
  const { order, index: i, apiDoSelectFocus } = props
  const isDeleteOrderable = globalStore.hasPermission('delete_order')
  const isStatusEditable = globalStore.hasPermission('edit_order_status')
  const isLKReceipt = isLK(order.id)

  const [delRemark, setDelRemark] = useState('')

  const handleSave = (order) => {
    store.orderStatusUpdate(order.status_tmp, [order.id])
  }

  const handleCancel = (index) => {
    store.orderStateEditableToggle(index)
  }

  const handleDel = (index, order) => {
    const isOldOrderEditable = globalStore.hasPermission('edit_old_order')
    store.orderDelete(order.id, index, isOldOrderEditable, delRemark)
  }

  const handleSaveDelRemark = (e) => {
    setDelRemark(e.target.value)
  }

  // isReplenish 区分补录订单
  const handleCopy = async (order, isReplenish) => {
    const {
      customer,
      time_config_info,
      id,
      remark,
      order_process_type_id,
      customized_field,
    } = order

    const callback = (isCopyOrderSyncGoodsPrice) => {
      orderStore.setCopyData({
        remark,
        address_id: +customer.address_id,
        time_config_id: time_config_info._id,
        order_id: id,
        orderType: order_process_type_id,
        customized_field,
        isCopyOrderSyncGoodsPrice,
      })
      // isReplenish, T: 复制至补单，F: 复制至新建
      const url = isReplenish
        ? '/order_manage/order/list/repair_create'
        : '/order_manage/order/create'
      history.push({
        pathname: url,
      })
    }

    if (isReplenish) {
      callback()
      return
    }
    copyOrderTip(false, callback)
  }

  const handleEdit = (index, isStatusEditable) => {
    if (!isStatusEditable || order.status === 15) {
      return
    }
    store.orderStateEditableToggle(index)
    setTimeout(() => {
      apiDoSelectFocus()
    }, 500)
  }

  if (order.edit) {
    return (
      <div className='text-primary'>
        <a onClick={() => handleSave(order)} className='gm-margin-right-5'>
          {i18next.t('保存')}
        </a>
        | <a onClick={() => handleCancel(i)}>{i18next.t('取消')}</a>
      </div>
    )
  }

  const moreActionList = [
    {
      text: i18next.t('复制'),
      children: [
        {
          text: i18next.t('复制至订单'),
          onClick: () => handleCopy(order),
          show: true,
        },
        {
          text: i18next.t('复制至补单'),
          onClick: () => handleCopy(order, true),
          show: globalStore.hasPermission('get_order_supplement_price'),
        },
      ].filter((v) => v.show),
    },
  ]

  const isLKEdit = isLKReceipt && order.status < 10 && isStatusEditable
  const isNoLKEdit = !isLKReceipt && order.status < 15 && isStatusEditable

  // 订单状态 -1 订单已删除 1 等待出库 5 正在分拣 10 正在配送 15 已签收 100 已支付（已废弃）
  // 支付状态 1 未支付 5 部分支付 10 已支付 15 超时关闭
  return (
    <TableXUtil.OperationCell>
      {isLKEdit || isNoLKEdit ? (
        <OperationIconTip tip={i18next.t('编辑')}>
          <span
            className='gm-cursor gm-margin-lr-5 gm-text-14 gm-text-hover-primary'
            onClick={() => handleEdit(i, isStatusEditable)}
          >
            <SVGPen />
          </span>
        </OperationIconTip>
      ) : null}
      {!isLKReceipt && (
        <>
          {_.includes([1, 5, 10, 15], order.status) &&
          !_.includes([5, 10], order.pay_status) &&
          isDeleteOrderable ? (
            <TableXUtil.OperationDelete
              title='警告'
              onClick={() => handleDel(i, order)}
            >
              {i18next.t('订单删除之后无法恢复，是否确认删除？')}
              <br />
              {i18next.t('备注:')}
              <Input
                className='gm-margin-10 form-control'
                style={{ width: '200px' }}
                value={delRemark || ''}
                onChange={(e) => handleSaveDelRemark(e)}
                placeholder={i18next.t('请填写备注，最多可输入20个汉字')}
              />
            </TableXUtil.OperationDelete>
          ) : null}

          <FunctionSet data={moreActionList} right showArrow>
            <span className='gm-cursor gm-margin-lr-5 gm-text-14 gm-text-hover-primary'>
              <SVGMore />
            </span>
          </FunctionSet>
        </>
      )}
    </TableXUtil.OperationCell>
  )
}
SheetAction.propTypes = {
  order: PropTypes.object,
  index: PropTypes.number,
  apiDoSelectFocus: PropTypes.func,
}

export default SheetAction
