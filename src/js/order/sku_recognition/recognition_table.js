import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  Price,
  InputNumber,
  Tip,
  RightSideModal,
  Popover,
  Button,
} from '@gmfe/react'
import { EditTable, TableUtil } from '@gmfe/table'
import { observer } from 'mobx-react'
import _ from 'lodash'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import Big from 'big.js'

import { getExpanded, getRecognitionLength } from './util'
import store from './store'
import orderStore from '../store'
import { getCombineGoodsClass } from '../util'
import globalStore from 'stores/global'

const hasOnOrderFun = (details, sku) => {
  if (sku.belongWith) return null
  return _.find(details, (v) => v.id === sku.id && !v.belongWith)
}

@observer
class RecognitionTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // 设定一个 table 初始值
      tableHeight: 500,
    }
  }

  resizeTableHeight = () => {
    const textHeight = this.props.getHeaderHeight()
    if (textHeight) {
      // tab切换头部 + 弹窗头部 + table标题为固定值，直接 -130
      this.setState({
        tableHeight: document.documentElement.clientHeight - textHeight - 130,
      })
    }
  }

  componentDidMount() {
    // 拿到输入文本实例，计算table可设置的高度
    this.resizeTableHeight()
    window.addEventListener('resize', this.resizeTableHeight)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeTableHeight)
  }

  handleToEdit = () => {
    store.toEdit()
  }

  handleChangeItemNum = (index, type, e) => {
    store.changeItemNum(index, type, this.props.type, e)
  }

  handleChangeItem = (index, subIndex) => {
    const { textRecognition, imgRecognition } = store
    const { type } = this.props
    const list =
      type === 'img'
        ? imgRecognition.vaild.slice()
        : textRecognition.vaild.slice()
    const currentSkuList = list[index].others.slice()
    const currentSku = currentSkuList[subIndex]

    let isAvailable = true
    _.forEach(list, (item) => {
      if (currentSku.id === item.id && !item.belongWith) {
        Tip.info(
          i18next.t('sku_recognition_tip', {
            VAR1: item.name,
            VAR2: item.id,
          }),
        )
        isAvailable = false
      }
    })
    isAvailable && store.changeItem(index, subIndex, type)
  }

  handleRemoveItem = (index) => {
    const { type } = this.props
    store.removeItem(index, type)
  }

  canAddSkuToOrder = (skus) => {
    // 多sku和组合商品互斥，判断是否可以添加
    const hasCombineGoods = _.find(skus, (sku) => sku.is_combine_goods)
    // 除去组合商品跟原料统计
    const _skus = _.filter(
      skus,
      (sku) => !sku.is_combine_goods || !sku.belongWith,
    )
    const _group = _.uniqBy(_skus, (sku) => sku.id)
    const hasSameSkusOnAdd = !(_group.length === _skus.length)

    // 当前添加商品同时存在多sku和组合商品
    if (hasCombineGoods && hasSameSkusOnAdd) {
      return i18next.t(
        '当前添加商品中存在重复商品和组合商品，暂不支持重复商品和组合商品同时添加',
      )
    }

    const { details } = orderStore.orderDetail
    const _details = _.filter(details, (sku) => sku.id !== null)
    const group = _.uniqBy(_details, (sku) => sku.id)
    const hasSameSkusInOrder = !(group.length === _details.length)

    // 已添加过多sku，当前添加商品中有组合商品
    if (hasSameSkusInOrder && hasCombineGoods) {
      return i18next.t(
        '当前添加商品中存在重复商品，暂不支持重复商品和组合商品同时添加',
      )
    }

    const hasCombineGoodsInOrder = _.find(
      details,
      (sku) => sku.is_combine_goods,
    )

    // 已添加过组合商品，当前添加商品中存在多sku
    if (hasCombineGoodsInOrder && hasSameSkusOnAdd) {
      return i18next.t(
        '当前添加商品中存在组合商品，暂不支持重复商品和组合商品同时添加',
      )
    }

    // 已添加的是普通商品，当前添加商品会导致多sku和组合商品
    const hasSameSku = _.intersectionBy(_skus, details, 'id').length !== 0
    if (hasSameSku && hasCombineGoods) {
      return i18next.t('暂不支持重复商品和组合商品同时添加')
    }

    return null
  }

  handleAddSkus = () => {
    const { textRecognition, imgRecognition } = store
    const { details } = orderStore.orderDetail
    const { type } = this.props
    const { orderCanHaveDuplicateSku } = globalStore.orderInfo
    const list =
      type === 'img'
        ? imgRecognition.vaild.slice()
        : textRecognition.vaild.slice()
    const skus = []
    let isAvailable = true
    _.forEach(list, (item) => {
      const target = item.belongWith
        ? _.find(list, (s) => s.id === item.belongWith)
        : item
      const hasOnOrder =
        hasOnOrderFun(details, target) && !orderCanHaveDuplicateSku
      if (!hasOnOrder) {
        if (item.quantity && item.sale_price) {
          skus.push({
            ...item,
            _spu_remark: item.spu_remark,
            spu_remark: '',
          })
        } else {
          Tip.info(
            i18next.t('sku_recognition_tip1', {
              VAR1: item.name,
              VAR2: item.id,
            }),
          )
          isAvailable = false
        }
      }
    })
    if (isAvailable && skus.length) {
      const msg = this.canAddSkuToOrder(skus)
      if (orderCanHaveDuplicateSku && msg) {
        Tip.info(msg)
        return
      }
      this.props.onAdd(skus)
      RightSideModal.hide()
      Tip.success(
        i18next.t('add_sku_to_order', {
          VAR1: getRecognitionLength(skus),
        }),
      )
    }
    if (!skus.length) {
      Tip.info(i18next.t('当前已没有商品可添加'))
    }
  }

  render() {
    const { textRecognition, imgRecognition } = store
    const { details } = orderStore.orderDetail
    const { orderCanHaveDuplicateSku } = globalStore.orderInfo
    const { errorNum } = textRecognition
    const { type } = this.props
    const list = type === 'img' ? imgRecognition.vaild : textRecognition.vaild
    const len = getRecognitionLength(list)

    return (
      <>
        <Flex className='gm-padding-lr-20'>
          <Flex alignCenter flex>
            <strong className='gm-text-14'>
              <i className='xfont xfont-bill' style={{ color: '#fd5271' }} />
              <span>
                {type === 'text'
                  ? i18next.t('sku_recognition_tip2', {
                      VAR1: len,
                      VAR2: errorNum || 0,
                    })
                  : i18next.t('sku_img_recognition_tip', {
                      VAR1: len,
                    })}
              </span>
            </strong>
          </Flex>
          <Flex>
            <Button type='primary' onClick={this.handleAddSkus}>
              {i18next.t('添加至订单')}
            </Button>
          </Flex>
        </Flex>
        <div className='gm-padding-lr-20 gm-padding-tb-10'>
          <EditTable
            data={list.slice()}
            getTrGroupProps={(state, row) => getCombineGoodsClass(row, list)}
            style={{ maxHeight: this.state.tableHeight }}
            columns={[
              {
                Header: i18next.t('商品ID'),
                accessor: 'id',
              },
              {
                Header: i18next.t('商品名'),
                accessor: 'name',
              },
              {
                Header: i18next.t('报价单名称（对外）'),
                accessor: 'supplier_name',
              },
              {
                Header: i18next.t('下单数量'),
                accessor: 'quantity',
                Cell: ({ original, index }) => {
                  const {
                    is_combine_goods,
                    isCombineGoodsTop,
                    quantity,
                    sale_unit_name,
                  } = original
                  if (is_combine_goods && !isCombineGoodsTop) {
                    return (
                      parseFloat(Big(quantity || 0).toFixed(2)) + sale_unit_name
                    )
                  }
                  return (
                    <Flex>
                      <InputNumber
                        value={quantity}
                        max={9999}
                        onChange={this.handleChangeItemNum.bind(
                          this,
                          index,
                          'quantity',
                        )}
                        className={classNames(
                          'form-control input-sm b-order-quantity-input',
                          {
                            'b-bg-warning': !quantity,
                          },
                        )}
                        style={{ width: '60px' }}
                        placeholder={i18next.t('下单数')}
                      />
                      <span className='gm-padding-5'>{sale_unit_name}</span>
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('含税单价（销售单位）'),
                accessor: 'sale_price',
                Cell: (row) => {
                  const { original, index } = row
                  const {
                    sale_price,
                    isCombineGoodsTop,
                    fee_type,
                    sale_unit_name,
                  } = original
                  const isPriceTiming = original.is_price_timing
                  if (isPriceTiming) return i18next.t('时价')
                  if (isCombineGoodsTop) {
                    return `${sale_price}${
                      Price.getUnit(fee_type) + '/'
                    }${sale_unit_name}`
                  }
                  return (
                    <Flex>
                      <InputNumber
                        value={sale_price}
                        max={999999}
                        onChange={this.handleChangeItemNum.bind(
                          this,
                          index,
                          'sale_price',
                        )}
                        className={classNames(
                          'form-control input-sm b-order-quantity-input',
                          {
                            'b-bg-warning': !sale_price,
                          },
                        )}
                        style={{ width: '70px' }}
                        placeholder={i18next.t('含税单价')}
                      />
                      <span className='gm-padding-5'>
                        {`${Price.getUnit(original.fee_type)}/${
                          original.sale_unit_name
                        }`}
                      </span>
                    </Flex>
                  )
                },
              },
              {
                width: 80,
                Header: TableUtil.OperationHeader,
                id: 'operation',
                Cell: ({ index, original: sku }) => {
                  const { belongWith } = sku
                  if (belongWith) return null
                  const hasOnOrder = hasOnOrderFun(details, sku)
                  if (hasOnOrder && !orderCanHaveDuplicateSku) {
                    return (
                      <div className='text-center'>{i18next.t('已添加')}</div>
                    )
                  } else {
                    return (
                      <TableUtil.OperationCell>
                        <Button
                          type='danger'
                          onClick={this.handleRemoveItem.bind(this, index)}
                        >
                          <i className='glyphicon glyphicon-remove' />
                        </Button>
                      </TableUtil.OperationCell>
                    )
                  }
                },
              },
              {
                expander: true,
                show: false,
                Expander: null,
              },
            ]}
            expanded={getExpanded(list)}
            defaultPageSize={9999}
            SubComponent={(row) => {
              const { original, index } = row
              const subList = (original.others || []).slice()
              const style = index % 2 ? { backgroundColor: '#f5f5f7' } : {}
              return (
                <Flex alignCenter className='gm-padding-10' style={style}>
                  <Flex className='b-warning-tips'>
                    <i className='ifont xfont-warning-circle' />
                    {i18next.t('商品未完全识别，为你推荐：')}
                  </Flex>
                  <Flex>
                    {_.map(subList, (item, i) => {
                      return (
                        <Popover
                          key={i}
                          showArrow
                          type='hover'
                          popup={
                            <div className='gm-inline-block gm-padding-10'>
                              {item.supplier_name}
                            </div>
                          }
                        >
                          <Button
                            className='gm-margin-right-5'
                            onClick={this.handleChangeItem.bind(this, index, i)}
                          >
                            {`${item.name} ${
                              item.is_combine_goods
                                ? i18next.t('KEY6', {
                                    VAR1: item.sale_unit_name,
                                  })
                                : `${item.std_unit_name_forsale}/${item.sale_unit_name}`
                            }`}
                          </Button>
                        </Popover>
                      )
                    })}
                  </Flex>
                </Flex>
              )
            }}
          />
        </div>
      </>
    )
  }
}

RecognitionTable.propTypes = {
  type: PropTypes.string,
  onAdd: PropTypes.func,
  getHeaderHeight: PropTypes.func,
}

export default RecognitionTable
