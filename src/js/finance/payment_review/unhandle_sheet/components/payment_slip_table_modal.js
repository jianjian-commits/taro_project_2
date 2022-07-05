import React, { Component } from 'react'
import { i18next } from 'gm-i18n'
import { PAYMENT_METHOD } from '../.././util'
import { Table, selectTableV2HOC } from '@gmfe/table'
import { ManagePaginationV2 } from '@gmfe/business'
import moment from 'moment'
// import Big from 'big.js'
import { Flex, Price, Button } from '@gmfe/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import store from '.././store'
import PropTypes from 'prop-types'

const SelectTable = selectTableV2HOC(Table)

@observer
class PaymentSlipTable extends Component {
  paginationRef = React.createRef()

  handleSelect = (selected) => {
    store.handlePaymentSelect(selected)
  }

  componentDidMount() {
    store.setPaymentModalRequest(this.paginationRef.current.doFirstRequest)
    this.paginationRef.current.doFirstRequest()
  }

  handleBatchFetch = (pagination) => {
    const { selectedList, dataList } = store
    const countList = []

    Array.from(selectedList).forEach((selectedId) => {
      countList.push(dataList.find((f) => f.id === selectedId))
    })

    // 拉取当前供应商的结款单
    return store.queryExistPaymentList(
      countList[0].settle_supplier_id,
      pagination,
    )
  }

  render() {
    const { paymentSlipList, paymentSelected, modalPaymentSlipSupplier } = store
    return (
      <div className='gm-padding-left-10 gm-padding-right-10'>
        <p className='gm-padding-top-5'>
          {i18next.t('当前供应商已有')}
          <span
            style={{ color: '#36ad39' }}
          >{`${paymentSlipList.length}个`}</span>
          {i18next.t('待提交的结款单，请选择要加入的结款单')}
        </p>
        <span>
          {`${modalPaymentSlipSupplier?.name}(${modalPaymentSlipSupplier?.customer_id}`}
          )
        </span>
        <span className='gm-margin-left-20'>
          {i18next.t('KEY286', {
            VAR1: PAYMENT_METHOD[modalPaymentSlipSupplier?.pay_method || ''],
          })}
        </span>
        <ManagePaginationV2
          id='pagination_unhandle_sheet_list'
          ref={this.paginationRef}
          onRequest={this.handleBatchFetch}
        >
          <SelectTable
            style={{ maxHeight: '500px' }}
            data={paymentSlipList.slice()}
            keyField='id'
            selected={paymentSelected.slice()}
            onSelect={this.handleSelect}
            selectType='radio'
            columns={[
              {
                id: 'date_time',
                Header: i18next.t('建单日期'),
                accessor: (d) => {
                  return moment(d.date_time).format('YYYY-MM-DD')
                },
              },
              {
                Header: i18next.t('结款单号'),
                accessor: 'id',
              },
              {
                id: 'total_price',
                Header: i18next.t('单据总金额'),
                accessor: (d) => {
                  // const data = Big(d.total_money).div(100).toFixed(2)
                  return <Price value={_.toNumber(d?.total_money)} />
                },
              },
              {
                id: 'include_receipt',
                Header: i18next.t('包含入库/退货单数'),
                accessor: (d) => {
                  return d.sheet_count || 0
                },
              },
            ]}
          />
        </ManagePaginationV2>
        <Flex
          className='gm-margin-top-10'
          style={{ flexDirection: 'row-reverse' }}
        >
          <Button
            type='primary'
            onClick={this.props.onOk}
            disabled={paymentSelected.length === 0}
          >
            {i18next.t('确认')}
          </Button>
          <Button className='gm-margin-right-5' onClick={this.props.onCancel}>
            {i18next.t('取消')}
          </Button>
        </Flex>
      </div>
    )
  }
}

PaymentSlipTable.propTypes = {
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default PaymentSlipTable
