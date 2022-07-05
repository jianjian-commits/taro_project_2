import React, { useState, useRef } from 'react'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import { observer, Observer } from 'mobx-react'
import {
  BoxPanel,
  Modal,
  Flex,
  ToolTip,
  Popover,
  Price,
  RightSideModal,
} from '@gmfe/react'
import {
  editTableXHOC,
  fixedColumnsTableXHOC,
  TableXVirtualized,
  diyTableXHOC,
  TableXUtil,
  selectTableXHOC,
} from '@gmfe/table-x'
import moment from 'moment'
import { KCInput } from '@gmfe/keyboard'
import { t } from 'gm-i18n'
import Big from 'big.js'
import store from './store'
import Position from 'common/components/position'
import ProductNameCell from './components/product_name_cell'
import StdPriceCell from './components/std_price_cell'
import StdQuantityCell from './components/std_quantity_cell'
import MoneyCell from './components/money_cell'
import ShelfNameCell from './components/shelf_name_cell'
import ProductRemarkCell from './components/product_remark_cell'
import ProductionTimeCell from './components/production_time_cell'
import ChooseSideModal from './components/choose_side_modal'
import BatchSetShelfModal from './components/batch_set_shelf_modal'
import BatchSetProductTime from './components/batch_set_product_time'
import KeyboardTip from 'common/components/key_board_tips'
import SvgRefresh from 'svg/refresh.svg'

const KeyboardVirtualTable = selectTableXHOC(
  diyTableXHOC(
    keyboardTableXHOC(fixedColumnsTableXHOC(editTableXHOC(TableXVirtualized))),
  ),
)
const DiyTableVirtualized = diyTableXHOC(TableXVirtualized)

const { OperationHeader, TABLE_X, EditOperation } = TableXUtil

// 商品明细
const ItemDetail = () => {
  const tableRef = useRef()
  const { itemDetailList = [], tableSelected = [], status } = store
  const isAdd = status !== 'detail'
  const [highlightIndex, setHighlightIndex] = useState()

  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(12, itemDetailList.length) * TABLE_X.HEIGHT_TR

  const onRowChange = (rowData, index) => {
    const {
      id,
      sku_name,
      sku_id,
      price,
      ratio,
      std_unit_name,
      sale_unit_name,
      reference_cost,
      plan_amount,
      plan_finish_time,
    } = rowData
    const changeData = {
      proc_order_custom_id: id,
      sku_name,
      sku_id,
      price,
      ratio,
      sale_unit_name,
      std_unit_name,
      reference_cost,
      sale_quantity: Number(plan_amount),
      production_time: plan_finish_time
        ? moment(plan_finish_time).format('YYYY-MM-DD')
        : plan_finish_time,
      plan_finish_time,
    }

    store.onRowDataChange(index, { ...changeData })
  }

  // 弹出抽屉选择加工单
  const handleChoose = (original, index) => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      title: t('选择加工单'),
      style: { width: '750px' },
      children: (
        <ChooseSideModal
          onRowChange={onRowChange}
          onCancel={() => RightSideModal.hide()}
          original={original}
          index={index}
        />
      ),
    })
  }
  // 批量修改存放货位
  const handleBatchSetShelf = () => {
    Modal.render({
      children: <BatchSetShelfModal onCancel={() => Modal.hide()} />,
      title: t('提示'),
      onHide: Modal.hide,
      size: 'sm',
    })
  }

  // 批量设置生产日期
  const handleBatchProductTime = () => {
    Modal.render({
      children: <BatchSetProductTime onCancel={() => Modal.hide()} />,
      title: t('提示'),
      onHide: Modal.hide,
      size: 'sm',
    })
  }

  const columns = [
    {
      Header: t('序号'),
      diyEnable: false,
      accessor: 'index',
      fixed: 'left',
      diyGroupName: t('基础字段'),
      width: TABLE_X.WIDTH_NO,
      Cell: (cellProps) => cellProps.row.index + 1,
    },
    isAdd && {
      Header: OperationHeader,
      accessor: 'action',
      diyEnable: false,
      diyGroupName: t('基础字段'),
      diyItemText: t('操作'),
      fixed: 'left',
      width: TABLE_X.WIDTH_OPERATION,
      Cell: (cellProps) => (
        <EditOperation
          onAddRow={() => store.onAddRow()}
          onDeleteRow={
            itemDetailList.length === 1
              ? undefined
              : () => store.onDeleteRow(cellProps.row.index)
          }
        />
      ),
    },
    {
      Header: t('入库批次'),
      accessor: 'batch_number',
      diyGroupName: t('基础字段'),
      diyEnable: false,
      isKeyboard: true,
      width: 150,
      Cell: (cellProps) => (
        <Observer>
          {() =>
            isAdd ? (
              <KCInput
                type='text'
                value={cellProps.row.original.batch_number}
                onChange={(e) =>
                  store.onRowChange(
                    'batch_number',
                    e.target.value,
                    cellProps.row.index,
                  )
                }
              />
            ) : (
              cellProps.row.original.batch_number
            )
          }
        </Observer>
      ),
    },
    {
      Header: (
        <Flex>
          {t('关联加工单')}
          <ToolTip
            popup={
              <div className='gm-padding-5' style={{ width: '150px' }}>
                {t(
                  '可选关联未完成的加工单，如不选择加工单，可自行填写入库商品',
                )}
              </div>
            }
          />
        </Flex>
      ),
      accessor: 'proc_order_custom_id',
      diyGroupName: t('基础字段'),
      width: 100,
      Cell: (cellProps) => (
        <Observer>
          {() => {
            const {
              original,
              original: { proc_order_custom_id },
              index,
            } = cellProps.row
            return isAdd ? (
              <a onClick={() => handleChoose(original, index)}>
                {proc_order_custom_id || t('选择加工单')}
              </a>
            ) : (
              proc_order_custom_id || '-'
            )
          }}
        </Observer>
      ),
    },
    {
      Header: t('商品名称'),
      accessor: 'sku_name',
      diyEnable: false,
      width: 200,
      diyItemText: t('商品名称'),
      diyGroupName: t('基础字段'),
      isKeyboard: true,
      Cell: (cellProps) => <ProductNameCell index={cellProps.row.index} />,
    },
    {
      Header: t('销售规格'),
      accessor: 'sale_unit',
      diyGroupName: t('基础字段'),
      diyEnable: false,
      width: 100,

      Cell: (cellProps) => (
        <Observer>
          {() => {
            const {
              ratio,
              std_unit_name,
              sale_unit_name,
            } = cellProps.row.original
            return ratio && std_unit_name && sale_unit_name
              ? `${ratio}${std_unit_name}/${sale_unit_name}`
              : '-'
          }}
        </Observer>
      ),
    },
    {
      Header: (
        <Flex>
          {t('入库单价（基本单位）')}
          <ToolTip
            popup={
              <div className='gm-padding-5' style={{ width: '150px' }}>
                {t(
                  '加工单生成的待入库单，入库单价默认值入；当前计划下所有物料的实际用料数 x 领料单价 ÷ 入库数，可修改',
                )}
              </div>
            }
          />
        </Flex>
      ),
      accessor: 'unit_price',
      diyGroupName: t('基础字段'),
      diyEnable: false,
      isKeyboard: true,
      width: 150,
      Cell: (cellProps) => <StdPriceCell index={cellProps.row.index} />,
    },
    isAdd && {
      Header: (
        <Popover
          top
          type='hover'
          popup={
            <div className='gm-padding-5' style={{ width: '150px' }}>
              {t('同步参考成本')}
            </div>
          }
        >
          <SvgRefresh
            style={{ color: '#56a3f2', fontSize: '16px' }}
            onClick={() => store.handleSyncCost()}
          />
        </Popover>
      ),
      width: 100,
      accessor: 'sync',
      diyGroupName: t('基础字段'),
    },
    {
      Header: (
        <Flex>
          {t('入库数（销售单位）')}
          <ToolTip
            popup={
              <div className='gm-padding-5' style={{ width: '150px' }}>
                {t(
                  '加工单生成的待入库单，入库数（销售单位）默认等于加工单的计划生产数，可修改',
                )}
              </div>
            }
          />
        </Flex>
      ),
      accessor: 'sale_quantity',
      diyGroupName: t('基础字段'),
      diyEnable: false,
      isKeyboard: true,
      width: 200,
      Cell: (cellProps) => <StdQuantityCell index={cellProps.row.index} />,
    },
    {
      Header: t('入库数（基本单位）'),
      accessor: 'amount',
      diyGroupName: t('基础字段'),
      diyEnable: false,
      width: 150,
      Cell: (cellProps) => (
        <Observer>
          {() => {
            const {
              sale_quantity,
              ratio,
              std_unit_name,
            } = cellProps.row.original

            return sale_quantity && ratio && std_unit_name
              ? `${Big(sale_quantity || 0)
                  .times(ratio || 0)
                  .toFixed(2)}${std_unit_name}`
              : '-'
          }}
        </Observer>
      ),
    },
    {
      Header: t('入库金额'),
      accessor: 'money',
      diyGroupName: t('基础字段'),
      diyEnable: false,
      width: 150,
      isKeyboard: true,
      Cell: (cellProps) => <MoneyCell index={cellProps.row.index} />,
    },
    {
      Header: (
        <Flex>
          {t('参考成本')}
          <ToolTip
            popup={
              <div className='gm-padding-5' style={{ width: '150px' }}>
                {t(
                  '参考成本=配比值*批次均价+单位加工成本；未关联加工单时，参考成本=单位加工成本',
                )}
              </div>
            }
          />
        </Flex>
      ),
      diyGroupName: t('基础字段'),
      accessor: 'reference_cost',
      diyEnable: false,
      width: 100,
      Cell: (cellProps) => {
        const { reference_cost, std_unit_name } = cellProps.row.original
        return (
          <Flex>
            {reference_cost ? (
              <>
                {reference_cost}
                <span>
                  {Price.getUnit() + '/'}
                  {std_unit_name || '-'}
                </span>
              </>
            ) : (
              '-'
            )}
          </Flex>
        )
      },
    },
    {
      Header: t('存放货位'),
      accessor: 'shelf_name',
      minWidth: 200,
      diyGroupName: t('基础字段'),
      isKeyboard: true,
      Cell: (cellProps) => (
        <ShelfNameCell
          data={cellProps.row.original}
          index={cellProps.row.index}
        />
      ),
    },
    {
      Header: t('生产日期'),
      accessor: 'production_time',
      diyGroupName: t('基础字段'),
      width: 200,
      isKeyboard: true,
      Cell: (cellProps) => (
        <ProductionTimeCell
          data={cellProps.row.original}
          index={cellProps.row.index}
        />
      ),
    },
    {
      Header: t('商品备注'),
      accessor: 'remark',
      diyGroupName: t('基础字段'),
      minWidth: 150,
      isKeyboard: true,
      Cell: (cellProps) => <ProductRemarkCell index={cellProps.row.index} />,
    },
    {
      Header: t('领料人'),
      diyGroupName: t('基础字段'),
      accessor: 'recver',
      diyEnable: false,
      width: 80,
      Cell: (cellProps) => cellProps.row.original.recver || '-',
    },
    {
      Header: t('操作人'),
      diyGroupName: t('基础字段'),
      accessor: 'operator',
      diyEnable: false,
      width: 80,
      Cell: (cellProps) => cellProps.row.original.operator || '-',
    },
  ]

  const Table = isAdd ? KeyboardVirtualTable : DiyTableVirtualized

  const tableProps = isAdd
    ? {
        fixedSelect: true,
        selected: tableSelected.slice(),
        onSelect: store.handleSelected,
        onAddRow: () => store.onAddRow(),
        batchActionBar: tableSelected.length ? (
          <TableXUtil.BatchActionBar
            pure
            onClose={() => store.handleSelected([])}
            count={tableSelected.length}
            batchActions={[
              {
                name: t('批量修改存放货位'),
                onClick: handleBatchSetShelf,
                type: 'edit',
              },
              {
                name: t('批量设置生产日期'),
                onClick: handleBatchProductTime,
                type: 'edit',
              },
            ]}
          />
        ) : null,
      }
    : {}
  return (
    <BoxPanel
      icon='bill'
      title={t('商品明细')}
      collapse
      right={isAdd ? <KeyboardTip /> : null}
      summary={
        <Flex alignCenter>
          <div>
            <span>{t('合计: ')}</span>
            <span className='gm-text-primary gm-text-bold'>
              {itemDetailList.length}
            </span>
            <span className='gm-padding-lr-10 gm-text-desc'>|</span>
          </div>
          <Position
            onHighlight={(i) => setHighlightIndex(i)}
            tableRef={tableRef}
            list={itemDetailList.slice()}
            placeholder={t('请输入商品名称')}
            className='gm-margin-left-10'
            filterText={['name']}
          />
        </Flex>
      }
    >
      <Table
        id='item_detail_table'
        keyField='keyField'
        {...tableProps}
        columns={columns.filter((f) => f)}
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        virtualizedHeight={tableHeight}
        isTrHighlight={(_, index) => index === highlightIndex}
        diyGroupSorting={[t('基础字段')]}
        data={itemDetailList.slice()}
        refVirtualized={tableRef}
      />
    </BoxPanel>
  )
}

export default observer(ItemDetail)
