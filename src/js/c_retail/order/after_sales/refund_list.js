import { t } from 'gm-i18n'
import React from 'react'
import { observer, Observer } from 'mobx-react'
import {
  selectTableXHOC,
  expandTableXHOC,
  TableX,
  TableXUtil
} from '@gmfe/table-x'
import { ManagePagination } from '@gmfe/business'
import { ToolTip, Popover, Tip, Dialog, BoxTable } from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'

import TableTotalText from 'common/components/table_total_text'
import TradeFlow from './trade_flow'
import store from './store'
import globalStore from '../../../stores/global'
import { getPrice } from '../util'
import SubTable from './sku_refund_list'

const SelectExpandTableX = selectTableXHOC(expandTableXHOC(TableX))
const { BatchActionBar, OperationHeader, OperationDetail } = TableXUtil

@observer
class RefundList extends React.Component {
  constructor(props) {
    super(props)
    this.paginationRef = React.createRef(null)
  }

  componentDidMount() {
    store.setDoApiDoFirstSearchFunc(
      this.paginationRef.current.apiDoFirstRequest
    )
    this.paginationRef.current.apiDoFirstRequest()
  }

  handlePageChange = pagination => {
    return store.getRefundOrdersList(pagination)
  }

  getBatchRefundOrderData = () => {
    const { refundOrdersList } = store
    // 批量退款，存在各种退款状态商品，需要整合数据
    const list = _.filter(
      refundOrdersList.slice(),
      order => order.selected.length
    )

    // 只有还未操作退款的商品或退款失败的商品可以请求退款
    const data = []
    _.forEach(list, order => {
      const skus = _.filter(
        order.details,
        sku =>
          _.findIndex(order.selected, select => sku.sku_id === select) !== -1 &&
          (sku.refund_status === 3 || sku.refund_status === 4)
      )

      // 存在可退款商品
      if (skus.length) {
        const ids = _.map(skus, sku => sku.sku_id)
        data.push({
          order_id: order.order_id,
          sku_ids: ids,
          refund_type: order.refund_type
        })
      }
    })
    return data
  }

  handleBatchRefund = () => {
    Dialog.confirm({
      children: t('确认将所选微信支付的退款金额原路退回吗？'),
      title: t('退款提示')
    })
      .then(() => {
        // 批量退款,处理数据
        const data = this.getBatchRefundOrderData()
        // 判断是否有可退款商品, 做一层提示
        if (!data.length) {
          Tip.info(t('目前暂无可退款商品或订单'))
          return
        }
        store.dealSkuRefund({ refund_data: JSON.stringify(data) })
      })
      .catch(err => {
        console.log(err)
      })
  }

  columns = [
    {
      Header: t('下单时间'),
      id: 'date_time',
      Cell: cellProps => (
        <div>
          {moment(cellProps.row.original.date_time).format(
            'YYYY-MM-DD HH:mm:ss'
          )}
        </div>
      )
    },
    {
      Header: t('订单号'),
      accessor: 'order_id'
    },
    {
      Header: t('客户名'),
      id: 'name',
      Cell: cellProps => <div>{cellProps.row.original.cshop_name}</div>
    },
    {
      Header: t('已支付金额'),
      id: 'paid_amount',
      Cell: cellProps => (
        <div>{getPrice(cellProps.row.original, 'paid_amount')}</div>
      )
    },
    {
      Header: (
        <div>
          {t('支付号')}
          <ToolTip
            popup={<div className='gm-padding-10'>{t('微信支付唯一标示')}</div>}
          />
        </div>
      ),
      accessor: 'wx_trade_no'
    },
    {
      Header: t('售后金额'),
      id: 'real_refund_money',
      Cell: cellProps => (
        <div>{getPrice(cellProps.row.original, 'real_refund_money')}</div>
      )
    },
    {
      Header: t('总退款金额'),
      id: 'all_refund_money',
      Cell: cellProps => (
        <div>{getPrice(cellProps.row.original, 'all_refund_money')}</div>
      )
    },
    {
      Header: OperationHeader,
      id: 'operation',
      Cell: cellProps => {
        // 显示交易流水详情
        return (
          <Popover
            type='hover'
            right
            height={200}
            popup={<TradeFlow id={cellProps.row.original.order_id} />}
          >
            <OperationDetail className='text-center' />
          </Popover>
        )
      }
    }
  ]

  render() {
    const { refundOrdersList, selectedRefundList, loading } = store
    // 计算选择商品数
    const count = _.sum(_.map(refundOrdersList, order => order.selected.length))

    return (
      <BoxTable
        info={
          <TableTotalText
            data={[{ label: t('退款列表'), content: refundOrdersList.length }]}
          />
        }
      >
        <ManagePagination
          onRequest={this.handlePageChange}
          ref={this.paginationRef}
          id='pagination_in_order_refund_list'
        >
          <SelectExpandTableX
            id='refund_order_list'
            data={refundOrdersList.slice()}
            columns={this.columns}
            keyField='order_id'
            loading={loading}
            selected={selectedRefundList.slice()}
            onSelect={selected => store.setSelected('order', selected)}
            batchActionBar={
              count + selectedRefundList.length &&
              globalStore.hasPermission('order_refund') ? (
                <BatchActionBar
                  pure
                  batchActions={[
                    {
                      name: t('批量退款'),
                      onClick: () => this.handleBatchRefund()
                    }
                  ]}
                  onClose={() => store.resetSelected()}
                  count={count}
                />
              ) : null
            }
            SubComponent={({ index }) => {
              return <Observer>{() => <SubTable mIndex={index} />}</Observer>
            }}
          />
        </ManagePagination>
      </BoxTable>
    )
  }
}

export default RefundList
