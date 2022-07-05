import React from 'react'
import { Popover, Flex } from '@gmfe/react'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'
import { Table } from '@gmfe/table'
import Big from 'big.js'

class orderBelongPop extends React.Component {
  render() {
    const { data } = this.props
    // 多sku订单号去重展示
    const order_num = _.uniqBy(data.orders, 'order_id').length

    return (
      <Popover
        type='hover'
        popup={
          <div
            className='gm-border'
            style={{ maxHeight: 300, overflowY: 'scroll' }}
          >
            <Table
              defaultPageSize={9999}
              data={data.orders.slice()}
              columns={[
                {
                  Header: i18next.t('订单号'),
                  accessor: 'order_id',
                  minWidth: 120,
                },
                {
                  Header: i18next.t('客户名'),
                  accessor: 'resname',
                  minWidth: 120,
                },
                {
                  Header: i18next.t('下单数'),
                  accessor: 'quantity',
                  minWidth: 120,
                  Cell: ({ value: v, original: sku }) => {
                    return v
                      ? parseFloat(Big(v).toFixed(2), 10) + sku.sale_unit_name
                      : '-'
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
            {order_num}
            {i18next.t('个订单')}
          </a>
        </Flex>
      </Popover>
    )
  }
}

orderBelongPop.propTypes = {
  data: PropTypes.object,
}

export default orderBelongPop
