import React, { useState, useRef, useCallback } from 'react'
import { observer } from 'mobx-react'
import store from './store'
import { BoxPanel } from '@gmfe/react'
import { t } from 'gm-i18n'
import { TableXVirtualized, TableXUtil, editTableXHOC } from '@gmfe/table-x'
import { RefPriceTypeSelect } from '../../../../common/components/ref_price_type_hoc'
import Position from '../../../../common/components/position'
import HeaderTip from '../../../../common/components/header_tip'
import EditCellRule from './component/edit_cell_rule_type'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import EditCellOperation from './component/edit_cell_operation'
import EditCellName from './component/edit_cell_name'
import EditCellYXPrice from './component/edit_cell_yx_price'
import EditCellRef from './component/edit_cell_ref_price'
import EditCellRatio from './component/edit_cell_ratio'
import EditCellPrice from './component/edit_cell_original_price'
import EditCellFlashSaleStock from './component/edit_cell_flash_sale_stock'
import EditCellPerLimit from './component/edit_cell_per_limit'
import EditCellState from './component/edit_cell_state'

const { TABLE_X, OperationHeader } = TableXUtil

const KeyboardVirtualTable = keyboardTableXHOC(editTableXHOC(TableXVirtualized))

const List = observer((props) => {
  const { postRefPriceType, refPriceType } = props
  const tableRef = useRef()
  const [highlightIndex, setHighlightIndex] = useState()
  const { skus } = store.detail

  const handleHighlight = useCallback((index) => {
    setHighlightIndex(index)
  }, [])

  const handleDetailAdd = useCallback(() => {
    store.addListItem()
  }, [])

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns = React.useMemo(() => {
    return [
      {
        Header: OperationHeader,
        accessor: 'action',
        width: TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => {
          return (
            <EditCellOperation
              index={cellProps.row.index}
              onAddRow={handleDetailAdd}
            />
          )
        },
      },
      {
        Header: t('商品名/商品ID'),
        accessor: 'name',
        isKeyboard: true,
        Cell: (cellProps) => {
          return <EditCellName index={cellProps.row.index} />
        },
      },
      {
        Header: t('规格'),
        accessor: 'name',
        Cell: (cellProps) => {
          return <EditCellRatio index={cellProps.row.index} />
        },
      },
      {
        Header: (
          <RefPriceTypeSelect
            postRefPriceType={postRefPriceType}
            refPriceType={refPriceType}
          />
        ),
        accessor: 'name',
        Cell: (cellProps) => {
          return (
            <EditCellRef
              index={cellProps.row.index}
              refPriceType={refPriceType}
            />
          )
        },
      },
      {
        Header: t('原价'),
        accessor: 'name',
        Cell: (cellProps) => {
          return <EditCellPrice index={cellProps.row.index} />
        },
      },
      {
        Header: t('计算规则'),
        accessor: 'rule_type',
        width: 200,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <EditCellRule index={cellProps.row.index} />
        },
      },
      {
        Header: (
          <HeaderTip
            title={t('规则价')}
            tip={t('规则价高于原价时，商品将使用原价售卖')}
          />
        ),
        accessor: 'yx_price',
        Cell: (cellProps) => {
          return <EditCellYXPrice index={cellProps.row.index} />
        },
      },
      {
        Header: (
          <HeaderTip
            title={t('活动库存')}
            tip={t('为空表示不限制商品活动库存')}
          />
        ),
        accessor: 'flash_sale_stock',
        Cell: (cellProps) => {
          return <EditCellFlashSaleStock index={cellProps.row.index} />
        },
      },
      {
        Header: (
          <HeaderTip
            title={t('单人限购')}
            tip={t('为空表示不限制单个用户购买数量')}
          />
        ),
        accessor: 'per_limit',
        Cell: (cellProps) => {
          return <EditCellPerLimit index={cellProps.row.index} />
        },
      },
      {
        Header: t('销售状态'),
        accessor: 'state',
        Cell: (cellProps) => {
          return <EditCellState index={cellProps.row.index} />
        },
      },
    ]
  }, [handleDetailAdd, refPriceType, postRefPriceType])

  return (
    <BoxPanel
      icon='bill'
      title={t('商品明细')}
      summary={[{ text: t('合计'), value: skus.length }]}
      collapse
    >
      <Position
        onHighlight={handleHighlight}
        tableRef={tableRef}
        list={skus.slice()}
        placeholder={t('请输入商品名称')}
        filterText={['name']}
        className='gm-padding-lr-10 gm-padding-bottom-10'
      />
      <KeyboardVirtualTable
        onAddRow={handleDetailAdd}
        refVirtualized={tableRef}
        isTrHighlight={(_, index) => index === highlightIndex}
        virtualizedHeight={
          TABLE_X.HEIGHT_HEAD_TR + Math.min(10, skus.length) * TABLE_X.HEIGHT_TR
        }
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        id='flash_sale_edit_table'
        data={skus.slice()}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default List
