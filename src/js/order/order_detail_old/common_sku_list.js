// 暂时应用于移动端，后续废弃
import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, InputNumber, Price, Button } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import orderDetailStore from './detail_store_old'
import _ from 'lodash'
import { convertNumber2Sid, isLockPriceSku } from '../../common/filter'
import PriceRuleIconTip from '../components/price_rule_icon_tip'
import { copywriterByTaxRate } from '../../common/service'
import {
  isStation,
  getSkuNameWithXinhaoIcon,
  isAbnormalFun,
  isQuantityInvalid,
  isLK,
  getReceiveTime,
} from '../util'
import Big from 'big.js'

@observer
class CommonSkuList extends React.Component {
  constructor() {
    super()
    this.searchInputRef = React.createRef()
  }

  componentDidMount() {
    orderDetailStore.getCommonSkuList()
  }

  handleAddSku(rowData) {
    Promise.resolve(orderDetailStore.skuAdd(rowData)).then(() => {
      orderDetailStore.skuUpdate(0, {
        key: 'quantity',
        value: rowData.quantity,
      })
    })
  }

  handleSkuQuantityChange(id, val) {
    orderDetailStore.changeCommonSkuListSku(id, val)
  }

  handleSkuInputFocus = (sku, e) => {
    if (e.keyCode === 13 && _.toNumber(sku.quantity)) {
      this.handleAddSku(sku)
      e.preventDefault()
    }
  }

  handleSearchInputChange = (e) => {
    orderDetailStore.getCommonSkuList(e.target.value)
  }

  handleSearchInputClear = (e) => {
    e.preventDefault()
    if (this.searchInputRef.current) this.searchInputRef.current.value = ''
    orderDetailStore.getCommonSkuList('')
  }

  render() {
    const {
      commonSkus: { list },
      orderDetail,
    } = orderDetailStore
    const { customer, time_config_info, viewType, _id, repair } = orderDetail
    const searchInputDom = this.searchInputRef.current
    const hasCustomer = !_.isEmpty(customer)

    let receive_time = '-'
    if (hasCustomer) {
      if (viewType === 'view' || (repair && viewType === 'edit')) {
        receive_time =
          customer.receive_begin_time + '~' + customer.receive_end_time
      } else {
        const { receive_begin_time, receive_end_time } = getReceiveTime(
          orderDetail
        )
        receive_time = receive_begin_time + '~' + receive_end_time
      }
    }

    return (
      <div>
        <div className='gm-back-bg gm-padding-tb-10 gm-padding-lr-20'>
          <div>
            <strong
              className='gm-padding-left-5'
              style={{ borderLeft: '3px solid rgb(54, 173, 58)' }}
            >
              {i18next.t('常用商品列表')}（{list.length}）
            </strong>
          </div>
          <Flex wrap className='gm-padding-top-15'>
            <span className='gm-margin-right-15'>
              {i18next.t('商户')}：
              {hasCustomer ? (
                <span>
                  {`${customer.extender.resname}/${
                    isStation(customer.address_id)
                      ? customer.address_id
                      : convertNumber2Sid(customer.address_id)
                  }`}
                </span>
              ) : (
                '-'
              )}
            </span>
            <span className='gm-margin-right-15'>
              {i18next.t('运营时间')}：
              {(time_config_info && time_config_info.name) || '-'}
            </span>
            <span className='gm-margin-right-15'>
              {i18next.t('收货时间')}：{receive_time}
            </span>
          </Flex>
        </div>

        <div className='gm-padding-tb-10 gm-padding-lr-20'>
          <p className='gm-text-desc'>
            {i18next.t('注：仅显示近两周下单频次较高的前50个商品')}
          </p>

          <div className='input-prepend input-group' style={{ width: '100%' }}>
            <span className='input-group-addon'>
              <i className='xfont xfont-search' />
            </span>
            <input
              ref={this.searchInputRef}
              onChange={this.handleSearchInputChange}
              className='form-control'
              placeholder={i18next.t(
                '输入商品ID、自定义编码或商品名，以添加商品'
              )}
              type='search'
            />
            {!searchInputDom || searchInputDom.value === '' ? null : (
              <span className='input-group-btn'>
                <button onClick={this.handleSearchInputClear} className='btn'>
                  <i className='glyphicon glyphicon-remove' />
                </button>
              </span>
            )}
          </div>
          <Table
            defaultPageSize={9999}
            data={toJS(list)}
            columns={[
              {
                Header: i18next.t('商品ID'),
                accessor: 'id',
              },
              {
                Header: i18next.t('商品名'),
                id: 'name',
                accessor: (d) => {
                  const searchInputRefVal = searchInputDom
                    ? searchInputDom.value
                    : ''
                  return getSkuNameWithXinhaoIcon(d, searchInputRefVal)
                },
              },
              {
                Header: i18next.t('规格'),
                id: 'sale_ratio',
                accessor: (d) => {
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
              },
              {
                Header: i18next.t('报价单简称（对外）'),
                accessor: 'supplier_name',
              },
              {
                Header: copywriterByTaxRate(
                  i18next.t('单价（基本单位）'),
                  i18next.t('含税单价（基本单位）')
                ),
                id: 'unit_price',
                accessor: (d) => {
                  const isTiming = d.is_price_timing
                  if (isTiming) {
                    return i18next.t('时价')
                  }
                  if (!d.unit_price) {
                    return '-'
                  }
                  return (
                    <div>
                      {Big(d.unit_price).toFixed(2) +
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
              },
              {
                Header: i18next.t('下单数'),
                id: 'quantity',
                accessor: (d) => {
                  if (d.code) {
                    return null
                  }

                  // 是否异常
                  const isAbnormal = isAbnormalFun(d)
                  // 是否已添加到订单中
                  const hasOnOrder = _.find(
                    orderDetailStore.orderDetail.details,
                    (v) => v.id === d.id
                  )

                  // 产品说：常用列表是给客户快速下单的，一旦确定了下单数，一般不会去改，所以若下单数不为0，则不可修改，若要修改，回到详情列表改
                  // 若详情列表已下该商品，则这里纯显示下单数多少，不让客户修改和添加该sku
                  if (
                    (viewType === 'create' || viewType === 'edit') &&
                    !hasOnOrder
                  ) {
                    const isSkuQuantityInvalid = isQuantityInvalid(
                      d.quantity,
                      d.sale_num_least
                    )
                    if (isLK(_id)) {
                      return (
                        parseFloat(Big(d.quantity || 0).toFixed(2)) +
                        d.sale_unit_name
                      )
                    } else {
                      return (
                        <Flex>
                          <InputNumber
                            disabled={isAbnormal}
                            value={d.quantity === undefined ? '' : d.quantity}
                            onChange={this.handleSkuQuantityChange.bind(
                              this,
                              d.id
                            )}
                            onKeyDown={this.handleSkuInputFocus.bind(this, d)}
                            className='form-control input-sm b-order-quantity-input'
                            style={{ width: '60px' }}
                            title={
                              isSkuQuantityInvalid
                                ? i18next.t(
                                    /* src:`下单数须大于0，最多两位小数，且不小于最小下单数${sku.sale_num_least}` => tpl:下单数须大于0，最多两位小数，且不小于最小下单数${VAR1} */ 'KEY104',
                                    { VAR1: d.sale_num_least }
                                  )
                                : ''
                            }
                            placeholder={i18next.t('下单数')}
                          />
                          <span className='gm-padding-5'>
                            {d.sale_unit_name}
                          </span>
                        </Flex>
                      )
                    }
                  }
                  return (
                    parseFloat(Big(d.quantity || 0).toFixed(2)) +
                    d.sale_unit_name
                  )
                },
              },
              {
                width: 80,
                Header: TableUtil.OperationHeader,
                Cell: (row) => {
                  const sku = row.original
                  const hasOnOrder = _.find(
                    orderDetailStore.orderDetail.details,
                    (v) => v.id === sku.id
                  )

                  if (sku.quantity && hasOnOrder) {
                    return (
                      <div className='text-center'>{i18next.t('已添加')}</div>
                    )
                  } else {
                    return (
                      <TableUtil.OperationCell>
                        <Button
                          className='gm-margin-right-5'
                          onClick={this.handleAddSku.bind(this, sku)}
                          disabled={
                            (viewType !== 'create' && viewType !== 'edit') ||
                            !_.toNumber(sku.quantity)
                          }
                        >
                          <i className='glyphicon glyphicon-ok' />
                        </Button>
                      </TableUtil.OperationCell>
                    )
                  }
                },
              },
            ]}
          />
        </div>
      </div>
    )
  }
}

export default CommonSkuList
