import React, { useState, useEffect } from 'react'
import {
  BoxTable,
  Price,
  Flex,
  Modal,
  RightSideModal,
  ToolTip,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import TableTotalText from 'common/components/table_total_text'
import { selectTableXHOC, TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import PropTypes from 'prop-types'
import Big from 'big.js'
import SafeStock from 'common/../product/inventory/components/safe_stock_modal'
import TaskList from '../../../../task/task_list'
import store from '../store'
import SecurityCostCell from './security_cost_cell'

const { BatchActionBar } = TableXUtil
const SelectTableX = selectTableXHOC(TableX)

const ProductStockList = (props) => {
  const {
    rowData: {
      spu_id,
      product_stock,
      std_unit_name,
      product: { product_avg_price, product_stock_value },
    },
  } = props

  const { productStockSelected, onProductStockSelected } = store

  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchList()
  }, [])

  const handleEditBatchSafe = (data) => {
    const { upValue, downValue, isSetUp, isSetDown } = data
    const params = {
      upper_threshold: isSetUp ? upValue : undefined,
      lower_threshold: isSetDown ? downValue : undefined,
      set_upper_threshold: isSetUp ? 1 : 2,
      set_lower_threshold: isSetDown ? 1 : 2,
      spu_ids: JSON.stringify([spu_id]),
      sku_ids: JSON.stringify(productStockSelected),
    }
    // 清除store中的selected

    Request('/stock/check/safe_stock/batch_modify')
      .data(params)
      .post()
      .then((res) => {
        RightSideModal.render({
          children: <TaskList tabKey={1} />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      })
  }

  const handleBatchSafeStock = () => {
    Modal.render({
      title: t('批量设置安全库存'),
      size: 'md',
      children: <SafeStock onOk={handleEditBatchSafe} />,
      onHide: () => {
        Modal.hide()
        store.setProductStockSelected([])
      },
    })
  }

  const fetchList = () => {
    setLoading(true)
    return store.fetchProductList(spu_id).then((res) => {
      const { code, data } = res
      if (code === 0) {
        setDataSource(data)
        setLoading(false)
        onProductStockSelected([])
      }
    })
  }

  const handleSelectAll = (bool) => {
    if (bool) onProductStockSelected(dataSource.map((item) => item.sku_id))
  }

  const columns = [
    {
      Header: (
        <Flex column alignCenter>
          {t('规格名')}
        </Flex>
      ),
      accessor: t('sku_name'),
      width: 120,
      Cell: (cellProps) => {
        const { sku_name, sku_id } = cellProps.row.original

        return (
          <Flex column alignCenter>
            <span>{sku_name}</span>
            <span>（{sku_id}）</span>
          </Flex>
        )
      },
    },
    {
      Header: t('规格'),
      accessor: t('sale_unit'),
      Cell: (cellProps) => {
        const { ratio, std_unit_name, sale_unit_name } = cellProps.row.original

        return ratio && std_unit_name && sale_unit_name
          ? `${ratio}${std_unit_name}/${sale_unit_name}`
          : '-'
      },
    },
    {
      Header: (
        <Flex>
          {t('成品安全库存')}
          <ToolTip
            center
            popup={
              <div className='gm-padding-5' style={{ width: '100px' }}>
                {t(
                  '成品安全库存：当前成品库存数小于等于安全库存时，请及时补货',
                )}
              </div>
            }
          />
        </Flex>
      ),
      width: 130,
      accessor: t('lower_threshold'),
      Cell: (cellProps) => {
        const {
          row: { original },
        } = cellProps

        return (
          <SecurityCostCell
            fetchList={fetchList}
            changeType='product'
            original={{ ...original, spu_id }}
          />
        )
      },
    },
    {
      Header: t('库存数（销售单位）'),
      accessor: t('sale_unit'),
      Cell: (cellProps) => {
        const { remain, sale_unit_name, ratio } = cellProps.row.original
        return `${Big(remain).div(ratio || 1)}${sale_unit_name}`
      },
    },
    {
      Header: t('库存数（基本单位）'),
      accessor: t('base_unit'),
      Cell: (cellProps) => {
        const { std_unit_name, remain } = cellProps.row.original
        return `${Big(remain || 0).toFixed(2)}${std_unit_name}`
      },
    },
    {
      Header: t('库存均价'),
      accessor: t('avg_price'),
      Cell: (cellProps) => {
        const { avg_price, std_unit_name } = cellProps.row.original
        return (
          Big(avg_price || 0).toFixed(2) + Price.getUnit() + '/' + std_unit_name
        )
      },
    },
    {
      Header: t('库存参考货值'),
      accessor: t('stock_value'),
      Cell: (cellProps) => {
        const { stock_value } = cellProps.row.original

        return parseFloat(stock_value) + Price.getUnit()
      },
    },
  ]

  return (
    <>
      <BoxTable
        info={
          <TableTotalText
            data={[
              {
                label: t('成品库存'),
                content: parseFloat(product_stock) + std_unit_name,
              },
              {
                label: t('成品库存均价'),
                content:
                  Big(product_avg_price || 0).toFixed(2) +
                  Price.getUnit() +
                  '/' +
                  std_unit_name,
              },
              {
                label: t('成品库存参考货值'),
                content: parseFloat(product_stock_value) + Price.getUnit(),
              },
            ]}
          />
        }
      >
        <SelectTableX
          data={dataSource}
          keyField='sku_id'
          columns={columns}
          loading={loading}
          selected={productStockSelected.slice()}
          onSelect={(val) => onProductStockSelected(val)}
          batchActionBar={
            productStockSelected.length > 0 ? (
              <BatchActionBar
                pure
                count={productStockSelected.length}
                batchActions={[
                  {
                    name: t('批量设置安全库存'),
                    onClick: handleBatchSafeStock,
                    type: 'business',
                  },
                ]}
                toggleSelectAll={(bool) => handleSelectAll(bool)}
                onClose={() => onProductStockSelected([])}
              />
            ) : null
          }
        />
      </BoxTable>
    </>
  )
}

ProductStockList.propTypes = {
  rowData: PropTypes.object.isRequired,
}

export default observer(ProductStockList)
