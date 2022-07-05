import { i18next } from 'gm-i18n'
import React, { useState } from 'react'
import { DropSelect, Price, Button } from '@gmfe/react'
import { SvgPriceRule } from 'gm-svg'
import _ from 'lodash'
import classNames from 'classnames'
import Big from 'big.js'

import { copywriterByTaxRate } from '../../../common/service'
import { isLockPriceSku } from '../../../common/filter'
import { getSkuNameWithXinhaoIcon } from '../../util'
import { getUnit } from '../util'

import globalStore from 'stores/global'

import PropTypes from 'prop-types'
const debounce = _.debounce((func) => {
  return func()
}, 300)

const SkuSelect = (props) => {
  const [dropSelectShow, setDropSelectShow] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [skus, setSkus] = useState({
    list: [],
    loading: false,
  })

  const { orderCanHaveDuplicateSku } = globalStore.orderInfo

  const handleDropSelectHide = () => {
    setDropSelectShow(false)
  }

  const handleDropSelectEnter = (index) => {
    const { list } = skus
    const sku = list[index]
    handleAdd(sku)
    setDropSelectShow(false)
  }

  const handleSkuInputClear = (e) => {
    e.preventDefault()
    setInputValue('')
    setDropSelectShow(false)
    setSkus({
      list: [],
      loading: false,
    })
  }

  const handleDropSelectFocus = () => {
    setDropSelectShow(true)
  }

  const handleSearch = (value) => {
    debounce(() => {
      setSkus({
        ...skus,
        loading: true,
      })

      return props
        .onSearch(value)
        .then((json) => {
          setSkus({
            list: json.data,
            loading: false,
          })
          return json
        })
        .catch(() => {
          setSkus({
            list: [],
            loading: true,
          })
        })
    })
  }

  const handleSkuInputChange = (e) => {
    if (!dropSelectShow) handleDropSelectFocus()
    setInputValue(e.target.value)
    handleSearch(e.target.value)
  }

  const handleAdd = (rowData) => {
    props.onSelect({
      ...rowData,
      quantity: rowData.sale_num_least,
    })
  }

  const columns = [
    {
      field: 'id',
      name: i18next.t('商品ID'),
      render: (id, data) => {
        const { showOuterId } = props
        let skuId = id
        let title = data.outer_id || ''
        if (showOuterId) {
          skuId = data.outer_id || '-'
          title = id
        }
        return (
          <div
            data-label={i18next.t('组合商品')}
            className={classNames({
              'b-combine-goods-label': data.is_combine_goods,
            })}
          >
            <span title={title}>{skuId}</span>
          </div>
        )
      },
    },
    {
      field: 'name',
      name: i18next.t('商品名'),
      render: (name, rowData) => (
        <div className='b-order-search-sku-name'>
          {getSkuNameWithXinhaoIcon(rowData, inputValue)}
          {isLockPriceSku(rowData.price_origin) && (
            <span
              title={i18next.t('order_price_rule', {
                price: `${rowData.lock_price}
                ${Price.getUnit(rowData.fee_type) + '/'}${
                  rowData.sale_unit_name
                }`,
              })}
            >
              <SvgPriceRule />
            </span>
          )}
        </div>
      ),
    },
    {
      field: 'spec',
      name: i18next.t('规格'),
      render: (value, rowData) => {
        return (
          <span className='gm-text-desc'>
            {getUnit(rowData, rowData.is_combine_goods)}
          </span>
        )
      },
    },
    {
      field: 'category_title_2',
      name: i18next.t('分类'),
      render: (category_title_2) => (
        <span className='gm-text-desc'>{category_title_2 || '-'}</span>
      ),
    },
    {
      field: 'supplier_name',
      name: i18next.t('报价单简称（对外）'),
      render: (supplier_name) => (
        <span className='gm-text-desc'>{supplier_name || '-'}</span>
      ),
    },
    {
      field: 'sale_price',
      name: copywriterByTaxRate(i18next.t('单价'), i18next.t('含税单价')),
      render: (sale_price, rowData) => {
        if (rowData.is_price_timing) {
          return i18next.t('时价')
        }
        return (
          <span className='gm-text-desc'>
            {`${Big(sale_price || 0).toFixed(2)}
            ${Price.getUnit(rowData.fee_type) + '/'}${rowData.sale_unit_name}`}
          </span>
        )
      },
    },
    {
      field: 'desc',
      name: i18next.t('商品描述'),
      render: (desc) => {
        const result = desc || '-'
        return (
          <span className='gm-text-desc b-ellipsis-desc' title={desc}>
            {result}
          </span>
        )
      },
    },
    {
      field: 'spec1',
      name: i18next.t('操作'),
      render: (value, rowData) => {
        const sku = _.find(props.order.skus, (item) => {
          return item.id === rowData.id && !item.belongWith
        })

        // 多sku放开限制，可以多次添加
        if (sku && !orderCanHaveDuplicateSku) {
          return i18next.t('已添加')
        }

        return (
          <Button
            className='gm-margin-right-5'
            onClick={() => handleAdd(rowData)}
          >
            <i className='glyphicon glyphicon-ok' />
          </Button>
        )
      },
    },
  ]

  return (
    <DropSelect
      className='b-batch-sku-select'
      show={dropSelectShow}
      data={{
        list: skus.list,
        loading: skus.loading,
        columns,
      }}
      onHide={handleDropSelectHide}
      onEnter={handleDropSelectEnter}
    >
      <div className='input-prepend input-group' style={{ width: '100%' }}>
        <span className='input-group-addon'>
          <i className='xfont xfont-search' />
        </span>
        <input
          onChange={handleSkuInputChange}
          onFocus={handleDropSelectFocus}
          value={inputValue}
          className='form-control'
          placeholder={i18next.t('输入商品ID、自定义编码或商品名，以添加商品')}
          type='search'
        />
        {inputValue === '' ? null : (
          <span className='input-group-btn'>
            <button onClick={handleSkuInputClear} className='btn'>
              <i className='glyphicon glyphicon-remove' />
            </button>
          </span>
        )}
      </div>
    </DropSelect>
  )
}

SkuSelect.propTypes = {
  showOuterId: PropTypes.bool,
  order: PropTypes.object,
  onSelect: PropTypes.func,
  onSearch: PropTypes.func,
}

export default SkuSelect
