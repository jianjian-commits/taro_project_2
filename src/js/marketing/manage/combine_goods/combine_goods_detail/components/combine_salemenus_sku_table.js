import React from 'react'
import { t } from 'gm-i18n'
import { Observer, observer, inject } from 'mobx-react'
import Big from 'big.js'
import PropTypes from 'prop-types'
import { Table, expandTableHOC, subTableHOC } from '@gmfe/table'
import { Price } from '@gmfe/react'
import SkuSearchSelector from '../../components/sku_search_selector'
import { saleState } from '../../util'
const ExpandTable = expandTableHOC(Table)
const SubTable = subTableHOC(Table)

const CombineSalemenusSkuTable = (props) => {
  const { salemenusSkuTable, setSkus, expanded, setExpanded } = props.store

  const handleSetSku = (selected, curSku) => {
    if (selected) {
      setSkus(curSku.salemenu_id, curSku.spu_id, curSku.origin_id || '', {
        sku_id: selected.id,
        sku_name: selected.name,
        sale_price: selected.sale_price,
        sale_unit_name: selected.sale_unit_name,
        sale_ratio: selected.sale_ratio,
        state: selected.state,
        fee_type: selected.fee_type,
      })
    }
  }

  const showQuantity = (sku) => {
    if (sku.sku_id && sku.sale_ratio && sku.quantity) {
      // sku来源于组合商品时，数量=组合商品数量 * sku在组合商品中的配比数量
      return sku.origin_id
        ? Big(sku.quantity)
            .times(sku.combineQuantity || 0)
            .div(sku.sale_ratio)
            .toFixed(2)
        : Big(sku.quantity).div(sku.sale_ratio).toFixed(2)
    } else {
      return '-'
    }
  }
  return (
    <ExpandTable
      style={{ width: '800px' }}
      data={salemenusSkuTable}
      keyField='salemenu_id'
      expanded={expanded.slice()}
      onExpand={(expand) => setExpanded(expand)}
      columns={[
        {
          Header: t('所属报价单'),
          accessor: 'salemenu_name',
        },
        {
          Header: t('参考单价'),
          id: 'reference_price',
          accessor: (d) => {
            return d.reference_price === '-'
              ? d.reference_price
              : d.reference_price + Price.getUnit(d.fee_type)
          },
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
              Header: t('规格名'),
              width: 250,
              id: 'sku_name',
              accessor: (d) => (
                <Observer>
                  {() => {
                    const selected = d.sku_id
                      ? { value: d.sku_id, text: d.sku_name }
                      : undefined
                    return (
                      <SkuSearchSelector
                        searchOption={{
                          spu_id: d.spu_id,
                          salemenu_id: d.salemenu_id,
                        }}
                        selected={selected}
                        onSelect={(selected) => handleSetSku(selected, d)}
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
              accessor: (d) => {
                return <Observer>{() => showQuantity(d)}</Observer>
              },
            },
            {
              Header: t('单价'),
              width: 100,
              id: 'price',
              accessor: (d) => (
                <Observer>
                  {() =>
                    d.sku_id
                      ? d.sale_price +
                        Price.getUnit(d.fee_type) +
                        '/' +
                        d.sale_unit_name
                      : '-'
                  }
                </Observer>
              ),
            },
            {
              Header: t('状态'),
              id: 'state',
              accessor: (d) => saleState(d.state),
            },
          ]}
        />
      )}
    />
  )
}

CombineSalemenusSkuTable.propTypes = {
  store: PropTypes.object.isRequired,
}

export default inject('store')(observer(CombineSalemenusSkuTable))
