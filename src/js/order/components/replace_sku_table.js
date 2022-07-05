import React from 'react'
import { i18next } from 'gm-i18n'
import classNames from 'classnames'
import Big from 'big.js'
import { MoreSelect, Input } from '@gmfe/react'
import PropTypes from 'prop-types'

import { Table, TableUtil } from '@gmfe/table'

import HeaderTip from '../../common/components/header_tip'
import SelectOrderType from './select_order_type'
import OrderBelongPop from './order_belong_pop'

import store from '../view_sku/store'

class replaceSkuTable extends React.Component {
  // 搜索可替换的商品
  handleSearch(index, item, value) {
    store.handleSearchList(index, item, value)
  }

  // 处理发生变化的数据
  handleChange(index, name, value) {
    store.replaceChangeInSkuBatch(index, name, value)
  }

  handleDel(index) {
    store.deleteReplaceSku(index)
  }

  render() {
    const { data, loading } = this.props
    return (
      <Table
        defaultPageSize={9999}
        data={data}
        loading={loading}
        columns={[
          {
            Header: i18next.t('商品名称'),
            accessor: 'name',
            Cell: ({ original }) => {
              return (
                <>
                  <p>{original.sku_name}</p>
                  <p>{original.sku_id}</p>
                </>
              )
            },
          },
          {
            Header: i18next.t('规格'),
            id: 'specification',
            Cell: ({ original }) => {
              return original.std_unit_name_forsale ===
                original.sale_unit_name && original.sale_ratio === 1
                ? i18next.t('KEY6', {
                    VAR1: original.std_unit_name_forsale,
                  })
                : original.sale_ratio +
                    original.std_unit_name_forsale +
                    '/' +
                    original.sale_unit_name
            },
          },
          {
            Header: i18next.t('报价单'),
            accessor: 'salemenu_name',
            Cell: ({ original, value }) => {
              return (
                <>
                  {value}
                  <br />
                  <span className='b-sheet-item-disable'>
                    {original.salemenu_id}
                  </span>
                </>
              )
            },
          },
          {
            Header: i18next.t('总下单数'),
            accessor: 'all_quantity',
            width: '150',
            Cell: ({ value, original }) => {
              return (
                <span>
                  {value
                    ? parseFloat(Big(value).toFixed(2), 10) +
                      original.sale_unit_name +
                      '（' +
                      parseFloat(
                        Big(value * original.sale_ratio).toFixed(2),
                        10,
                      ) +
                      original.std_unit_name_forsale +
                      '）'
                    : '-'}
                </span>
              )
            },
          },
          {
            Header: i18next.t('所属订单'),
            id: 'orders',
            Cell: ({ original: sku }) => {
              return <OrderBelongPop data={sku} />
            },
          },
          {
            Header: i18next.t('替换商品'),
            id: 'replace_name',
            width: 200,
            Cell: ({ original, index }) => {
              return (
                <MoreSelect
                  data={original.search_list || []}
                  selected={original.selected_data}
                  renderListFilterType='pinyin'
                  renderListFilter={(data) => data}
                  onSelect={this.handleChange.bind(
                    this,
                    index,
                    'selected_data',
                  )}
                  onSearch={this.handleSearch.bind(this, index, original)}
                  placeholder={i18next.t('输入商品ID或商品名')}
                />
              )
            },
          },
          {
            Header: i18next.t('替换商品规格'),
            id: 'selected_data',
            Cell: ({ original: sku }) => {
              return typeof sku.selected_data === 'undefined'
                ? '-'
                : sku.selected_data.original.std_unit_name_forsale ===
                    sku.selected_data.original.sale_unit_name &&
                  sku.selected_data.original.sale_ratio === 1
                ? i18next.t('KEY6', {
                    VAR1: sku.selected_data.original.std_unit_name_forsale,
                  })
                : sku.selected_data.original.sale_ratio +
                  sku.selected_data.original.std_unit_name +
                  '/' +
                  sku.selected_data.original.sale_unit_name
            },
          },
          {
            Header: (
              <HeaderTip
                title={i18next.t('替换数量')}
                tip={i18next.t(
                  '若使用原下单数作为替换商品的下单数，仅取数值，不考虑单位',
                )}
              />
            ),
            id: 'change_type',
            width: '200',
            Cell: ({ original, index }) => {
              // 这里的替换数量校验统一由后台进行处理
              return (
                <SelectOrderType
                  data={original}
                  index={index}
                  onChange={this.handleChange}
                />
              )
            },
          },
          {
            Header: i18next.t('销售库存'),
            id: 'stocks',
            Cell: ({ original: sku }) => {
              if (typeof sku.selected_data === 'undefined') {
                return '-'
              } else {
                if (sku.selected_data.original.stock_type === 2) {
                  return (
                    sku.selected_data.original.new_stocks +
                    sku.selected_data.original.sale_unit_name
                  )
                } else if (sku.selected_data.original.stock_type === 1) {
                  if (sku.selected_data.original.stocks === -99999) {
                    return '不限库存'
                  } else {
                    return (
                      sku.selected_data.original.stocks +
                      sku.selected_data.original.sale_unit_name
                    )
                  }
                }
              }
            },
          },
          {
            Header: i18next.t('商品备注'),
            id: 'spu_mark',
            width: '200',
            Cell: ({ original, index }) => {
              const value = original.spu_remark || ''
              const isRemarkInvalid = value?.length > 100
              return (
                <Input
                  style={{ width: '100px' }}
                  name='spu_remark'
                  value={value}
                  onChange={this.handleChange.bind(this, index, 'spu_remark')}
                  placeholder={i18next.t('备注')}
                  className={classNames('form-control', {
                    'b-bg-warning': isRemarkInvalid,
                  })}
                  title={
                    isRemarkInvalid ? i18next.t('备注长度不要超过100') : ''
                  }
                />
              )
            },
          },
          {
            width: 80,
            Header: TableUtil.OperationHeader,
            Cell: (original) => (
              <TableUtil.OperationCell>
                <TableUtil.OperationDelete
                  title='警告'
                  onClick={this.handleDel.bind(this, original.index)}
                >
                  {i18next.t('确定不替换该商品吗？')}
                </TableUtil.OperationDelete>
              </TableUtil.OperationCell>
            ),
          },
        ]}
      />
    )
  }
}

replaceSkuTable.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
}

export default replaceSkuTable
