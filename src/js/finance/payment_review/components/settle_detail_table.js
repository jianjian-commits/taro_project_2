import React from 'react'
import { TableX } from '@gmfe/table-x'
import { BoxPanel, Price } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Big from 'big.js'
import { getEnumValue } from 'common/filter'
import { UNHANDLE_TYPE } from 'common/enum'

const TableDetail = (props) => {
  const { settle_sheet_detail } = props.payment_review
  const { sub_sheets } = settle_sheet_detail
  const columns = [
    {
      Header: i18next.t('序号'),
      accessor: 'num',
      Cell: ({ row: { index } }) => index + 1,
    },
    {
      Header: i18next.t('单据类型'),
      accessor: 'type',
      Cell: ({
        row: {
          original: { type },
        },
      }) => getEnumValue(UNHANDLE_TYPE, type, 'key'),
    },
    {
      Header: i18next.t('单据号'),
      accessor: 'id',
      Cell: (cellProps) => {
        const { type, id } = cellProps.row.original
        let url = ''

        if (id) {
          url =
            type + '' === '1'
              ? `#/sales_invoicing/stock_in/product/detail?id=${id}`
              : `#/sales_invoicing/stock_out/refund/detail/${id}`
        }

        return (
          <a
            style={{
              fontSize: '12px',
              textDecoration: 'underline',
            }}
            href={url}
            target='_blank'
            rel='noopener noreferrer'
          >
            {id}
          </a>
        )
      },
    },
    {
      Header: i18next.t('入库/退货时间'),
      accessor: 'submit_time',
    },
    {
      Header: i18next.t('单据金额'),
      accessor: 'sku_money',
      Cell: (cellProps) => {
        const { sku_money, delta_money } = cellProps.row.original
        return (
          Big(sku_money || 0)
            .plus(delta_money || 0)
            .div(100)
            .toFixed(2) + Price.getUnit()
        )
      },
    },
  ]
  return (
    <BoxPanel
      title={i18next.t('单据列表')}
      summary={[{ text: i18next.t('合计'), value: sub_sheets.length }]}
      collapse
    >
      <TableX data={sub_sheets} columns={columns} />
    </BoxPanel>
  )
}

TableDetail.propTypes = {
  payment_review: PropTypes.object.isRequired,
}

export default connect((state) => ({
  payment_review: state.payment_review,
}))(TableDetail)
