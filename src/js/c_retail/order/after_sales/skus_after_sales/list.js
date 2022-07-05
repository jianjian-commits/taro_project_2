import { i18next } from 'gm-i18n'
import React from 'react'
import { Popover, Select, InputNumber, Price, BoxPanel } from '@gmfe/react'
import { TableX } from '@gmfe/table-x'
import { observer, Observer } from 'mobx-react'
import Big from 'big.js'
import _ from 'lodash'

import store from '../store'
import { isAbnormalFun } from '../../../../order/util'
import { copywriterByTaxRate } from 'common/service'
import { afterSalesType } from 'common/enum'

const SkusAfterSalesList = observer((props) => {
  const handleSelectChange = (index, name, value) => {
    store.skusSelectChange(index, name, value)
  }

  const handleInputChange = (index, name, value) => {
    store.skusInputChange(index, name, value)
  }

  const isSelectDisable = (d) => {
    return d.refund && d.refund.state >= 2
  }

  const isRefundSku = (id) => {
    const { orderDetail } = store
    const { has_refund_money_abnormal_sku_ids } = orderDetail
    const isRefund =
      _.findIndex(has_refund_money_abnormal_sku_ids, (sku) => sku === id) !== -1
    return isRefund
  }

  const { skusList } = store
  // c订单售后暂不做退款
  const afterSalesTypeList = afterSalesType.slice(0, afterSalesType.length - 1)

  return (
    <BoxPanel
      title={i18next.t('售后明细')}
      collapse
      summary={[{ text: i18next.t('合计'), value: skusList.length }]}
    >
      <TableX
        data={skusList.slice()}
        columns={[
          {
            Header: i18next.t('商品ID'),
            accessor: 'id',
            minWidth: 80,
          },
          {
            Header: i18next.t('商品名'),
            id: 'name',
            accessor: (d) => {
              return (
                <span>
                  {d.name}
                  {isAbnormalFun(d) ? (
                    <Popover
                      showArrow
                      type='hover'
                      left
                      bottom
                      style={{
                        marginLeft: '-2px',
                        marginTop: '2px',
                        fontSize: '12px',
                      }}
                      popup={
                        <div className='gm-inline-block gm-bg gm-padding-10'>
                          {i18next.t('当前商品已存在售后异常')}
                        </div>
                      }
                    >
                      <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
                    </Popover>
                  ) : null}
                </span>
              )
            },
            minWidth: 80,
          },
          {
            Header: i18next.t('下单数'),
            id: 'quantity',
            minWidth: 80,
            accessor: (d) => (
              <div>
                {parseFloat(Big(d.quantity || 0).toFixed(2)) + d.sale_unit_name}
              </div>
            ),
          },
          {
            Header: copywriterByTaxRate(
              i18next.t('单价（销售单位）'),
              i18next.t('含税单价（销售单位）'),
            ),
            id: 'sale_price',
            minWidth: 100,
            accessor: (d) => (
              <div>{`${d.sale_price}${Price.getUnit(d.fee_type) + '/'}${
                d.sale_unit_name
              }`}</div>
            ),
          },
          {
            Header: copywriterByTaxRate(
              i18next.t('单价（基本单位）'),
              i18next.t('含税单价（基本单位）'),
            ),
            id: 'std_sale_price_forsale',
            minWidth: 100,
            accessor: (d) => (
              <div>{`${Big(d.std_sale_price_forsale / 100 || 0).toFixed(2)}${
                Price.getUnit(d.fee_type) + '/'
              }${d.std_unit_name_forsale}`}</div>
            ),
          },
          {
            Header: i18next.t('下单金额'),
            id: 'real_item_price',
            accessor: (d) => {
              const isTiming = d.is_price_timing
              if (d.code) {
                return <div>-</div>
              }
              if (isTiming) {
                return <div>{'0.00' + Price.getUnit(d.fee_type)}</div>
              } else {
                return (
                  <div>
                    {d.quantity
                      ? Big(d.quantity)
                          .times(d.sale_price || 0)
                          .toFixed(2) + Price.getUnit(d.fee_type)
                      : '0.00' + Price.getUnit(d.fee_type)}
                  </div>
                )
              }
            },
            minWidth: 100,
          },
          {
            Header: i18next.t('售后类型'),
            id: 'after_sales_type',
            accessor: (d) => {
              // 判断该商品是否已经发起售后, 已发起售后的商品不做再次售后
              const isRefund = isRefundSku(d.id)
              return (
                <Observer>
                  {() =>
                    isRefund ? (
                      <div>{i18next.t('异常')}</div>
                    ) : (
                      <Select
                        disabled={isSelectDisable(d)}
                        data={afterSalesTypeList}
                        value={d.after_sales_type}
                        style={{ minWidth: 80 }}
                        onChange={(value) =>
                          handleSelectChange(d.index, 'after_sales_type', value)
                        }
                      />
                    )
                  }
                </Observer>
              )
            },
            minWidth: 100,
          },
          {
            Header: i18next.t('记账数'),
            id: 'final_amount_forsale',
            accessor: (d) => {
              // 判断该商品是否已经发起售后, 已发起售后的商品不做再次售后
              const isRefund = isRefundSku(d.id)
              const max = parseFloat(d.quantity) * Number(d.sale_ratio)
              return (
                <Observer>
                  {() =>
                    isRefund ? (
                      <div>{d.final_amount_forsale || '-'}</div>
                    ) : d.after_sales_type === 1 ? (
                      <div>
                        <InputNumber
                          value={d.final_amount_forsale}
                          min={0}
                          max={max}
                          onChange={(value) =>
                            handleInputChange(
                              d.index,
                              'final_amount_forsale',
                              value,
                            )
                          }
                          className='form-control input-sm b-order-price-input'
                          placeholder={i18next.t('记账数')}
                        />
                        <span className='gm-padding-left-5'>
                          {d.clean_food
                            ? d.sale_unit_name
                            : d.std_unit_name_forsale}
                        </span>
                      </div>
                    ) : (
                      <div>-</div>
                    )
                  }
                </Observer>
              )
            },
            minWidth: 115,
          },
          {
            Header: i18next.t('售后原因'),
            id: 'reason',
            accessor: (d) => {
              // 判断该商品是否已经发起售后, 已发起售后的商品不做再次售后
              const isRefund = isRefundSku(d.id)
              return (
                <Observer>
                  {() =>
                    isRefund ? (
                      <div>{(d.abnormal && d.abnormal.type_text) || '-'}</div>
                    ) : d.after_sales_type > 0 ? (
                      <Select
                        disabled={isSelectDisable(d)}
                        data={d.exception_reasons.slice()}
                        value={d.type_id}
                        style={{ minWidth: 80 }}
                        onChange={(value) =>
                          handleSelectChange(d.index, 'type_id', value)
                        }
                      />
                    ) : (
                      <div>-</div>
                    )
                  }
                </Observer>
              )
            },
            minWidth: 150,
          },
        ]}
      />
    </BoxPanel>
  )
})

export default SkusAfterSalesList
