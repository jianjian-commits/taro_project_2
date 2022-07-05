import { t } from 'gm-i18n'
import React, { useState } from 'react'
import { observer } from 'mobx-react'
import {
  selectTableXHOC,
  TableX,
  subTableXHOC,
  TableXUtil
} from '@gmfe/table-x'
import { Dialog, Tip } from '@gmfe/react'
import _ from 'lodash'

import store from './store'
import globalStore from '../../../stores/global'
import { refundStatusFliter, getPrice } from '../util'

const SubSelectTableTableX = selectTableXHOC(subTableXHOC(TableX))
const { OperationHeader } = TableXUtil

const SubTable = observer(props => {
  const { mIndex } = props
  const { refundOrdersList } = store

  const [isRefunding, setRefunding] = useState(false)

  // 获取退款状态
  const renderRefundStatus = status => {
    const res = _.find(refundStatusFliter, s => s.value === status)
    return (res && res.text) || ''
  }

  // 单个商品退款
  const handleSkuRefund = id => {
    if (isRefunding) {
      // 防重复点击
      Tip.info(t('商品已经发起退款'))
      return
    }

    setRefunding(true)
    Dialog.confirm({
      children: t('确认将所选微信支付的退款金额原路退回吗？'),
      title: t('退款提示')
    })
      .then(() => {
        const order = refundOrdersList[mIndex]
        const data = [
          {
            sku_ids: id,
            order_id: order.order_id,
            refund_type: order.refund_type // 退款类型： 1-先款差额退款, 2-整单退款
          }
        ]
        store
          .dealSkuRefund({ refund_data: JSON.stringify(data) })
          .then(() => {
            setRefunding(false)
          })
          .catch(() => setRefunding(false))
      })
      .catch(() => {
        setRefunding(false)
        return false
      })
  }

  const subColumns = [
    {
      Header: t('商品名称'),
      accessor: 'sku_name'
    },
    {
      Header: t('商品ID'),
      accessor: 'sku_id'
    },
    {
      Header: t('售后异常数'),
      accessor: 'abnormal_quantity'
    },
    {
      Header: t('售后原因'),
      accessor: 'after_sale_reason'
    },
    {
      Header: t('售后金额'),
      id: 'after_sale_amount',
      Cell: cellProps => {
        const { original } = cellProps.row
        return <div>{getPrice(original, 'after_sale_amount')}</div>
      }
    },
    {
      Header: t('退款状态'),
      id: 'refund_status',
      Cell: cellProps => {
        const { original } = cellProps.row
        return <div>{renderRefundStatus(original.refund_status)}</div>
      }
    },
    {
      Header: t('退款说明'),
      accessor: 'refund_msg'
    },
    globalStore.hasPermission('order_refund') && {
      Header: OperationHeader,
      id: 'operation',
      Cell: cellProps => {
        const {
          row: { original }
        } = cellProps
        const { refund_status } = original

        // 除退款失败或未处理退款，否则不可再次退款, value = 3 表示退款失败, value = 4表示还未发起退款
        if (refund_status !== 3 && refund_status !== 4) {
          return <div className='text-center'>-</div>
        }

        // 防重复点击
        return (
          <a
            className='gm-cursor text-primary text-center'
            onClick={() => handleSkuRefund([original.sku_id])}
          >
            {refund_status === 4 ? t('退款') : t('重新提交')}
          </a>
        )
      }
    }
  ].filter(_ => _)

  return (
    <SubSelectTableTableX
      id={`refund_sku_list${mIndex}`}
      data={refundOrdersList[mIndex].details.slice()}
      columns={subColumns}
      keyField='sku_id'
      selected={refundOrdersList[mIndex].selected.slice()}
      onSelect={selected => store.setSelected('sku', selected, mIndex)}
    />
  )
})

export default SubTable
