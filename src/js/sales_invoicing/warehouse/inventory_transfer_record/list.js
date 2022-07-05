import React from 'react'
import { observer } from 'mobx-react'
import { RightSideModal, Price, Flex } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX } from '@gmfe/table-x'
import QueryFilter from './query_filter'
import store from './store'
import TaskList from '../../../task/task_list'
import { i18next } from 'gm-i18n'
import Big from 'big.js'
import moment from 'moment'
import SupplierDel from '../../../common/components/supplier_del_sign'

@observer
class MerchandiseTransferList extends React.Component {
  constructor(props) {
    super(props)
    this.pagination = React.createRef()
  }

  componentDidMount() {
    this.pagination.current.apiDoFirstRequest()
  }

  componentWillUnmount() {
    store.clear()
  }

  handleSearch = () => {
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

  render() {
    const { list, activeTab } = store
    return (
      <div>
        <QueryFilter
          onSearchFunc={this.handleSearch}
          onExportFunc={this.handleExport}
        />
        <ManagePaginationV2
          id='pagination_in_product_warehouse_inventory_transfer_record'
          ref={this.pagination}
          onRequest={(pagination) =>
            store.fetchInventoryTransferListData(pagination)
          }
        >
          <TableX
            data={list.slice()}
            className='gm-margin-bottom-10'
            columns={[
              {
                Header: i18next.t('商品ID'),
                accessor: 'spu_id',
              },
              {
                Header: i18next.t('移库商品名'),
                accessor: 'spu_name',
              },
              {
                accessor: 'category_name',
                Header: i18next.t('商品分类'),
                Cell: ({
                  row: {
                    original: { category_1_name, category_2_name },
                  },
                }) => {
                  return <span>{`${category_1_name}/${category_2_name}`}</span>
                },
              },
              {
                Header: i18next.t('移库单号'),
                accessor: 'sheet_no',
              },
              activeTab === '1' && {
                Header: i18next.t('供应商'),
                accessor: 'supplier_name',
                Cell: (cellProps) => {
                  const {
                    supplier_name,
                    supplier_status,
                  } = cellProps.row.original

                  return (
                    <Flex>
                      {supplier_status === 0 && <SupplierDel />}
                      {supplier_name}
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('移出批次号'),
                accessor: 'out_batch_num',
              },
              {
                accessor: 'out_mount',
                Header: i18next.t('移库数'),
                Cell: ({
                  row: {
                    original: { out_amount, std_unit_name },
                  },
                }) => {
                  return out_amount + std_unit_name
                },
              },
              {
                accessor: 'unit_price',
                Header: i18next.t('移库单价'),
                Cell: (cellProps) => {
                  const { unit_price, std_unit_name } = cellProps.row.original
                  return (
                    (unit_price
                      ? parseFloat(Big(unit_price || 0))
                      : unit_price) + `${Price.getUnit()}/${std_unit_name}`
                  )
                },
              },
              {
                accessor: 'price',
                Header: i18next.t('移库金额'),
                Cell: ({
                  row: {
                    original: { price },
                  },
                }) => {
                  return (
                    (price ? parseFloat(Big(price || 0)) : price) +
                    Price.getUnit()
                  )
                },
              },
              {
                Header: i18next.t('移入批次号'),
                accessor: 'in_batch_num',
              },
              {
                accessor: 'submit_time',
                Header: i18next.t('移库时间'),
                Cell: (cellProps) => {
                  return (
                    <span>
                      {moment(cellProps.row.original.submit_time).format(
                        'YYYY-MM-DD HH:MM:SS',
                      )}
                    </span>
                  )
                },
              },
              {
                Header: i18next.t('操作人'),
                accessor: 'operator',
              },
              {
                Header: i18next.t('商品备注'),
                accessor: 'remark',
              },
            ].filter((_) => _)}
          />
        </ManagePaginationV2>
      </div>
    )
  }
}

export default MerchandiseTransferList
