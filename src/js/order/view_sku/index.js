import { i18next } from 'gm-i18n'
import React from 'react'
import Big from 'big.js'
import _ from 'lodash'
import { toJS } from 'mobx'
import { observer, Observer } from 'mobx-react'
import qs from 'query-string'
import PropTypes from 'prop-types'
import { getFiledData } from 'common/components/customize'

import { Tip, Price, BoxTable, Flex, Popover } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import {
  Table,
  selectTableV2HOC,
  diyTableHOC,
  TableUtil,
  fixedColumnsTableHOC,
} from '@gmfe/table'

import {
  isAbnormalFun,
  squeshQoutePriceList,
  getQuantityWithUnit,
  isPresent,
  getCurrentSortType,
} from '../util'

import {
  orderState,
  skuBoxStatus,
  findReceiveWayById,
} from '../../common/filter'
import { saleReferencePrice } from '../../common/enum'
import FloatTip from '../../common/components/float_tip'
import {
  RefPriceTypeSelect,
  refPriceTypeHOC,
} from '../../common/components/ref_price_type_hoc'
import ReferencePriceDetail from '../../common/components/reference_price_detail'
import LastSaleHeader from '../components/last_sale_header'
import StateContainer from '../components/state_container'

import BoxAction from './box_action'
import Modify from '../../common/components/modify/modify'
import ViewSkuFilter from './filter'
import store from './store'
import globalStore from '../../stores/global'
import TableTotalText from 'common/components/table_total_text'

const SelectTable = selectTableV2HOC(diyTableHOC(fixedColumnsTableHOC(Table)))

const disableFilter = (eList) => isPresent(eList.sku_type)

@refPriceTypeHOC(3)
@observer
class ViewSku extends React.Component {
  constructor(props) {
    super(props)
    // 是否可以追加修改订单
    this.isOldOrderEditable = globalStore.hasPermission('edit_old_order_change')
    this.refPagination = React.createRef(null)
  }

  componentDidMount() {
    store.getSaleList()
    store.getPickUpList() // 自提点
    store.fetchStationServiceTime().then(() => {
      // 需要运营时间返回 因为可能是按运营周期搜索
      store.setDoFirstRequest(this.refPagination.current.apiDoFirstRequest)
      this.refPagination.current.apiDoFirstRequest()
    })
    store.getRouteList()
    // 获取服务时间
    store.getStatusServiceTime().then((json) => {
      if (json.data && json.data.length > 0) {
        const defaultTimeId = json.data[0]._id
        store.getStatusTaskCycle(defaultTimeId)
      }
    })
  }

  componentWillUnmount() {
    store.resetAll()
  }

  handleSelect = (selected) => {
    const { skus } = store
    // 处理 全选列表之后取消某一个勾选
    let isSelectedAll = false
    if (skus.list.length === selected.length) {
      isSelectedAll = true
    }
    store.filterChange({
      isAllSelected: isSelectedAll,
    })
    store.skuSelect(selected, this.isOldOrderEditable)
  }

  handleSelectAll = (isSelectedAll) => {
    store.filterChange({
      isAllSelected: isSelectedAll,
    })
    store.skuListSelect(this.isOldOrderEditable, isSelectedAll)
  }

  handlePageChange = (page) => {
    const { sortType } = store.skus.filter
    const searchData = Object.assign({}, store.searchData, {
      sort_type: sortType === '' ? null : sortType,
    })
    return store.skuListSearch(searchData, page)
  }

  handleSortClick(name) {
    const { skus } = store
    const { sortType } = skus.filter
    let sortTypeName = ''

    if (sortType) {
      const isDesc = sortType.indexOf('_desc') > -1
      const isCurrentName = sortType.indexOf(name) > -1

      if (isCurrentName) {
        sortTypeName = isDesc ? name + '_asc' : ''
      } else {
        sortTypeName = name + '_desc'
      }
    } else {
      sortTypeName = name + '_desc'
    }

    store.filterChange({
      sortType: sortTypeName,
    })

    this.refPagination.current.apiDoFirstRequest()
  }

  handleUpdateSku = (index, key, value) => {
    store.updateSku(index, key, value)
  }

  async handleQuantityConfirm(
    index,
    { order_id, sku_id, type, inputValue, detail_id },
  ) {
    const { sale_ratio } = store.skus.list[index]
    const data = {
      id: sku_id,
      order_id,
      std_real_quantity:
        type === 'temp_real_quantity'
          ? parseFloat(
              Big(inputValue || 0)
                .times(sale_ratio)
                .toFixed(2),
            )
          : inputValue,
      detail_id,
    }
    if (inputValue === '') {
      Tip.info(i18next.t('出库数不能为空'))
      return Promise.reject(new Error('出库数不能为空'))
    }
    const isOK = await store.updateRealQuantity(index, data)
    if (isOK) {
      Tip.success(i18next.t('修改成功!'))
      this.handleUpdateSku(index, 'std_real_quantity', inputValue)
      return true
    } else {
      return false
    }
  }

  async handlePriceConfirm(
    index,
    value,
    // 区分销售单位和基本单位 true -> 基本 false -> 销售
    isForSale,
  ) {
    if (isNaN(Number(value))) {
      Tip.warning(i18next.t('请输入数字'))
      return Promise.reject(new Error('请输入数字'))
    }
    if (value < 0) {
      Tip.warning(i18next.t('单价不能小于0'))
      return Promise.reject(new Error('单价不能小于0'))
    }

    await store.updatePrice(index, value, isForSale)
  }

  render() {
    const { postRefPriceType, refPriceType } = this.props
    const { skus, selectedSkus } = store
    const { sortType } = skus.filter
    const isQuantityEditable = globalStore.hasPermission('edit_real_quantity')
    const list = toJS(skus.list)
    const sequshList = squeshQoutePriceList(list)
    let referencePriceFlag = ''
    _.find(saleReferencePrice, (item) => {
      if (item.type === refPriceType) {
        referencePriceFlag = item.flag
        return true
      }
    })
    const detailConfigs = globalStore.customizedDetailConfigs.filter(
      (v) => v.permission.read_station_order,
    )
    const infoConfigs = globalStore.customizedInfoConfigs.filter(
      (v) => v.permission.read_station_order,
    )

    return (
      <div className='b-order-sort-table-wrap' style={{ position: 'relative' }}>
        <ViewSkuFilter />
        <BoxTable
          info={
            <>
              <BoxTable.Info>
                <TableTotalText
                  data={[
                    {
                      label: i18next.t('商品总数'),
                      content: skus.pagination.count,
                    },
                  ]}
                />
              </BoxTable.Info>
            </>
          }
          action={<BoxAction refPriceType={refPriceType} />}
        >
          <ManagePagination
            onRequest={this.handlePageChange}
            ref={this.refPagination}
            id='pagination_in_view_sku'
          >
            <SelectTable
              id='sku_select'
              data={sequshList}
              keyField='_id'
              isSelectorDisable={disableFilter}
              diyGroupSorting={[i18next.t('基础字段')]}
              onSelectAll={this.handleSelectAll}
              selected={selectedSkus.slice()}
              onSelect={this.handleSelect}
              loading={skus.loading}
              columns={[
                {
                  Header: i18next.t('规格名'),
                  accessor: 'id',
                  minWidth: 80,
                  diyEnable: false,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ original, value }) => {
                    return (
                      <div>
                        {original.name}
                        <span className='b-sheet-item-disable'>
                          <FloatTip
                            skuId={value}
                            tip={original.outer_id}
                            showCustomer={globalStore.otherInfo.showSkuOuterId}
                          />
                        </span>
                      </div>
                    )
                  },
                },
                {
                  Header: i18next.t('报价单'),
                  accessor: 'salemenu_name',
                  minWidth: 80,
                  diyEnable: false,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ original, value }) => {
                    return (
                      <div>
                        {value}
                        <span className='b-sheet-item-disable'>
                          {original.salemenu_id}
                        </span>
                      </div>
                    )
                  },
                },
                {
                  Header: i18next.t('原单价（基本单位）'),
                  accessor: 'before_change_price',
                  show: false,
                  minWidth: 140,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({
                    original: {
                      is_price_timing,
                      std_unit_name_forsale,
                      fee_type,
                      before_change_price,
                    },
                  }) => {
                    if (is_price_timing) return i18next.t('时价')

                    return `${before_change_price}${
                      Price.getUnit(fee_type) + '/'
                    }${std_unit_name_forsale}`
                  },
                },
                {
                  Header: i18next.t('变化率'),
                  accessor: 'change_rate',
                  show: false,
                  minWidth: 80,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({
                    original: {
                      yx_price,
                      sale_price,
                      before_change_price_forsale,
                    },
                  }) => {
                    // 未填写现价或原价时 返回占位符 -
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
                  },
                },
                {
                  Header: (
                    <TableUtil.SortHeader
                      onClick={this.handleSortClick.bind(
                        this,
                        'std_sale_price_forsale',
                      )}
                      type={getCurrentSortType(
                        sortType,
                        'std_sale_price_forsale',
                      )}
                    >
                      {i18next.t('单价(基本单位)')}
                    </TableUtil.SortHeader>
                  ),
                  accessor: 'std_sale_price_forsale',
                  minWidth: 100,
                  diyEnable: false,
                  diyGroupName: i18next.t('基础字段'),
                  diyItemText: i18next.t('单价(基本单位)'),
                  Cell: ({ original, index }) => (
                    <Observer>
                      {() => {
                        const {
                          is_price_timing,
                          fee_type,
                          std_unit_name_forsale,
                          // 基本单位的单价
                          std_sale_price_forsale,
                        } = original
                        return (
                          <Flex>
                            <span>
                              {is_price_timing
                                ? i18next.t('时价')
                                : `${Big(std_sale_price_forsale).toFixed(2)}${
                                    Price.getUnit(fee_type) + '/'
                                  }${std_unit_name_forsale}`}
                            </span>
                            <TableUtil.EditButton
                              popupRender={(closePopup) => {
                                return (
                                  <TableUtil.EditContentInputNumber
                                    closePopup={closePopup}
                                    initialVal={
                                      is_price_timing
                                        ? i18next.t('时价')
                                        : +std_sale_price_forsale
                                    }
                                    onSave={(value) => {
                                      this.handlePriceConfirm(
                                        index,
                                        value,
                                        true,
                                      )
                                    }}
                                  />
                                )
                              }}
                            />
                          </Flex>
                        )
                      }}
                    </Observer>
                  ),
                  // Cell: ({ original }) => {
                  //   if (original.is_price_timing) {
                  //     return i18next.t('时价')
                  //   }
                  //   return `${original.std_sale_price_forsale}${
                  //     Price.getUnit(original.fee_type) + '/'
                  //   }${original.std_unit_name_forsale}`
                  // },
                },
                {
                  Header: (
                    <TableUtil.SortHeader
                      onClick={this.handleSortClick.bind(this, 'sale_price')}
                      type={getCurrentSortType(sortType, 'sale_price')}
                    >
                      {i18next.t('单价(销售单位)')}
                    </TableUtil.SortHeader>
                  ),
                  accessor: 'price_for_sale',
                  minWidth: 100,
                  diyEnable: true,
                  diyGroupName: i18next.t('基础字段'),
                  diyItemText: i18next.t('单价(销售单位)'),
                  show: false,
                  Cell: ({ original, index }) => {
                    return (
                      <Observer>
                        {() => {
                          const {
                            is_price_timing,
                            fee_type,
                            sale_unit_name,
                            // 基本单位的单价
                            std_sale_price_forsale,
                            // 销售单位的单价
                            sale_price,
                            sale_ratio,
                          } = original
                          return (
                            <Flex>
                              <span>
                                {is_price_timing
                                  ? i18next.t('时价')
                                  : `${Big(sale_price).toFixed(2)}${
                                      Price.getUnit(fee_type) + '/'
                                    }${sale_unit_name}`}
                              </span>
                              <TableUtil.EditButton
                                popupRender={(closePopup) => {
                                  return (
                                    <TableUtil.EditContentInputNumber
                                      closePopup={closePopup}
                                      initialVal={
                                        is_price_timing
                                          ? i18next.t('时价')
                                          : std_sale_price_forsale * sale_ratio
                                      }
                                      onSave={(value) => {
                                        this.handlePriceConfirm(
                                          index,
                                          value,
                                          false,
                                        )
                                      }}
                                    />
                                  )
                                }}
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
                    <TableUtil.SortHeader
                      onClick={this.handleSortClick.bind(this, 'quantity')}
                      type={getCurrentSortType(sortType, 'quantity')}
                    >
                      {i18next.t('下单数')}
                    </TableUtil.SortHeader>
                  ),
                  accessor: 'quantity',
                  minWidth: 80,
                  diyEnable: true,
                  diyItemText: i18next.t('下单数'),
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value: v, original: sku }) => {
                    return v
                      ? parseFloat(Big(v).toFixed(2), 10) + sku.sale_unit_name
                      : '-'
                  },
                },
                {
                  Header: <LastSaleHeader />,
                  accessor: 'latest_std_sale_price_forsale',
                  diyItemText: i18next.t('最近销售单价 (基本单位)'),
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ original: sku }) => {
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
                  Header: (
                    <Flex column>
                      <span>{i18next.t('最近销售单价')}</span>
                      <span>{i18next.t('(销售单位)')}</span>
                    </Flex>
                  ),
                  diyItemText: i18next.t('最近销售单价(销售单位)'),
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
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
                {
                  Header: (
                    <RefPriceTypeSelect
                      postRefPriceType={postRefPriceType}
                      refPriceType={refPriceType}
                      filterType={[saleReferencePrice.SUPPLIERCYCLEQUOTE.type]}
                    />
                  ),
                  id: 'referencePriceFlag',
                  diyItemText: i18next.t('参考成本'),
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                  accessor: (d) => d[referencePriceFlag],
                  Cell: ({ value: reference_price, index, original }) => {
                    return (
                      <ReferencePriceDetail
                        sequshList={sequshList}
                        reference_price={reference_price}
                        currentIndex={index}
                        referencePriceFlag={referencePriceFlag}
                        feeType={original.fee_type}
                      />
                    )
                  },
                },
                {
                  Header: i18next.t('下单金额'),
                  accessor: 'sale_price',
                  minWidth: 80,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value: sale_price, original: sku }) => {
                    console.log(sale_price)
                    const isTiming = sku.is_price_timing

                    if (sku.code) {
                      return null
                    }

                    if (isTiming) {
                      return '0.00' + Price.getUnit(sku.fee_type)
                    } else {
                      return sku.quantity
                        ? Big(sku.quantity)
                            .times(sale_price || 0)
                            .toFixed(2) + Price.getUnit(sku.fee_type)
                        : '0.00' + Price.getUnit(sku.fee_type)
                    }
                  },
                },
                {
                  Header: (
                    <TableUtil.SortHeader
                      onClick={this.handleSortClick.bind(
                        this,
                        'std_real_quantity',
                      )}
                      type={getCurrentSortType(sortType, 'std_real_quantity')}
                    >
                      {i18next.t('出库数（基本单位）')}
                    </TableUtil.SortHeader>
                  ),
                  diyItemText: i18next.t('出库数(基本单位)'),
                  minWidth: 130,
                  diyGroupName: i18next.t('基础字段'),
                  accessor: 'std_real_quantity',
                  Cell: ({ value: v, original: sku, index }) => {
                    const {
                      status,
                      is_weigh: isWeigh, // is_weight是搜索商品时的是否称重商品，带t，详情的is_weight是不带t
                      weighted: isWeighted,
                      out_of_stock: outOfStock,
                      std_unit_name_forsale: unit_name,
                      id,
                      order_id,
                      clean_food,
                      detail_id,
                    } = sku

                    const isDelete = +status === -1

                    const isAbnormal = isAbnormalFun(sku)
                    const disabled =
                      !!isDelete || !isQuantityEditable || !!isAbnormal
                    const type = clean_food
                      ? 'temp_real_quantity'
                      : 'temp_std_real_quantity'
                    return (
                      <Flex>
                        <Modify
                          key={sku.id}
                          disabled={
                            !!isDelete ||
                            !isQuantityEditable ||
                            !!isAbnormal ||
                            sku.clean_food // 净菜不编辑基本单位
                          }
                          value={parseFloat(Big(v).toFixed(2))}
                          realIsWeight={isWeigh}
                          printed={sku.is_print}
                          isWeight={isWeighted}
                          outOfStock={outOfStock}
                          isExc={_.toNumber(isAbnormal)}
                          unitName={unit_name}
                        />
                        {!disabled && (
                          <TableUtil.EditButton
                            popupRender={(closePopup) => (
                              <TableUtil.EditContentInputNumber
                                closePopup={closePopup}
                                initialVal={parseFloat(Big(v).toFixed(2))}
                                onSave={(inputValue) => {
                                  this.handleQuantityConfirm(index, {
                                    order_id,
                                    sku_id: id,
                                    type,
                                    inputValue,
                                    detail_id,
                                  })
                                }}
                              />
                            )}
                          />
                        )}
                      </Flex>
                    )
                  },
                },
                {
                  Header: i18next.t('出库数（销售单位）'),
                  accessor: 'real_quantity',
                  minWidth: 130,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value: v, original: sku, index }) => {
                    const {
                      status,
                      is_edit,
                      temp_real_quantity,
                      is_weigh: isWeigh, // is_weight是搜索商品时的是否称重商品，带t，详情的is_weight是不带t
                      weighted: isWeighted,
                      out_of_stock: outOfStock,
                      sale_unit_name: unit_name,
                    } = sku
                    const isDelete = +status === -1

                    const isAbnormal = isAbnormalFun(sku)
                    return sku.clean_food ? (
                      <Modify
                        key={sku.id}
                        disabled={
                          !!isDelete ||
                          !isQuantityEditable ||
                          !!isAbnormal ||
                          !sku.clean_food // 净菜编辑销售单位
                        }
                        value={parseFloat(Big(v).toFixed(2))}
                        realIsWeight={isWeigh}
                        printed={sku.is_print}
                        isWeight={isWeighted}
                        outOfStock={outOfStock}
                        isExc={_.toNumber(isAbnormal)}
                        unitName={unit_name}
                        inputValue={temp_real_quantity}
                        isEdit={is_edit}
                        onChange={this.handleUpdateSku.bind(
                          this,
                          index,
                          'temp_real_quantity',
                        )}
                      />
                    ) : v ? (
                      parseFloat(Big(v).toFixed(2)) + sku.sale_unit_name
                    ) : (
                      '-'
                    )
                  },
                },
                {
                  Header: i18next.t('异常数'),
                  accessor: 'exc_quantity',
                  minWidth: 60,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value, original }) =>
                    getQuantityWithUnit(value, original),
                },
                {
                  Header: i18next.t('应退数'),
                  minWidth: 60,
                  diyGroupName: i18next.t('基础字段'),
                  accessor: 'request_refund_quantity',
                  Cell: ({ value, original }) =>
                    getQuantityWithUnit(Big(value || 0).toFixed(2), original),
                },
                {
                  Header: i18next.t('实退数'),
                  accessor: 'real_refund_quantity',
                  minWidth: 60,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value, original }) =>
                    getQuantityWithUnit(value, original),
                },
                {
                  Header: i18next.t('进入采购'),
                  accessor: 'is_create_purchase',
                  minWidth: 80,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value: v }) => {
                    return v ? '已进入' : '未进入'
                  },
                },
                {
                  Header: i18next.t('销售额'),
                  accessor: 'sale_money',
                  minWidth: 80,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value: v }) => (v ? Big(v).toFixed(2) : '-'),
                },
                globalStore.hasViewTaxRate() && {
                  Header: i18next.t('税率'),
                  accessor: 'tax_rate',
                  minWidth: 80,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value: tax_rate, original }) => {
                    return original.is_set_tax
                      ? Big(tax_rate || 0)
                          .div(100)
                          .toFixed(2) + '%'
                      : i18next.t('未设置')
                  },
                },
                globalStore.hasViewTaxRate() && {
                  Header: i18next.t('商品税额'),
                  accessor: 'tax',
                  minWidth: 80,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value: tax, original }) => {
                    if (original.is_price_timing) {
                      return '-'
                    }
                    return Big(tax || 0).toFixed(2)
                  },
                },
                {
                  Header: i18next.t('订单号'),
                  accessor: 'order_id',
                  minWidth: 100,
                  diyEnable: false,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value: order_id }) => {
                    return (
                      <a
                        href={`#/order_manage/order/list/detail?${qs.stringify({
                          id: order_id,
                        })}`}
                        style={{ textDecoration: 'underline' }}
                        rel='noopener noreferrer'
                        target='_blank'
                      >
                        {order_id}
                      </a>
                    )
                  },
                },
                {
                  Header: i18next.t('线路'),
                  accessor: 'route_name',
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                },
                {
                  Header: i18next.t('商户名'),
                  accessor: 'resname',
                  minWidth: 180,
                  diyEnable: false,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value: resname, original }) => {
                    return (
                      <div>
                        {resname}
                        <span className='b-sheet-item-disable'>
                          {original.address_id}
                        </span>
                      </div>
                    )
                  },
                },
                {
                  Header: i18next.t('订单状态'),
                  accessor: 'status',
                  diyEnable: false,
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value: status }) => {
                    return (
                      <StateContainer status={status}>
                        {orderState(status)}
                      </StateContainer>
                    )
                  },
                },
                {
                  Header: i18next.t('商品备注'),
                  accessor: 'spu_remark',
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value }) => {
                    if (!value) return '-'
                    return (
                      <Popover
                        showArrow
                        center
                        type='hover'
                        popup={
                          <div
                            className='gm-bg gm-padding-10'
                            style={{ width: '200px', wordBreak: 'break-all' }}
                          >
                            {value}
                          </div>
                        }
                      >
                        <span className='b-ellipsis-order-remark'>{value}</span>
                      </Popover>
                    )
                  },
                },
                {
                  Header: i18next.t('装箱状态'),
                  accessor: 'sku_box_status',
                  minWidth: 70,
                  show: false,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value: v }) => {
                    return <span>{skuBoxStatus(v)}</span>
                  },
                },
                ..._.map(infoConfigs, (v) => ({
                  Header: v.field_name,
                  minWidth: 100,
                  accessor: `customized_field.${v.id}`,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: (cellProps) => {
                    const detail = cellProps.original
                    return <div>{getFiledData(v, detail.customized_field)}</div>
                  },
                })),
                ..._.map(detailConfigs, (v) => ({
                  Header: v.field_name,
                  minWidth: 100,
                  accessor: `detail_customized_field.${v.id}`,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: (cellProps) => {
                    const sku = cellProps.original
                    return (
                      <div>{getFiledData(v, sku.detail_customized_field)}</div>
                    )
                  },
                })),
                {
                  Header: i18next.t('收货方式'),
                  accessor: 'receive_way',
                  minWidth: 70,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: (cellProps) => {
                    const sku = cellProps.original
                    return (
                      <div>{findReceiveWayById(sku.receive_way) || '-'}</div>
                    )
                  },
                },
                {
                  Header: i18next.t('自提点'),
                  accessor: 'pick_up_st_name',
                  minWidth: 100,
                  diyGroupName: i18next.t('基础字段'),
                  Cell: (cellProps) => {
                    const sku = cellProps.original
                    return <div>{sku.pick_up_st_name || '-'}</div>
                  },
                },
              ].filter(Boolean)}
            />
          </ManagePagination>
        </BoxTable>
      </div>
    )
  }
}

ViewSku.propTypes = {
  postRefPriceType: PropTypes.func,
  refPriceType: PropTypes.number,
}

export default ViewSku
