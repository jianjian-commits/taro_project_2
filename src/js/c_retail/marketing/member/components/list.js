import React from 'react'
import { BoxTable, Popover } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { t } from 'gm-i18n'
import moment from 'moment'
import { observer } from 'mobx-react'
import { ManagePaginationV2 } from '@gmfe/business'

import TableTotalText from 'common/components/table_total_text'
import BuyList from './buy_list'
import store from '../store'
import globalStore from '../../../../stores/global'
import { checkMemberType } from '../util'

@observer
class List extends React.Component {
  constructor(props) {
    super(props)

    this.refPagination = React.createRef(null)
  }

  componentDidMount() {
    store.setDoInfoFirstRequest(this.refPagination.current.apiDoFirstRequest)
    this.refPagination.current.apiDoFirstRequest()
  }

  handleChangePage(page) {
    return store.getList(page)
  }

  render() {
    return (
      <BoxTable
        info={
          <TableTotalText
            data={[{ label: t('会员总数'), content: store.count }]}
          />
        }
      >
        <ManagePaginationV2
          id='pagination_member_card_member_info_list'
          onRequest={this.handleChangePage}
          ref={this.refPagination}
        >
          <Table
            data={store.list.slice()}
            columns={[
              {
                Header: t('序号'),
                id: 'index',
                Cell: ({ index }) => index + 1
              },
              {
                Header: t('客户名'),
                id: 'nickname',
                accessor: 'nickname'
              },
              {
                Header: t('手机号'),
                id: 'telephone_number',
                accessor: 'telephone_number'
              },
              {
                Header: t('会员过期时间'),
                id: 'expired_time',
                accessor: item => moment(item.expired_time).format('YYYY-MM-DD')
              },
              {
                Header: t('会员卡状态'),
                id: 'status',
                accessor: item => checkMemberType(item.status)
              },
              globalStore.hasPermission('view_purchase_record') && {
                Header: t('购买记录'),
                accessor: 'edit',
                Cell: ({ original }) => {
                  const { c_uid } = original
                  return (
                    <Popover
                      type='hover'
                      showArrow
                      right
                      offset={5}
                      height={200}
                      popup={<BuyList id={c_uid} />}
                    >
                      <TableUtil.OperationDetail />
                    </Popover>
                  )
                }
              }
            ].filter(_ => _)}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default List
