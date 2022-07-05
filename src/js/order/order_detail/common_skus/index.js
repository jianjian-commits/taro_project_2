import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Price, Button, Tip } from '@gmfe/react'
import { EditTable, TableUtil } from '@gmfe/table'
import { keyboardTableHoc, KCInputNumberV2 } from '@gmfe/keyboard'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'

import {
  getSkuNameWithXinhaoIcon,
  isAbnormalFun,
  isQuantityInvalid,
  isLK,
  getCombineGoodsClass,
} from '../../util'
import { isLockPriceSku } from 'common/filter'
import PriceRuleIconTip from '../../components/price_rule_icon_tip'
import { copywriterByTaxRate } from 'common/service'
import KCDisabledCell from 'common/components/kc_disabled_cell'
import CommonSkuContainer from './container'
import orderStore from '../../store'
import store from './store'

import globalStore from 'stores/global'
import { getInfoOfOrderSkus } from '../util'

const CommonSkuTable = keyboardTableHoc(EditTable)
const findById = (details, id) =>
  _.find(details, (v) => v.id === id && !v.belongWith)

@observer
class CommonSkuList extends React.Component {
  componentDidMount() {
    store.getCommonSkuList()
  }

  handleAddSku(rowData) {
    // 若开启多sku下单, 需要判断当前选择商品是否可以添加
    const { orderCanHaveDuplicateSku } = globalStore.orderInfo
    if (orderCanHaveDuplicateSku) {
      const infoMsg = getInfoOfOrderSkus(
        rowData,
        orderStore.orderDetail.details,
      )
      if (infoMsg) {
        Tip.info(infoMsg)
        return
      }
    }
    const index = null
    store.addSkusToOrder(index, rowData)
  }

  handleSkuQuantityChange(id, val) {
    store.changeCommonSkuListSku(id, val)
  }

  handleSkuInputFocus = (sku, e) => {
    if (e.keyCode === 13 && _.toNumber(sku.quantity)) {
      this.handleAddSku(sku)
      e.preventDefault()
    }
  }

  render() {
    const { list, search_text } = store
    const { viewType, _id } = orderStore.orderDetail

    return (
      <CommonSkuContainer>
        <CommonSkuTable
          id='commonSkuList'
          defaultPageSize={9999}
          onAddRow={() => {}}
          getTrProps={(state, row) => getCombineGoodsClass(row, list)}
          data={list.slice()}
          columns={[
            {
              Header: i18next.t('商品ID'),
              accessor: 'id',
              minWidth: 80,
            },
            {
              Header: i18next.t('商品名'),
              id: 'name',
              minWidth: 80,
              accessor: (d) => {
                return getSkuNameWithXinhaoIcon(d, search_text)
              },
            },
            {
              Header: i18next.t('规格'),
              id: 'sale_ratio',
              minWidth: 80,
              accessor: (d) => {
                if (d.is_combine_goods && d.isCombineGoodsTop) {
                  return i18next.t('KEY6', { VAR1: d.sale_unit_name })
                }
                if (
                  d.std_unit_name_forsale === d.sale_unit_name &&
                  d.sale_ratio === 1
                ) {
                  return i18next.t('KEY6', { VAR1: d.std_unit_name_forsale })
                } /* src:`按${sku.std_unit_name_forsale}` => tpl:按${VAR1} */

                return (
                  d.sale_ratio +
                  d.std_unit_name_forsale +
                  '/' +
                  d.sale_unit_name
                )
              },
            },
            {
              Header: i18next.t('分类'),
              accessor: 'category_title_2',
              minWidth: 80,
            },
            {
              Header: i18next.t('报价单简称（对外）'),
              accessor: 'supplier_name',
              minWidth: 80,
            },
            {
              Header: copywriterByTaxRate(
                i18next.t('单价（基本单位）'),
                i18next.t('含税单价（基本单位）'),
              ),
              id: 'std_sale_price_forsale',
              minWidth: 80,
              accessor: (d) => {
                const isTiming = d.is_price_timing
                if (isTiming) {
                  return i18next.t('时价')
                }
                if (!d.std_sale_price_forsale) {
                  return '-'
                }
                return (
                  <div>
                    {Big(d.std_sale_price_forsale).toFixed(2) +
                      Price.getUnit(d.fee_type) +
                      '/' +
                      d.std_unit_name_forsale}
                    {isLockPriceSku(d.price_origin) && <PriceRuleIconTip />}
                  </div>
                )
              },
            },
            {
              Header: i18next.t('下单频次'),
              accessor: 'frequency',
              minWidth: 80,
            },
            {
              Header: i18next.t('下单数'),
              id: 'quantity',
              accessor: 'quantity',
              isKeyboard: true,
              minWidth: 100,
              Cell: ({ original }) => {
                return (
                  <Observer>
                    {() => {
                      const {
                        code,
                        id,
                        quantity,
                        sale_num_least,
                        sale_unit_name,
                        is_combine_goods,
                        isCombineGoodsTop,
                      } = original
                      const { details } = orderStore.orderDetail
                      if (code) {
                        return null
                      }

                      // 是否异常
                      const isAbnormal = isAbnormalFun(original)
                      // 是否已添加到订单中
                      const hasOnOrder = findById(details, id)

                      // 产品说：常用列表是给客户快速下单的，一旦确定了下单数，一般不会去改，所以若下单数不为0，则不可修改，若要修改，回到详情列表改
                      // 若详情列表已下该商品，则这里纯显示下单数多少，不让客户修改和添加该sku
                      if (
                        (viewType === 'create' || viewType === 'edit') &&
                        !hasOnOrder
                      ) {
                        const isSkuQuantityInvalid = isQuantityInvalid(
                          quantity,
                          sale_num_least,
                        )
                        if (
                          isLK(_id) ||
                          (is_combine_goods && !isCombineGoodsTop)
                        ) {
                          return (
                            <KCDisabledCell>
                              <span>
                                {parseFloat(Big(quantity || 0).toFixed(2)) +
                                  sale_unit_name}
                              </span>
                            </KCDisabledCell>
                          )
                        } else {
                          const _quantity =
                            quantity === undefined ? null : quantity
                          return (
                            <Flex>
                              <KCInputNumberV2
                                disabled={isAbnormal}
                                value={_quantity}
                                onChange={this.handleSkuQuantityChange.bind(
                                  this,
                                  id,
                                )}
                                onKeyDown={this.handleSkuInputFocus.bind(
                                  this,
                                  original,
                                )}
                                className='form-control input-sm b-order-quantity-input'
                                style={{ width: '60px' }}
                                title={
                                  isSkuQuantityInvalid
                                    ? i18next.t(
                                        /* src:`下单数须大于0，最多两位小数，且不小于最小下单数${sku.sale_num_least}` => tpl:下单数须大于0，最多两位小数，且不小于最小下单数${VAR1} */ 'KEY104',
                                        { VAR1: sale_num_least },
                                      )
                                    : ''
                                }
                                placeholder={i18next.t('下单数')}
                              />
                              <span className='gm-padding-5'>
                                {sale_unit_name}
                              </span>
                            </Flex>
                          )
                        }
                      }

                      return (
                        <KCDisabledCell>
                          <span>
                            {parseFloat(Big(quantity || 0).toFixed(2)) +
                              sale_unit_name}
                          </span>
                        </KCDisabledCell>
                      )
                    }}
                  </Observer>
                )
              },
            },
            {
              width: 80,
              Header: TableUtil.OperationHeader,
              Cell: ({ index, original: sku }) => {
                return (
                  <Observer>
                    {() => {
                      const { details } = orderStore.orderDetail
                      const hasOnOrder = findById(details, sku.id)
                      if (sku.is_combine_goods && !sku.isCombineGoodsTop) {
                        return null
                      }

                      if (sku.quantity && hasOnOrder) {
                        return (
                          <div className='text-center'>
                            {i18next.t('已添加')}
                          </div>
                        )
                      } else {
                        return (
                          <TableUtil.OperationCell>
                            <Button
                              className='gm-margin-right-5'
                              onClick={this.handleAddSku.bind(this, sku)}
                              disabled={
                                (viewType !== 'create' &&
                                  viewType !== 'edit') ||
                                !_.toNumber(sku.quantity)
                              }
                            >
                              <i className='glyphicon glyphicon-ok' />
                            </Button>
                          </TableUtil.OperationCell>
                        )
                      }
                    }}
                  </Observer>
                )
              },
            },
          ]}
        />
      </CommonSkuContainer>
    )
  }
}

export default CommonSkuList
