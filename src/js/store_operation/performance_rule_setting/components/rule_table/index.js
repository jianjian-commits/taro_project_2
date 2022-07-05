/*
 * @Description: 计件和计重规则表格
 */
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { editTableXHOC, TableXUtil, TableX } from '@gmfe/table-x'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import { t } from 'gm-i18n'

import RenderOperate from './render_operate'
import RenderTaskHeader from './render_task_header'
import RenderPriceHeader from './render_price_header'
import RenderMaxValue from './render_max_value'
import RenderPerf from './render_perf'

const { TABLE_X, OperationHeader } = TableXUtil
const KeyboardDiyEditTable = keyboardTableXHOC(editTableXHOC(TableX))

function CalculateRuleTable(props) {
  const { isPiece, data, disabled } = props

  const { onAddRow, onDeleteRow, onChange } = props

  const rowsSize = data.length

  const columns = useMemo(
    () => [
      {
        id: 'id',
        width: 70,
        Header: t('序号'),
        accessor: 'id',
        Cell: ({ row: { index } }) => index + 1,
      },
      {
        Header: OperationHeader,
        accessor: 'action',
        width: TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => (
          <RenderOperate
            index={cellProps.row.index}
            disabled={disabled}
            rowsSize={rowsSize}
            onAddRow={onAddRow}
            onDeleteRow={onDeleteRow}
          />
        ),
      },
      {
        id: 'min',
        accessor: 'min',
        Header: () => <RenderTaskHeader isMin isPiece={isPiece} />,
      },
      {
        id: 'value',
        accessor: 'value',
        Header: () => <RenderTaskHeader isPiece={isPiece} />,
        Cell: (cellProps) => (
          <RenderMaxValue
            index={cellProps.row.index}
            value={cellProps.row.original.value}
            disabled={disabled}
            rowsSize={rowsSize}
            onChange={onChange}
          />
        ),
        isKeyboard: true,
      },
      {
        id: 'perf',
        accessor: 'perf',
        width: 200,
        Header: () => <RenderPriceHeader isPiece={isPiece} />,
        Cell: (cellProps) => (
          <RenderPerf
            index={cellProps.row.index}
            value={cellProps.row.original.perf}
            disabled={disabled}
            onChange={onChange}
          />
        ),
        isKeyboard: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, isPiece, rowsSize],
  )
  return (
    <>
      <KeyboardDiyEditTable
        className='gm-border'
        style={{ width: '100%' }}
        id={`${isPiece ? 'piece' : 'weight'}RuleTable`}
        data={data}
        onAddRow={onAddRow}
        columns={columns}
      />
      <div className='gm-text-desc gm-margin-top-5'>
        {t(
          isPiece
            ? '计件的计数规则统一按任务数计算，即客户下单2斤白菜，10箱萝卜，记录任务数为2'
            : '表明实际分拣的结果数，客户下单2斤白菜，10箱萝卜，实际出库1斤白菜，9箱萝卜，分拣出库数为10',
        )}
      </div>
    </>
  )
}

CalculateRuleTable.propTypes = {
  isPiece: PropTypes.bool,
  data: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
  onAddRow: PropTypes.func.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default CalculateRuleTable
