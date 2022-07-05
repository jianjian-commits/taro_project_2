import React, { useState } from 'react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Input } from '@gmfe/react'
import { TableXUtil } from '@gmfe/table-x'
import { isLK } from '../../../../order/util'
import SVGPen from 'svg/pen.svg'

import store from './store'
import globalStore from 'stores/global'

const SheetAction = (props) => {
  const { order, index: i, apiDoSelectFocus } = props
  // 删除订单 / 编辑订单状态
  const isDeleteOrderable = globalStore.hasPermission('delete_order')
  const isStatusEditable = globalStore.hasPermission('edit_order_status')
  const isLKReceipt = isLK(order.id)

  const [del_remark, setDelRemark] = useState(order.del_remark || '')

  const handleSave = (order) => {
    store.orderStatusUpdate(order.status_tmp, [order.id])
  }

  const handleCancel = (index) => {
    store.orderStateEditableToggle(index)
  }

  const handleDel = (index, order) => {
    const isOldOrderEditable = globalStore.hasPermission('edit_old_order')
    store.orderDelete(order.id, index, isOldOrderEditable, del_remark)
  }

  const handleSaveDelRemark = (e) => {
    setDelRemark(e.target.value)
  }

  const handleEdit = (index, isStatusEditable, e) => {
    e.preventDefault()
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

  const isLKEdit = isLKReceipt && order.status < 10 && isStatusEditable
  const isNoLKEdit = !isLKReceipt && order.status < 15 && isStatusEditable

  // 订单状态 -1 订单已删除 1 等待出库 5 正在分拣 10 正在配送 15 已签收 100 已支付（已废弃）
  // 支付状态 1 未支付 5 部分支付 10 已支付 15 超时关闭
  return (
    <TableXUtil.OperationCell>
      {isLKEdit || isNoLKEdit ? (
        <span
          className='gm-cursor gm-padding-5 gm-padding-left-10 gm-text-14 gm-text-hover-primary'
          onClick={(e) => handleEdit(i, isStatusEditable, e)}
        >
          <SVGPen />
        </span>
      ) : null}
      {/** 未配送未支付 */}
      {!isLKReceipt &&
        (_.includes([1, 5, 10, 15], order.status) &&
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
              className='gm-margin-10'
              style={{ width: '200px' }}
              value={del_remark}
              onChange={handleSaveDelRemark}
              placeholder={i18next.t('请填写备注，最多可输入20个汉字')}
            />
          </TableXUtil.OperationDelete>
        ) : null)}
    </TableXUtil.OperationCell>
  )
}
SheetAction.propTypes = {
  order: PropTypes.object,
  index: PropTypes.number,
  apiDoSelectFocus: PropTypes.func,
}

export default SheetAction
