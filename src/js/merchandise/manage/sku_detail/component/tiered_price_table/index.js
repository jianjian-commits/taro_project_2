import React from 'react'
import PropTypes from 'prop-types'
import { TableUtil, EditTable } from '@gmfe/table'
import { KCInputNumberV2, keyboardTableHoc } from '@gmfe/keyboard'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'

import skuStore from '../../sku_store.js'

import RenderOperate from './render_operate'

import { CalculationPopover } from '../sale_info'

const KeyboardDiyEditTable = keyboardTableHoc(EditTable)
const { OperationHeader, referOfWidth } = TableUtil

const TieredPriceTable = observer((props) => {
  const { priceUnit, std_unit_name_forsale, sale_unit_name } = props

  // const rowsSize = 5
  const rowsSize = skuStore.skuDetail.step_price_table.length

  const columns = [
    {
      Header: OperationHeader,
      accessor: 'action',
      width: referOfWidth.operationCell,
      Cell: (cellProps) => (
        <RenderOperate
          index={cellProps.index}
          rowsSize={rowsSize}
          onAddRow={() => skuStore.addTieredPriceRow()}
          onDeleteRow={() => skuStore.delTieredPriceRow(cellProps.index)}
        />
      ),
    },
    {
      id: 'min',
      accessor: 'min',
      Header: t('最小下单数（包含）'),
    },
    {
      id: 'max',
      accessor: 'max',
      Header: t('最大下单数（不包含）'),
      Cell: (cellProps) =>
        cellProps.index === rowsSize - 1 ? (
          '-'
        ) : (
          <KCInputNumberV2
            style={{ width: '80px' }}
            // min={0.0}
            autoComplete='off'
            precision={2}
            onChange={(num) => {
              skuStore.changeSkuDetailTieredTable(cellProps.index, 'max', num)
            }}
            value={cellProps.original.max}
          />
        ),
      isKeyboard: true,
    },
    {
      Header: t('单价（基本单位）'),
      id: 'step_std_price',
      accessor: 'step_std_price',
      Cell: (cellProps) => {
        return (
          <Flex alignCenter>
            <KCInputNumberV2
              style={{ width: '80px' }}
              autoComplete='off'
              precision={2}
              disabled={skuStore.skuDetail?.price_cal_type === 1}
              value={cellProps.original.step_std_price}
              onChange={(value) => {
                skuStore.changeSkuDetailTieredTable(
                  cellProps.index,
                  'step_std_price',
                  value,
                )
              }}
            />
            {priceUnit + ' / '}
            {std_unit_name_forsale}
            <CalculationPopover
              onOk={(value) =>
                skuStore.changeSkuDetailTieredTable(
                  cellProps.index,
                  'step_std_price',
                  value,
                )
              }
              taxPrice={Number(cellProps.original.step_std_price)}
            />
          </Flex>
        )
      },
      isKeyboard: true,
    },
    {
      Header: t('单价（销售单位）'),
      id: 'step_sale_price',
      accessor: 'step_sale_price',
      Cell: (cellProps) => {
        return (
          <Flex alignCenter>
            <KCInputNumberV2
              precision={2}
              autoComplete='off'
              disabled={skuStore.skuDetail?.price_cal_type === 0}
              value={cellProps.original.step_sale_price}
              style={{ width: '80px' }}
              onChange={(value) => {
                skuStore.changeSkuDetailTieredTable(
                  cellProps.index,
                  'step_sale_price',
                  value,
                )
              }}
            />
            {priceUnit + ' / '}
            {sale_unit_name || std_unit_name_forsale}
            <CalculationPopover
              onOk={(value) =>
                skuStore.changeSkuDetailTieredTable(
                  cellProps.index,
                  'step_sale_price',
                  value,
                )
              }
              taxPrice={Number(cellProps.original.step_sale_price)}
            />
          </Flex>
        )
      },
      isKeyboard: true,
    },
  ]

  return (
    <KeyboardDiyEditTable
      className='gm-border'
      style={{ width: '100%' }}
      id='tiered_price_table'
      data={skuStore.skuDetail.step_price_table.slice()}
      onAddRow={() => skuStore.addTieredPriceRow()}
      columns={columns}
    />
  )
})

TieredPriceTable.propTypes = {
  priceUnit: PropTypes.string.isRequired,
  std_unit_name_forsale: PropTypes.string.isRequired,
  sale_unit_name: PropTypes.string,
}

export default TieredPriceTable
