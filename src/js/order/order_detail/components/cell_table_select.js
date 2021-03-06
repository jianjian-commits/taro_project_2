import { i18next } from 'gm-i18n'
import React, { useState, useRef } from 'react'
import { KCTableSelect } from '@gmfe/keyboard'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Price, Tip, ToolTip } from '@gmfe/react'
import Big from 'big.js'
import { is } from '@gm-common/tool'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import TieredPriceTable from './tiered_price_table'

import {
  isLK,
  getSkuNameWithXinhaoIcon,
  dealCombineGoodsData,
  asyncSalePriceInOrder,
  setSalePriceIfCombineGoods,
  findSameSku,
  asyncSkuInfo,
} from '../../util'
import { getInfoOfOrderSkus, isSkusOrCombineGoodsOrder } from '../util'
import orderDetailStore from '../../store'
import KCDisabledCell from '../../../common/components/kc_disabled_cell'
import { getDiscountSku } from '../../../common/filter'
import SelectedBox from './sku_selected_box'
import globalStore from 'stores/global'
import SVGTieredPrice from 'svg/tiered_price.svg'

let search_text = ''

const CellTableSelect = observer((props) => {
  const { index, original, showOuterId, disabled } = props
  const order = orderDetailStore.orderDetail

  const [skuList, setSkuList] = useState([])

  const productNameRef = useRef()

  if (original.code || original.is_combine_goods) {
    return (
      <KCDisabledCell>
        <div>
          <span>{original.name}</span>
          {original.code && (
            <span className='gm-text-red'>{`(${original.msg})`}</span>
          )}
        </div>
      </KCDisabledCell>
    )
  }
  const { viewType } = order
  const isLKOrder = isLK(order._id)

  const renderID = (cellProps) => {
    const sku = cellProps.original.original
    const { outer_id, id, _select, is_combine_goods } = sku
    let skuId = id
    let title = outer_id || ''
    if (showOuterId) {
      skuId = outer_id || '-'
      title = id
    }
    return (
      <SelectedBox
        selected={_select}
        style={{ width: '70px' }}
        className={classNames({
          'b-combine-goods-label': is_combine_goods,
        })}
        title={title}
      >
        {skuId}
      </SelectedBox>
    )
  }

  const renderNowStock = (cellProps) => {
    const sku = cellProps.original.original
    const { _select, now_stocks } = sku
    return (
      <SelectedBox selected={_select}>
        {now_stocks !== -99999
          ? Big(now_stocks || 0).toFixed(2)
          : i18next.t('???????????????')}
      </SelectedBox>
    )
  }

  const renderDesc = (cellProps) => {
    const sku = cellProps.original.original
    const { desc, _select } = sku
    const result = desc || '-'
    return (
      <SelectedBox selected={_select} title={desc}>
        {result}
      </SelectedBox>
    )
  }

  const renderSpec = (cellProps) => {
    const sku = cellProps.original.original
    const {
      std_unit_name_forsale,
      sale_unit_name,
      sale_ratio,
      is_combine_goods,
      _select,
    } = sku
    if (
      (std_unit_name_forsale === sale_unit_name && sale_ratio === 1) ||
      is_combine_goods
    ) {
      return (
        <SelectedBox selected={_select}>
          {
            is_combine_goods
              ? i18next.t('KEY48', {
                  VAR1: sale_unit_name,
                }) /* src:`???${rowData.std_unit_name_forsale}` => tpl:???${VAR1} */
              : i18next.t('KEY48', {
                  VAR1: std_unit_name_forsale,
                }) /* src:`???${rowData.std_unit_name_forsale}` => tpl:???${VAR1} */
          }
        </SelectedBox>
      )
    }

    return (
      <span>{`${sale_ratio}${std_unit_name_forsale}/${sale_unit_name}`}</span>
    )
  }

  const initStepPriceInterval = (key, step_price_table) => {
    const table = step_price_table.map((e) => e[key]).sort((a, b) => a - b)
    return `${Big(table[0] || 0)
      .div(100)
      .toFixed(2)}~${Big(table[table.length - 1] || 0)
      .div(100)
      .toFixed(2)}`
  }

  const renderSalePrice = (cellProps) => {
    const sku = cellProps.original.original
    const {
      is_price_timing,
      sale_price,
      sale_unit_name,
      _select,
      is_step_price,
      step_price_table,
    } = sku
    if (is_price_timing) {
      return <SelectedBox selected={_select}>{i18next.t('??????')}</SelectedBox>
    }
    const unit = `${Price.getUnit(sku.fee_type) + '/'}${sale_unit_name}`
    if (is_step_price && step_price_table?.length > 0) {
      return initStepPriceInterval('step_sale_price', step_price_table) + unit
    }
    return (
      <SelectedBox selected={_select}>{`${Big(sale_price || 0).toFixed(
        2,
      )}${unit}`}</SelectedBox>
    )
  }

  const renderTaxRate = (cellProps) => {
    const {
      tax_rate,
      is_set_tax,
      _select,
      is_combine_goods,
    } = cellProps.original.original
    if (is_combine_goods) {
      return <SelectedBox selected={_select}>-</SelectedBox>
    }
    return (
      <SelectedBox selected={_select}>
        {is_set_tax
          ? `${Big(tax_rate || 0)
              .div(100)
              .toFixed(2)}%`
          : i18next.t('?????????')}
      </SelectedBox>
    )
  }

  const renderTax = (cellProps) => {
    const sku = cellProps.original.original
    // ?????? = ??????????????? * ????????? ?????? 1+??????
    const { is_combine_goods, sale_price, _select } = sku
    const _tax_rate = sku.tax_rate
    if (is_combine_goods) {
      return <SelectedBox selected={_select}>-</SelectedBox>
    }
    const tax_rate = Big(_tax_rate || 0)
      .div(10000)
      .toFixed(6)
    const price = Big(sale_price || 0)
      .times(tax_rate)
      .toFixed(6)
    return (
      <SelectedBox selected={_select}>
        {Big(price).div(Big(1).plus(tax_rate)).toFixed(2)}
      </SelectedBox>
    )
  }

  const renderName = (cellProps) => {
    const original = cellProps.original.original
    return (
      <SelectedBox
        selected={original._select}
        className='b-order-search-sku-name'
        style={{ width: '120px' }}
      >
        {getSkuNameWithXinhaoIcon(original, search_text)}
        {getDiscountSku(original)}
        {original.is_step_price === 1 && (
          <ToolTip
            style={{ marginLeft: '10px' }}
            popup={() => {
              orderDetailStore.initStepPriceTable(
                original?.step_price_table || [],
              )
              return (
                <div style={{ padding: '8px' }}>
                  <div style={{ paddingBottom: '8px' }}>
                    {i18next.t('?????????????????????')}
                  </div>
                  <TieredPriceTable
                    priceUnit={Price.getUnit(original.fee_type)}
                    sale_unit_name={original.sale_unit_name}
                  />
                </div>
              )
            }}
          >
            <span>
              <SVGTieredPrice className='gm-cursor' />
            </span>
          </ToolTip>
        )}
      </SelectedBox>
    )
  }

  let tableColumns = [
    {
      Header: '??????ID',
      accessor: 'original.id',
      width: 80,
      Cell: renderID,
    },
    {
      Header: '?????????',
      accessor: 'original.name',
      width: 130,
      Cell: renderName,
    },
    {
      Header: '??????',
      accessor: 'original.spec',
      width: 70,
      Cell: renderSpec,
    },
    {
      Header: '??????',
      accessor: 'original.category_title_2',
      width: 60,
      Cell: (cellProps) => {
        const sku = cellProps.original.original
        if (sku.is_combine_goods) return '-'
        return (
          <SelectedBox selected={sku._select}>
            {sku.is_combine_goods ? '-' : sku.category_title_2}
          </SelectedBox>
        )
      },
    },
    {
      Header: '????????????',
      accessor: 'original.sale_price',
      width: 70,
      Cell: renderSalePrice,
    },
    {
      Header: '????????????',
      accessor: 'original.now_stocks',
      width: 80,
      Cell: renderNowStock,
    },
    {
      Header: '????????????',
      accessor: 'original.desc',
      width: 80,
      Cell: renderDesc,
    },
    {
      Header: '???????????????????????????',
      accessor: 'original.supplier_name',
      width: 120,
      Cell: (cellProps) => {
        const { _select, supplier_name } = cellProps.original.original
        return <SelectedBox selected={_select}>{supplier_name}</SelectedBox>
      },
    },
    {
      Header: '??????',
      accessor: 'original.tax_rate',
      width: 40,
      Cell: renderTaxRate,
    },
    {
      Header: '??????',
      accessor: 'original.tax',
      width: 40,
      Cell: renderTax,
    },
  ]

  const dealNewItem = (item) => {
    let newItem = item
    if (!item) {
      newItem = orderDetailStore.getInitItem()
      setSkuList([])
    } else {
      newItem = {
        ...item.original,
        isNewItem: true,
        // ?????????????????????????????????
        spu_remark: undefined,
      }
    }
    return newItem
  }

  // ?????????????????????????????????
  const asyncInOrder = (newItem) => {
    let items = []
    if (newItem.is_combine_goods) {
      asyncSalePriceInOrder(newItem.skus, order.details)
      items = dealCombineGoodsData(newItem)
      const sameSku = findSameSku(items, order.details)
      if (sameSku) {
        Tip.info(i18next.t('??????????????????????????????') + sameSku.name)
        return
      }
      setSalePriceIfCombineGoods(items)
    } else {
      asyncSalePriceInOrder([newItem], order.details)
      items.push(newItem)
    }
    return items
  }

  // ???sku???????????????????????????????????????????????????????????????????????????
  const canSelectSkuInOrder = (item) => {
    const { orderCanHaveDuplicateSku } = globalStore.orderInfo
    if (orderCanHaveDuplicateSku) {
      const infoMsg = getInfoOfOrderSkus(item, order.details)

      if (infoMsg) {
        Tip.info(infoMsg)
        return false
      }
    }
    return true
  }

  /**
   * ???sku??????
   * 1??????sku, ????????????????????????, ???????????????????????????
   * 2???????????????, ??????????????????????????????????????????????????????????????????
   * ???????????????????????????
   */
  const handleSkusSelect = (item) => {
    // ???????????????????????????????????????
    if (item) {
      if (!canSelectSkuInOrder({ ...item.original })) {
        return
      }
      item.original.backup_sale_price = Big(
        item.original.sale_price || 0,
      ).toString()
      item.original.sale_price = Big(item.original.sale_price || 0).toFixed(2)
      // item.original.init_value = true
    }

    // ????????????????????????
    const currentOrder = isSkusOrCombineGoodsOrder(order.details)
    const newItem = dealNewItem(item)
    let items = []
    if (currentOrder.isCombineGoodsOrder || newItem.is_combine_goods) {
      // ????????????
      asyncSkuInfo([newItem], order.details)
      items = asyncInOrder(newItem)
    } else {
      items.push(newItem)
    }

    orderDetailStore.orderSkusChange(index, items)
  }

  const handleSelect = (item) => {
    const { orderCanHaveDuplicateSku } = globalStore.orderInfo
    if (orderCanHaveDuplicateSku) {
      handleSkusSelect(item)
      return
    }

    if (item) {
      // ????????????????????????????????????????????????????????????
      if (item.original._select && !orderCanHaveDuplicateSku) {
        orderDetailStore.setRepeatedSku(item)
        return
      }

      item.original.backup_sale_price = Big(
        item.original.sale_price || 0,
      ).toString()

      item.original.sale_price = Big(item.original.sale_price || 0).toFixed(2)
      // item.original.init_value = true
    }

    const newItem = dealNewItem(item)
    const items = asyncInOrder(newItem)

    orderDetailStore.orderSkusChange(index, items)
  }

  const handleSearchList = (list) => {
    const { details } = orderDetailStore.orderDetail
    // ???????????????????????????(???????????????)
    let ids = []
    _.each(details, (item) => {
      if (!item.belongWith) {
        ids.push(item.id)
      }
    })
    if (details[index].id !== null) {
      ids = _.filter(ids, (item) => item !== details[index].id)
    }

    // ??????????????????
    const result = _.each(list, (item) => {
      item._select = false
      if (ids.indexOf(item.id) !== -1) {
        item._select = true
      }
    })

    // ????????????????????????
    return _.map(result, (item, i) => ({
      value: item.id + i,
      text: item.name,
      original: item,
    }))
  }

  const handleSearch = (value) => {
    search_text = value
    productNameRef.current = value
    return orderDetailStore.search(value).then((list) => {
      const _list = handleSearchList(list)
      if (value === productNameRef.current) {
        setSkuList(_list)
        return _list
      }
      return list
    })
  }

  let selected = null
  if (original && original.id) {
    selected = {
      value: original.id,
      text: original.name,
    }
  }

  const renderSelected = (selected) => {
    if (selected !== null) {
      return (
        <span className='b-ellipsis-desc' title={selected.text}>
          {selected.text}
        </span>
      )
    }
  }

  if (is.phone()) {
    tableColumns = _.reject(tableColumns, (column) => {
      return (
        column.accessor === 'category_title_2' ||
        column.accessor === 'supplier_name'
      )
    })
  }

  if (!isLKOrder && viewType !== 'view') {
    return (
      <KCTableSelect
        data={skuList}
        columns={tableColumns}
        disabled={disabled}
        selected={selected}
        renderSelected={() => renderSelected(selected)}
        onSearch={handleSearch}
        onSelect={handleSelect}
        renderListFilter={(data) => data}
        placeholder={i18next.t('????????????ID????????????')}
        style={{ width: '168px' }}
      />
    )
  }
  return (
    <span className='b-ellipsis-desc' title={original.name}>
      {original.name}
    </span>
  )
})

CellTableSelect.propTypes = {
  showOuterId: PropTypes.bool,
  index: PropTypes.number.isRequired,
  original: PropTypes.object,
  disabled: PropTypes.bool,
}

export default CellTableSelect
