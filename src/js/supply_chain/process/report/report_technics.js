import React from 'react'
import { t } from 'gm-i18n'
import { TableX } from '@gmfe/table-x'
import PropTypes from 'prop-types'
import Big from 'big.js'
import _ from 'lodash'

import { isNumber } from 'common/util'
import { renderPercentageHeader } from '../util'

class Technics extends React.Component {
  render() {
    const { techData, technologyNames } = this.props

    return (
      <>
        <p className='gm-margin-10'>
          {t('加工工艺：') + technologyNames(techData.technics).join('-')}
        </p>
        <TableX
          className='gm-margin-10'
          data={techData.technics.slice()}
          columns={[
            {
              Header: t('工艺'),
              accessor: 'technic',
            },
            {
              Header: t('基本单位'),
              accessor: 'std_unit_name',
              Cell: () => <span>{techData.std_unit_name}</span>,
            },
            {
              Header: t('领料数量'),
              accessor: 'recv_amount',
              Cell: ({ row: { original } }) => {
                const num = isNumber(original.recv_amount)
                  ? Big(original.recv_amount).toFixed(2)
                  : '-'
                return <span>{num}</span>
              },
            },
            {
              Header: t('产出数量'),
              accessor: 'product_amount',
              Cell: ({ row: { original } }) => {
                const num = isNumber(original.product_amount)
                  ? Big(original.product_amount).toFixed(2)
                  : '-'
                return <span>{num}</span>
              },
            },
            {
              Header: t('损耗数量'),
              accessor: 'amount',
              Cell: ({ row: { original } }) => {
                const { recv_amount, product_amount } = original
                const num =
                  isNumber(recv_amount) && isNumber(product_amount)
                    ? Big(recv_amount).minus(product_amount).toFixed(2)
                    : '-'

                return <span>{num}</span>
              },
            },
            {
              Header: renderPercentageHeader(-1),
              accessor: 'product_ratio',
              Cell: ({ row: { original } }) => {
                const { product_amount, recv_amount } = original
                const percentage =
                  isNumber(product_amount) &&
                  isNumber(recv_amount) &&
                  _.toNumber(recv_amount) !== 0
                    ? Big(product_amount)
                        .div(recv_amount)
                        .times(100)
                        .toFixed(2) + '%'
                    : '-'

                return <span>{percentage}</span>
              },
            },
          ]}
        />
      </>
    )
  }
}

Technics.propTypes = {
  techData: PropTypes.object,
  technologyNames: PropTypes.func,
}

export default Technics
