import { i18next } from 'gm-i18n'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import Big from 'big.js'
import classNames from 'classnames'
import { SvgRecognizeAll, SvgPriceRule } from 'gm-svg'
import _ from 'lodash'
import {
  InputNumber,
  InputNumberV2,
  Popover,
  RightSideModal,
  Price,
  Drawer,
  ToolTip,
  Storage,
  Button,
} from '@gmfe/react'

import { QuickPanel } from '@gmfe/react-deprecated'
import { TableUtil, diyTableHOC } from '@gmfe/table'
import TinyPrice from '../../common/components/tiny_price'
import FloatTip from '../../common/components/float_tip'
import getLazyDndTable from '../../common/components/lazy_dnd_table'
import {
  RefPriceTypeSelect,
  refPriceTypeHOC,
} from '../../common/components/ref_price_type_hoc'
import {
  isLK,
  isQuantityInvalid,
  getAllSkuTotalPrice,
  getDynamicFreight,
  isAbnormalFun,
  squeshQoutePriceList,
  getQuantityWithUnit,
} from '../util'
import { copywriterByTaxRate } from '../../common/service'
import RemarkInput from '../components/remark_input'
import TextTip from '../../common/components/text_tip'
import { OverCreditLimitTip } from './fragments'
import ModifyTip from '../../common/components/modify/modify_tip'
import { saleReferencePrice } from '../../common/enum'
import ReferencePriceDetail from '../../common/components/reference_price_detail'
import SpuDropSelect from './spu_drop_select'
import TempImportDialogOld from './temp_import_old'
import CommonSkuList from './common_sku_list'
import OrderCopyModal from './order_copy_old'
import { pinyin, is } from '@gm-common/tool'
import OrderDetailStore from './detail_store_old'
import globalStore from '../../stores/global'
import { isLockPriceSku } from '../../common/filter'
import ListProductImg from '../components/list_product_img'

import SkuRecognition from '../sku_recognition/index.old'

// 若修改了列表相关字段，记得修改这里，因为localStorage会缓存!!!
const FILTER_STORAGE = '_sku_detail_filterBoxOld_V1.2'

const DiyDndTableOld = getLazyDndTable((loaded) => {
  loaded.default = diyTableHOC(loaded.default)
  return loaded
})

const isOrderDistributing = (order) => {
  return order.status === 15 || order.status === 10
}

function getFirstPinYinCharCode(str) {
  return pinyin(str, 'first_letter')[0].charCodeAt(0)
}

@refPriceTypeHOC(3)
class OrderDetailListOld extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      inRankSaving: false,
    }
  }

  componentWillUnmount() {
    OrderDetailStore.clear('searchSkus')
  }

  handleSheetColumnChange(index, key, value) {
    if (this.props.batch) {
      OrderDetailStore.skuUpdateBatch(
        index,
        { key, value },
        this.props.batchOrderIndex,
      )
      return
    }
    OrderDetailStore.skuUpdate(index, { key, value })
  }

  // 出库数修改
  handleOutputChange(index, value) {
    OrderDetailStore.skuUpdate(index, { key: 'std_real_quantity', value })
  }

  handleSheetRemarkChange(index, e) {
    e.preventDefault()
    this.handleSheetColumnChange(index, 'spu_remark', e.target.value)
  }

  // 备注按Tab失去焦点，输入框获得焦点
  handleSheetRemarkKeyDown = (e) => {
    if (e.keyCode === 9 || e.keyCode === 13) {
      this.searchInput.select()
      e.preventDefault()
    }
  }

  handleQuantityInputFocus(index, e) {
    if (e.keyCode === 13) {
      this.searchInput.select()
      e.preventDefault()
    } else if (e.keyCode === 40) {
      const targetRef = this[`std_real_quantity_${index + 1}`]
      targetRef && ReactDOM.findDOMNode(targetRef).select()
    } else if (e.keyCode === 38) {
      const targetRef = this[`std_real_quantity_${index - 1}`]
      targetRef && ReactDOM.findDOMNode(targetRef).select()
    }
  }

  handleSearchInputFocus = (e) => {
    if (e.keyCode === 13) {
      this.searchInput.select()
      e.preventDefault()
    }
  }

  handleTimingDisabled(index) {
    OrderDetailStore.listChangeTiming(index, false)
  }

  handleUploadShow = () => {
    OrderDetailStore.importChange({ importShow: true })
  }

  handleDropDownCallBack = (id) => {
    this.forceUpdate(() => {
      const quantity = ReactDOM.findDOMNode(this[`refQuantity${id}`])
      if (quantity) {
        quantity.scrollIntoViewIfNeeded()
        quantity.select()
      }
    })
  }

  handleDel(i, batchOrderIndex) {
    this.props.batch
      ? OrderDetailStore.skuDelBatch(i, batchOrderIndex)
      : OrderDetailStore.skuDel(i)
  }

  handleCommonlistShow = () => {
    RightSideModal.render({
      children: <CommonSkuList />,
      onHide: RightSideModal.hide,
      style: { width: '900px', overflowY: 'scroll' },
    })
  }

  handleCopyOrder = () => {
    Drawer.render({
      children: <OrderCopyModal />,
      onHide: Drawer.hide,
      opacityMask: false,
      style: {
        width: '630px',
      },
    })
  }

  handleOrderRecognize = (textRecognition) => {
    const { time_config_info, customer } = this.props.order
    RightSideModal.render({
      children: (
        <SkuRecognition
          serviceTime={time_config_info}
          customer={customer}
          canRecognizeText={textRecognition}
        />
      ),
      onHide: RightSideModal.hide,
      noCloseBtn: true,
      style: { width: '900px' },
    })
  }

  handleToggleSequence = () => {
    const { isRanking, details } = this.props.order

    if (isRanking) {
      // 保存顺序
      this.setState({ isRankSaving: true })

      OrderDetailStore.update()
        .then(() => {
          this.setState({ isRankSaving: false })
          OrderDetailStore.receiveChange({
            isRanking: false,
            category_sort_type: null,
            detailsBeforeRank: null,
          })
        })
        .catch(() => this.setState({ isRankSaving: false }))
    } else {
      // 修改顺序
      OrderDetailStore.processDetail(isOrderDistributing(this.props.order))
      OrderDetailStore.receiveChange({
        isRanking: true,
        detailsBeforeRank: details,
      })
    }
  }

  handleDragEnd = (e) => {
    const sIndex = e.source.index
    const dIndex = e.destination.index

    if (sIndex === dIndex) return

    OrderDetailStore.receiveChange({ category_sort_type: null })
    OrderDetailStore.skuMove(e.source.index, e.destination.index)
  }

  handleCategorySort = () => {
    let { details, category_sort_type } = this.props.order
    details = details.slice()
    if (!category_sort_type || category_sort_type === 'desc') {
      category_sort_type = 'asc'
    } else {
      category_sort_type = 'desc'
    }

    details.sort((a, b) => {
      const asc =
        getFirstPinYinCharCode(a.category_title_2) -
        getFirstPinYinCharCode(b.category_title_2)
      return category_sort_type === 'asc' ? asc : -asc
    })

    OrderDetailStore.receiveChange({ category_sort_type, details })
  }

  quantityCell = ({ value: quantity, index }) => {
    const { order } = this.props
    const { viewType, details: skus } = order

    const isLKOrder = isLK(order._id)

    const sku = skus[index]

    if (sku.code) {
      return null
    }

    // 是否异常
    const isAbnormal = isAbnormalFun(sku)

    if (viewType !== 'view') {
      const isSkuQuantityInvalid = isQuantityInvalid(
        quantity,
        sku.sale_num_least,
      )
      if (isLKOrder) {
        return parseFloat(Big(quantity || 0).toFixed(2)) + sku.sale_unit_name
      } else {
        return (
          <div>
            <InputNumber
              disabled={isAbnormal}
              ref={(ref) => {
                this[`refQuantity${sku.id}`] = ref
              }}
              value={sku.quantity}
              onChange={this.handleSheetColumnChange.bind(
                this,
                index,
                'quantity',
              )}
              onKeyDown={this.handleSearchInputFocus}
              className={classNames(
                'form-control input-sm b-order-quantity-input',
                {
                  'b-bg-warning': isSkuQuantityInvalid,
                },
              )}
              title={
                isSkuQuantityInvalid
                  ? i18next.t(
                      /* src:`下单数须大于0，最多两位小数，且不小于最小下单数${sku.sale_num_least}` => tpl:下单数须大于0，最多两位小数，且不小于最小下单数${VAR1} */ 'KEY104',
                      { VAR1: sku.sale_num_least },
                    )
                  : ''
              }
              placeholder={i18next.t('下单数')}
            />
            <span className='gm-padding-left-5'>{sku.sale_unit_name}</span>
          </div>
        )
      }
    }
    return parseFloat(Big(quantity || 0).toFixed(2)) + sku.sale_unit_name
  }

  salePriceCell = ({ value: sale_price, index }) => {
    const { order, isPriceEditable } = this.props
    const { viewType, details: skus } = order

    const isLKOrder = isLK(order._id)

    const sku = skus[index]
    const totalItemPrice = sku.total_item_price || 0
    // 是否异常
    const isAbnormal = isAbnormalFun(sku)

    let renderValue = null

    if (sale_price !== null) {
      renderValue = sale_price === '' ? null : sale_price * 1.0
    }
    if (sku.code) {
      return null
    }

    if (!isPriceEditable) {
      return `${renderValue}${Price.getUnit(sku.fee_type) + '/'}${
        sku.sale_unit_name
      }`
    }

    if (viewType !== 'view') {
      const isTiming = sku.is_price_timing
      if (isLKOrder) {
        if (sku.is_price_timing && !totalItemPrice) {
          return i18next.t('时价')
        } else {
          return `${renderValue}${Price.getUnit(sku.fee_type) + '/'}${
            sku.sale_unit_name
          }`
        }
      } else {
        if (isTiming) {
          return (
            <div
              className='gm-inline-block'
              style={{ cursor: 'pointer' }}
              onClick={this.handleTimingDisabled.bind(this, index)}
            >
              <span className=' gm-margin-right-5'>{i18next.t('时价')}</span>
              <i className='glyphicon glyphicon-pencil text-primary' />
            </div>
          )
        } else {
          return (
            <div>
              <InputNumberV2
                value={renderValue}
                disabled={isAbnormal}
                onChange={this.handleSheetColumnChange.bind(
                  this,
                  index,
                  'sale_price',
                )}
                onKeyDown={this.handleSearchInputFocus}
                className='form-control input-sm b-order-price-input'
                placeholder={i18next.t('单价')}
                max={999999}
                min={0}
              />
              <span className='gm-padding-left-5'>
                {Price.getUnit(sku.fee_type) + '/'}
                {sku.sale_unit_name}
              </span>
            </div>
          )
        }
      }
    } else {
      // 时价
      if (sku.is_price_timing && !totalItemPrice) {
        return i18next.t('时价')
      } else {
        return `${renderValue}${Price.getUnit(sku.fee_type) + '/'}${
          sku.sale_unit_name
        }`
      }
    }
  }

  remarkCell = ({ value: spu_remark, index }) => {
    const { order } = this.props
    const { viewType, details: skus } = order

    const isLKOrder = isLK(order._id)

    if (viewType !== 'view') {
      const sku = skus[index]

      if (sku.code) {
        return null
      }

      const isRemarkInvalid = spu_remark?.length > 100

      if (isLKOrder) {
        return spu_remark || '-'
      } else {
        return (
          <RemarkInput
            spu_remark={skus[index]._spu_remark}
            onSelect={this.handleSheetColumnChange.bind(
              this,
              index,
              'spu_remark',
            )}
          >
            <input
              onChange={this.handleSheetRemarkChange.bind(this, index)}
              value={spu_remark}
              style={{ width: '100%', minWidth: '60px' }}
              className={classNames(
                'form-control input-sm b-order-price-input',
                {
                  'b-bg-warning': isRemarkInvalid,
                },
              )}
              placeholder={i18next.t('备注')}
              title={isRemarkInvalid ? i18next.t('备注的长度不要超过100') : ''}
              onKeyDown={this.handleSheetRemarkKeyDown}
            />
          </RemarkInput>
        )
      }
    }
    return spu_remark || '-'
  }

  handleToggle = () => {
    Storage.set('ORDER_DETAIL_VERSION', 'new')
    window.location.reload()
  }

  render() {
    const {
      order,
      searchSkus,
      batch,
      batchOrderIndex,
      isQuantityEditable,
      modify,
      orderImport,
      cleanFoodStation,
      postRefPriceType,
      refPriceType,
    } = this.props
    const {
      viewType,
      repair,
      customer,
      details: skus,
      freight,
      freightFromDatabase,
      category_sort_type,
      isRanking,
      fee_type,
    } = order

    const isLKOrder = isLK(order._id)

    // 是否是详情页
    const isIdDetail = this.props.query && this.props.query.id
    const textRecognition = globalStore.hasPermission(
      'edit_order_by_recognize_text',
    )
    let referencePriceFlag = ''
    const sequshList = squeshQoutePriceList(skus).map((item) => ({
      ...item,
      sale_price: Big(item.sale_price || 0).toFixed(2),
    }))
    const isOldOrderEditable = globalStore.hasPermission(
      'edit_old_order_change',
    )
    const isEditOrder = globalStore.hasPermission('edit_order')

    const canEditSequence =
      viewType === 'view' &&
      ((isOldOrderEditable && isOrderDistributing(this.props.order)) ||
        (isEditOrder && !isOrderDistributing(this.props.order)))

    _.find(saleReferencePrice, (item) => {
      if (item.type === refPriceType) {
        referencePriceFlag = item.flag

        return true
      }
    })

    const actionDom = (
      <div>
        {viewType === 'view' && (
          <div className='gm-margin-left-10'>
            {canEditSequence &&
              (isRanking ? (
                <Button
                  type='primary'
                  plain
                  loading={this.state.isRankSaving}
                  onClick={this.handleToggleSequence}
                >
                  {i18next.t('保存顺序')}
                </Button>
              ) : (
                <Button
                  type='primary'
                  plain
                  onClick={this.handleToggleSequence}
                >
                  {i18next.t('修改顺序')}
                </Button>
              ))}
            <div className='gm-gap-5' />
            <Button type='primary' plain onClick={this.handleCommonlistShow}>
              {i18next.t('常用商品')}&nbsp;&nbsp;
              <i className='xfont xfont-star' />
            </Button>
          </div>
        )}
        {viewType !== 'view' && (
          <div className='gm-inline'>
            <Button
              type='primary'
              plain
              onClick={this.handleToggle}
              className='gm-margin-left-10'
            >
              {i18next.t('切回新版本')}
            </Button>
          </div>
        )}
        {textRecognition && (viewType === 'create' || viewType === 'edit') && (
          <div className='gm-inline'>
            <Button
              type='primary'
              plain
              onClick={this.handleOrderRecognize.bind(this, textRecognition)}
              className='gm-margin-left-10'
            >
              {i18next.t('智能识别')}&nbsp;&nbsp;
              <SvgRecognizeAll className='gm-text-14' />
            </Button>
          </div>
        )}
        {viewType === 'create' && (
          <div className='gm-inline'>
            <Button
              type='primary'
              plain
              onClick={this.handleCopyOrder}
              className='gm-margin-left-10'
            >
              {i18next.t('复制订单')}&nbsp;&nbsp;
              <i className='xfont xfont-copy' />
            </Button>
          </div>
        )}
        {
          // PL但才有导入导出
          !batch && !isLKOrder && viewType !== 'view' && (
            <div className='gm-inline'>
              <Button
                type='primary'
                plain
                onClick={this.handleCommonlistShow}
                className='gm-margin-left-10'
              >
                {i18next.t('常用商品')}&nbsp;&nbsp;
                <i className='xfont xfont-star' />
              </Button>
              {!repair && (
                <Button
                  type='primary'
                  plain
                  onClick={this.handleUploadShow}
                  className='gm-margin-left-10'
                >
                  {i18next.t('模板导入')}&nbsp;&nbsp;
                  <i className='ifont ifont-upload' />
                </Button>
              )}
            </div>
          )
        }
      </div>
    )

    // 下单金额,出库金额
    const allSkuTotalPrice = getAllSkuTotalPrice(skus, 1)
    const realSkuTotalPrice = getAllSkuTotalPrice(skus, 0)
    // 运费
    const dynamicFreight = getDynamicFreight(freight, allSkuTotalPrice)
    const total = Big(allSkuTotalPrice).add(dynamicFreight).toFixed(2)
    const freightCom = (feeType) => {
      if (viewType === 'view') {
        return freightFromDatabase ? (
          <span>
            {i18next.t('（含运费:')}
            <TinyPrice value={freightFromDatabase} feeType={feeType} /> ）
          </span>
        ) : (
          <span>{i18next.t('（免运费）')}</span>
        )
      } else {
        // 编辑的时候显示动态计算的运费
        return dynamicFreight ? (
          <span>
            {i18next.t('（含运费:') + Price.getCurrency(feeType)}
            {dynamicFreight.toFixed(2)}）
          </span>
        ) : (
          <span>{i18next.t('（免运费）')}</span>
        )
      }
    }

    let totalPrice = 0
    let realPrice = 0
    let totalPay = 0
    if (viewType === 'view') {
      totalPrice = Big(order.total_price).toFixed(2)
      realPrice = Big(order.real_price).toFixed(2)
      totalPay = Big(order.total_pay).toFixed(2)
    } else {
      // 编辑状态,加上异常与退货
      const abnormal = Big(order.abnormal_money || 0).div(100)
      const refund = Big(order.refund_money || 0).div(100)
      const coupon = Big(order.coupon_amount || 0).div(100)
      totalPay = Big(realSkuTotalPrice)
        .add(dynamicFreight)
        .add(abnormal)
        .add(refund)
        .minus(coupon)
        .times(100)
        .toFixed(2)
      totalPrice = Big(allSkuTotalPrice).times(100).toFixed(2)
      realPrice = Big(realSkuTotalPrice).times(100).toFixed(2)
    }

    const orderListTitle = () => {
      if (!isIdDetail) {
        return (
          <span>
            {i18next.t('商品统计')}：
            {i18next.t('共多少种商品', { skuNum: skus.length })}，
            {i18next.t('合计')} {Price.getCurrency(fee_type)}
            {total}
            {freightCom(fee_type)}
          </span>
        )
      } else {
        const couponDiscount = Big(order.coupon_amount || 0).toFixed(2)
        return (
          <span>
            {i18next.t('商品列表')}：
            {i18next.t('共多少种商品', { skuNum: skus.length })}（
            {i18next.t('下单金额')}：{' '}
            <TinyPrice value={totalPrice} feeType={fee_type} />，
            {couponDiscount !== '0.00' && (
              <span>
                {i18next.t('优惠金额')}：-
                <TinyPrice value={couponDiscount} feeType={fee_type} />，
              </span>
            )}
            {i18next.t('出库金额')}：{' '}
            <TinyPrice value={realPrice} feeType={fee_type} />，
            {i18next.t('销售额')}：
            <TinyPrice value={totalPay} feeType={fee_type} />
            {freightCom(fee_type)}）
          </span>
        )
      }
    }

    return (
      <div>
        {totalPay < 0 ? (
          <div className='gm-padding-10 b-warning-tips'>
            <i className='ifont xfont-warning-circle' />
            {i18next.t(
              '当前销售额已小于0，保存订单后优惠券将被返还至用户账户，订单按原价计算',
            )}
          </div>
        ) : (
          <div className='gm-gap-15' />
        )}

        <QuickPanel
          icon='bill'
          title={
            <span>
              {orderListTitle()}
              {repair ? (
                <Popover
                  type='hover'
                  left
                  top
                  showArrow
                  arrowBorderColor='#5a5a5a'
                  arrowBgColor='#5a5a5a'
                  popup={
                    <div
                      style={{
                        width: '118px',
                        color: '#fff',
                        background: '#5a5a5a',
                        padding: '2px',
                      }}
                    >
                      {i18next.t('该订单为补录订单')}
                    </div>
                  }
                >
                  <i
                    className='ifont ifont-bu gm-margin-left-10'
                    style={{ color: '#CE3D2E', fontSize: '30px' }}
                  />
                </Popover>
              ) : null}
              <OverCreditLimitTip total={total} customer={customer} />
            </span>
          }
          right={actionDom}
        >
          {viewType !== 'view' && !isLKOrder ? (
            <SpuDropSelect
              order={order}
              searchSkus={searchSkus}
              batch={batch}
              batchOrderIndex={batchOrderIndex}
              showOuterId={this.props.showOuterId}
              onDropDown={this.handleDropDownCallBack}
              ref={(ref) => {
                this.searchInput = ref
              }}
            />
          ) : null}
          <DiyDndTableOld
            key={viewType}
            id={FILTER_STORAGE}
            className='b-order-sheet-table-fix'
            noDataText={i18next.t('请添加商品')}
            diyGroupSorting={[i18next.t('基础字段')]}
            rowKey='id'
            dndDisabled={!canEditSequence || !isRanking}
            onDragEnd={this.handleDragEnd}
            getTrProps={(state, rowInfo) => {
              if (rowInfo && rowInfo.index >= 0) {
                const sku = skus[rowInfo.index]
                return {
                  className: classNames({
                    'b-bg-warning': !!sku.code,
                  }),
                }
              } else {
                return {}
              }
            }}
            data={sequshList}
            columns={[
              {
                Header: <div className='text-center'>{i18next.t('序号')}</div>,
                diyItemText: i18next.t('序号'),
                accessor: 'sequence',
                minWidth: 50,
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ index }) => (
                  <div className='text-center'>{index + 1}</div>
                ),
              },
              {
                Header: i18next.t('商品图'),
                accessor: 'imgs',
                minWidth: 80,
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ value }) => <ListProductImg src={value} />,
              },
              {
                Header: i18next.t('商品ID'),
                accessor: 'id',
                minWidth: 80,
                diyEnable: false,
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ value, index }) => (
                  <FloatTip
                    skuId={value}
                    tip={skus[index].outer_id}
                    showCustomer={this.props.showOuterId}
                  />
                ),
              },
              {
                Header: i18next.t('商品名'),
                accessor: 'name',
                minWidth: 80,
                diyEnable: false,
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ value, index }) => {
                  const sku = skus[index]
                  return (
                    <span>
                      {value}
                      {sku.code ? (
                        <span className='gm-text-red'>({sku.msg})</span>
                      ) : null}
                      {isAbnormalFun(sku) ? (
                        <TextTip
                          content={
                            <div className='gm-inline-block gm-bg'>
                              {i18next.t('当前商品存在售后异常，无法进行修改')}
                            </div>
                          }
                          style={{
                            marginLeft: '-2px',
                            marginTop: '2px',
                            fontSize: '12px',
                          }}
                        >
                          <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
                        </TextTip>
                      ) : null}
                      {isLockPriceSku(sku.price_origin) && (
                        <TextTip
                          content={
                            <div className='gm-inline-block gm-bg'>
                              {i18next.t('order_price_rule', {
                                price: `${sku.lock_price}${
                                  Price.getUnit(sku.fee_type) + '/'
                                }${sku.sale_unit_name}`,
                              })}
                            </div>
                          }
                        >
                          <span>
                            <SvgPriceRule />
                          </span>
                        </TextTip>
                      )}
                    </span>
                  )
                },
              },
              {
                Header: i18next.t('规格'),
                accessor: 'std_unit_name_forsale',
                minWidth: 50,
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ value, index }) => {
                  const sku = skus[index]
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
                },
              },

              !is.phone() && {
                Header:
                  canEditSequence && isRanking ? (
                    <TableUtil.SortHeader
                      onClick={this.handleCategorySort}
                      type={category_sort_type}
                    >
                      {i18next.t('分类')}
                    </TableUtil.SortHeader>
                  ) : (
                    i18next.t('分类')
                  ),
                diyItemText: i18next.t('分类'),
                minWidth: 50,
                diyGroupName: i18next.t('基础字段'),
                accessor: 'category_title_2',
              },

              !is.phone() && {
                Header: i18next.t('报价单简称（对外）'),
                diyGroupName: i18next.t('基础字段'),
                minWidth: 80,
                accessor: 'supplier_name',
              },
              {
                Header: i18next.t('下单数'),
                accessor: 'quantity',
                minWidth: 100,
                diyEnable: false,
                diyGroupName: i18next.t('基础字段'),
                Cell: this.quantityCell,
              },
              {
                Header: copywriterByTaxRate(
                  i18next.t('单价（销售单位）'),
                  i18next.t('含税单价（销售单位）'),
                ),
                accessor: 'sale_price',
                minWidth: 120,
                diyEnable: false,
                diyGroupName: i18next.t('基础字段'),
                Cell: this.salePriceCell,
              },
              {
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
                diyGroupName: i18next.t('基础字段'),
                accessor: (d) => d[referencePriceFlag],
                Cell: ({ value: reference_price, index: i, original }) => {
                  if (sequshList[i].code === 1) {
                    return <span> - </span>
                  } else {
                    return (
                      <ReferencePriceDetail
                        sequshList={sequshList}
                        reference_price={reference_price}
                        currentIndex={i}
                        referencePriceFlag={referencePriceFlag}
                        feeType={original.fee_type}
                      />
                    )
                  }
                },
              },

              viewType === 'view' && {
                Header: copywriterByTaxRate(
                  i18next.t('单价（基本单位）'),
                  i18next.t('含税单价（基本单位）'),
                ),
                accessor: 'std_sale_price_forsale',
                minWidth: 100,
                show: false,
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ value, index }) => {
                  const sku = skus[index]
                  const isTiming = sku.is_price_timing
                  const totalItemPrice = sku.total_item_price || 0
                  if (isTiming && !totalItemPrice) {
                    return i18next.t('时价')
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
                Header: i18next.t('下单金额'),
                minWidth: 80,
                accessor: 'price',
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ index }) => {
                  const sku = skus[index]
                  const quantity = sku.quantity
                  const totalItemPrice = sku.total_item_price || 0
                  if (sku.code) {
                    return null
                  }
                  if (viewType === 'view') {
                    return (
                      Big(totalItemPrice).div(100).toFixed(2) +
                      Price.getUnit(sku.fee_type)
                    )
                  } else {
                    return quantity
                      ? Big(quantity)
                          .times(sku.sale_price || 0)
                          .toFixed(2) + Price.getUnit(sku.fee_type)
                      : '0.00' + Price.getUnit(sku.fee_type)
                  }
                },
              },
              {
                Header: (
                  <div>
                    <span className='gm-margin-right-5'>
                      {i18next.t('最近销售单价')}
                      <br />
                      {i18next.t(' (基本单位)')}
                    </span>
                    <ToolTip
                      popup={
                        <div
                          className='gm-padding-5'
                          style={{ width: '150px' }}
                        >
                          {i18next.t(
                            '表明此客户当前商品最近一个月内的最近销售单价，如果当前已经是最新下单，则取此客户前一次下单此商品的销售单价',
                          )}
                        </div>
                      }
                    />
                  </div>
                ),
                diyItemText: i18next.t('最近销售单价(基本单位)'),
                minWidth: 120,
                diyGroupName: i18next.t('基础字段'),
                accessor: 'latest_std_sale_price_forsale',
                Cell: ({ value, index }) => {
                  const sku = skus[index]
                  const unit_price = sku.latest_std_sale_price_forsale
                  // todo check
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

              viewType === 'view' &&
                globalStore.hasViewTaxRate() && {
                  Header: i18next.t('税率'),
                  minWidth: 60,
                  accessor: 'tax_rate',
                  diyGroupName: i18next.t('基础字段'),
                  diyEnable: globalStore.hasViewTaxRate(),
                  Cell: ({ value: tax_rate }) => {
                    return (
                      Big(tax_rate || 0)
                        .div(100)
                        .toFixed(2) + '%'
                    )
                  },
                },

              viewType === 'view' &&
                globalStore.hasViewTaxRate() && {
                  Header: i18next.t('税额'),
                  minWidth: 60,
                  accessor: 'tax',
                  diyGroupName: i18next.t('基础字段'),
                  diyEnable: globalStore.hasViewTaxRate(),
                  Cell: ({ value: tax, index }) => {
                    const sku = skus[index]
                    const isTiming = sku.is_price_timing

                    if (isTiming || !sku.std_sale_price_forsale) {
                      return '-'
                    } else {
                      return tax
                    }
                  },
                },

              !batch && {
                Header: i18next.t('出库数（基本单位）'),
                minWidth: 120,
                accessor: 'std_real_quantity',
                show: false,
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ value: v, index }) => {
                  const sku = skus[index]
                  const unit = sku.std_unit_name_forsale
                  const value = sku.std_real_quantity
                  const valueBackup = sku.std_real_quantity_backup
                  // 是否缺货
                  const outOfStock = sku.out_of_stock
                  // 是否异常
                  const isAbnormal = isAbnormalFun(sku)
                  // 是否是记重任务
                  // is_weight是搜索商品时的是否称重商品，带t，详情的is_weight是不带t
                  const isWeigh =
                    sku.is_weigh === undefined ? sku.is_weight : sku.is_weigh
                  // 是否已称重
                  const weighted = sku.weighted
                  const isPrint = sku.is_print
                  // 当【未称重】时，显示为空
                  if (
                    !cleanFoodStation &&
                    isQuantityEditable &&
                    viewType !== 'view' &&
                    value !== undefined
                  ) {
                    return (
                      <div>
                        <InputNumber
                          ref={(ref) => {
                            this[`std_real_quantity_${index}`] = ref
                          }}
                          disabled={isAbnormal}
                          value={isAbnormal ? valueBackup : value}
                          onChange={this.handleOutputChange.bind(this, index)}
                          onKeyDown={this.handleQuantityInputFocus.bind(
                            this,
                            index,
                          )}
                          className={classNames(
                            'form-control input-sm b-order-quantity-input',
                          )}
                        />
                        <span className='gm-padding-5'>{unit}</span>
                        <ModifyTip
                          realIsWeight={isWeigh}
                          printed={isPrint}
                          isWeight={weighted}
                          outOfStock={outOfStock}
                        />
                      </div>
                    )
                  } else {
                    if (!outOfStock && value) {
                      return (
                        <div>
                          <span
                            className={classNames('gm-inline-block', {
                              'b-order-active-color': isWeigh && !!weighted,
                            })}
                          >
                            {value + unit}
                          </span>
                          <ModifyTip
                            realIsWeight={isWeigh}
                            printed={isPrint}
                            isWeight={weighted}
                            outOfStock={outOfStock}
                          />
                        </div>
                      )
                    } else if (outOfStock || value === '0') {
                      return (
                        <div>
                          <span className='gm-text-red gm-inline-block'>
                            {i18next.t('缺货')}
                          </span>
                          <ModifyTip
                            realIsWeight={isWeigh}
                            printed={isPrint}
                            isWeight={weighted}
                            outOfStock={outOfStock}
                            isSellout
                          />
                        </div>
                      )
                    } else {
                      return '-'
                    }
                  }
                },
              },

              !batch && {
                Header: i18next.t('出库数（销售单位）'),
                minWidth: 80,
                accessor: 'real_quantity',
                show: false,
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ value: v, index }) =>
                  v
                    ? parseFloat(Big(v).toFixed(2)) + skus[index].sale_unit_name
                    : '-',
              },

              viewType === 'view' &&
                isIdDetail && {
                  Header: i18next.t('异常数'),
                  minWidth: 60,
                  accessor: 'exc_quantity',
                  diyGroupName: i18next.t('基础字段'),
                  Cell: ({ value, original }) => {
                    return getQuantityWithUnit(value, original)
                  },
                },

              viewType === 'view' && {
                Header: i18next.t('应退数'),
                minWidth: 60,
                accessor: 'request_refund_quantity',
                diyGroupName: i18next.t('基础字段'),
                show: false,
                Cell: ({ value, original }) => {
                  return getQuantityWithUnit(value, original)
                },
              },

              viewType === 'view' && {
                Header: i18next.t('实退数'),
                minWidth: 60,
                accessor: 'real_refund_quantity',
                diyGroupName: i18next.t('基础字段'),
                show: false,
                Cell: ({ value, original }) => {
                  return getQuantityWithUnit(value, original)
                },
              },

              viewType === 'view' && {
                Header: copywriterByTaxRate(
                  i18next.t('销售额'),
                  i18next.t('销售额（含税）'),
                ),
                minWidth: 80,
                accessor: 'sale_money',
                show: false,
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ value: v, original }) =>
                  v
                    ? Big(v).div(100).toFixed(2) +
                      Price.getUnit(original.fee_type)
                    : '-',
              },
              {
                Header: i18next.t('备注'),
                minWidth: 80,
                accessor: 'spu_remark',
                diyGroupName: i18next.t('基础字段'),
                Cell: this.remarkCell,
              },
              {
                minWidth: 80,
                Header: TableUtil.OperationHeader,
                dragField: true,
                diyEnable: false,
                diyItemText: '操作',
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ value, index }) => (
                  <TableUtil.OperationCell>
                    {!isLKOrder && viewType !== 'view' ? (
                      <Button
                        type='danger'
                        onClick={this.handleDel.bind(
                          this,
                          index,
                          batchOrderIndex,
                        )}
                      >
                        <i className='glyphicon glyphicon-remove' />
                      </Button>
                    ) : canEditSequence && isRanking ? (
                      <i className='xfont xfont-sort' />
                    ) : (
                      '-'
                    )}
                  </TableUtil.OperationCell>
                ),
              },
            ].filter((_) => _)}
          />
          {!batch && !repair && !isLKOrder ? (
            <TempImportDialogOld
              show={orderImport.importShow}
              isImporting={orderImport.isImporting}
              modify={modify}
              order={order}
            />
          ) : null}
        </QuickPanel>
      </div>
    )
  }
}

OrderDetailListOld.propTypes = {
  order: PropTypes.object,
  searchSkus: PropTypes.object,
  isPriceEditable: PropTypes.bool, // 价格可编辑
  cleanFoodStation: PropTypes.bool, // 净菜站点
  showOuterId: PropTypes.bool, // 自定义编码
  batch: PropTypes.bool, // 是否批量
  batchOrderIndex: PropTypes.number, // 批量订单索引
  orderImport: PropTypes.object,
  refPriceType: PropTypes.number,
  postRefPriceType: PropTypes.func,
  query: PropTypes.object,
  isQuantityEditable: PropTypes.bool,
  modify: PropTypes.bool,
}

export default OrderDetailListOld
