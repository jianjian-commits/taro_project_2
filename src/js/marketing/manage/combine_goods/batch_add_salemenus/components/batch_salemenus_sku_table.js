import React from 'react'
import { t } from 'gm-i18n'
import { Observer, observer, inject } from 'mobx-react'
import Big from 'big.js'
import PropTypes from 'prop-types'
import SkuSearchSelector from '../../components/sku_search_selector'
import { saleState } from '../../util'
import { Table, expandTableHOC, subTableHOC } from '@gmfe/table'
import { Price } from '@gmfe/react'
const ExpandTable = expandTableHOC(Table)
const SubTable = subTableHOC(Table)

const BatchSaleMenusSkuTable = (props) => {
  const {
    salemenusSkuTable,
    store: { setSkus, setExpanded, expandedList },
    index,
  } = props

  const handleSetSku = (selected, curSku, combine_good_id) => {
    if (selected) {
      setSkus(
        combine_good_id,
        curSku.salemenu_id,
        curSku.spu_id,
        curSku.origin_id,
        {
          sku_id: selected.id,
          sku_name: selected.name,
          sale_price: selected.sale_price,
          sale_unit_name: selected.sale_unit_name,
          sale_ratio: selected.sale_ratio,
          origin: curSku.origin,
          origin_id: curSku.origin_id,
          state: selected.state,
        },
      )
    }
  }

  const expanded = expandedList.length ? expandedList[index] : []

  return (
    <ExpandTable
      style={{ width: '800px' }}
      data={salemenusSkuTable.slice()}
      keyField='salemenu_id'
      expanded={expanded && expanded.slice()}
      onExpand={(expand) => setExpanded(expand, index)}
      getTrGroupProps={(state, rowInfo, column) => {
        // 已存在的报价单 字体颜色置灰 不能修改sku
        return {
          style: {
            color: rowInfo.original.isExit ? '#798294' : '#243351',
            cursor: rowInfo.original.isExit ? 'not-allowed' : 'default',
          },
        }
      }}
      columns={[
        {
          Header: t('所属报价单'),
          accessor: 'salemenu_name',
        },
        {
          Header: t('参考单价'),
          accessor: 'reference_price',
        },
      ]}
      SubComponent={(item) => (
        <SubTable
          data={item.original.skuList.slice()}
          key={item.index}
          columns={[
            {
              Header: t('商品名'),
              accessor: 'spu_name',
            },
            {
              Header: t('来源'),
              accessor: 'origin',
            },
            {
              id: 'sku_name',
              Header: t('规格名'),
              width: 250,
              accessor: (d) => (
                <Observer>
                  {() => {
                    const selected = d.sku_id
                      ? { value: d.sku_id, text: d.sku_name }
                      : undefined
                    // 已存在报价单 不允许修改
                    return d.noModify ? (
                      <span>{d.sku_name || '-'}</span>
                    ) : (
                      <SkuSearchSelector
                        searchOption={{
                          spu_id: d.spu_id,
                          salemenu_id: d.salemenu_id,
                        }}
                        selected={selected}
                        onSelect={(selected) =>
                          handleSetSku(selected, d, item.original.id)
                        }
                        sku_id={d.sku_id}
                      />
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: t('销售规格'),
              id: 'sale_unit_name',
              accessor: (d) =>
                d.sku_id
                  ? d.sale_ratio + d.std_unit_name + '/' + d.sale_unit_name
                  : '-',
            },
            {
              Header: t('数量'),
              id: 'quantity',
              accessor: (d) => (
                <Observer>
                  {() =>
                    d.sku_id && d.sale_ratio && d.quantity
                      ? Big(d.quantity).div(d.sale_ratio).toFixed(2)
                      : '-'
                  }
                </Observer>
              ),
            },
            {
              Header: t('单价'),
              id: 'price',
              accessor: (d) =>
                d.sku_id
                  ? d.sale_price + Price.getUnit() + '/' + d.sale_unit_name
                  : '-',
            },
            {
              Header: t('状态'),
              id: 'state',
              accessor: (d) => {
                return saleState(d.state)
              },
            },
          ]}
        />
      )}
    />
  )
}

BatchSaleMenusSkuTable.propTypes = {
  salemenusSkuTable: PropTypes.array.isRequired,
  store: PropTypes.object.isRequired,
  index: PropTypes.number,
}

export default inject('store')(observer(BatchSaleMenusSkuTable))
