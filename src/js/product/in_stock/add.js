import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Flex,
  Tip,
  Dialog,
  Popover,
  RightSideModal,
  Drawer,
  Price,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import {
  Table,
  EditTable,
  fixedColumnsTableHOC,
  diyTableHOC,
  TableUtil,
} from '@gmfe/table'
import {
  KCMoreSelect,
  KCInputNumberV2,
  KCLevelSelect,
  keyboardTableHoc,
  KCInput,
  KCDatePicker,
} from '@gmfe/keyboard'
import {
  SvgPriceRule,
  SvgWeight,
  SvgXinxi,
  SvgArrivalSubmit,
  SvgArrivalCancel,
  SvgLinechart,
} from 'gm-svg'
import DiscountPanel from '../../common/components/discount_panel'
import {
  SharePanle,
  InstockScan,
  GoodDetail,
  InStockWarning,
  InStockDetailHeader,
  InStockDetailWarning,
} from './components'

import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { history } from '../../common/service'
import styles from '../product.module.less'
import { fillBatchNum, closeWindowDialog } from '../util'
import { isInShare, getSku, isValid } from './util'
import { is } from '@gm-common/tool'
import {
  PRODUCT_REASON_TYPE,
  PRODUCT_ACTION_TYPE,
  PRODUCT_STATUS,
} from '../../common/enum'

import '../actions'
import '../reducer'
import actions from '../../actions'
import DragWeight from '../../common/components/weight/drag_weight'
import weightStore from '../../stores/weight'
import globalStore from '../../stores/global'
import bridge from '../../bridge/index'

const { OperationHeader, EditTableOperation, referOfWidth } = TableUtil

import { formatShelfDataForCascade } from '../../common/util'
import KeyBoardTips from '../../common/components/key_board_tips'

const KeyboardDiyEditTable = diyTableHOC(
  fixedColumnsTableHOC(keyboardTableHoc(EditTable))
)

const isNullAndUndefined = (data) => {
  return data === null || data === undefined
}

class InStockAdd extends React.Component {
  constructor(props) {
    super(props)
    this.scanRef = React.createRef()
  }

  async componentDidMount() {
    if (globalStore.hasPermission('get_shelf')) {
      await actions.product_in_stock_shelf_list()
    }
    actions.product_in_stock_detail(this.props.params.id)
  }

  componentWillMount() {
    actions.product_in_stock_detail_init()
  }

  handleDetailAdd = () => {
    actions.product_in_pro_detail_add()
  }

  handleDetailDel(index) {
    const { inStockDetail } = this.props.product
    const { share, details } = inStockDetail

    if (share[index]) {
      if (_.includes(share[index].in_sku_logs, details[index].id)) {
        Tip.warning(i18next.t('?????????????????????????????????'))
        return false
      }
    }

    actions.product_in_pro_detail_del(index)
  }

  handleShareAdd = (share) => {
    actions.product_in_share_add(share)
    setTimeout(() => {
      this.modifyInStock(1)
    }, 100)
  }

  handleShareDel = (index) => {
    Dialog.confirm({
      children: i18next.t('??????????????????????'),
      title: i18next.t('????????????'),
    }).then(
      () => {
        actions.product_in_share_del(index)
        setTimeout(() => {
          this.modifyInStock(1)
        }, 100)
      },
      () => {}
    )
  }

  handleDiscountAdd = (discount) => {
    actions.product_in_discount_add(discount)
  }

  handleDiscountDel = (index) => {
    actions.product_in_discount_del(index)
  }

  handleChangeDate = (date) => {
    actions.product_in_date_change(moment(date).format('YYYY-MM-DD'))
  }

  handleQuantityChange(index, value) {
    actions.product_in_details_item_field_change(index, value, 'quantity')

    const { inStockDetail } = this.props.product
    const item = inStockDetail.details[index]

    if (value && item.ratio) {
      actions.product_in_details_item_field_change(
        index,
        Big(value).div(item.ratio).toFixed(4),
        'purchase_unit_quantity'
      )
    }

    if (value && item.unit_price && item.ratio) {
      // ????????????
      const money = Big(value).times(item.unit_price).toFixed(2)

      actions.product_in_details_item_field_change(index, money, 'money')
      // ?????????????????????
      const purchase_unit_price = Big(item.unit_price)
        .times(item.ratio)
        .toFixed(2)

      actions.product_in_details_item_field_change(
        index,
        purchase_unit_price,
        'purchase_unit_price'
      )
      actions.product_in_details_item_field_change(
        index,
        '0',
        'different_price'
      )
    }
  }

  handleStdUnitPriceChange(index, value) {
    actions.product_in_details_item_field_change(index, value, 'unit_price')

    const { inStockDetail } = this.props.product
    const item = inStockDetail.details[index]

    if ((value === 0 || value) && item.ratio) {
      actions.product_in_details_item_field_change(
        index,
        Big(value).times(item.ratio).toFixed(2),
        'purchase_unit_price'
      )
    }

    if ((value === 0 || value) && item.quantity) {
      actions.product_in_details_item_field_change(
        index,
        Big(value).times(item.quantity).toFixed(2),
        'money'
      )
      actions.product_in_details_item_field_change(
        index,
        '0',
        'different_price'
      )
    }
  }

  handlePurchaseUnitPriceChange(index, value) {
    actions.product_in_details_item_field_change(
      index,
      value,
      'purchase_unit_price'
    )

    const { inStockDetail } = this.props.product
    const item = inStockDetail.details[index]

    if ((value === 0 || value) && item.purchase_unit_quantity) {
      actions.product_in_details_item_field_change(
        index,
        Big(value).times(item.purchase_unit_quantity).toFixed(2),
        'money'
      )
      actions.product_in_details_item_field_change(
        index,
        '0',
        'different_price'
      )
    }

    if ((value === 0 || value) && item.ratio) {
      actions.product_in_details_item_field_change(
        index,
        Big(value).div(item.ratio).toFixed(2),
        'unit_price'
      )
    }
  }

  handlePurchaseUnitQuantityChange(index, value) {
    actions.product_in_details_item_field_change(
      index,
      value,
      'purchase_unit_quantity'
    )

    const { inStockDetail } = this.props.product
    const item = inStockDetail.details[index]

    if (value && item.ratio) {
      const quantity = Big(value).times(item.ratio).toFixed(2)
      actions.product_in_details_item_field_change(index, quantity, 'quantity')
      if (value && item.unit_price) {
        actions.product_in_details_item_field_change(
          index,
          Big(item.ratio).times(item.unit_price).toFixed(2),
          'purchase_unit_price'
        )
        actions.product_in_details_item_field_change(
          index,
          Big(quantity).times(item.unit_price).toFixed(2),
          'money'
        )
        actions.product_in_details_item_field_change(
          index,
          '0',
          'different_price'
        )
      }
    }
  }

  handleMoneyChange(index, value) {
    actions.product_in_details_item_field_change(index, value, 'money')

    const { inStockDetail } = this.props.product
    const item = inStockDetail.details[index]

    if ((value === 0 || value) && item.quantity && +item.quantity !== 0) {
      const unit_price = Big(value).div(item.quantity).toFixed(2)
      const money = Big(unit_price).times(item.quantity).toFixed(4)

      const different_price = Big(value).minus(money).toFixed(2)

      actions.product_in_details_item_field_change(
        index,
        Big(value).div(item.purchase_unit_quantity).toFixed(2),
        'purchase_unit_price'
      )
      actions.product_in_details_item_field_change(
        index,
        Big(value).div(item.quantity).toFixed(2),
        'unit_price'
      )
      actions.product_in_details_item_field_change(
        index,
        different_price,
        'different_price'
      )
    }
  }

  handelRemarkChange(index, e) {
    const { value } = e.target
    actions.product_in_details_item_field_change(index, value, 'remark')
  }

  handleChangeLifeTime(index, value) {
    actions.product_in_product_life_time_change(
      index,
      value ? moment(value).format('YYYY-MM-DD') : value
    )
  }

  // ????????????????????????
  handleChangeProductionTime(index, value) {
    actions.product_in_product_production_time_change(index, value)
  }

  // ????????????
  handleOrderRemarkChange(e) {
    const { value } = e.target
    actions.product_in_order_remark_change(value)
  }

  handleSubmit = () => {
    return this.modifyInStock(2) // ???????????????
  }

  handleSaveDraft = () => {
    this.modifyInStock(1) // ????????????
  }

  handlePrint = () => {
    const { inStockDetail } = this.props.product
    if (inStockDetail.details.length === 0) {
      Tip.warning(i18next.t('????????????????????????????????????'))
      return
    }
    window.open(`#/sales_invoicing/stock_in/print/${this.props.params.id}`)
  }

  handleExport = () => {
    window.open(
      '/stock/in_stock_sheet/material/new_detail?id=' +
        this.props.params.id +
        '&export=1'
    )
  }

  handleCancel = () => {
    const id = this.props.params.id
    Dialog.confirm({
      children: i18next.t('??????????????????????'),
      title: i18next.t('????????????'),
    }).then(
      () => {
        actions.product_in_stock_cancel(id).then(() => {
          history.push(`/sales_invoicing/stock_in/product/detail?id=${id}`)
        })
      },
      () => {}
    )
  }

  async modifyInStock(submit_type) {
    // submit_type  1????????? 2?????????
    const {
      product: { inStockDetail },
    } = this.props
    const { details } = inStockDetail

    // ?????????????????????????????????
    if (details.length === 0 || !_.find(details, (v) => v.id)) {
      Tip.warning(i18next.t('????????????????????????'))
      return Promise.reject(new Error('addProductFirst'))
    }

    const postDetails = []

    // ???????????????????????????????????????????????????????????????
    _.each(details, (v) => {
      if (
        v.spu_id ||
        !isNullAndUndefined(v.quantity) ||
        !isNullAndUndefined(v.unit_price) ||
        !isNullAndUndefined(v.money)
      ) {
        postDetails.push({ ...v })
      }
    })

    let index = 0

    // ??????????????????????????????????????????
    while (index < postDetails.length) {
      if (
        !postDetails[index].name ||
        postDetails[index].money === '' ||
        postDetails[index].unit_price === '' ||
        isNullAndUndefined(postDetails[index].money) ||
        isNullAndUndefined(postDetails[index].unit_price)
      ) {
        Tip.warning(i18next.t('???????????????????????????'))
        return Promise.reject(new Error('productDesNotComplete'))
      } else if (+postDetails[index].quantity <= 0) {
        Tip.warning(i18next.t('??????????????????0?????????????????????????????????????????????'))
        return Promise.reject(new Error('expectProductNum'))
      } else if (
        postDetails[index].production_time &&
        postDetails[index].life_time &&
        moment(postDetails[index].production_time).isAfter(
          postDetails[index].life_time
        )
      ) {
        Tip.warning(i18next.t('?????????????????????????????????'))
        return Promise.reject(
          new Error('production_time or life_time is wrong')
        )
      }

      // add ?????????
      postDetails[index].batch_number =
        inStockDetail.id + '-' + fillBatchNum(index + 1)

      index++
    }

    // ????????????????????????????????????????????????
    if (
      submit_type === 2 &&
      globalStore.otherInfo.inStockPriceWarning === 2 &&
      _.find(
        postDetails,
        (v) =>
          v.max_stock_unit_price !== null &&
          Big(v.max_stock_unit_price).lt(v.purchase_unit_price || 0)
      )
    ) {
      return Dialog.confirm({
        children: i18next.t(
          '?????????????????????????????????????????????????????????????????????????????????????????????'
        ),
        title: i18next.t('??????'),
      }).then(() => {
        inStockDetail.details = [...postDetails]
        return this.save(inStockDetail, submit_type)
      })
    }

    inStockDetail.details = [...postDetails]
    await this.save(inStockDetail, submit_type)

    if (submit_type === 2) {
      // ????????????????????????????????????????????????????????????
      closeWindowDialog('????????????????????????')
    }
  }

  save = (inStockDetail, submit_type) => {
    if (inStockDetail.submit_time === '-') {
      inStockDetail.submit_time = moment(new Date()).format('YYYY-MM-DD')
    }

    const req = Object.assign(
      {},
      inStockDetail,
      {
        details: JSON.stringify(inStockDetail.details),
      },
      { share: JSON.stringify(inStockDetail.share) },
      { discount: JSON.stringify(inStockDetail.discount) },
      { is_submit: submit_type },
      { remark: inStockDetail.remark }
    )

    return actions.product_in_stock_submit(req).then(() => {
      if (submit_type === 1) {
        actions.product_in_stock_detail(this.props.params.id)
        Tip.success(i18next.t('????????????'))
      } else {
        history.push(
          `/sales_invoicing/stock_in/product/detail?id=${this.props.params.id}`
        )
      }
    })
  }

  handleIsArrivalChange = (e, index, is_arrival) => {
    e.preventDefault()
    actions.product_in_details_item_field_change(
      index,
      is_arrival,
      'is_arrival'
    )
  }

  handleSelect(index, selectedData) {
    const { share, settle_supplier_id } = this.props.product.inStockDetail
    const {
      product: { shelfList },
    } = this.props
    if (!selectedData) {
      return actions.product_in_product_name_selected(
        index,
        selectedData,
        shelfList
      )
    }

    // ??????????????????????????????????????????
    if (selectedData && !isInShare(share, selectedData.value)) {
      actions.product_in_product_name_selected(index, selectedData, shelfList)
      actions
        .product_get_add_purchase_avg_price({
          spec_id: selectedData.value,
          settle_supplier_id: settle_supplier_id,
          query_type: 3,
        })
        .then((json) => {
          actions.product_in_product_name_selected(
            index,
            {
              ...selectedData,
              supplier_stock_avg_price: json.data.supplier_avg_price,
            },
            shelfList
          )
        })
    } else {
      Tip.info(
        i18next.t('???????????????????????????????????????????????????????????????????????????????????????')
      )
    }
  }

  handleSearch = (index, value) => {
    const id = this.props.params.id

    if (value) {
      return actions.product_sku_list(
        { name: value, id: id, source: 'supply_sku' },
        index
      )
    } else {
      return actions.product_clear_sku_list(index)
    }
  }

  handleSelectStockGoodsShelf = (index, value) => {
    actions.product_in_product_shelf_change(index, value)
  }

  handlePopupGoodDetail(original) {
    const {
      inStockDetail: { supplier_name, status, settle_supplier_id },
    } = this.props.product
    const props = {
      header: {
        origin: { ...original, status },
        settle_supplier_name: supplier_name,
        statusMap: PRODUCT_STATUS,
      },
      detail: {
        id: original.id,
        supplier_id: settle_supplier_id,
        std_unit_name: original.std_unit,
        purchase_type: 3,
      },
    }
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: is.phone()
        ? { width: '100vw', overflow: 'auto' }
        : { width: '900px', overflowY: 'scroll' },
      children: <GoodDetail {...props} />,
    })
  }

  batchTips(index) {
    const { id } = this.props.product.inStockDetail

    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ width: '260px', color: '#333' }}
      >
        {`${id}-${fillBatchNum(++index)}`}
      </div>
    )
  }

  handleSearchByBarcode = (data) => {
    const { details, share } = this.props.product.inStockDetail
    const price = Big(data.quote_unit_price || 0)
      .div(100)
      .toFixed(2)

    // ??????????????????????????????????????????
    if (!isInShare(share, data.sku_id)) {
      // ???????????????????????????????????? ???????????????????????????
      // ???????????????????????????????????? ???????????????sku_id??????????????????????????????????????????????????????sku_id????????????+1
      if (globalStore.otherInfo.batchInStock) {
        Promise.resolve(
          actions.product_in_product_name_selected(details.length, getSku(data))
        ).then(() => {
          this.handleQuantityChange(details.length, 1)
          this.handleStdUnitPriceChange(details.length, price)
        })
      } else {
        const skuIndex = _.findIndex(details, (v) => v.id === data.sku_id)
        if (skuIndex !== -1) {
          this.handleQuantityChange(
            skuIndex,
            _.toNumber(details[skuIndex].quantity) + 1
          )
          this.handleStdUnitPriceChange(skuIndex, price)
        } else {
          Promise.resolve(
            actions.product_in_product_name_selected(
              details.length,
              getSku(data)
            )
          ).then(() => {
            this.handleQuantityChange(details.length, 1)
            this.handleStdUnitPriceChange(details.length, price)
          })
        }
      }
    } else {
      Tip.info(
        i18next.t('???????????????????????????????????????????????????????????????????????????????????????')
      )
    }
  }

  handlePopupScan = () => {
    const { id } = this.props.product.inStockDetail
    let marginTop = 0
    if (this.scanRef.current) marginTop = this.scanRef.current.offsetTop
    if (id) {
      Drawer.render({
        onHide: Drawer.hide,
        style: { width: '260px', height: '42px', marginTop: marginTop },
        opacityMask: true,
        children: (
          <InstockScan id={id} onSearchByBarcode={this.handleSearchByBarcode} />
        ),
      })
    }
  }

  renderProductItem = (item) => {
    return (
      <div>
        {item.name}
        {item.in_sales === 0 && (
          <span className={styles.warnings}>{i18next.t('????????????')}</span>
        )}
      </div>
    )
  }

  // ?????????????????????
  handleReadingPound = (index, quantity) => {
    const weight = Big(quantity || 0).toFixed(2)
    const weightBridgeData = +(weightStore.data || 0)
    if (+weight > 0) {
      Dialog.confirm({
        children: i18next.t('????????????????????????????????????????????????'),
        title: i18next.t('??????'),
      }).then(() => {
        this.handleQuantityChange(index, weightBridgeData)
      })
    } else {
      this.handleQuantityChange(index, weightBridgeData)
    }
  }

  handleRenderRight = () => {
    return (
      <Flex>
        <KeyBoardTips />
      </Flex>
    )
  }

  render() {
    const { stock_method } = globalStore.user
    const { inStockDetail, saleSku, shelfList } = this.props.product
    const {
      discount,
      details,
      share,
      remark,
      status,
      creator,
      purchase_sheet_id,
    } = inStockDetail
    // ???status: 0-??????????????? 1-????????? ????????????
    const can_submit_in_stock =
      globalStore.hasPermission('edit_in_stock') && _.includes([0, 1], +status)
    const can_get_shelf = globalStore.hasPermission('get_shelf')
    const weigh_stock_in = globalStore.groundWeightInfo.weigh_stock_in // _.includes(permission, 'weigh_stock_in')

    const shelfListDetails = formatShelfDataForCascade(shelfList)
    // ???????????????????????????????????????????????????????????????
    const isYiKeXian = globalStore.stationId === 'T33176'
    const { isInstalled } = bridge.mes_app.getChromeStatus()

    return (
      <div>
        <InStockDetailHeader
          can_submit_in_stock={can_submit_in_stock}
          inStockDetail={inStockDetail}
          statusMap={PRODUCT_STATUS}
          type='add'
          handleChangeDate={this.handleChangeDate}
          handleSubmit={this.handleSubmit}
          handleSaveDraft={this.handleSaveDraft}
          handlePrint={this.handlePrint}
          handleExport={this.handleExport}
          handleCancel={this.handleCancel}
        />
        <InStockDetailWarning
          purchase_sheet_id={purchase_sheet_id}
          details={details}
          status={status}
        />

        <QuickPanel
          icon='bill'
          title={i18next.t('????????????')}
          collapse
          right={this.handleRenderRight()}
        >
          <KeyboardDiyEditTable
            diyGroupSorting={[i18next.t('????????????'), i18next.t('??????')]}
            onAddRow={this.handleDetailAdd}
            style={{ maxWidth: '100%', maxHeight: '800px' }}
            id='in_stock_table_add'
            data={details}
            getTrProps={(state, rowInfo) => {
              return {
                className:
                  rowInfo &&
                  rowInfo.original.hasOwnProperty('spu_status') &&
                  rowInfo.original.spu_status === 0 &&
                  'b-sheet-item-disable',
              }
            }}
            columns={[
              {
                Header: i18next.t('?????????'),
                diyGroupName: i18next.t('????????????'),
                diyEnable: false,
                accessor: 'num',
                fixed: 'left',
                width: referOfWidth.noCell,
                Cell: ({ index }) => {
                  return (
                    <Popover
                      showArrow
                      type='hover'
                      popup={this.batchTips(index)}
                      key={index}
                      component={<div />}
                    >
                      <span style={{ padding: '5px 0 5px 10px' }}>
                        {++index}
                      </span>
                    </Popover>
                  )
                },
              },
              {
                Header: OperationHeader,
                accessor: 'action',
                diyEnable: false,
                diyItemText: i18next.t('??????'),
                diyGroupName: i18next.t('????????????'),
                fixed: 'left',
                width: referOfWidth.operationCell,
                Cell: ({ index, original }) => {
                  const delDisable =
                    isInShare(share, original.id) || details.length === 1

                  return (
                    <EditTableOperation
                      onAddRow={this.handleDetailAdd}
                      onDeleteRow={
                        delDisable
                          ? undefined
                          : this.handleDetailDel.bind(this, index)
                      }
                    />
                  )
                },
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: '??????ID',
                accessor: 'spu_id',
                minWidth: 100,
                show: false,
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: '??????ID',
                accessor: 'id',
                minWidth: 100,
                show: false,
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('????????????'),
                accessor: 'name',
                diyEnable: false,
                minWidth: 200,
                isKeyboard: true,
                Cell: ({ original, index }) => {
                  const {
                    name,
                    displayName,
                    id,
                    unit_price,
                    money,
                    purchase_amount,
                    purchase_price,
                    purchase_unit,
                    spu_status,
                  } = original

                  const list = []
                  // siqi??????, saleSku???????????????,???????????????????????????.   ????????????????
                  _.each(saleSku, (data, index) => {
                    list[index] = []
                    _.each(data, (d) => {
                      list[index].push({
                        label: d.category_name,
                        children: _.map(d.skus, (sku) => {
                          const skuData = getSku(sku, d.in_sales)

                          skuData.text = skuData.name
                          return skuData
                        }),
                      })
                    })
                  })

                  let disable = isInShare(share, id)

                  if (name && isValid(unit_price) && isValid(money)) {
                    disable = true
                  }

                  return (
                    <Flex row alignCenter>
                      {/* ????????????????????? */}
                      {!isInShare(share, id) ? (
                        <KCMoreSelect
                          style={{ width: referOfWidth.searchBox }}
                          data={list[index] || [{ label: '', children: [] }]}
                          isGroupList
                          selected={
                            displayName
                              ? { text: displayName, value: id }
                              : undefined
                          }
                          onSelect={this.handleSelect.bind(this, index)}
                          onSearch={this.handleSearch.bind(this, index)}
                          placeholder={i18next.t('????????????????????????')}
                          renderListItem={this.renderProductItem}
                          renderListFilter={(data) => {
                            return data
                          }}
                        />
                      ) : (
                        name
                      )}

                      {disable && (
                        <>
                          <div className='gm-cursor gm-inline-block'>
                            {globalStore.hasPermission(
                              'get_stock_spec_price_info'
                            ) ? (
                              <a
                                onClick={() =>
                                  this.handlePopupGoodDetail(original)
                                }
                              >
                                <Popover
                                  showArrow
                                  component={<div />}
                                  type='hover'
                                  popup={
                                    <div
                                      className='gm-border gm-padding-5 gm-bg gm-text-12'
                                      style={{ width: '100px' }}
                                    >
                                      {i18next.t('???????????????????????????')}
                                    </div>
                                  }
                                >
                                  <span>
                                    <SvgLinechart
                                      style={{
                                        color: '#56a3f2',
                                        marginLeft: '5px',
                                      }}
                                    />
                                  </span>
                                </Popover>
                              </a>
                            ) : (
                              name
                            )}
                          </div>
                          <div className='gm-gap-5' />

                          {purchase_amount && (
                            <Popover
                              showArrow
                              component={<div />}
                              type='hover'
                              popup={
                                <div className='gm-border gm-padding-5 gm-bg gm-text-12'>
                                  <Table
                                    data={[
                                      {
                                        purchase_price,
                                        purchase_amount,
                                        purchase_unit,
                                      },
                                    ]}
                                    columns={[
                                      {
                                        Header: '?????????',
                                        id: 'purchase_amount',
                                        accessor: (d) =>
                                          d.purchase_amount + d.purchase_unit,
                                        minWidth: 60,
                                      },
                                      {
                                        Header: '????????????',
                                        id: 'purchase_price',
                                        accessor: (d) =>
                                          d.purchase_price +
                                          Price.getUnit() +
                                          '/' +
                                          d.purchase_unit,
                                        minWidth: 60,
                                      },
                                    ]}
                                  />
                                </div>
                              }
                            >
                              <span>
                                <SvgPriceRule
                                  style={{ transform: 'rotate(270deg)' }}
                                />
                              </span>
                            </Popover>
                          )}

                          {spu_status === 0 && (
                            <Popover
                              showArrow
                              component={<div />}
                              type='hover'
                              popup={
                                <div
                                  className='gm-border gm-padding-5 gm-bg gm-text-12'
                                  style={{ width: '100px' }}
                                >
                                  {i18next.t('?????????????????????')}
                                </div>
                              }
                            >
                              <span>
                                <SvgXinxi
                                  style={{ color: 'red', marginLeft: '5px' }}
                                />
                              </span>
                            </Popover>
                          )}
                        </>
                      )}
                    </Flex>
                  )
                },
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('????????????'),
                minWidth: 100,
                accessor: 'category',
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('???????????????????????????'),
                diyEnable: false,
                isKeyboard: true,
                accessor: 'quantity',
                minWidth: 190,
                Cell: ({ original, index }) => {
                  const { quantity, name } = original
                  const disable = isInShare(share, original.id)

                  return disable ? (
                    quantity + (original ? original.std_unit || '-' : '-')
                  ) : (
                    <Flex alignCenter>
                      <KCInputNumberV2
                        growing-track={isYiKeXian}
                        id={index}
                        value={quantity}
                        onChange={this.handleQuantityChange.bind(this, index)}
                        min={0}
                        className='form-control input-sm'
                        style={{ width: referOfWidth.numberInputBox }}
                      />
                      <span className='gm-padding-5'>
                        {original ? original.std_unit || '-' : '-'}
                      </span>
                      {!!weigh_stock_in && name && (
                        <button
                          onClick={() =>
                            this.handleReadingPound(index, quantity)
                          }
                        >
                          <SvgWeight style={{ fontSize: '1.4em' }} />
                          {i18next.t('??????')}
                        </button>
                      )}
                    </Flex>
                  )
                },
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: '??????????????????',
                id: 'max_stock_unit_price',
                minWidth: 90,
                accessor: (d) =>
                  d.max_stock_unit_price === null ||
                  d.max_stock_unit_price === undefined
                    ? '-'
                    : Big(d.max_stock_unit_price).toFixed(2) +
                      Price.getUnit() +
                      '/' +
                      (d.purchase_unit || '-'),
                show: false,
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('??????????????????????????????'),
                minWidth: 150,
                accessor: 'unit_price',
                diyEnable: false,
                isKeyboard: true,
                Cell: ({ original, index }) => {
                  const { unit_price } = original
                  const disable = isInShare(share, original.id)

                  return disable ? (
                    unit_price +
                      Price.getUnit() +
                      '/' +
                      (original ? original.std_unit || '-' : '-')
                  ) : (
                    <Flex alignCenter>
                      <KCInputNumberV2
                        growing-track={isYiKeXian}
                        value={unit_price}
                        onChange={this.handleStdUnitPriceChange.bind(
                          this,
                          index
                        )}
                        min={0}
                        className='form-control input-sm'
                        style={{ width: referOfWidth.numberInputBox }}
                      />
                      <span className='gm-padding-5'>
                        {Price.getUnit() + '/'}
                        {original ? original.std_unit || '-' : '-'}
                      </span>
                      <InStockWarning
                        original={original}
                        type={globalStore.otherInfo.inStockPriceWarning}
                      />
                    </Flex>
                  )
                },
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('??????'),
                id: 'different_price',
                accessor: (d) =>
                  d.different_price === undefined
                    ? '-'
                    : Big(d.different_price || 0).toFixed(2) + Price.getUnit(),
                minWidth: 80,
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('???????????????????????????'),
                accessor: 'purchase_unit_quantity',
                show: false,
                isKeyboard: true,
                minWidth: 140,
                Cell: ({ original, index }) => {
                  const { purchase_unit_quantity, purchase_unit } = original
                  const disable = isInShare(share, original.id)

                  return disable ? (
                    `${purchase_unit_quantity}${purchase_unit}`
                  ) : (
                    <Flex alignCenter>
                      <KCInputNumberV2
                        growing-track={isYiKeXian}
                        id={index}
                        value={purchase_unit_quantity}
                        onChange={this.handlePurchaseUnitQuantityChange.bind(
                          this,
                          index
                        )}
                        precision={4}
                        min={0}
                        className='form-control input-sm'
                        style={{ width: referOfWidth.numberInputBox }}
                      />
                      <span className='gm-padding-5'>
                        {purchase_unit || '-'}
                      </span>
                    </Flex>
                  )
                },
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('??????????????????????????????'),
                accessor: 'purchase_unit_price',
                show: false,
                minWidth: 150,
                isKeyboard: true,
                Cell: ({ original, index }) => {
                  const { purchase_unit_price, purchase_unit } = original
                  const disable = isInShare(share, original.id)

                  return disable ? (
                    `${purchase_unit_price}${purchase_unit}`
                  ) : (
                    <Flex alignCenter>
                      <KCInputNumberV2
                        growing-track={isYiKeXian}
                        value={purchase_unit_price}
                        onChange={this.handlePurchaseUnitPriceChange.bind(
                          this,
                          index
                        )}
                        min={0}
                        className='form-control input-sm'
                        style={{ width: referOfWidth.numberInputBox }}
                      />
                      <span className='gm-padding-5'>
                        {Price.getUnit() + '/'}
                        {purchase_unit || '-'}
                      </span>
                    </Flex>
                  )
                },
              },
              {
                diyGroupName: i18next.t('??????'),
                Header: i18next.t('????????????'),
                accessor: 'money',
                diyEnable: false,
                isKeyboard: true,
                minWidth: 140,
                Cell: ({ original, original: { money }, index }) => {
                  const disable = isInShare(share, original.id)

                  return disable ? (
                    money + Price.getUnit()
                  ) : (
                    <Flex alignCenter>
                      <KCInputNumberV2
                        growing-track={isYiKeXian}
                        value={money}
                        id={index}
                        onChange={this.handleMoneyChange.bind(this, index)}
                        min={0}
                        className='form-control input-sm'
                        style={{ width: referOfWidth.numberInputBox }}
                      />
                      <span className='gm-padding-5'>{Price.getUnit()}</span>
                    </Flex>
                  )
                },
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('????????????'),
                accessor: 'production_time',
                show: stock_method === 2,
                diyEnable: stock_method === 2,
                isKeyboard: true,
                minWidth: 160,
                Cell: ({ original, original: { production_time }, index }) => {
                  const disable = isInShare(share, original.id)

                  return disable ? (
                    production_time
                  ) : (
                    <KCDatePicker
                      style={{ width: '130px' }}
                      placeholder={i18next.t('?????????????????????')}
                      date={production_time ? moment(production_time) : null}
                      onChange={this.handleChangeProductionTime.bind(
                        this,
                        index
                      )}
                      canClear
                    />
                  )
                },
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('?????????'),
                accessor: 'life_time',
                show: stock_method === 2,
                diyEnable: stock_method === 2,
                isKeyboard: true,
                minWidth: 160,
                Cell: ({ original, original: { life_time }, index }) => {
                  const disable = isInShare(share, original.id)

                  return disable ? (
                    life_time
                  ) : (
                    <KCDatePicker
                      placeholder={i18next.t('??????????????????')}
                      date={life_time ? moment(life_time) : null}
                      onChange={this.handleChangeLifeTime.bind(this, index)}
                      canClear
                      style={{ width: '130px' }}
                    />
                  )
                },
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('????????????'),
                accessor: 'shelf_name',
                minWidth: 200,
                diyEnable: can_get_shelf,
                show: can_get_shelf,
                isKeyboard: true,
                Cell: ({
                  original: { id, shelf_name, shelfSelectedValue },
                  index,
                }) => {
                  const disable = isInShare(share, id)

                  return disable ? (
                    shelf_name
                  ) : (
                    <KCLevelSelect
                      onSelect={this.handleSelectStockGoodsShelf.bind(
                        this,
                        index
                      )}
                      selected={shelfSelectedValue || []}
                      data={shelfListDetails}
                      style={{ width: referOfWidth.levelSelectBox }}
                    />
                  )
                },
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('?????????'),
                id: 'operator',
                accessor: () => creator || '-',
                minWidth: 90,
              },
              {
                diyGroupName: i18next.t('????????????'),
                show: true,
                Header: i18next.t('????????????'),
                minWidth: 80,
                headerStyle: { textAlign: 'center' },
                accessor: 'is_arrival',
                Cell: ({ original, original: { is_arrival }, index }) => {
                  // 1 ?????????????????? 0 ?????????
                  const enable = !isInShare(share, original.id)
                  return (
                    <Flex
                      alignCenter
                      justifyCenter
                      className={styles.arrivalMark}
                    >
                      {is_arrival ? (
                        <SvgArrivalSubmit
                          style={{ color: '#56a3f2', fontSize: '16px' }}
                        />
                      ) : (
                        <SvgArrivalCancel
                          style={{ color: '#bbbbbb', fontSize: '16px' }}
                        />
                      )}
                      {enable && (
                        <a
                          onClick={(e) =>
                            this.handleIsArrivalChange(e, index, +!is_arrival)
                          }
                          className={styles.arrivalMarkText}
                        >
                          {is_arrival ? '????????????' : '????????????'}
                        </a>
                      )}
                    </Flex>
                  )
                },
              },
              {
                diyGroupName: i18next.t('????????????'),
                Header: i18next.t('????????????'),
                show: false,
                accessor: 'remark',
                minWidth: 150,
                isKeyboard: true,
                Cell: ({ original, original: { remark = '' }, index }) => {
                  const disable = isInShare(share, original.id)

                  return disable ? (
                    remark
                  ) : (
                    <KCInput
                      growing-track={isYiKeXian}
                      style={{ width: '100px' }}
                      maxLength={15}
                      type='text'
                      value={remark || ''}
                      className='form-control input-sm'
                      onChange={this.handelRemarkChange.bind(this, index)}
                    />
                  )
                },
              },
            ]}
          />
          <Flex
            alignContentStretch
            className='gm-padding-5 gm-border gm-border-top-0'
          >
            <Flex alignCenter className='gm-margin-right-10'>
              ??????
            </Flex>
            <Flex flex={1}>
              <input
                type='text'
                value={remark || ''}
                className='form-control input-md'
                maxLength={100}
                onChange={this.handleOrderRemarkChange.bind(this)}
              />
            </Flex>
          </Flex>
        </QuickPanel>
        <SharePanle
          editable
          onAdd={this.handleShareAdd}
          onDel={this.handleShareDel}
          {...this.props}
        />
        <DiscountPanel
          list={discount}
          reasonMap={PRODUCT_REASON_TYPE}
          actionMap={PRODUCT_ACTION_TYPE}
          editable
          onAdd={this.handleDiscountAdd}
          onDel={this.handleDiscountDel}
        />

        <div
          ref={this.scanRef}
          className='b-overview gm-border gm-padding-5'
          onClick={this.handlePopupScan}
        >
          {i18next.t('??????')}
        </div>
        {!!weigh_stock_in && isInstalled && <DragWeight />}
      </div>
    )
  }
}

InStockAdd.propTypes = {
  product: PropTypes.object,
}

export default connect((state) => ({
  product: state.product,
}))(InStockAdd)
