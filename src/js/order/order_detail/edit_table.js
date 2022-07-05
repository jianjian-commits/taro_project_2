import { i18next, t } from 'gm-i18n'
import React from 'react'
import { Price } from '@gmfe/react'
import { is } from '@gm-common/tool'
import Big from 'big.js'
import PropTypes from 'prop-types'
import {
  TableUtil,
  EditTable,
  fixedColumnsTableHOC,
  diyTableHOC,
} from '@gmfe/table'
import { keyboardTableHoc, KeyboardUtil } from '@gmfe/keyboard'
import _ from 'lodash'
import { observer, Observer } from 'mobx-react'
import { DatePicker, ToolTip, Flex } from '@gmfe/react'
import moment from 'moment'

import { copywriterByTaxRate } from '../../common/service'
import FloatTip from '../../common/components/float_tip'
import { RefPriceTypeSelect } from '../../common/components/ref_price_type_hoc'
import ReferencePriceDetail from '../../common/components/reference_price_detail'
import { saleReferencePrice } from 'common/enum'
import { KcCustomize } from 'common/components/customize'

import {
  isLK,
  getCombineGoodsClass,
  deleteConfirm,
  isAbnormalFun,
  isPresent,
} from '../util'
import { findItemFromType, getActualQuantity } from './util'

import ListProductImg from '../components/list_product_img'
import StdRealQuantity from './components/std_real_quantity'
import RealQuantity from './components/real_quantity'
import QuantityCell from './components/quantity_cell'
import FakeQuantityCell from './components/fake_quantity_cell'
import SalePriceCell from './components/sale_price_cell'
import BeforePriceCell from './components/before_price_cell'
import ChangeRateCell from './components/change_rate_cell'
import RemarkCell from './components/remark_cell'
import LastSaleHeader from '../components/last_sale_header'
import RefTrend from './components/ref_trend'
import LowerSalepriceArrow from './components/lower_saleprice_arrow'
import OutStockQuantityCell from './components/outstock_quantity'
import SelfAcquisitionQuantityCell from './components/self_acquisition_quantity'
import LoanNumHeader from './components/loan_num_header'
import TieredPriceTable from './components/tiered_price_table'
import SVGTieredPrice from 'svg/tiered_price.svg'

import globalStore from '../../stores/global'
import orderDetailStore from '../store'
import CellTableSelect from './components/cell_table_select'
import KCDisabledCell from '../../common/components/kc_disabled_cell'

const { OperationHeader, EditTableOperation, referOfWidth } = TableUtil

const DiyEditTable = diyTableHOC(
  fixedColumnsTableHOC(keyboardTableHoc(EditTable)),
)

@observer
class Component extends React.Component {
  handleSheetColumnChange = (index, key, value, sale_ratio) => {
    const sku = orderDetailStore.orderDetail.details[index]
    const { clean_food } = sku

    // 净菜商品下不同步转换，只有提交的时候转换
    if (key === 'real_quantity' && !clean_food) {
      // 出库数销售单位*规格=出库数基本单位
      const multiValue = parseFloat(Big((value || 0) * sale_ratio).toFixed(2))
      orderDetailStore.skuUpdate(index, {
        key: 'std_real_quantity',
        value: multiValue,
      })
    }
    this.handleHuaKangLinkage(index, key, value)
    orderDetailStore.skuUpdate(index, {
      key,
      value,
    })
  }

  handleHuaKangLinkage = (index, key, value) => {
    if (globalStore.isHuaKang()) {
      const sku = orderDetailStore.orderDetail.details[index]
      if (key === 'quantity' && !(sku.weighted || sku.out_of_stock)) {
        const actualQuantity = getActualQuantity({ ...sku, quantity: value })
        orderDetailStore.skuUpdate(index, {
          key: 'after_sale_outstock_quantity',
          value: actualQuantity,
        })
        orderDetailStore.skuUpdate(index, {
          key: 'actual_quantity',
          value: actualQuantity,
        })
        orderDetailStore.skuUpdate(index, {
          key: 'after_sale_outstock_quantity_fe',
          value: 0,
        })
      }
      if (key === 'after_sale_outstock_quantity_fe') {
        orderDetailStore.skuUpdate(index, {
          key: 'after_sale_outstock_quantity',
          value: parseFloat(
            Big(value || 0)
              .plus(Big(sku.actual_quantity || 0))
              .toFixed(2),
          ),
        })
      }
    }
  }

  handleTimingDisabled = (index) => {
    orderDetailStore.listChangeTiming(index, false)
  }

  handleOutputChange = (index, value) => {
    orderDetailStore.skuUpdate(index, { key: 'std_real_quantity', value })
  }

  handleProductionDateChange = (index, value) => {
    orderDetailStore.skuUpdate(index, {
      key: 'sku_production_date',
      value,
    })
  }

  handleSheetRemarkChange = (index, e) => {
    e.preventDefault()
    this.handleSheetColumnChange(index, 'spu_remark', e.target.value)
  }

  handleDateList = (list) => {
    const newList = []
    _.forEach(list, (item) => {
      const newItem = {
        text: item.name,
        value: item.id,
      }
      newList.push(newItem)
    })
    return newList
  }

  handleAddItem = (index) => {
    const { orderDetail } = orderDetailStore
    const isLKOrder = isLK(orderDetail._id)
    // LK单不能编辑
    if (!isLKOrder) {
      orderDetailStore.addNewItem(index)
    }
  }

  handleDeleteItem = (index) => {
    const { orderDetail } = orderDetailStore
    const { details } = orderDetail
    const sku = details[index]
    if (sku && sku.is_combine_goods) {
      // 删除组合商品需要做一些同步
      deleteConfirm(details, sku).then(() => {
        orderDetailStore.deleteItem(index)
      })
    } else {
      orderDetailStore.deleteItem(index)
    }
  }

  handleBeforeDispatch = ({ actionName, to, from }) => {
    const { filterStorageKey } = this.props
    const { orderDetail } = orderDetailStore
    // 已存在的商品
    const repeatedSku = orderDetailStore.repeatedSku
    // 添加的商品 id
    const id = repeatedSku && repeatedSku.original.id

    if (from.columnKey === 'name' && actionName === 'enter') {
      const sameIndex = _.findIndex(
        orderDetail.details,
        (v, i) =>
          i !== from.rowKey &&
          v.id === id &&
          v.id !== null &&
          !v.is_combine_goods,
      )

      // 存在重复商品
      if (sameIndex >= 0) {
        // 清空存在商品
        orderDetailStore.setRepeatedSku(null)
        // 跳转到商品所在行
        KeyboardUtil.doFocus(filterStorageKey + 'edit', sameIndex, 'quantity')
        // 阻止默认的调度
        return false
      }
    }
  }

  render() {
    const {
      filterStorageKey,
      showOuterId,
      isPriceEditable,
      postRefPriceType,
      cleanFoodStation,
      isQuantityEditable,
    } = this.props
    const { orderDetail } = orderDetailStore
    const { viewType, time_config_info, details, _id } = orderDetail
    const isLKOrder = isLK(_id)
    const isHKOrder = globalStore.isHuaKang()
    const detailConfigs = isLKOrder
      ? []
      : globalStore.customizedDetailConfigs.filter(
          (v) => v.permission.write_station,
        )
    return (
      <DiyEditTable
        className='b-order-sheet-table-fix'
        diyGroupSorting={[i18next.t('基础字段')]}
        id={filterStorageKey + 'edit'}
        onAddRow={this.handleAddItem}
        onBeforeDispatch={this.handleBeforeDispatch}
        data={details.slice()}
        getTrProps={(state, row) => getCombineGoodsClass(row, details.slice())}
        columns={[
          {
            Header: <div className='text-center'>{i18next.t('序号')}</div>,
            diyItemText: i18next.t('序号'),
            accessor: 'sequence',
            width: referOfWidth.noCell,
            fixed: is.phone() ? false : 'left',
            diyGroupName: i18next.t('基础字段'),
            Cell: (cellProps) => cellProps.index + 1,
          },
          {
            Header: OperationHeader,
            diyItemText: '操作',
            id: 'action',
            accessor: 'operation',
            diyEnable: false,
            diyGroupName: i18next.t('基础字段'),
            width: referOfWidth.operationCell,
            fixed: 'left',
            Cell: ({ index, original }) => (
              <Observer>
                {() => {
                  if (!isLKOrder) {
                    const { is_combine_goods, isCombineGoodsTop } = original
                    const notDisabled = !is_combine_goods || isCombineGoodsTop
                    return (
                      <EditTableOperation
                        onAddRow={
                          notDisabled
                            ? this.handleAddItem.bind(this, index)
                            : undefined
                        }
                        onDeleteRow={
                          details.length === 1 ||
                          isPresent(original.sku_type) ||
                          isAbnormalFun(original)
                            ? undefined
                            : this.handleDeleteItem.bind(this, index)
                        }
                      />
                    )
                  }
                  return <div className='text-center'> - </div>
                }}
              </Observer>
            ),
          },
          {
            Header: i18next.t('商品图'),
            accessor: 'imgs',
            width: 70,
            diyGroupName: i18next.t('基础字段'),
            fixed: is.phone() ? false : 'left',
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  const imgs = cellProps.original.imgs
                  if (imgs === null) {
                    return '-'
                  }
                  return <ListProductImg src={imgs} />
                }}
              </Observer>
            ),
          },
          {
            Header: i18next.t('规格ID'),
            accessor: 'id',
            width: 100,
            diyGroupName: i18next.t('基础字段'),
            fixed: is.phone() ? false : 'left',
            diyEnable: false,
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  if (cellProps.original.id === null) {
                    return '-'
                  } else {
                    return (
                      <div>
                        <FloatTip
                          skuId={cellProps.original.id}
                          tip={cellProps.original.outer_id}
                          showCustomer={showOuterId}
                        />
                        {cellProps.original?.is_step_price === 1 && (
                          <ToolTip
                            style={{ marginLeft: '10px' }}
                            popup={() => {
                              orderDetailStore.initStepPriceTable(
                                cellProps.original?.step_price_table || [],
                              )
                              return (
                                <div style={{ padding: '8px' }}>
                                  <div style={{ paddingBottom: '8px' }}>
                                    {i18next.t('阶梯定价商品：')}
                                  </div>
                                  <TieredPriceTable
                                    priceUnit={Price.getUnit(
                                      cellProps.original.fee_type,
                                    )}
                                    sale_unit_name={
                                      cellProps.original.sale_unit_name
                                    }
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
                      </div>
                    )
                  }
                }}
              </Observer>
            ),
          },
          {
            // 规格ID 规格名
            Header: i18next.t('规格名'),
            accessor: 'name',
            width: 190,
            fixed: is.phone() ? false : 'left',
            diyEnable: false,
            diyGroupName: i18next.t('基础字段'),
            isKeyboard: !isLKOrder,
            Cell: (cellProps) => {
              let key = `${time_config_info?._id} ${cellProps.index}`
              if (cellProps.original.id) {
                key = `${time_config_info?._id} ${cellProps.index} ${cellProps.original.id}`
              }
              return (
                <CellTableSelect
                  key={key}
                  disabled={isPresent(cellProps.original.sku_type)}
                  index={cellProps.index}
                  original={cellProps.original}
                  showOuterId={showOuterId}
                />
              )
            },
          },
          {
            Header: i18next.t('规格'),
            accessor: 'std_unit_name_forsale',
            minWidth: 80,
            diyGroupName: i18next.t('基础字段'),
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  const sku = cellProps.original
                  if (
                    sku.std_unit_name_forsale === null ||
                    sku.isCombineGoodsTop
                  ) {
                    return '-'
                  }

                  if (sku.isCombineGoodsTop) {
                    return i18next.t('KEY6', { VAR1: sku.sale_unit_name })
                  }

                  // 批量导入sku错误code为1
                  if (sku.code) {
                    return null
                  }

                  if (
                    sku.std_unit_name_forsale === sku.sale_unit_name &&
                    sku.sale_ratio === 1
                  ) {
                    return i18next.t('KEY6', {
                      VAR1: sku.std_unit_name_forsale,
                    })
                  } /* src:`按${sku.std_unit_name_forsale}` => tpl:按${VAR1} */

                  return (
                    sku.sale_ratio +
                    sku.std_unit_name_forsale +
                    '/' +
                    sku.sale_unit_name
                  )
                }}
              </Observer>
            ),
          },

          !is.phone() && {
            Header: i18next.t('分类'),
            minWidth: 80,
            diyGroupName: i18next.t('基础字段'),
            accessor: 'category_title_2',
            Cell: (cellProps) => (
              <Observer>
                {() => cellProps.original.category_title_2 || '-'}
              </Observer>
            ),
          },

          !is.phone() && {
            Header: i18next.t('报价单简称（对外）'),
            minWidth: 80,
            diyGroupName: i18next.t('基础字段'),
            accessor: 'supplier_name',
            Cell: (cellProps) => (
              <Observer>
                {() => cellProps.original.supplier_name || '-'}
              </Observer>
            ),
          },
          {
            Header: i18next.t('下单数'),
            accessor: 'quantity',
            minWidth: 145,
            diyEnable: false,
            diyGroupName: i18next.t('基础字段'),
            isKeyboard: !isLKOrder,
            Cell: (cellProps) => {
              return (
                <Observer>
                  {() => (
                    <QuantityCell
                      index={cellProps.index}
                      sku={cellProps.original}
                      disabled={isPresent(cellProps.original.sku_type)}
                      inputWidth={referOfWidth.numberInputBox}
                      onChange={this.handleSheetColumnChange}
                    />
                  )}
                </Observer>
              )
            },
          },
          {
            Header: (
              <Flex>
                {copywriterByTaxRate(
                  i18next.t('变化前原单价（销售单位）'),
                  i18next.t('变化前含税原单价（销售单位）'),
                )}
                <ToolTip
                  popup={
                    <div className='gm-padding-5' style={{ width: '150px' }}>
                      {i18next.t('同步报价单价格')}
                    </div>
                  }
                />
              </Flex>
            ),
            accessor: 'before_change_price_forsale',
            minWidth: 150,
            diyItemText: copywriterByTaxRate(
              i18next.t('变化前原单价（销售单位）'),
              i18next.t('变化前含税原单价（销售单位）'),
            ),
            show: false,
            diyEnable: true,
            diyGroupName: i18next.t('基础字段'),
            isKeyboard: !isLKOrder && isPriceEditable,
            Cell: (cellProps) => (
              <BeforePriceCell
                rowData={cellProps.original}
                index={cellProps.index}
                isDetail={isLKOrder}
                disabled={isPresent(cellProps.original.sku_type)}
              />
            ),
          },
          {
            Header: copywriterByTaxRate(
              i18next.t('单价（销售单位）'),
              i18next.t('含税单价（销售单位)'),
            ),
            accessor: 'sale_price',
            minWidth: 150,
            diyEnable: false,
            diyGroupName: i18next.t('基础字段'),
            isKeyboard: !isLKOrder && isPriceEditable,
            Cell: (cellProps) => {
              return (
                <Observer>
                  {() => {
                    const index = cellProps.index
                    const sale_price = cellProps.original.sale_price
                    const backup_sale_price =
                      cellProps.original?.backup_sale_price
                    const { refPriceType } = orderDetailStore
                    const referencePriceFlag =
                      findItemFromType(saleReferencePrice, refPriceType).flag ||
                      ''
                    const reference_price =
                      cellProps.original[referencePriceFlag]
                    const setOriginalPrice = () => {
                      orderDetailStore.onRowChange(
                        index,
                        'sale_price',
                        backup_sale_price,
                      )
                      const { yx_price, rule_type } = cellProps.original
                      if (yx_price && rule_type) {
                        const before_change_price_forsale = Big(
                          backup_sale_price,
                        )
                          .div(yx_price)
                          .times(100)
                          .toFixed(2)

                        orderDetailStore.onRowChange(
                          index,
                          'before_change_price_forsale',
                          Number(before_change_price_forsale),
                        )
                      }
                    }
                    return (
                      <ToolTip
                        popup={
                          backup_sale_price &&
                          !Big(backup_sale_price).eq(
                            Big(backup_sale_price).toFixed(2),
                          ) && (
                            <div className='gm-padding-5'>
                              {i18next.t('真实单价为：')}
                              {backup_sale_price.toString() + '，'}
                              {<a onClick={setOriginalPrice}>点此应用</a>}
                            </div>
                          )
                        }
                      >
                        <Flex alignCenter>
                          <SalePriceCell
                            sale_price={
                              // sale_price !== null
                              //   ? String(sale_price)
                              //   : sale_price
                              sale_price
                            }
                            index={index}
                            disabled={isPresent(cellProps.original.sku_type)}
                            sku={cellProps.original}
                            inputWidth={referOfWidth.numberInputBox}
                            isPriceEditable={isPriceEditable}
                            onEdit={this.handleTimingDisabled}
                          />
                          <LowerSalepriceArrow
                            sku={cellProps.original}
                            refPrice={reference_price}
                            viewType='edit'
                          />
                        </Flex>
                      </ToolTip>
                    )
                  }}
                </Observer>
              )
            },
          },
          {
            Header: (
              <Flex>
                {i18next.t('变化率')}
                <ToolTip
                  popup={
                    <div className='gm-padding-5' style={{ width: '150px' }}>
                      {i18next.t(
                        globalStore?.orderInfo?.contract_rate_format === 1
                          ? '表征变化，值为分数形式，可为负值'
                          : '表征折扣，值为大于0的小数',
                      )}
                    </div>
                  }
                />
              </Flex>
            ),
            accessor: 'change_rate',
            minWidth: 80,
            diyItemText: i18next.t('变化率'),
            diyEnable: true,
            show: false,
            diyGroupName: i18next.t('基础字段'),
            isKeyboard: false,
            Cell: ({ original, index }) => (
              <ChangeRateCell index={index} rowData={original} />
            ),
          },
          {
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
            diyItemText: i18next.t('参考成本'),
            id: 'referencePrice',
            diyGroupName: i18next.t('基础字段'),
            Cell: ({ index, original, value }) => (
              <Observer>
                {() => {
                  if (
                    original.id === null ||
                    original.code === 1 ||
                    original.isCombineGoodsTop
                  ) {
                    return <span> - </span>
                  } else {
                    const { refPriceType } = orderDetailStore
                    const referencePriceFlag =
                      findItemFromType(saleReferencePrice, refPriceType).flag ||
                      ''
                    const value = original[referencePriceFlag]
                    return (
                      <div className='gm-inline-block'>
                        <ReferencePriceDetail
                          sequshList={details.slice()}
                          reference_price={value}
                          currentIndex={index}
                          referencePriceFlag={referencePriceFlag}
                          feeType={original.fee_type}
                        />
                        <RefTrend sku={original} refPrice={value} />
                      </div>
                    )
                  }
                }}
              </Observer>
            ),
          },
          {
            Header: i18next.t('下单金额'),
            minWidth: 80,
            accessor: 'price',
            diyGroupName: i18next.t('基础字段'),
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  const sku = cellProps.original
                  if (sku.code) {
                    return null
                  }
                  const quantity = sku.quantity
                  return quantity
                    ? Big(quantity)
                        .times(sku.sale_price || 0)
                        .toFixed(2) +
                        Price.getUnit(sku.fee_type) +
                        (sku.is_combine_goods && sku.isCombineGoodsTop
                          ? ` (${t('参考金额')})`
                          : '')
                    : '0.00' + Price.getUnit(sku.fee_type)
                }}
              </Observer>
            ),
          },
          {
            Header: i18next.t('周转物'),
            minWidth: 80,
            accessor: 'tname',
            diyGroupName: i18next.t('基础字段'),
            show: false,
            Cell: (cellProps) => {
              return (
                <Observer>
                  {() => {
                    const { tname } = cellProps.original

                    return <span> {tname || '-'}</span>
                  }}
                </Observer>
              )
            },
          },
          {
            Header: <LoanNumHeader />,
            diyItemText: i18next.t('预借出数'),
            minWidth: 120,
            accessor: 'radio',
            show: false,
            diyGroupName: i18next.t('基础字段'),
            Cell: (cellProps) => {
              return (
                <Observer>
                  {() => {
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
                        : Big(radio ?? 0) // 下单数可能为0
                            .times(turnover_ratio)
                            .toFixed(2)
                      : 0

                    return tid ? num + turnover_unit_name : '-'
                  }}
                </Observer>
              )
            },
          },
          globalStore.hasPermission('edit_fake_quantity') && {
            Header: i18next.t('预下单数'),
            minWidth: 145,
            accessor: 'fake_quantity',
            show: false,
            isKeyboard: true,
            diyGroupName: i18next.t('基础字段'),
            Cell: (cellProps) => {
              return (
                <Observer>
                  {() => (
                    <FakeQuantityCell
                      index={cellProps.index}
                      sku={cellProps.original}
                      disabled={isPresent(cellProps.original.sku_type)}
                      inputWidth={referOfWidth.numberInputBox}
                      onChange={this.handleSheetColumnChange}
                    />
                  )}
                </Observer>
              )
            },
          },
          {
            Header: <LastSaleHeader />,
            diyItemText: i18next.t('最近销售单价(基本单位)'),
            minWidth: 120,
            accessor: 'latest_std_sale_price_forsale',
            diyGroupName: i18next.t('基础字段'),
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  const sku = cellProps.original
                  const unit_price = sku.latest_std_sale_price_forsale
                  const unit_name = sku.latest_std_unit_name_forsale
                  if (unit_price !== null && unit_name) {
                    const price = Big(unit_price).div(100).toFixed(2)
                    return `${price}${
                      Price.getUnit(sku.fee_type) + '/'
                    }${unit_name}`
                  } else {
                    return '-'
                  }
                }}
              </Observer>
            ),
          },
          {
            Header: i18next.t('出库数（基本单位）'),
            minWidth: 160,
            accessor: 'std_real_quantity',
            show: true,
            diyGroupName: i18next.t('基础字段'),
            isKeyboard: viewType !== 'create' && isQuantityEditable,
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  if (cellProps.original.isCombineGoodsTop) {
                    return <span> - </span>
                  }
                  return (
                    <StdRealQuantity
                      sku={cellProps.original}
                      index={cellProps.index}
                      inputWidth={referOfWidth.numberInputBox}
                      cleanFoodStation={cleanFoodStation}
                      isQuantityEditable={isQuantityEditable}
                      viewType={viewType}
                      onChange={this.handleOutputChange}
                    />
                  )
                }}
              </Observer>
            ),
          },

          {
            Header: i18next.t('出库数（销售单位）'),
            minWidth: 160,
            accessor: 'real_quantity',
            diyGroupName: i18next.t('基础字段'),
            show: false,
            isKeyboard: viewType !== 'create' && isQuantityEditable,
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  if (cellProps.original.isCombineGoodsTop) {
                    return <span> - </span>
                  }
                  return (
                    <RealQuantity
                      sku={cellProps.original}
                      index={cellProps.index}
                      inputWidth={referOfWidth.numberInputBox}
                      cleanFoodStation={cleanFoodStation}
                      isQuantityEditable={isQuantityEditable}
                      viewType={viewType}
                      onChange={this.handleSheetColumnChange}
                    />
                  )
                }}
              </Observer>
            ),
          },
          {
            diyGroupName: i18next.t('基础字段'),
            Header: i18next.t('商品生产日期'),
            minWidth: 180,
            accessor: 'sku_production_date',
            show: false,
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  return (
                    <DatePicker
                      disabled={isPresent(cellProps.original.sku_type)}
                      date={cellProps.original?.sku_production_date}
                      onChange={(value) => {
                        const date = value
                          ? moment(value).format('YYYY-MM-DD')
                          : null
                        this.handleProductionDateChange(cellProps.index, date)
                      }}
                      placeholder='选择日期'
                    />
                  )
                }}
              </Observer>
            ),
          },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('基础字段'),
              Header: i18next.t('验货数'),
              minWidth: 80,
              accessor: 'actual_quantity',
              Cell: ({ original: sku }) => {
                return (
                  <Observer>
                    {() => {
                      if (sku.isCombineGoodsTop) return '-'
                      return (
                        parseFloat(Big(sku.actual_quantity || 0).toFixed(2)) +
                        sku.sale_unit_name
                      )
                    }}
                  </Observer>
                )
              },
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('基础字段'),
              Header: i18next.t('验货金额'),
              minWidth: 80,
              accessor: 'actual_price',
              Cell: ({ original: sku }) => {
                return (
                  <Observer>
                    {() => {
                      if (sku.isCombineGoodsTop) return '-'
                      const renderValue = Big(sku.actual_quantity || 0).times(
                        sku.sale_price || 0,
                      )
                      return (
                        parseFloat(Big(renderValue).toFixed(2)) +
                        Price.getUnit(sku.fee_type)
                      )
                    }}
                  </Observer>
                )
              },
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('基础字段'),
              Header: i18next.t('售后数'),
              minWidth: 140,
              accessor: 'after_sale_outstock_quantity_fe',
              isKeyboard: true,
              Cell: (cellProps) => {
                return (
                  <Observer>
                    {() => (
                      <OutStockQuantityCell
                        disabled={isPresent(cellProps.original.sku_type)}
                        index={cellProps.index}
                        sku={cellProps.original}
                        inputWidth={referOfWidth.numberInputBox}
                        onChange={this.handleSheetColumnChange}
                      />
                    )}
                  </Observer>
                )
              },
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('基础字段'),
              Header: i18next.t('售后金额'),
              minWidth: 80,
              accessor: 'after_sale_outstock_price_fe',
              Cell: ({ original: sku }) => (
                <Observer>
                  {() =>
                    parseFloat(
                      Big(sku.after_sale_outstock_quantity_fe || 0)
                        .times(Big(sku.sale_price || 0))
                        .toFixed(2),
                    ) + Price.getUnit(sku.fee_type)
                  }
                </Observer>
              ),
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('基础字段'),
              Header: i18next.t('售后出库数'),
              minWidth: 80,
              accessor: 'after_sale_outstock_quantity',
              Cell: ({ original }) => (
                <Observer>
                  {() =>
                    parseFloat(
                      Big(original.after_sale_outstock_quantity || 0).toFixed(
                        2,
                      ),
                    ) + original.sale_unit_name
                  }
                </Observer>
              ),
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('基础字段'),
              Header: i18next.t('售后出库金额'),
              minWidth: 90,
              accessor: 'after_sale_outstock_price',
              Cell: ({ original: sku }) => {
                return (
                  <Observer>
                    {() => {
                      if (sku.isCombineGoodsTop) return '-'
                      return (
                        parseFloat(
                          Big(sku.after_sale_outstock_quantity || 0)
                            .times(sku.sale_price || 0)
                            .toFixed(2),
                        ) + Price.getUnit(sku.fee_type)
                      )
                    }}
                  </Observer>
                )
              },
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('基础字段'),
              Header: i18next.t('自采数'),
              minWidth: 140,
              accessor: 'self_acquisition_quantity',
              isKeyboard: true,
              Cell: (cellProps) => {
                return (
                  <Observer>
                    {() => (
                      <SelfAcquisitionQuantityCell
                        disabled={isPresent(cellProps.original.sku_type)}
                        index={cellProps.index}
                        sku={cellProps.original}
                        inputWidth={referOfWidth.numberInputBox}
                        onChange={this.handleSheetColumnChange}
                      />
                    )}
                  </Observer>
                )
              },
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('基础字段'),
              Header: i18next.t('自采金额'),
              minWidth: 80,
              accessor: 'self_acquisition_price',
              Cell: ({ original: sku }) => {
                return (
                  <Observer>
                    {() => {
                      if (sku.isCombineGoodsTop) return '-'
                      return (
                        parseFloat(
                          Big(sku.self_acquisition_quantity || 0)
                            .times(sku.sale_price || 0)
                            .toFixed(2),
                        ) + Price.getUnit(sku.fee_type)
                      )
                    }}
                  </Observer>
                )
              },
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('基础字段'),
              Header: i18next.t('销售出库数'),
              minWidth: 80,
              accessor: 'sale_outstock_quantity',
              Cell: ({ original: sku }) => {
                return (
                  <Observer>
                    {() => {
                      if (sku.isCombineGoodsTop) return '-'
                      return (
                        parseFloat(
                          Big(sku.after_sale_outstock_quantity || 0)
                            .plus(sku.self_acquisition_quantity || 0)
                            .toFixed(2),
                        ) + sku.sale_unit_name
                      )
                    }}
                  </Observer>
                )
              },
            },
          !isLKOrder &&
            isHKOrder && {
              diyGroupName: i18next.t('基础字段'),
              Header: i18next.t('销售出库金额'),
              minWidth: 90,
              accessor: 'sale_outstock_price',
              Cell: ({ original: sku }) => {
                return (
                  <Observer>
                    {() => {
                      if (sku.isCombineGoodsTop) return '-'
                      return (
                        parseFloat(
                          Big(sku.self_acquisition_quantity || 0)
                            .times(sku.sale_price || 0)
                            .plus(
                              Big(sku.after_sale_outstock_quantity || 0).times(
                                sku.sale_price || 0,
                              ),
                            )
                            .toFixed(2),
                        ) + Price.getUnit(sku.fee_type)
                      )
                    }}
                  </Observer>
                )
              },
            },
          {
            Header: i18next.t('备注'),
            minWidth: 100,
            accessor: 'spu_remark',
            isKeyboard: true,
            diyGroupName: i18next.t('基础字段'),
            Cell: (cellProps) => {
              return (
                <Observer>
                  {() => {
                    return (
                      <RemarkCell
                        spu_remark={cellProps.original.spu_remark}
                        index={cellProps.index}
                        sku={cellProps.original}
                        onChange={this.handleSheetRemarkChange}
                        onSelect={this.handleSheetColumnChange}
                      />
                    )
                  }}
                </Observer>
              )
            },
          },
          ..._.map(detailConfigs, (v) => ({
            Header: v.field_name,
            minWidth: 150,
            accessor: `detail_customized_field.${v.id}`,
            isKeyboard: true,
            diyGroupName: i18next.t('基础字段'),
            Cell: (cellProps) => {
              return (
                <Observer>
                  {() => {
                    const sku = cellProps.original
                    const handleChange = (value) => {
                      const customizedField = {
                        ...sku.detail_customized_field,
                        [v.id]: value,
                      }
                      this.handleSheetColumnChange(
                        cellProps.index,
                        'detail_customized_field',
                        customizedField,
                      )
                    }
                    const radioList = (v.radio_list || []).map((v) => ({
                      value: v.id,
                      text: v.name,
                    }))
                    radioList.unshift({
                      value: undefined,
                      text: i18next.t('无'),
                    })
                    if (sku.code || sku.isCombineGoodsTop) {
                      return (
                        <KCDisabledCell>
                          <span> - </span>
                        </KCDisabledCell>
                      )
                    }
                    return (
                      <KcCustomize
                        type={v.field_type}
                        value={(sku.detail_customized_field || {})[v.id]}
                        onChange={handleChange}
                        data={radioList}
                      />
                    )
                  }}
                </Observer>
              )
            },
          })),
        ].filter((_) => _)}
      />
    )
  }
}
Component.propTypes = {
  order: PropTypes.object,
  filterStorageKey: PropTypes.string,
  showOuterId: PropTypes.bool,
  isPriceEditable: PropTypes.bool,
  postRefPriceType: PropTypes.func,
  cleanFoodStation: PropTypes.bool, // 净菜站点
  isQuantityEditable: PropTypes.bool,
}
export default Component
