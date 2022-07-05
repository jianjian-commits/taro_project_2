import React, { useMemo } from 'react'
import { editTableXHOC, TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import { InputNumberV2, RecommendInput, Flex } from '@gmfe/react'

import store from '../store'
import { observer } from 'mobx-react'
import { AFTER_SALES_TYPE, isSelectDisable } from '../util'
import Big from 'big.js'
import _ from 'lodash'
import styled from 'styled-components'
import Calculator from './calculator'

const StyledInputNumber = styled(InputNumberV2)`
  max-width: 180px;
`

const StyledInput = styled(RecommendInput)`
  max-width: 280px;
`

const EditTable = editTableXHOC(TableX)
const { TABLE_X, OperationHeader, EditOperation } = TableXUtil

const AbnormalAmount = observer(({ index, parentRow }) => {
  const {
    _idIndex,
    after_sales_type,
    clean_food,
    sale_unit_name,
    std_unit_name_forsale,
    _std_real_quantity,
    totalAbnormalCount,
    index: parentIndex,
  } = parentRow

  const _typeConfig = AFTER_SALES_TYPE[after_sales_type]
  const data = store[_typeConfig.dataName].get(_idIndex)

  const { exception_amount } = data[index]

  const max = +Big(99999)
    .minus(_std_real_quantity)
    .minus(totalAbnormalCount)
    .plus(exception_amount || 0)

  const min = +Big(0)
    .minus(_std_real_quantity) // 这里是最小异常数
    .minus(totalAbnormalCount) // 这里是当前还可使用的最小异常数
    .plus(exception_amount || 0) // 需要补回当前输入的

  const handleChange = (value) => {
    store.changeSubValue(
      _typeConfig.typeName,
      _idIndex,
      index,
      'exception_amount',
      value,
    )

    let totalAbnormal = 0
    _.each(data, (item) => {
      totalAbnormal = +Big(item.exception_amount || 0)
        .plus(totalAbnormal)
        .toFixed(2)
    })

    // 计算总异常数
    store.changeDetailItem(parentIndex, 'totalAbnormalCount', totalAbnormal)
    // 计算总记账数
    store.changeDetailItem(
      parentIndex,
      'totalBillingNumber',
      +Big(_std_real_quantity).plus(totalAbnormal),
    )
  }

  // 异常数需要type为异常才可编辑
  return _typeConfig.typeName === 'abnormal' ? (
    <Flex alignCenter>
      <StyledInputNumber
        value={exception_amount}
        min={min}
        max={max}
        onChange={handleChange}
        placeholder={t('异常数')}
      />
      <div className='gm-gap-5' />
      <div>
        {clean_food
          ? sale_unit_name // 如果是净菜就用销售单位
          : std_unit_name_forsale}
      </div>
    </Flex>
  ) : (
    '-'
  )
})

const RefundAmount = observer(({ index, parentRow }) => {
  const {
    _idIndex,
    after_sales_type,
    clean_food,
    sale_unit_name,
    std_unit_name_forsale,
    _std_real_quantity, // 出库数
    totalRefundCount, // 总退货数
    index: parentIndex,
  } = parentRow

  const _typeConfig = AFTER_SALES_TYPE[after_sales_type]
  const data = store[_typeConfig.dataName].get(_idIndex)
  const { request_amount_forsale } = data[index]

  const max = +Big(_std_real_quantity)
    .minus(totalRefundCount)
    .plus(request_amount_forsale || 0)

  const handleChange = (value) => {
    store.changeSubValue(
      _typeConfig.typeName,
      _idIndex,
      index,
      'request_amount_forsale',
      value,
    )

    let totalRefund = 0
    _.each(data, (item) => {
      totalRefund += item.request_amount_forsale
    })

    // 计算总退货数
    store.changeDetailItem(
      parentIndex,
      'totalRefundCount',
      +Big(totalRefund).toFixed(2),
    )
  }

  // 退货数需要type为退货才可编辑
  return _typeConfig.typeName === 'refund' ? (
    <Flex alignCenter>
      <StyledInputNumber
        value={request_amount_forsale}
        onChange={handleChange}
        min={0}
        max={max}
        placeholder={t('退货数')}
        disabled={isSelectDisable(data[index], _typeConfig.typeName)}
        className='form-control input-sm b-order-price-input'
      />
      <div className='gm-gap-5' />
      {clean_food
        ? sale_unit_name // 如果是净菜就用销售单位
        : std_unit_name_forsale}
      <Calculator
        sku={parentRow}
        type={t('退货')}
        handleOk={(value) => {
          // request_amount_forsale = value;
          handleChange(value)
        }}
      />
    </Flex>
  ) : (
    '-'
  )
})

const Action = observer(({ index, parentRow }) => {
  const { _idIndex, after_sales_type, index: parentIndex } = parentRow
  const _typeConfig = AFTER_SALES_TYPE[after_sales_type]
  const data = store[_typeConfig.dataName].get(_idIndex)

  const handleAdd = () => {
    store.addAfterSales(_typeConfig.dataName, _idIndex)
  }

  const handleDel = () => {
    store.delAfterSales(_typeConfig.dataName, _idIndex, index, parentIndex)
  }
  return (
    <EditOperation
      onAddRow={handleAdd}
      onDeleteRow={
        data.length > 1 && !isSelectDisable(data[index], _typeConfig.typeName) // state>=2也不能删除了
          ? handleDel
          : undefined
      }
    />
  )
})

const Reason = observer(({ index, parentRow }) => {
  const { _idIndex, after_sales_type } = parentRow
  const _typeConfig = AFTER_SALES_TYPE[after_sales_type]
  const data = store[_typeConfig.dataName].get(_idIndex)
  const { exception_reason_text } = data[index]

  const { reasonList } = store
  return after_sales_type > 0 ? (
    <StyledInput
      disabled={isSelectDisable(data[index], _typeConfig.typeName)}
      data={reasonList.slice()}
      value={exception_reason_text}
      onChange={(value) =>
        store.changeSubValue(
          _typeConfig.typeName,
          _idIndex,
          index,
          'exception_reason_text',
          value,
        )
      }
      inputMaxLength={15}
    />
  ) : (
    '-'
  )
})

const SubTable = observer((props) => {
  const { parentRow } = props
  const { after_sales_type, _idIndex } = parentRow
  const _typeConfig = AFTER_SALES_TYPE[after_sales_type]
  const data = _typeConfig.dataName
    ? store[_typeConfig.dataName].get(_idIndex)
    : []

  const columns = useMemo(() => {
    return [
      {
        Header: OperationHeader,
        accessor: 'action',
        fixed: 'left',
        width: TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => {
          const { index } = cellProps.row
          return <Action index={index} parentRow={parentRow} />
        },
      },
      {
        Header: t('异常数'),
        accessor: 'abnormal_amount',
        minWidth: TABLE_X.WIDTH_NUMBER,
        Cell: (cellProps) => {
          const { index } = cellProps.row

          return <AbnormalAmount index={index} parentRow={parentRow} />
        },
      },
      {
        Header: t('退货数'),
        accessor: 'refund_amount',
        minWidth: TABLE_X.WIDTH_NUMBER,
        Cell: (cellProps) => {
          const { index } = cellProps.row

          return <RefundAmount index={index} parentRow={parentRow} />
        },
      },
      {
        Header: t('售后原因'),
        accessor: 'reason',
        minWidth: 130,
        Cell: (cellProps) => {
          const { index } = cellProps.row
          return <Reason index={index} parentRow={parentRow} />
        },
      },
    ]
  }, [parentRow])

  return <EditTable data={data.slice()} columns={columns} />
})

export default SubTable
