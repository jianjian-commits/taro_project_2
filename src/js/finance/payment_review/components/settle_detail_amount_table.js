import React from 'react'
import { TableX } from '@gmfe/table-x'
import { BoxPanel } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

const AmoutTable = (props) => {
  const { settle_sheet_detail } = props.payment_review
  const { transactions = [] } = settle_sheet_detail

  const columns = [
    {
      Header: i18next.t('操作时间'),
      accessor: 'time',
    },
    {
      Header: i18next.t('流水号'),
      accessor: 'running_number',
    },
    {
      Header: i18next.t('结款金额'),
      accessor: 'amount',
      Cell: ({ row: { original } }) => i18next.t(`${original.amount}元`),
    },
    {
      Header: i18next.t('备注'),
      accessor: 'pay_remark',
      Cell: ({ row: { original } }) => original.pay_remark || '-',
    },
    {
      Header: i18next.t('操作人'),
      accessor: 'operator',
    },
  ]
  return (
    <BoxPanel
      title={i18next.t('交易流水')}
      summary={[{ text: i18next.t('合计'), value: transactions.length }]}
      collapse
    >
      <TableX data={transactions} columns={columns} />
    </BoxPanel>
  )
}

AmoutTable.propTypes = {
  payment_review: PropTypes.object.isRequired,
}

export default connect((state) => ({
  payment_review: state.payment_review,
}))(AmoutTable)
