import { i18next } from 'gm-i18n'
import React from 'react'
import { Price, Flex, ToolTip } from '@gmfe/react'
import { is } from '@gm-common/tool'
import Big from 'big.js'
import PropTypes from 'prop-types'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import { TableUtil, diyTableHOC, fixedColumnsTableHOC } from '@gmfe/table'
import moment from 'moment'

import { RefPriceTypeSelect } from '../../common/components/ref_price_type_hoc'
import getLazyDndTable from '../../common/components/lazy_dnd_table'
import FloatTip from '../../common/components/float_tip'
import ReferencePriceDetail from '../../common/components/reference_price_detail'
import { copywriterByTaxRate } from '../../common/service'
import { saleReferencePrice } from 'common/enum'
import ListProductImg from '../components/list_product_img'
import StdRealQuantity from './components/std_real_quantity'
import SkuName from './components/sku_name'
import QuantityCell from './components/quantity_cell'
import FakeQuantityCell from './components/fake_quantity_cell'
import BeforePriceCell from './components/before_price_cell'
import SalePriceCell from './components/sale_price_cell'
import RemarkCell from './components/remark_cell'
import LastSaleHeader from '../components/last_sale_header'
import RefTrend from './components/ref_trend'
import LowerSalepriceArrow from './components/lower_saleprice_arrow'
import { getFiledData } from 'common/components/customize'
import LoanNumHeader from './components/loan_num_header'
import { getQuantityWithUnit, isLK } from '../util'
import {
  sortByFirstLetterBase,
  isOrderDistributing,
  findItemFromType,
} from './util'

import orderDetailStore from '../store'
import globalStore from '../../stores/global'

const DiyDndTable = getLazyDndTable((loaded) => {
  loaded.default = diyTableHOC(fixedColumnsTableHOC(loaded.default))
  return loaded
})
@observer
class Component extends React.Component {
  handleDragEnd = (e) => {
    const sIndex = e.source.index
    const dIndex = e.destination.index
    if (sIndex === dIndex) return

    orderDetailStore.receiveChange({ category_sort_type: null })
    orderDetailStore.skuMove(e.source.index, e.destination.index)
  }

  handleSort = (key) => {
    const { orderDetail } = orderDetailStore
    let type = orderDetail[key]
    let { details } = orderDetail
    details = details.slice()
    if (!type || type === 'desc') {
      type = 'asc'
    } else {
      type = 'desc'
    }

    details.sort((a, b) => {
      const name = key === 'category_sort_type' ? 'category_title_2' : 'name'
      const asc = sortByFirstLetterBase(a[name], b[name])
      return type === 'asc' ? asc : -asc
    })

    orderDetailStore.receiveChange({ [key]: type, details })
  }

  render() {
    const {
      postRefPriceType,
      showOuterId,
      filterStorageKey,
      cleanFoodStation,
      isQuantityEditable,
      isPriceEditable,
    } = this.props

    const isEditOrder = globalStore.hasPermission('edit_order')
    const isOldOrderEditable = globalStore.hasPermission(
      'edit_old_order_change',
    )
    const isHKOrder = globalStore.isHuaKang()

    const { orderDetail } = orderDetailStore
    const {
      viewType,
      isRanking,
      category_sort_type,
      sku_name_sort_type,
      details,
    } = orderDetail
    const canEditSequence =
      viewType === 'view' &&
      ((isOldOrderEditable && isOrderDistributing(orderDetail)) ||
        (isEditOrder && !isOrderDistributing(orderDetail)))

    const isLKOrder = isLK(orderDetail._id)
    const detailConfigs = isLKOrder
      ? []
      : globalStore.customizedDetailConfigs.filter(
          (v) => v.permission.read_station_order,
        )

    return (
      <DiyDndTable
        key={'view' + isRanking}
        id={filterStorageKey}
        diyGroupSorting={[i18next.t('????????????')]}
        className='b-order-sheet-table-fix'
        noDataText={i18next.t('???????????????')}
        rowKey={details[0].detail_id ? 'detail_id' : 'id'}
        dndDisabled={!canEditSequence || !isRanking}
        onDragEnd={this.handleDragEnd}
        data={details.slice()}
        columns={[
          {
            diyGroupName: i18next.t('????????????'),
            Header: <div className='text-center'>{i18next.t('??????')}</div>,
            diyItemText: i18next.t('??????'),
            accessor: 'sequence',
            minWidth: 50,
            Cell: ({ index }) => <div className='text-center'>{index + 1}</div>,
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('?????????'),
            accessor: 'imgs',
            minWidth: 80,
            Cell: ({ value }) => <ListProductImg src={value} />,
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('??????ID'),
            accessor: 'id',
            minWidth: 80,
            diyEnable: false,
            Cell: ({ value, index, original }) => (
              <FloatTip
                skuId={value}
                tip={original.outer_id}
                showCustomer={showOuterId}
              />
            ),
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header:
              canEditSequence && isRanking ? (
                <TableUtil.SortHeader
                  onClick={() => this.handleSort('sku_name_sort_type')}
                  type={sku_name_sort_type}
                >
                  {i18next.t('?????????')}
                </TableUtil.SortHeader>
              ) : (
                i18next.t('?????????')
              ),
            accessor: 'name',
            minWidth: 80,
            diyItemText: i18next.t('?????????'),
            diyEnable: false,
            Cell: ({ value, index, original }) => {
              return <SkuName value={value} index={index} sku={original} />
            },
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('??????'),
            accessor: 'std_unit_name_forsale',
            minWidth: 50,
            Cell: ({ original: sku }) => {
              return sku.std_unit_name_forsale === sku.sale_unit_name &&
                sku.sale_ratio === 1
                ? i18next.t('KEY6', { VAR1: sku.std_unit_name_forsale })
                : sku.sale_ratio +
                    sku.std_unit_name_forsale +
                    '/' +
                    sku.sale_unit_name
            },
          },
          !is.phone() && {
            diyGroupName: i18next.t('????????????'),
            Header:
              canEditSequence && isRanking ? (
                <TableUtil.SortHeader
                  onClick={() => this.handleSort('category_sort_type')}
                  type={category_sort_type}
                >
                  {i18next.t('??????')}
                </TableUtil.SortHeader>
              ) : (
                i18next.t('??????')
              ),
            minWidth: 50,
            diyItemText: i18next.t('??????'),
            accessor: 'category_title_2',
          },
          !is.phone() && {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('???????????????????????????'),
            minWidth: 80,
            accessor: 'supplier_name',
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('?????????'),
            accessor: 'quantity',
            minWidth: 100,
            diyEnable: false,
            Cell: ({ value, original }) => {
              return <QuantityCell sku={original} />
            },
          },
          {
            Header: (
              <Flex>
                {copywriterByTaxRate(
                  i18next.t('????????????????????????????????????'),
                  i18next.t('??????????????????????????????????????????'),
                )}
                <ToolTip
                  popup={
                    <div className='gm-padding-5' style={{ width: '150px' }}>
                      {i18next.t('?????????????????????')}
                    </div>
                  }
                />
              </Flex>
            ),
            accessor: 'before_change_price_forsale',
            minWidth: 150,
            diyItemText: copywriterByTaxRate(
              i18next.t('????????????????????????????????????'),
              i18next.t('??????????????????????????????????????????'),
            ),
            show: false,
            diyEnable: true,
            diyGroupName: i18next.t('????????????'),
            isKeyboard: !isLKOrder && isPriceEditable,
            Cell: (cellProps) => {
              return (
                <Observer>
                  {() => {
                    return (
                      <BeforePriceCell
                        isDetail
                        rowData={cellProps.original}
                        index={cellProps.index}
                      />
                    )
                  }}
                </Observer>
              )
            },
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: copywriterByTaxRate(
              i18next.t('????????????????????????'),
              i18next.t('??????????????????????????????'),
            ),
            accessor: 'sale_price',
            minWidth: 120,
            diyEnable: false,
            Cell: ({ value, index, original }) => {
              return (
                <Observer>
                  {() => {
                    const { refPriceType } = orderDetailStore
                    const referencePriceFlag =
                      findItemFromType(saleReferencePrice, refPriceType).flag ||
                      ''
                    const reference_price = original[referencePriceFlag]

                    return (
                      <Flex>
                        <SalePriceCell
                          sale_price={Big(value).toFixed(2)}
                          index={index}
                          sku={original}
                          isPriceEditable={isPriceEditable}
                        />
                        <LowerSalepriceArrow
                          sku={original}
                          refPrice={reference_price}
                          viewType='view'
                        />
                      </Flex>
                    )
                  }}
                </Observer>
              )
            },
          },
          {
            Header: (
              <Flex>
                {i18next.t('?????????')}
                <ToolTip
                  popup={
                    <div className='gm-padding-5' style={{ width: '150px' }}>
                      {i18next.t(
                        globalStore?.orderInfo?.contract_rate_format === 1
                          ? '????????????????????????????????????????????????'
                          : '???????????????????????????0?????????',
                      )}
                    </div>
                  }
                />
              </Flex>
            ),
            accessor: 'change_rate',
            minWidth: 80,
            diyItemText: i18next.t('?????????'),
            diyEnable: true,
            show: false,
            diyGroupName: i18next.t('????????????'),
            isKeyboard: false,
            Cell: ({ index, original, value }) => (
              <Observer>
                {() => {
                  const {
                    sale_price,
                    before_change_price_forsale,
                    yx_price,
                  } = original

                  // ??????????????????????????? ??????????????? -
                  if (
                    !yx_price &&
                    (!sale_price || !Number(before_change_price_forsale))
                  )
                    return '-'

                  const change_rate = yx_price
                    ? yx_price / 100
                    : Number(sale_price) / Number(before_change_price_forsale)

                  return globalStore?.orderInfo?.contract_rate_format === 1
                    ? `${Big(change_rate - 1)
                        .times(100)
                        .toFixed(2)}%`
                    : Big(change_rate).toFixed(2)
                }}
              </Observer>
            ),
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: (
              <Observer>
                {() => {
                  const { refPriceType } = orderDetailStore
                  return (
                    <RefPriceTypeSelect
                      postRefPriceType={postRefPriceType}
                      refPriceType={refPriceType}
                      filterType={[saleReferencePrice.SUPPLIERCYCLEQUOTE.type]}
                    />
                  )
                }}
              </Observer>
            ),
            minWidth: 100,
            show: false,
            diyItemText: i18next.t('????????????'),
            id: 'referencePrice',
            Cell: ({ index: i, original }) => {
              if (original.code === 1) {
                return <span> - </span>
              } else {
                return (
                  <Observer>
                    {() => {
                      const { refPriceType } = orderDetailStore
                      const referencePriceFlag =
                        findItemFromType(saleReferencePrice, refPriceType)
                          .flag || ''
                      const reference_price = original[referencePriceFlag]
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
                    }}
                  </Observer>
                )
              }
            },
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: copywriterByTaxRate(
              i18next.t('????????????????????????'),
              i18next.t('??????????????????????????????'),
            ),
            accessor: 'std_sale_price_forsale',
            minWidth: 100,
            show: false,
            Cell: ({ value, index, original: sku }) => {
              const isTiming = sku.is_price_timing
              const totalItemPrice = sku.total_item_price || 0
              if (isTiming && !totalItemPrice) {
                return i18next.t('??????')
              }
              if (!value) {
                return '-'
              }
              const unitName = sku.std_unit_name_forsale
              return (
                Big(value).div(100).toFixed(2) +
                Price.getUnit(sku.fee_type) +
                '/' +
                unitName
              )
            },
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('????????????'),
            minWidth: 80,
            accessor: 'price',
            Cell: ({ index, original: sku }) => {
              const totalItemPrice = sku.total_item_price || 0
              if (sku.code) {
                return null
              }
              return (
                Big(totalItemPrice).div(100).toFixed(2) +
                Price.getUnit(sku.fee_type)
              )
            },
          },
          {
            Header: i18next.t('?????????'),
            minWidth: 80,
            accessor: 'tname',
            show: false,
            diyGroupName: i18next.t('????????????'),
            Cell: (cellProps) => {
              const { tname } = cellProps.original

              return <span> {tname || '-'}</span>
            },
          },
          {
            diyItemText: i18next.t('????????????'),
            Header: <LoanNumHeader />,
            minWidth: 120,
            accessor: 'radio',
            show: false,
            diyGroupName: i18next.t('????????????'),
            Cell: (cellProps) => {
              const {
                original: {
                  tid,
                  turnover_bind_type,
                  turnover_ratio,
                  turnover_unit_name,
                  quantity,
                  turnover_apply_amount,
                },
              } = cellProps
              const radio = turnover_bind_type === 1 ? 1 : quantity

              const num = tid
                ? !_.isNil(turnover_apply_amount)
                  ? Big(turnover_apply_amount).toFixed(2)
                  : Big(radio ?? 0) // ??????????????????0
                      .times(turnover_ratio)
                      .toFixed(2)
                : 0
              return tid ? num + turnover_unit_name : '-'
            },
          },
          globalStore.hasPermission('edit_fake_quantity') && {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('????????????'),
            show: false,
            accessor: 'fake_quantity',
            minWidth: 100,
            Cell: ({ value, index, original }) => {
              return <FakeQuantityCell index={index} sku={original} />
            },
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: <LastSaleHeader />,
            diyItemText: i18next.t('??????????????????(????????????)'),
            minWidth: 120,
            accessor: 'latest_std_sale_price_forsale',
            Cell: ({ value, index, original: sku }) => {
              const unit_price = sku.latest_std_sale_price_forsale
              const unit_name = sku.latest_std_unit_name_forsale

              if (unit_price && unit_name) {
                const price = Big(unit_price).div(100).toFixed(2)
                return `${price}${
                  Price.getUnit(sku.fee_type) + '/'
                }${unit_name}`
              } else {
                return '-'
              }
            },
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: (
              <Flex column>
                <span>{i18next.t('??????????????????')}</span>
                <span>{i18next.t('(????????????)')}</span>
              </Flex>
            ),
            diyItemText: i18next.t('??????????????????(????????????)'),
            minWidth: 120,
            accessor: 'latest_sale_price',
            Cell: ({ original }) => {
              const latest_sale_price = original.latest_sale_price
              const latest_sale_unit_name = original.latest_sale_unit_name

              if (latest_sale_price && latest_sale_unit_name) {
                const price = Big(latest_sale_price).div(100).toFixed(2)
                return `${price}${
                  Price.getUnit(original.fee_type) + '/'
                }${latest_sale_unit_name}`
              } else {
                return '-'
              }
            },
          },
          globalStore.hasViewTaxRate() && {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('??????'),
            minWidth: 60,
            accessor: 'tax_rate',
            diyEnable: true,
            Cell: (value) => {
              const {
                value: tax_rate,
                original: { is_set_tax },
              } = value
              return is_set_tax
                ? `${Big(tax_rate || 0)
                    .div(100)
                    .toFixed(2)}%`
                : i18next.t('?????????')
            },
          },
          globalStore.hasViewTaxRate() && {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('??????'),
            minWidth: 60,
            accessor: 'tax',
            diyEnable: true,
            Cell: ({ value: tax, index, original: sku }) => {
              if (sku.is_price_timing || !sku.std_sale_price) {
                return '-'
              } else {
                return tax
              }
            },
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('???????????????????????????'),
            minWidth: 120,
            accessor: 'std_real_quantity',
            show: true,
            Cell: ({ value: v, index, original: sku }) => {
              return (
                <StdRealQuantity
                  sku={sku}
                  index={index}
                  cleanFoodStation={cleanFoodStation}
                  isQuantityEditable={isQuantityEditable}
                  viewType='view'
                />
              )
            },
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('???????????????????????????'),
            minWidth: 80,
            accessor: 'real_quantity',
            show: false,
            Cell: ({ value: v, index, original: sku }) =>
              v ? parseFloat(Big(v).toFixed(2)) + sku.sale_unit_name : '-',
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('??????????????????'),
            minWidth: 80,
            id: 'sku_production_date',
            show: false,
            accessor: (d) =>
              d?.sku_production_date
                ? moment(d.sku_production_date).format('YYYY-MM-DD')
                : '-',
          },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('????????????'),
              Header: i18next.t('?????????'),
              minWidth: 80,
              accessor: 'actual_quantity',
              Cell: ({ value: v, original: sku }) =>
                parseFloat(Big(v || 0).toFixed(2)) + sku.sale_unit_name,
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('????????????'),
              Header: i18next.t('????????????'),
              minWidth: 80,
              accessor: 'actual_price',
              Cell: ({ value: v, original: sku }) =>
                parseFloat(Big(v || 0).toFixed(2)) +
                Price.getUnit(sku.fee_type),
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('????????????'),
              Header: i18next.t('?????????'),
              minWidth: 80,
              accessor: 'after_sale_outstock_quantity_fe',
              Cell: ({ value: v, original: sku }) =>
                parseFloat(Big(v || 0).toFixed(2)) + sku.sale_unit_name,
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('????????????'),
              Header: i18next.t('????????????'),
              minWidth: 80,
              accessor: 'after_sale_outstock_price_fe',
              Cell: ({ value: v, original: sku }) =>
                parseFloat(
                  Big(sku.after_sale_outstock_quantity_fe || 0)
                    .times(Big(sku.sale_price))
                    .toFixed(2),
                ) + Price.getUnit(sku.fee_type),
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('????????????'),
              Header: i18next.t('???????????????'),
              minWidth: 80,
              accessor: 'after_sale_outstock_quantity',
              Cell: ({ value: v, original: sku }) =>
                parseFloat(Big(v || 0).toFixed(2)) + sku.sale_unit_name,
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('????????????'),
              Header: i18next.t('??????????????????'),
              minWidth: 90,
              accessor: 'after_sale_outstock_price',
              Cell: ({ value: v, original: sku }) =>
                parseFloat(Big(v || 0).toFixed(2)) +
                Price.getUnit(sku.fee_type),
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('????????????'),
              Header: i18next.t('?????????'),
              minWidth: 80,
              accessor: 'self_acquisition_quantity',
              Cell: ({ value: v, original: sku }) =>
                parseFloat(Big(v || 0).toFixed(2)) + sku.sale_unit_name,
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('????????????'),
              Header: i18next.t('????????????'),
              minWidth: 80,
              accessor: 'self_acquisition_price',
              Cell: ({ value: v, original: sku }) =>
                parseFloat(Big(v || 0).toFixed(2)) +
                Price.getUnit(sku.fee_type),
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('????????????'),
              Header: i18next.t('???????????????'),
              minWidth: 80,
              accessor: 'sale_outstock_quantity',
              Cell: ({ value: v, original: sku }) =>
                parseFloat(Big(v || 0).toFixed(2)) + sku.sale_unit_name,
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('????????????'),
              Header: i18next.t('??????????????????'),
              minWidth: 90,
              accessor: 'sale_outstock_price',
              Cell: ({ value: v, original: sku }) =>
                parseFloat(Big(v || 0).toFixed(2)) +
                Price.getUnit(sku.fee_type),
            },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('?????????'),
            minWidth: 60,
            accessor: 'exc_quantity',
            Cell: ({ value, original }) => {
              return getQuantityWithUnit(value, original)
            },
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('?????????'),
            minWidth: 60,
            accessor: 'request_refund_quantity',
            show: false,
            Cell: ({ value, original }) => {
              return getQuantityWithUnit(Big(value || 0).toFixed(2), original)
            },
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('?????????'),
            minWidth: 60,
            accessor: 'real_refund_quantity',
            show: false,
            Cell: ({ value, original }) => {
              return getQuantityWithUnit(value, original)
            },
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: copywriterByTaxRate(
              i18next.t('?????????'),
              i18next.t('?????????????????????'),
            ),
            minWidth: 80,
            accessor: 'sale_money',
            show: false,
            Cell: ({ value: v, original: sku }) =>
              v
                ? Big(v).div(100).toFixed(2) + Price.getUnit(sku.fee_type)
                : '-',
          },
          {
            diyGroupName: i18next.t('????????????'),
            Header: i18next.t('??????'),
            minWidth: 80,
            accessor: 'spu_remark',
            Cell: ({ value, index, original }) => {
              return (
                <RemarkCell spu_remark={value} index={index} sku={original} />
              )
            },
          },
          {
            width: 80,
            diyGroupName: i18next.t('????????????'),
            Header: TableUtil.OperationHeader,
            dragField: true,
            diyEnable: false,
            id: 'action',
            diyItemText: '??????',
            fixed: 'right',
            Cell: ({ value, index }) => (
              <TableUtil.OperationCell>
                {canEditSequence && isRanking ? (
                  <i className='xfont xfont-sort' />
                ) : (
                  '-'
                )}
              </TableUtil.OperationCell>
            ),
          },
          ..._.map(detailConfigs, (v) => ({
            Header: v.field_name,
            minWidth: 150,
            accessor: `detail_customized_field.${v.id}`,
            diyGroupName: i18next.t('????????????'),
            Cell: (cellProps) => {
              const sku = cellProps.original
              return <div>{getFiledData(v, sku.detail_customized_field)}</div>
            },
          })),
        ].filter((_) => _)}
      />
    )
  }
}

Component.propTypes = {
  order: PropTypes.object,
  postRefPriceType: PropTypes.func,
  showOuterId: PropTypes.bool,
  filterStorageKey: PropTypes.string,
  cleanFoodStation: PropTypes.bool, // ????????????
  isPriceEditable: PropTypes.bool, // ???????????????
  isQuantityEditable: PropTypes.bool,
  canEditSequence: PropTypes.bool,
}

export default Component
