import React, { Component } from 'react'
import store from '../store'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX } from '@gmfe/table-x'
import moment from 'moment'
import global from 'stores/global'

@observer
class List extends Component {
  componentDidMount() {
    const { pagination } = store
    pagination.current.apiDoFirstRequest()
  }

  handlePageChange = (pagination) => {
    const { fetchList } = store
    return fetchList(pagination)
  }

  handleAdd = () => {
    window.open('#/sales_invoicing/base/tax_rate/add')
  }

  render() {
    const { list, loading, statusList, pagination } = store
    return (
      <BoxTable
        action={
          global.hasPermission('edit_tax') && (
            <Button type='primary' onClick={this.handleAdd}>
              {t('新建税率规则')}
            </Button>
          )
        }
      >
        <ManagePaginationV2 onRequest={this.handlePageChange} ref={pagination}>
          <TableX
            data={list.slice()}
            columns={[
              {
                Header: t('序号'),
                id: 'number',
                Cell: ({ row: { index } }) => index + 1,
              },
              {
                Header: t('规则税率名称'),
                id: 'tax_rule_name',
                Cell: ({ row: { original } }) => (
                  <a
                    href={`#/sales_invoicing/base/tax_rate/edit?tax_id=${original.tax_rule_id}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {original.tax_rule_name}
                  </a>
                ),
              },
              { Header: t('供应商数'), accessor: 'supplier_count' },
              { Header: t('商品数'), accessor: 'spu_count' },
              { Header: t('创建人'), accessor: 'create_user' },
              {
                Header: t('创建时间'),
                id: 'create_time',
                Cell: ({ row: { original } }) =>
                  moment(original.create_time).format('YYYY-MM-DD HH:mm'),
              },
              {
                Header: t('状态'),
                id: 'status',
                Cell: ({ row: { original } }) =>
                  statusList.find((item) => item.value === original.status)
                    .text,
              },
            ]}
            loading={loading}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default List
