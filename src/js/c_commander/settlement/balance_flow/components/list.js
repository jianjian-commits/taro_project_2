import React, { Component } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX } from '@gmfe/table-x'
import PropTypes from 'prop-types'
import { withBreadcrumbs } from 'common/service'
import TableTotalText from 'common/components/table_total_text'

import { store } from '../store'

@withBreadcrumbs([t('余额流水')])
@observer
class List extends Component {
  pagination = React.createRef()

  componentDidMount() {
    store.setDoFirstRequest(this.pagination.current.apiDoFirstRequest)
    this.pagination.current.apiDoFirstRequest()
  }

  handleRequest = (pagination) => {
    const { distributor_id } = this.props.communityInfo
    return store.fetchList(pagination, distributor_id)
  }

  render() {
    const { list, loading } = store
    const { community_name } = this.props.communityInfo

    return (
      <>
        <BoxTable
          info={
            <>
              <BoxTable.Info>
                <TableTotalText
                  data={[
                    {
                      label: t('社区店名称'),
                      content: community_name,
                    },
                  ]}
                />
              </BoxTable.Info>
            </>
          }
        >
          <ManagePaginationV2
            id='pagination_in_balance_flow_list'
            onRequest={this.handleRequest}
            ref={this.pagination}
          >
            <TableX
              data={list.slice()}
              loading={loading}
              columns={[
                {
                  Header: t('流水单号'),
                  accessor: 'flow_number',
                },
                {
                  Header: t('变动日期'),
                  accessor: 'create_time',
                },
                {
                  Header: t('变动类型'),
                  id: 'type',
                  accessor: (d) => {
                    return d.type === 1 ? '佣金收入' : '提现'
                  },
                },
                {
                  Header: t('余额变动'),
                  accessor: 'change_money',
                },
                {
                  Header: t('操作人'),
                  accessor: 'handler',
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

List.propTypes = {
  communityInfo: PropTypes.object,
}

export default List
