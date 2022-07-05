import React from 'react'
import { observer } from 'mobx-react'
import { RightSideModal, BoxTable, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table } from '@gmfe/table'
import QueryFilter from './query_filter'
import store from './store'
import TaskList from '../../../../task/task_list'
import { i18next } from 'gm-i18n'
import { receiptType } from '../../util'
import { history } from '../../../../common/service'
import moment from 'moment'
import globalStore from '../../../../stores/global'

@observer
class MerchandiseTransferList extends React.Component {
  constructor(props) {
    super(props)
    this.pagination = React.createRef()
  }

  componentDidMount() {
    this.pagination.current.apiDoFirstRequest()
  }

  handleGotoTransferReceipt = (receiptNo) => {
    window.open(
      `#/sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list/transfer_receipt_detail?receiptNo=${receiptNo}`
    )
  }

  handleNewTransferReceipt = () => {
    history.push(
      '/sales_invoicing/warehouse/transfer_inside_warehouse/inventory_transfer_list/new_transfer_receipt'
    )
  }

  handleSearch = (e) => {
    e.preventDefault()
    this.pagination.current.apiDoFirstRequest()
  }

  handleExport = () => {
    store.exportInventoryTransferListData().then(() => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  renderRight = () => {
    return (
      <Button
        type='primary'
        onClick={this.handleNewTransferReceipt}
        style={{
          display: globalStore.hasPermission('add_inner_transfer_sheet')
            ? 'block'
            : 'none',
        }}
      >
        {i18next.t('新建移库单')}
      </Button>
    )
  }

  render() {
    const { list } = store
    return (
      <div>
        <QueryFilter
          searchFunc={this.handleSearch}
          exportFunc={this.handleExport}
        />
        <BoxTable action={this.renderRight()}>
          <ManagePaginationV2
            id='pagination_in_product_warehouse_inventory_transfer_list'
            ref={this.pagination}
            onRequest={store.fetchInventoryTransferListData}
          >
            <Table
              data={list.slice()}
              className='gm-margin-bottom-10'
              columns={[
                {
                  accessor: 'create_time',
                  Header: i18next.t('建单日期'),
                  Cell: ({ original }) => {
                    return (
                      <span>
                        {moment(original.create_time).format('YYYY-MM-DD')}
                      </span>
                    )
                  },
                },
                {
                  accessor: 'sheet_no',
                  Header: i18next.t('移库单号'),
                  Cell: ({ original }) => {
                    return original.sheet_no ? (
                      <a
                        onClick={this.handleGotoTransferReceipt.bind(
                          this,
                          original.sheet_no
                        )}
                      >
                        {original.sheet_no}
                      </a>
                    ) : null
                  },
                },
                {
                  Header: i18next.t('建单人'),
                  accessor: 'creator',
                },
                {
                  accessor: 'status',
                  Header: i18next.t('单据状态'),
                  Cell: ({ original }) => {
                    return receiptType[original.status]
                  },
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

export default MerchandiseTransferList
