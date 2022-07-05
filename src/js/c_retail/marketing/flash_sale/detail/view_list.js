import React, { useState, useRef, useCallback } from 'react'
import { observer } from 'mobx-react'
import store from './store'
import { BoxPanel, Flex, Popover, Price } from '@gmfe/react'
import { i18next, t } from 'gm-i18n'
import { SvgSupplier } from 'gm-svg'
import { TableXVirtualized, TableXUtil } from '@gmfe/table-x'
import { RefPriceTypeSelect } from '../../../../common/components/ref_price_type_hoc'
import _ from 'lodash'
import Big from 'big.js'
import { saleState } from '../../../../common/filter'
import {
  arrowDown,
  arrowUp,
  ruleTypeMap,
  getRuleType,
  legitimate,
} from '../util'
import Position from '../../../../common/components/position'
import FloatTip from '../../../../common/components/float_tip'
import HeaderTip from '../../../../common/components/header_tip'
import globalStore from '../../../../stores/global'
import { saleReferencePrice } from '../../../../common/enum'
const { TABLE_X } = TableXUtil

const List = observer((props) => {
  const { postRefPriceType, refPriceType } = props
  const tableRef = useRef()
  const [highlightIndex, setHighlightIndex] = useState()
  const { skus } = store.detail

  const handleHighlight = useCallback((index) => {
    setHighlightIndex(index)
  }, [])

  const { flag: refPriceTypeFlag } = _.find(
    saleReferencePrice,
    (v) => v.type === refPriceType,
  )

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
      <TableXVirtualized
        refVirtualized={tableRef}
        isTrHighlight={(_, index) => index === highlightIndex}
        virtualizedHeight={
          TABLE_X.HEIGHT_HEAD_TR + Math.min(10, skus.length) * TABLE_X.HEIGHT_TR
        }
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        id='flash_sale_view_table'
        data={skus.slice()}
        columns={[
          {
            Header: t('商品名/商品ID'),
            accessor: 'name',
            Cell: (cellProps) => {
              const { name, sku_id, outer_id } = cellProps.row.original
              return (
                <div>
                  {name}
                  <br />
                  <span className='b-second-text-opacity'>
                    <FloatTip
                      skuId={sku_id}
                      tip={outer_id}
                      showCustomer={globalStore.otherInfo.showSkuOuterId}
                    />
                  </span>
                </div>
              )
            },
          },
          {
            Header: t('规格'),
            accessor: 'name',
            Cell: (cellProps) => {
              const {
                sale_ratio,
                std_unit_name_forsale,
                unit_name,
                sale_unit_name,
              } = cellProps.row.original
              return (
                <span>
                  {sale_ratio +
                    (std_unit_name_forsale || unit_name) +
                    '/' +
                    sale_unit_name}
                </span>
              )
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
              const { original } = cellProps.row
              const {
                latest_quote_from_supplier,
                quoted_from_supplier,
                fee_type,
                std_unit_name_forsale,
              } = original
              let isSupplierPrice = false
              if (
                refPriceTypeFlag === 'latest_quote_price' &&
                latest_quote_from_supplier
              ) {
                isSupplierPrice = true
              } else if (
                refPriceTypeFlag === 'last_quote_price' &&
                quoted_from_supplier
              ) {
                isSupplierPrice = true
              }

              const price = _.isNil(original[refPriceTypeFlag])
                ? '-'
                : original[refPriceTypeFlag]
              return price === '-' ? (
                '-'
              ) : (
                <Flex alignCenter>
                  <div>
                    {Big(price).div(100).toFixed(2) +
                      Price.getUnit(fee_type) +
                      '/' +
                      std_unit_name_forsale}
                  </div>
                  {isSupplierPrice && (
                    <Popover
                      top
                      showArrow
                      type='hover'
                      popup={<div>{i18next.t('供应商报价')}</div>}
                    >
                      <SvgSupplier
                        className='gm-text-14'
                        style={{
                          color: 'green',
                          marginLeft: '2px',
                        }}
                      />
                    </Popover>
                  )}
                </Flex>
              )
            },
          },
          {
            Header: t('原价'),
            accessor: 'name',
            Cell: (cellProps) => {
              const {
                sale_price,
                fee_type,
                sale_unit_name,
              } = cellProps.row.original
              return (
                <span>
                  {sale_price + Price.getUnit(fee_type) + '/' + sale_unit_name}
                </span>
              )
            },
          },
          {
            Header: t('计算规则'),
            accessor: 'rule_type',
            width: 200,
            Cell: (cellProps) => {
              const { yx_price, rule_type, fee_type } = cellProps.row.original

              return (
                <span>
                  {yx_price >= 0 && getRuleType(rule_type).operator}
                  {yx_price && Big(yx_price).toFixed(2)}
                  {rule_type === 1 && Price.getUnit(fee_type)}
                </span>
              )
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
              const { original } = cellProps.row
              const {
                rule_type,
                yx_price,
                sale_price,
                sale_unit_name,
                fee_type,
              } = original
              let rule_price = yx_price
              let yxPriceDom = null
              let yxPriceArrowDom = null

              // 计算出规则价
              if (rule_type === ruleTypeMap.VARIATION) {
                rule_price = Big(sale_price || 0)
                  .plus(legitimate(yx_price))
                  .toString()
              } else if (rule_type === ruleTypeMap.MULTIPLE) {
                rule_price = Big(sale_price)
                  .times(legitimate(yx_price))
                  .toFixed(2)
              }

              if (
                rule_price !== '' &&
                !Big(legitimate(rule_price || 0)).eq(sale_price || 0)
              ) {
                yxPriceArrowDom = Big(legitimate(rule_price || 0)).gt(
                  sale_price || 0,
                )
                  ? arrowUp()
                  : arrowDown()
              }

              if (rule_type === ruleTypeMap.FIXED_VALUE) {
                yxPriceDom = (
                  <span>
                    {rule_price && Big(rule_price).toFixed(2)}
                    {Price.getUnit(fee_type) + '/'}
                    {sale_unit_name} {yxPriceArrowDom}
                  </span>
                )
              } else if (rule_type === ruleTypeMap.VARIATION) {
                yxPriceDom = (
                  <span>
                    {rule_price && Big(rule_price).toFixed(2)}
                    {Price.getUnit(fee_type) + '/'}
                    {sale_unit_name} {yxPriceArrowDom}
                  </span>
                )
              } else if (rule_type === ruleTypeMap.MULTIPLE) {
                yxPriceDom = (
                  <span>
                    {rule_price && Big(rule_price).toFixed(2)}
                    {Price.getUnit(fee_type) + '/'}
                    {sale_unit_name} {yxPriceArrowDom}
                  </span>
                )
              }

              return yxPriceDom
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
            Cell: (cellProps) => (
              <span>{cellProps.row.original.flash_sale_stock || '-'}</span>
            ),
          },
          {
            Header: (
              <HeaderTip
                title={t('单人限购')}
                tip={t('为空表示不限制单个用户购买数量')}
              />
            ),
            accessor: 'per_limit',
            Cell: (cellProps) => (
              <span>{cellProps.row.original.per_limit || '-'}</span>
            ),
          },
          {
            Header: t('销售状态'),
            accessor: 'state',
            Cell: (cellProps) => (
              <span>{saleState(cellProps.row.original.state)}</span>
            ),
          },
        ]}
      />
    </BoxPanel>
  )
})

export default List
