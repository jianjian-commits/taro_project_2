import { i18next } from 'gm-i18n'
import React, { useState } from 'react'
import { Price, Flex, Popover, Loading, Tip, Button } from '@gmfe/react'
import { Table, EditTable, TableUtil } from '@gmfe/table'
import { KCInputNumberV2, keyboardTableHoc } from '@gmfe/keyboard'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { useKCInputNumber } from '../../common/hooks'

import { isAbnormalFun, squeshQoutePriceList } from '../util'
import ReferencePriceDetail from '../../common/components/reference_price_detail'
import { saleReferencePrice } from 'common/enum'

import store from './store'
import Big from 'big.js'

const KeyboardTable = keyboardTableHoc(EditTable)

const ModifyPriceModal = observer((props) => {
  const { onOk, onCancel, showRefPrice } = props

  // const { skus } = store
  // const { aggregate_sort_type } = skus.filter

  const { filter } = store.skus

  const { skuBatch } = store
  const list = toJS(skuBatch.list)

  const [sortType, setSortType] = useState(undefined)
  const { onFocus, onBlur } = useKCInputNumber()

  const renderModalHeader = () => {
    return (
      <Flex row className='gm-margin-bottom-10'>
        <Flex column justifyStart style={{ width: '650px', fontSize: '12px' }}>
          <p>{i18next.t('说明')}：</p>
          <p>{i18next.t('1. LK单中的商品不支持修改订单')}</p>
          <p>
            {i18next.t(
              '2. 修改价格后，使用了优惠券的订单产生退券，可在【系统-操作日志-订单日志】中查看已退还优惠券的订单',
            )}
          </p>
        </Flex>
        <Flex
          justifyEnd
          alignEnd
          className='gm-padding-bottom-5'
          style={{ width: '170px' }}
        >
          <Button
            className='gm-margin-right-10'
            onClick={onCancel}
            style={{ height: 30 }}
          >
            {i18next.t('取消')}
          </Button>
          <Button
            type='primary'
            htmlType='submit'
            onClick={onOk}
            style={{ height: 30 }}
          >
            {i18next.t('确定')}
          </Button>
        </Flex>
      </Flex>
    )
  }

  const handlePriceChange = (index, from, value) => {
    if (value?.length > 9) {
      Tip.info(i18next.t('价格不能超过9位'))
      return
    }

    store.priceChangeInSkuBatch(from, index, value)
  }

  // 判断商品是否存在异常
  const isAbnormalSku = (isAbnormal) => {
    return isAbnormal ? (
      <Popover
        showArrow
        type='hover'
        left
        bottom
        style={{
          marginLeft: '-3px',
          fontSize: '12px',
        }}
        className='gm-border'
        popup={
          <div style={{ minWidth: '130px' }} className='gm-padding-10 gm-bg'>
            {i18next.t('当前商品存在售后异常，无法进行修改')}
          </div>
        }
      >
        <Flex alignCenter>
          <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
        </Flex>
      </Popover>
    ) : null
  }

  if (skuBatch.loading) {
    return (
      <Flex justifyCenter>
        <Loading />
      </Flex>
    )
  }

  // 是否展示参考成本
  // eslint-disable-next-line
  const showReferencePrice = showRefPrice
  let referencePriceFlag = ''

  if (showReferencePrice) {
    // 获取参考成本价格类型
    const { refPriceType } = props
    _.find(saleReferencePrice, (item) => {
      if (item.type === refPriceType) {
        referencePriceFlag = item.flag
        return true
      }
    })

    // 处理参考成本数据
    _.each(list, (item, i) => {
      const _orders = squeshQoutePriceList(item.orders)
      item.orders = _orders

      // 是否存在不同参考成本订单
      const initReferencePrice = _orders[0][referencePriceFlag]
      const noEqualReferencePrice = _.findIndex(
        _orders,
        (order) => order[referencePriceFlag] !== initReferencePrice,
      )

      item.noEqualReferencePrice = noEqualReferencePrice
    })
  }

  const handleSortClick = (name) => {
    if (filter.isAllSelected) {
      console.log('isAllse')
      let aggregateSortType = ''
      if (sortType === undefined) {
        setSortType('desc')
        aggregateSortType = 'total_quantity_desc'
      } else if (sortType === 'desc') {
        setSortType('asc')
        aggregateSortType = 'total_quantity_asc'
      } else if (sortType === 'asc') {
        setSortType(undefined)
        aggregateSortType = undefined
      }
      store.changeAllSelectedListOrder(aggregateSortType, 1)
    } else {
      if (sortType === undefined) {
        setSortType('desc')
      } else if (sortType === 'desc') {
        setSortType('asc')
      } else if (sortType === 'asc') {
        setSortType(undefined)
      }
      store.changeBatchListOrder(sortType)
    }
  }

  return (
    <div className='gm-padding-15'>
      {renderModalHeader()}
      <KeyboardTable
        id='keyboard_table'
        onAddRow={() => {}}
        data={list}
        columns={[
          {
            Header: i18next.t('商品ID'),
            accessor: 'sku_id',
          },
          {
            Header: i18next.t('商品名'),
            width: 120,
            id: 'sku_name',
            accessor: (d) => {
              const isAbnormal = isAbnormalFun(d.orders[0])
              return (
                <Flex row alignCenter>
                  {d.sku_name}
                  {isAbnormalSku(isAbnormal)}
                </Flex>
              )
            },
          },
          {
            Header: i18next.t('报价单名称'),
            accessor: 'salemenu_name',
          },
          {
            Header: showReferencePrice ? i18next.t('参考成本') : '',
            id: 'referencePriceFlag',
            accessor: (d) => d.orders[0][referencePriceFlag],
            width: showReferencePrice ? 100 : 0,
            Cell: (cellProps) => {
              // 修改单价失败列表 再次修改时 暂时不展示参考成本
              if (!showReferencePrice) {
                return null
              }
              const orders = cellProps.original.orders.slice()
              const noEqualReferencePrice =
                cellProps.original.noEqualReferencePrice
              // 所有订单参考成本相同 && code !== 1 才展示参考成本
              if (
                noEqualReferencePrice === -1 &&
                cellProps.original.code !== 1
              ) {
                return (
                  <ReferencePriceDetail
                    sequshList={orders}
                    reference_price={cellProps.value}
                    currentIndex={0}
                    feeType={cellProps.original.fee_type}
                    referencePriceFlag={referencePriceFlag}
                  />
                )
              } else {
                return '-'
              }
            },
          },
          {
            Header: (
              <TableUtil.SortHeader
                onClick={() => handleSortClick('total_quantity')}
                type={sortType}
              >
                {i18next.t('下单数')}
              </TableUtil.SortHeader>
            ),
            id: 'total_quantity',

            Cell: (cellProps) => {
              const { original } = cellProps
              // 全选时使用
              const total_quantity = original.total_quantity
              // 非全选时使用
              const sum = original.orders
                .map((order) => order.quantity)
                .reduce((preQuantity, curQuantity) => {
                  return parseFloat(
                    Big(preQuantity + curQuantity).toFixed(2),
                    10,
                  )
                })

              const unit_name = original.std_unit_name_forsale
              if (filter.isAllSelected) {
                return <Flex>{`${total_quantity}${unit_name} `}</Flex>
              } else {
                return <Flex>{`${sum}${unit_name} `}</Flex>
              }
            },
          },
          {
            Header: i18next.t('单价(基本单位)'),
            accessor: 'std_sale_price_forsale',
            width: 140,
            isKeyboard: true,
            Cell: (cellProps) => {
              const original = cellProps.original
              const isAbnormal = isAbnormalFun(original.orders[0])
              return (
                <>
                  <KCInputNumberV2
                    disabled={isAbnormal}
                    value={original.std_sale_price_forsale ?? ''}
                    onChange={(value) => {
                      handlePriceChange(cellProps.index, 'std', value)
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    style={{ width: '70px' }}
                    className='form-control input-sm b-order-price-input gm-margin-right-5'
                  />
                  {Price.getUnit(original.fee_type) + '/'}
                  {original.std_unit_name_forsale}
                </>
              )
            },
          },
          {
            Header: i18next.t('销售规格'),
            accessor: 'std_unit_name',
            // isKeyboard: true,
            Cell: ({ original }) =>
              `${original.sale_ratio}
              ${original.std_unit_name_forsale}/${original.sale_unit_name}`,
          },
          {
            Header: i18next.t('单价(销售单位)'),
            accessor: 'sale_price',
            width: 140,
            isKeyboard: true,
            Cell: (cellProps) => {
              const original = cellProps.original
              const isAbnormal = isAbnormalFun(original.orders[0])
              return (
                <>
                  <KCInputNumberV2
                    disabled={isAbnormal}
                    value={original.sale_price ?? ''}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    style={{ width: '70px' }}
                    onChange={(value) =>
                      handlePriceChange(cellProps.index, 'sale', value)
                    }
                    className='form-control input-sm b-order-price-input gm-margin-lr-5'
                  />
                  {Price.getUnit(original.fee_type) + '/'}
                  {original.sale_unit_name}
                </>
              )
            },
          },
          {
            Header: i18next.t('订单'),
            accessor: 'orders',
            Cell: (cellProps) => {
              const orders = cellProps.original.orders.slice()
              return (
                <Popover
                  type='hover'
                  right
                  popup={
                    <div style={{ maxHeight: 300, overflowY: 'scroll' }}>
                      <Table
                        defaultPageSize={9999}
                        data={orders}
                        columns={[
                          {
                            Header: i18next.t('订单号'),
                            accessor: 'order_id',
                            minWidth: 120,
                          },
                          {
                            Header: i18next.t('商户名'),
                            accessor: 'resname',
                            minWidth: 120,
                          },
                          {
                            Header: (
                              <span>
                                {i18next.t('当前单价')}
                                <br />
                                {i18next.t('(基本单位)')}
                              </span>
                            ),
                            id: 'std_sale_price_forsale',
                            minWidth: 120,
                            Cell: ({ original }) => {
                              if (original.is_price_timing) {
                                return i18next.t('时价')
                              }

                              return `${Big(
                                original.std_sale_price_forsale,
                              ).toFixed(2)}${
                                Price.getUnit(original.fee_type) + '/'
                              }${original.std_unit_name_forsale}`
                            },
                          },
                        ]}
                      />
                    </div>
                  }
                >
                  <Flex>
                    <a style={{ textDecoration: 'underline' }}>
                      {i18next.t('共')}
                      {_.uniqBy(orders, 'order_id').length}
                      {i18next.t('个订单')}
                    </a>
                  </Flex>
                </Popover>
              )
            },
          },
        ]}
      />
    </div>
  )
})

ModifyPriceModal.propTypes = {
  refPriceType: PropTypes.number,
}

export default ModifyPriceModal
