import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxTable } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import { observer } from 'mobx-react'
import store from './store'
import { getColumns } from './util'
import TableTotalText from '../../../../common/components/table_total_text'

@observer
class ErrorList extends React.Component {
  componentDidMount() {
    this.pagination.apiDoFirstRequest()
  }

  getTemplateSpuErrorList = (pagination) => {
    return store.fetchImportErrorList(this.props.location.query.id, pagination)
  }

  componentWillUnmount() {
    store.errorListClear()
  }

  render() {
    const { errorList, loading } = store
    const list = errorList.list.slice()
    const pagination = errorList.pagination || {}
    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('云商品列表'),
                  content: pagination.count || 0,
                },
              ]}
            />
          </BoxTable.Info>
        }
      >
        <ManagePaginationV2
          id='pagination_in_merchandise_cloud_goods_error_list'
          onRequest={this.getTemplateSpuErrorList}
          ref={(ref) => {
            this.pagination = ref
          }}
        >
          <Table
            ref={(ref) => (this.table = ref)}
            loading={loading}
            data={list}
            columns={[
              ...getColumns(),
              {
                Header: i18next.t('失败原因'),
                id: 'error_msg',
                accessor: (d) => (
                  <span className='gm-text-red'>{d.error_msg}</span>
                ),
              },
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default ErrorList
