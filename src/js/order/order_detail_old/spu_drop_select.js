// 暂时应用于移动端，后续废弃
import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import { DropSelect, Price, Flex, Button } from '@gmfe/react'
import { is } from '@gm-common/tool'
import { copywriterByTaxRate } from '../../common/service'
import { isLockPriceSku } from '../../common/filter'
import { getSkuNameWithXinhaoIcon } from '../util'
import Big from 'big.js'
import _ from 'lodash'
import orderDetailStore from './detail_store_old'
import globalStore from '../../stores/global'
import ListProductImg from '../components/list_product_img'
import { SvgPriceRule } from 'gm-svg'

import PropTypes from 'prop-types'

class SpuDropSelect extends Component {
  constructor(props) {
    super(props)
    this.searchInput = null
    this.state = {
      dropSelectShow: false,
    }
    this.handleDropSelectHide = ::this.handleDropSelectHide
    this.handleDropSelectEnter = ::this.handleDropSelectEnter
    this.handleSkuInputClear = ::this.handleSkuInputClear
    this.handleDropSelectFocus = ::this.handleDropSelectFocus
    this.handleSkuInputChange = ::this.handleSkuInputChange
  }

  select() {
    this.searchInput && this.searchInput.select()
  }

  handleDropSelectHide() {
    this.setState({
      dropSelectShow: false,
    })
  }

  handleDropSelectEnter(index) {
    const { list } = this.props.searchSkus
    const sku = list[index]

    this.searchInput.blur()

    if (this.props.batch) {
      orderDetailStore.skuAddBatch(sku, this.props.batchOrderIndex)
    } else {
      orderDetailStore.skuAdd(sku)
    }

    this.setState(
      {
        dropSelectShow: false,
      },
      () => {
        this.props.onDropDown(sku.id)
      },
    )
  }

  handleSkuInputClear(e) {
    e.preventDefault()
    this.searchInput.value = ''
    orderDetailStore.clear('searchSkus')
    this.setState({
      dropSelectShow: false,
    })
  }

  handleDropSelectFocus() {
    this.setState({
      dropSelectShow: true,
    })
  }

  handleSkuInputChange() {
    const { dropSelectShow } = this.state
    if (!dropSelectShow) this.handleDropSelectFocus()
    if (this.props.batch) {
      orderDetailStore.debounceSearchSku(
        this.searchInput.value,
        this.props.batchOrderIndex,
      )
      return
    }

    orderDetailStore.debounceSearchSku(this.searchInput.value)
  }

  handleAdd(rowData, batchOrderIndex) {
    if (this.props.batch) {
      orderDetailStore.skuAddBatch(rowData, batchOrderIndex)
    } else {
      orderDetailStore.skuAdd(rowData)
    }
  }

  render() {
    const { order, searchSkus, batchOrderIndex } = this.props
    const { details: skus } = order

    let columns = [
      {
        field: 'id',
        name: i18next.t('商品ID'),
        render: (id, data) => {
          const { showOuterId } = this.props
          let skuId = id
          let title = data.outer_id || ''
          if (showOuterId) {
            skuId = data.outer_id || '-'
            title = id
          }
          return <span title={title}>{skuId}</span>
        },
      },
      {
        field: 'imgs',
        name: i18next.t('商品图'),
        render: (img) => <ListProductImg src={img} />,
      },
      {
        field: 'name',
        name: i18next.t('商品名'),
        render: (name, rowData) => (
          <div className='b-order-search-sku-name'>
            <Flex alignCenter>
              {getSkuNameWithXinhaoIcon(rowData, this.searchInput.value)}
              {isLockPriceSku(rowData.price_origin) && (
                <span
                  title={i18next.t('order_price_rule', {
                    price: `${rowData.lock_price}${
                      Price.getUnit(rowData.fee_type) + '/'
                    }${rowData.sale_unit_name}`,
                  })}
                >
                  <SvgPriceRule />
                </span>
              )}
            </Flex>
          </div>
        ),
      },
      {
        field: 'spec',
        name: i18next.t('规格'),
        render: (value, rowData) => {
          if (
            rowData.std_unit_name_forsale === rowData.sale_unit_name &&
            rowData.sale_ratio === 1
          ) {
            return (
              <span className='gm-text-desc'>
                {
                  i18next.t('KEY48', {
                    VAR1: rowData.std_unit_name_forsale,
                  }) /* src:`按${rowData.std_unit_name_forsale}` => tpl:按${VAR1} */
                }
              </span>
            )
          }

          return (
            <span className='gm-text-desc'>
              {`${rowData.sale_ratio}${rowData.std_unit_name_forsale}/${rowData.sale_unit_name}`}
            </span>
          )
        },
      },
      {
        field: 'category_title_2',
        name: i18next.t('分类'),
        render: (category_title_2) => (
          <span className='gm-text-desc'>{category_title_2}</span>
        ),
      },
      {
        field: 'supplier_name',
        name: i18next.t('报价单简称（对外）'),
        render: (supplier_name) => (
          <span className='gm-text-desc'>{supplier_name}</span>
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
              {`${Big(sale_price || 0).toFixed(2)}${
                Price.getUnit(rowData.fee_type) + '/'
              }${rowData.sale_unit_name}`}
            </span>
          )
        },
      },
      {
        field: 'now_stocks',
        name: i18next.t('销售库存'),
        render: (now_stocks) => {
          return (
            <span className='gm-text-desc'>
              {now_stocks !== -99999
                ? Big(now_stocks || 0).toFixed(2)
                : i18next.t('不限制库存')}
            </span>
          )
        },
      },
      globalStore.hasViewTaxRate() && {
        field: 'tax_rate',
        name: i18next.t('税率'),
        render: (tax_rate, { is_set_tax }) => {
          return (
            <span className='gm-text-desc'>
              {is_set_tax
                ? `${Big(tax_rate || 0)
                    .div(100)
                    .toFixed(2)}%`
                : i18next.t('未设置')}
            </span>
          )
        },
      },
      globalStore.hasViewTaxRate() && {
        field: 'tax',
        name: i18next.t('税额'),
        render: (tax, rowData) => {
          // 税额 = （含税单价 * 税率） 除以 1+税额
          const tax_rate = Big(rowData.tax_rate || 0)
            .div(10000)
            .toFixed(6)
          const price = Big(rowData.sale_price || 0)
            .times(tax_rate)
            .toFixed(6)
          return (
            <span className='gm-text-desc'>
              {Big(price).div(Big(1).plus(tax_rate)).toFixed(2)}
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
          const sku = _.find(skus, (item) => {
            return item.id === rowData.id
          })

          if (sku) {
            return i18next.t('已添加')
          }

          return (
            <Button
              className='gm-margin-right-5'
              onClick={this.handleAdd.bind(this, rowData, batchOrderIndex)}
            >
              <i className='glyphicon glyphicon-ok' />
            </Button>
          )
        },
      },
    ]
    if (is.phone()) {
      columns = _.reject(columns, (column) => {
        return (
          column.field === 'category_title_2' ||
          column.field === 'supplier_name'
        )
      })
    }

    const dropSelectData = Object.assign(
      {},
      {
        list: searchSkus.list,
        loading: searchSkus.loading,
        columns: _.filter(columns, (item) => item),
      },
    )

    return (
      <DropSelect
        show={this.state.dropSelectShow}
        data={dropSelectData}
        onHide={this.handleDropSelectHide}
        onEnter={this.handleDropSelectEnter}
      >
        <div className='input-prepend input-group' style={{ width: '100%' }}>
          <input
            ref={(ref) => {
              this.searchInput = ref
            }}
            onChange={this.handleSkuInputChange}
            onFocus={this.handleDropSelectFocus}
            className='form-control'
            placeholder={i18next.t(
              '输入商品ID、自定义编码或商品名，以添加商品',
            )}
            type='search'
          />
          {!this.searchInput || this.searchInput.value === '' ? null : (
            <span className='input-group-btn'>
              <button onClick={this.handleSkuInputClear} className='btn'>
                <i className='glyphicon glyphicon-remove' />
              </button>
            </span>
          )}
        </div>
      </DropSelect>
    )
  }
}

SpuDropSelect.propTypes = {
  showOuterId: PropTypes.Number,
  searchSkus: PropTypes.list,
  batch: PropTypes.bool,
  batchOrderIndex: PropTypes.Number,
  order: PropTypes.object,
  onDropDown: PropTypes.func,
}

export default SpuDropSelect
