import { i18next } from 'gm-i18n'
import React from 'react'
import { Price, Flex } from '@gmfe/react'
import { TableX, diyTableXHOC, fixedColumnsTableXHOC } from '@gmfe/table-x'
import { is } from '@gm-common/tool'
import Big from 'big.js'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import { RefPriceTypeSelect } from 'common/components/ref_price_type_hoc'
import FloatTip from 'common/components/float_tip'
import ReferencePriceDetail from 'common/components/reference_price_detail'
import { copywriterByTaxRate } from 'common/service'

import ListProductImg from '../../../../order/components/list_product_img'
import SkuName from '../../../../order/order_detail/components/sku_name'
import LastSaleHeader from '../../../../order/components/last_sale_header'
import RefTrend from '../../../../order/order_detail/components/ref_trend'
import { getQuantityWithUnit } from '../../../../order/util'

import store from './store'
import globalStore from 'stores/global'

const DiyTableX = diyTableXHOC(fixedColumnsTableXHOC(TableX))

@observer
class Component extends React.Component {
  render() {
    const {
      refPriceType,
      postRefPriceType,
      referencePriceFlag,
      filterStorageKey,
    } = this.props
    const showOuterId = globalStore.otherInfo.showSkuOuterId
    const { orderDetail } = store
    const { details } = orderDetail

    return (
      <DiyTableX
        key='view_c_order_detail'
        id={filterStorageKey}
        diyGroupSorting={[i18next.t('基础字段')]}
        className='b-order-sheet-table-fix'
        data={details.slice()}
        columns={[
          {
            diyGroupName: i18next.t('基础字段'),
            Header: <div className='text-center'>{i18next.t('序号')}</div>,
            diyItemText: i18next.t('序号'),
            accessor: 'sequence',
            minWidth: 50,
            Cell: ({ row: { index } }) => (
              <div className='text-center'>{index + 1}</div>
            ),
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: i18next.t('商品图'),
            accessor: 'imgs',
            minWidth: 80,
            Cell: ({ row: { original } }) => (
              <ListProductImg src={original.imgs} />
            ),
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: i18next.t('商品ID'),
            accessor: 'id',
            minWidth: 80,
            diyEnable: false,
            Cell: ({ row: { index, original } }) => (
              <FloatTip
                skuId={original.id}
                tip={original.outer_id}
                showCustomer={showOuterId}
              />
            ),
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: i18next.t('商品名'),
            accessor: 'name',
            minWidth: 80,
            diyItemText: i18next.t('商品名'),
            diyEnable: false,
            Cell: ({ row: { index, original } }) => {
              return (
                <SkuName value={original.name} index={index} sku={original} />
              )
            },
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: i18next.t('规格'),
            accessor: 'std_unit_name_forsale',
            minWidth: 50,
            Cell: ({ row: { original: sku } }) => {
              return (
                <div>
                  {sku.std_unit_name_forsale === sku.sale_unit_name &&
                  sku.sale_ratio === 1
                    ? i18next.t('KEY6', { VAR1: sku.std_unit_name_forsale })
                    : sku.sale_ratio +
                      sku.std_unit_name_forsale +
                      '/' +
                      sku.sale_unit_name}
                </div>
              )
            },
          },
          !is.phone() && {
            diyGroupName: i18next.t('基础字段'),
            Header: i18next.t('分类'),
            minWidth: 50,
            diyItemText: i18next.t('分类'),
            accessor: 'category_title_2',
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: i18next.t('下单数'),
            accessor: 'quantity',
            minWidth: 100,
            diyEnable: false,
            Cell: ({ row: { original } }) => {
              return (
                <div>
                  {original.code
                    ? '-'
                    : parseFloat(Big(original.quantity || 0).toFixed(2)) +
                      original.sale_unit_name}
                </div>
              )
            },
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: copywriterByTaxRate(
              i18next.t('单价（销售单位）'),
              i18next.t('含税单价（销售单位）'),
            ),
            accessor: 'sale_price',
            minWidth: 120,
            diyEnable: false,
            Cell: ({ row: { index, original } }) => {
              return (
                <div>{`${parseFloat(Big(original.sale_price || 0).toFixed(2))}${
                  Price.getUnit(original.fee_type) + '/'
                }
              ${original.sale_unit_name}`}</div>
              )
            },
          },
          // eslint-disable-next-line gm-react-app/no-window-template-state
          !window.g_clean_food && {
            diyGroupName: i18next.t('基础字段'),
            Header: (
              <RefPriceTypeSelect
                postRefPriceType={postRefPriceType}
                refPriceType={refPriceType}
              />
            ),
            minWidth: 100,
            show: false,
            diyItemText: i18next.t('参考成本'),
            id: 'referencePrice',
            accessor: (d) => d[referencePriceFlag],
            Cell: ({ value: reference_price, row: { index: i, original } }) => {
              if (original.code === 1) {
                return <span> - </span>
              } else {
                return (
                  <div className='gm-inline-block'>
                    <ReferencePriceDetail
                      sequshList={details.slice()}
                      reference_price={reference_price}
                      currentIndex={i}
                      referencePriceFlag={referencePriceFlag}
                      feeType={original.fee_type}
                    />
                    <RefTrend
                      sku={original}
                      refPrice={reference_price}
                      viewType='view'
                    />
                  </div>
                )
              }
            },
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: copywriterByTaxRate(
              i18next.t('单价（基本单位）'),
              i18next.t('含税单价（基本单位）'),
            ),
            accessor: 'std_sale_price_forsale',
            minWidth: 100,
            show: false,
            Cell: ({ row: { index, original: sku } }) => {
              const isTiming = sku.is_price_timing
              const totalItemPrice = sku.total_item_price || 0
              if (isTiming && !totalItemPrice) {
                return <div>{i18next.t('时价')}</div>
              }
              if (!sku.std_sale_price_forsale) {
                return <div>-</div>
              }
              const unitName = sku.std_unit_name_forsale
              return (
                <div>
                  {Big(sku.std_sale_price_forsale).div(100).toFixed(2) +
                    Price.getUnit(sku.fee_type) +
                    '/' +
                    unitName}
                </div>
              )
            },
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: i18next.t('下单金额'),
            minWidth: 80,
            accessor: 'price',
            Cell: ({ row: { index, original: sku } }) => {
              const totalItemPrice = sku.total_item_price || 0
              if (sku.code) {
                return null
              }
              return (
                <div>
                  {Big(totalItemPrice).div(100).toFixed(2) +
                    Price.getUnit(sku.fee_type)}
                </div>
              )
            },
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: <LastSaleHeader />,
            diyItemText: i18next.t('最近销售单价(基本单位)'),
            minWidth: 120,
            accessor: 'latest_std_sale_price_forsale',
            Cell: ({ row: { index, original: sku } }) => {
              const unit_price = sku.latest_std_sale_price_forsale
              const unit_name = sku.latest_std_unit_name_forsale

              if (unit_price && unit_name) {
                const price = Big(unit_price).div(100).toFixed(2)
                return (
                  <div>{`${price}${
                    Price.getUnit(sku.fee_type) + '/'
                  }${unit_name}`}</div>
                )
              } else {
                return <div>-</div>
              }
            },
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: (
              <Flex column>
                <span>{i18next.t('最近销售单价')}</span>
                <span>{i18next.t('(销售单位)')}</span>
              </Flex>
            ),
            diyItemText: i18next.t('最近销售单价(销售单位)'),
            minWidth: 120,
            accessor: 'latest_sale_price',
            Cell: ({ row: { original } }) => {
              const latest_sale_price = original.latest_sale_price
              const latest_sale_unit_name = original.latest_sale_unit_name

              if (latest_sale_price && latest_sale_unit_name) {
                const price = Big(latest_sale_price).div(100).toFixed(2)
                return (
                  <div>{`${price}${
                    Price.getUnit(original.fee_type) + '/'
                  }${latest_sale_unit_name}`}</div>
                )
              } else {
                return <div>-</div>
              }
            },
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: i18next.t('异常数'),
            minWidth: 60,
            accessor: 'exc_quantity',
            Cell: ({ row: { original } }) => {
              return (
                <div>
                  {getQuantityWithUnit(original.exc_quantity, original)}
                </div>
              )
            },
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: copywriterByTaxRate(
              i18next.t('销售额'),
              i18next.t('销售额（含税）'),
            ),
            minWidth: 80,
            accessor: 'sale_money',
            show: false,
            Cell: ({ row: { original } }) => (
              <div>
                {original.sale_money
                  ? Big(original.sale_money).div(100).toFixed(2) +
                    Price.getUnit(original.fee_type)
                  : '-'}
              </div>
            ),
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: i18next.t('备注'),
            minWidth: 80,
            accessor: 'spu_remark',
            Cell: ({ row: { original } }) => (
              <div>{original.spu_remark || '-'}</div>
            ),
          },
        ].filter((_) => _)}
      />
    )
  }
}

Component.propTypes = {
  refPriceType: PropTypes.number,
  referencePriceFlag: PropTypes.string,
  postRefPriceType: PropTypes.func,
  filterStorageKey: PropTypes.string,
}

export default Component
