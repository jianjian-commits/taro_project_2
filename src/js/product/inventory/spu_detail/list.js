import React, { Component, createRef } from 'react'
import { ManagePaginationV2 } from '@gmfe/business'
import { observer } from 'mobx-react'
import { TableX, fixedColumnsTableXHOC } from '@gmfe/table-x'
import { Flex } from '@gmfe/react'
import { withRouter } from 'react-router'
import { t } from 'gm-i18n'
import store from './store'

const FixedColumnsDiyTableX = fixedColumnsTableXHOC(TableX)
@withRouter
@observer
class List extends Component {
  pagination = createRef()

  columns = [
    { Header: t('商品ID'), accessor: 'spu_id', minWidth: 100, fixed: 'left' },
    { Header: t('商品名'), accessor: 'spu_name', minWidth: 100 },
    { Header: t('商品分类'), accessor: 'pinlei_name', minWidth: 100 },
    {
      Header: t('单据号'),
      accessor: 'sheet_number',
      width: 250,
      Cell: ({
        row: {
          original: { sheet_number, review_status },
        },
      }) => {
        const style = {
          padding: 4,
          background: '#ED8C99',
          borderRadius: 7,
          width: 80,
          textAlign: 'center',
        }
        return (
          <Flex column>
            <span style={{ fontWeight: 400 }}>{sheet_number}&nbsp;&nbsp;</span>
            {review_status === 2 && (
              <span className='gm-margin-top-5' style={style}>
                {t('审核不通过')}
              </span>
            )}
            {review_status === 3 && (
              <span className='gm-margin-top-5' style={style}>
                {t('冲销')}
              </span>
            )}
          </Flex>
        )
      },
    },
    { Header: t('变动类型'), accessor: 'change_type', minWidth: 100 },
    { Header: t('变动对象'), accessor: 'change_object', minWidth: 100 },
    { Header: t('基本单位'), accessor: 'std_unit_name', minWidth: 100 },
    { Header: t('变动前库存'), accessor: 'old_stock', minWidth: 100 },
    { Header: t('变动库存'), accessor: 'amount', minWidth: 100 },
    { Header: t('变动后库存'), accessor: 'stock', minWidth: 100 },
    { Header: t('变动前货值'), accessor: 'old_stock_value', minWidth: 100 },
    { Header: t('变动货值'), accessor: 'stock_value_change', minWidth: 100 },
    { Header: t('变动后货值'), accessor: 'stock_value', minWidth: 100 },
    { Header: t('变动前均价'), accessor: 'old_avg_price', minWidth: 100 },
    { Header: t('变动后均价'), accessor: 'avg_price', minWidth: 100 },
    { Header: t('操作时间'), accessor: 'create_time', minWidth: 100 },
    { Header: t('操作人'), accessor: 'operator', minWidth: 100 },
  ]

  componentWillUnmount() {
    this.props.location.query = {}
    store.init('')
  }

  componentDidMount() {
    store.setDoFirstRequest(this.pagination.current.apiDoFirstRequest)
    if (this.props.location.query.spu_id) {
      const { spu_id } = this.props.location.query
      store.init(spu_id)
    } else {
      store.init('')
    }
    this.pagination.current.apiDoFirstRequest()
  }

  render() {
    const { fetchList, list, loading } = store

    return (
      <ManagePaginationV2
        id='pagination_in_product_inventory_changes_spu_record'
        onRequest={fetchList}
        ref={this.pagination}
        disablePage
      >
        <FixedColumnsDiyTableX
          data={list.slice()}
          columns={this.columns}
          loading={loading}
          id='spu-detail-table'
        />
      </ManagePaginationV2>
    )
  }
}

export default List
