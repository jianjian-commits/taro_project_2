import { i18next } from 'gm-i18n'
import React from 'react'
import { Pagination, Flex, Price } from '@gmfe/react'
import { Table } from '@gmfe/table'
import Big from 'big.js'
import moment from 'moment'
import { connect } from 'react-redux'
import './reducer.js'
import './actions.js'
import actions from '../../../actions'
import _ from 'lodash'
import PropTypes from 'prop-types'

class ProductSheetModal extends React.Component {
  componentDidMount() {
    const { orderId } = this.props
    actions.driver_task_get_product_data(orderId)
  }

  handleToPage = (data) => {
    actions.driver_task_set_product_pagination(data)
  }

  render() {
    const formatDate = (date) => moment(date).format('MM-DD hh:mm:ss')
    const { data, pagination } = this.props.driverOrderProduct
    const list = _.slice(
      data,
      pagination.offset,
      pagination.offset + pagination.limit,
    )
    return (
      <>
        <Table
          data={list}
          columns={[
            {
              Header: i18next.t('商品名'),
              accessor: 'name',
            },
            {
              Header: i18next.t('下单数'),
              accessor: 'quantity',
            },
            {
              Header: i18next.t('出库数'),
              accessor: 'real_std_count_forsale',
            },
            {
              Header: i18next.t('金额'),
              id: 'real_item_price',
              Cell: ({ original }) => (
                <div>
                  {original.real_item_price &&
                    Big(original.real_item_price).div(100).toFixed(2) +
                      Price.getUnit(original.fee_type)}
                </div>
              ),
            },
            {
              Header: i18next.t('验货状态'),
              id: 'inspect_status',
              accessor: ({ inspect_status }) =>
                inspect_status === 2
                  ? i18next.t('已验货')
                  : i18next.t('未验货'),
            },
            {
              Header: i18next.t('验货时间'),
              id: 'inspect_time',
              Cell: ({ original }) =>
                original.inspect_time && formatDate(original.inspect_time),
            },
          ]}
        />
        <Flex justifyEnd alignCenter className='gm-padding-20'>
          <Pagination data={pagination} toPage={this.handleToPage} />
        </Flex>
      </>
    )
  }
}

ProductSheetModal.propTypes = {
  driverOrderProduct: PropTypes.object,
  orderId: PropTypes.string,
}

export default connect((state) => ({
  driverOrderProduct: state.distributeDriver.driverOrderProduct,
}))(ProductSheetModal)
