import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Pagination } from '@gmfe/react'
import { Table } from '@gmfe/table'

import { observer } from 'mobx-react'
import { purchaseTaskStatus } from '../../../common/filter'
import Big from 'big.js'
import _ from 'lodash'
import moment from 'moment'
import ReferencePriceDetail from '../../../common/components/reference_price_detail'
import { RefPriceTypeSelect } from '../../../common/components/ref_price_type_hoc'
import { saleReferencePrice } from '../../../common/enum'

@observer
class PurchaseTaskHistoryTable extends React.Component {
  render() {
    const {
      list,
      loading,
      pagination,
      refPriceType,
      postRefPriceType,
    } = this.props

    let referencePriceFlag = ''
    _.find(saleReferencePrice, (item) => {
      if (item.type === refPriceType) {
        referencePriceFlag = item.flag
        return true
      }
    })

    return (
      <>
        <Table
          data={list}
          loading={loading}
          columns={[
            {
              Header: i18next.t('商品'),
              accessor: 'name',
              Cell: ({ value: name, original: record }) =>
                `${name}(${record.sale_ratio}${record.std_unit_name}/${record.sale_unit_name})`,
            },
            {
              Header: i18next.t('分类'),
              accessor: 'category1_name',
              Cell: ({ value: category1_name, original: record }) =>
                `${category1_name}/${record.category2_name}/${record.pinlei_name}`,
            },
            {
              Header: i18next.t('供应商'),
              accessor: 'settle_supplier_name',
            },
            {
              Header: i18next.t('采购员'),
              accessor: 'purchaser_name',
            },
            {
              Header: (
                <RefPriceTypeSelect
                  postRefPriceType={postRefPriceType}
                  refPriceType={refPriceType}
                />
              ),
              id: 'referencePriceFlag',
              accessor: (d) => d[referencePriceFlag],
              Cell: ({ value: reference_price, index }) => {
                return (
                  <ReferencePriceDetail
                    sequshList={list}
                    reference_price={reference_price}
                    currentIndex={index}
                    referencePriceFlag={referencePriceFlag}
                    unit_name={list[index].std_unit_name}
                  />
                )
              },
            },
            {
              Header: i18next.t('计划采购'),
              accessor: 'plan_purchase',
              Cell: ({ value: plan_purchase_amount, original: record }) =>
                `${Big(record.plan_purchase_amount)
                  .div(record.sale_ratio)
                  .toFixed(2)}${record.sale_unit_name}(${Big(
                  record.plan_purchase_amount,
                ).toFixed(2)}${record.std_unit_name})`,
            },
            {
              Header: i18next.t('已采购'),
              accessor: 'already_purchase_amount',
              Cell: ({ value: already_purchase_amount, original: record }) =>
                `${Big(already_purchase_amount)
                  .div(record.sale_ratio)
                  .toFixed(2)}${record.sale_unit_name}(${Big(
                  already_purchase_amount,
                ).toFixed(2)}${record.std_unit_name})`,
            },
            {
              Header: i18next.t('发布时间'),
              accessor: 'release_time',
              Cell: ({ value: release_time }) =>
                release_time
                  ? moment(release_time).format('YYYY-MM-DD HH:mm:ss')
                  : '-',
            },
            {
              Header: i18next.t('状态'),
              accessor: 'status',
              Cell: ({ value: status }) => purchaseTaskStatus(status),
            },
          ]}
        />
        <Flex justifyEnd alignCenter className='gm-padding-20'>
          <Pagination
            data={pagination}
            toPage={this.props.toPage}
            nextDisabled={list.length < 10}
          />
        </Flex>
      </>
    )
  }
}

PurchaseTaskHistoryTable.propTypes = {
  list: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  pagination: PropTypes.object.isRequired,
  nextDisabled: PropTypes.bool,
  refPriceType: PropTypes.number,
  postRefPriceType: PropTypes.func,
  toPage: PropTypes.func,
}

PurchaseTaskHistoryTable.defaultProps = {
  loading: false,
  list: [],
  pagination: {
    list: [],
    peek: 0,
    limit: 10,
    current: 1,
    is_first: true,
    is_last: true,
    offset: 0,
  },
}

export default PurchaseTaskHistoryTable
