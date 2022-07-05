import React from 'react'
import { i18next } from 'gm-i18n'
import { BoxTable, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table, TableUtil } from '@gmfe/table'
import { observer } from 'mobx-react'
import _ from 'lodash'

import { history } from '../common/service'
import { BUSINESS_STATUS, SELF_LIFTING_TYPE_SHOW } from '../common/enum'
import Filter from './components/filter'
import store from './store'

@observer
class Component extends React.Component {
  pagination = React.createRef()

  componentDidMount() {
    store.setDoFirstRequest(this.pagination.current.doFirstRequest)
    this.pagination.current.apiDoFirstRequest()
  }

  handleRequest = (pagination) => {
    return store.getList(pagination)
  }

  handleToDetail = (id) => {
    history.push({
      pathname: '/supply_chain/distribute/self_lifting/detail',
      search: `?id=${id}`,
    })
  }

  handleDelete = async (id) => {
    await store.delete(id)
    this.pagination.current.doCurrentRequest()
  }

  render() {
    const { list, loading } = store
    return (
      <div>
        <Filter />
        <BoxTable
          action={
            <Button
              type='primary'
              onClick={() =>
                history.push('/supply_chain/distribute/self_lifting/create')
              }
            >
              {i18next.t('新建自提点')}
            </Button>
          }
        >
          <ManagePaginationV2
            id='pagination_in_self_lifting_list'
            onRequest={this.handleRequest}
            ref={this.pagination}
          >
            <Table
              data={list.slice()}
              loading={loading}
              columns={[
                {
                  Header: i18next.t('自提点名称'),
                  accessor: 'name',
                },
                {
                  Header: i18next.t('地理标签'),
                  accessor: 'geographic_label',
                },
                {
                  Header: i18next.t('地理位置'),
                  accessor: 'address',
                },
                {
                  Header: i18next.t('负责人'),
                  accessor: 'principal',
                },
                {
                  Header: i18next.t('联系电话'),
                  accessor: 'phone',
                },
                {
                  Header: i18next.t('营业状态'),
                  id: 'business_status',
                  accessor: (d) => {
                    const target = _.find(
                      BUSINESS_STATUS,
                      (item) => d.business_status === item.id
                    )
                    return (target && target.value) || i18next.t('未知')
                  },
                },
                {
                  Header: i18next.t('类型'),
                  id: 'type',
                  accessor: d => SELF_LIFTING_TYPE_SHOW[d.type]
                },
                {
                  Header: TableUtil.OperationHeader,
                  Cell: ({ original }) => (
                    <TableUtil.OperationCell>
                      <TableUtil.OperationDetail
                        onClick={this.handleToDetail.bind(this, original.id)}
                      />
                      {original.type === 1 && (
                        <TableUtil.OperationDelete
                          onClick={this.handleDelete.bind(this, original.id)}
                        >
                          {i18next.t('是否确认要删除该自提点？')}
                        </TableUtil.OperationDelete>
                      )}
                    </TableUtil.OperationCell>
                  ),
                },
              ]}
            />
            <div className='gm-padding-bottom-15' />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

export default Component
