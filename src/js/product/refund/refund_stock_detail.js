import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import Big from 'big.js'
import { isNil } from 'lodash'
import PropTypes from 'prop-types'
import {
  Dialog,
  Popover,
  Price,
  FunctionSet,
  BoxPanel,
  Flex,
} from '@gmfe/react'
import { Table } from '@gmfe/table'
import globalStore from 'stores/global'
import '../actions'
import '../reducer'
import actions from '../../actions'
import { history } from 'common/service'
import {
  PRODUCT_REASON_TYPE,
  PRODUCT_ACTION_TYPE,
  PRODUCT_STATUS,
} from 'common/enum'
import { PRODUCT_STATUS_TAGS } from '../util'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import SupplierDel from 'common/components/supplier_del_sign'
import RefundStockDetailWarning from './refund_stock_detail_warning'

class RefundDetail extends React.Component {
  componentDidMount() {
    actions.product_refund_detail(this.props.params.id)
  }

  handlePrint = () => {
    window.open(
      `#/sales_invoicing/stock_out/refund/print?print_type=2&return_ids=${JSON.stringify(
        [this.props.params.id],
      )}`,
    )
  }

  handleExport = () => {
    window.open(
      '/stock/return_stock_sheet/detail?id=' +
        this.props.params.id +
        '&export=1',
    )
  }

  handleRefuse = () => {
    const id = this.props.params.id

    actions
      .product_refund_stock_check_pass({
        id: id,
        is_pass: 2,
      })
      .then(() => {
        history.push(`/sales_invoicing/stock_out/refund/add/${id}`)
      })
  }

  handleCancel = () => {
    const id = this.props.params.id

    Dialog.confirm({
      children: i18next.t('是否删除此单据?'),
      title: i18next.t('确认删除'),
    }).then(
      () => {
        actions.product_refund_stock_cancel(id).then(() => {
          actions.product_refund_detail(id)
        })
      },
      () => {},
    )
  }

  batchTips(batch_number) {
    return (
      <div
        className='gm-padding-10 gm-bg'
        style={{ minWidth: '160px', color: '#333' }}
      >
        {batch_number}
      </div>
    )
  }

  renderReceiptDetail = () => {
    const { refundStockDetail } = this.props.product
    const isCheck = refundStockDetail.status + '' === '2' // 是否处于审核状态，审核状态操作多，单独处理
    const { is_frozen } = refundStockDetail

    const totalMoney = Big(refundStockDetail.sku_money || 0)
      .plus(refundStockDetail.delta_money || 0)
      .toFixed(2)

    return (
      <ReceiptHeaderDetail
        contentLabelWidth={75}
        customeContentColWidth={[370, 260, 260]}
        totalData={[
          {
            text: i18next.t('退货金额'),
            value: Price.getCurrency() + totalMoney,
          },
          {
            text: i18next.t('商品金额'),
            value: Price.getCurrency() + (refundStockDetail.sku_money || 0),
          },
          {
            text: i18next.t('折让金额'),
            value: Price.getCurrency() + (refundStockDetail.delta_money || 0),
          },
        ]}
        HeaderInfo={[
          {
            label: i18next.t('退货单号'),
            item: (
              <>
                <div>{refundStockDetail.id}</div>
                <div>{is_frozen ? i18next.t('历史单据，不允许修改') : ''}</div>
              </>
            ),
          },
          {
            label: i18next.t('供应商名称'),
            item: (
              <Flex style={{ width: '500px' }}>
                {refundStockDetail.supplier_status === 0 && <SupplierDel />}
                {refundStockDetail.supplier_name}
              </Flex>
            ),
          },
        ]}
        HeaderAction={
          <>
            <FunctionSet
              right
              data={[
                {
                  show: isCheck,
                  text: i18next.t('打印退货单'),
                  onClick: this.handlePrint,
                },
                {
                  text: i18next.t('导出退货单'),
                  onClick: this.handleExport,
                },
                {
                  text: i18next.t('审核不通过'),
                  onClick: this.handleRefuse,
                  show: isCheck && !is_frozen,
                },
                {
                  text: i18next.t('冲销'),
                  onClick: this.handleCancel,
                  show: isCheck && !is_frozen,
                },
              ]}
            />
          </>
        }
        ContentInfo={[
          {
            label: i18next.t('退货单状态'),
            item: <span>{PRODUCT_STATUS[refundStockDetail.status]}</span>,
            tag: PRODUCT_STATUS_TAGS(refundStockDetail.status),
          },
          {
            label: i18next.t('建单人'),
            item: <span>{refundStockDetail.creator}</span>,
          },
          {
            label: i18next.t('退货时间'),
            item: <span>{refundStockDetail.submit_time}</span>,
          },
          {
            label: i18next.t('退货备注'),
            item: <span>{refundStockDetail.return_sheet_remark}</span>,
          },
        ]}
      />
    )
  }

  render() {
    const { refundStockDetail } = this.props.product
    const { details, discount, settle_sheet_number } = refundStockDetail
    return (
      <div>
        {this.renderReceiptDetail()}
        <RefundStockDetailWarning settle_sheet_number={settle_sheet_number} />
        <BoxPanel
          summary={[{ text: i18next.t('合计'), value: details.length }]}
          collapse
          title={i18next.t('退货商品明细')}
        >
          <Table
            data={details}
            columns={[
              {
                Header: i18next.t('序号'),
                accessor: 'num',
                Cell: ({ index }) => ++index,
              },
              {
                Header: i18next.t('商品名称'),
                id: 'name',
                accessor: (d) => d.name,
              },
              {
                Header: i18next.t('商品分类'),
                id: 'category',
                accessor: (d) => d.category,
              },
              {
                Header: i18next.t('退货数'),
                id: 'quantity',
                accessor: (d) => (d.quantity ? d.quantity + d.std_unit : '-'),
              },
              {
                Header: i18next.t('退货单价'),
                id: 'unit_price',
                accessor: (d) =>
                  d.unit_price
                    ? d.unit_price + Price.getUnit() + '/' + d.std_unit
                    : '-',
              },
              {
                Header: i18next.t('补差'),
                id: 'different_price',
                accessor: (d) =>
                  Big(d.different_price || 0).toFixed(2) + Price.getUnit(),
              },
              {
                Header: i18next.t('退货金额'),
                id: 'money',
                accessor: (d) => (d.money ? Big(d.money).toFixed(2) : '-'),
              },
              {
                Header: i18next.t('退货金额（不含税）'),
                accessor: 'return_money_no_tax',
                Cell: ({ value }) =>
                  isNil(value)
                    ? '-'
                    : `${Big(value).toFixed(2)}${Price.getUnit()}`,
              },
              {
                Header: i18next.t('进项税率'),
                accessor: 'tax_rate',
                Cell: ({ value }) =>
                  isNil(value) ? '-' : `${Big(value).div(100).toFixed(2)}%`,
              },
              {
                Header: i18next.t('进项税额'),
                accessor: 'tax_money',
                Cell: ({ value }) =>
                  isNil(value)
                    ? '-'
                    : `${Big(value).toFixed(2)}${Price.getUnit()}`,
              },
              {
                Header: i18next.t('退货批次'),
                id: 'batch_number',
                show: globalStore.user.stock_method !== 1,
                Cell: ({ original }) => {
                  return original.batch_number ? (
                    <div>
                      <Popover
                        showArrow
                        component={<div />}
                        type='hover'
                        popup={this.batchTips(original.batch_number)}
                      >
                        <span style={{ color: '#2182CC' }}>
                          {i18next.t('查看批次')}
                        </span>
                      </Popover>
                    </div>
                  ) : (
                    '-'
                  )
                },
              },
              {
                Header: i18next.t('商品退货备注'),
                accessor: 'spu_remark',
              },
              {
                Header: i18next.t('操作人'),
                id: 'operator',
                accessor: (d) => d.operator,
              },
            ]}
          />
        </BoxPanel>
        <BoxPanel
          summary={[{ text: i18next.t('合计'), value: discount.length }]}
          collapse
          title={i18next.t('金额折让')}
        >
          <Table
            data={discount}
            columns={[
              {
                Header: i18next.t('操作时间'),
                id: 'operate_time',
                accessor: (d) => d.operate_time,
              },
              {
                Header: i18next.t('折让原因'),
                id: 'reason',
                accessor: (d) => PRODUCT_REASON_TYPE[d.reason],
              },
              {
                Header: i18next.t('折让金额'),
                id: 'money',
                accessor: (d) => d.money + Price.getUnit(),
              },
              {
                Header: i18next.t('折让类型'),
                id: 'action',
                accessor: (d) => PRODUCT_ACTION_TYPE[d.action],
              },
              {
                Header: i18next.t('备注'),
                id: 'remark',
                accessor: (d) => d.remark,
              },
              {
                Header: i18next.t('操作人'),
                id: 'operator',
                accessor: (d) => d.operator,
              },
            ]}
          />
        </BoxPanel>
      </div>
    )
  }
}

RefundDetail.propTypes = {
  product: PropTypes.object,
}

export default connect((state) => ({
  product: state.product,
}))(RefundDetail)
