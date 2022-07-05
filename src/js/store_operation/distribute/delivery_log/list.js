import React from 'react'
import { BoxTable, Button, RightSideModal } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { selectTableV2HOC, Table, TableUtil } from '@gmfe/table'
import { i18next } from 'gm-i18n'
import { observer, inject } from 'mobx-react'
import Big from 'big.js'
import moment from 'moment'
import globalStore from '../../../stores/global'
import PropTypes from 'prop-types'

import TableTotalText from 'common/components/table_total_text'
import TableListTips from 'common/components/table_list_tips'
import { OrderPrePrintBtn } from 'common/components/common_printer_options'
import PopupExportModal from '../popup_export_modal'

const formatTime = (date) => moment(date).format('YYYY-MM-DD  HH:mm:ss')
const SelectTable = selectTableV2HOC(Table)

@inject('store')
@observer
class List extends React.Component {
  componentDidMount() {
    const { doFirstRequest } = this.pagination
    this.props.store.setDoFirstRequest(doFirstRequest)
    doFirstRequest()
  }

  handleEditDelivery(order_id) {
    window.open(`#/order_manage/order/list/edit_delivery?order_id=${order_id}`)
  }

  handleDelete(order_id, i) {
    this.props.store.deleteDelivery(order_id, i)
  }

  handleSelect = (selected) => {
    this.props.store.listSelect(selected)
  }

  handleSelectAll = (all) => {
    this.props.store.listSelectAll(all)
  }

  handleSyncOrder = () => {
    this.props.store.syncOrder()
  }

  handleSelectAllPage = (bool) => {
    const { store } = this.props
    store.handleSelectAllPage(bool)

    // 接口不支持选择 所有页
    store.listSelectAll(true)
  }

  handleExport = () => {
    // 已选择的订单
    const { selectedList } = this.props.store
    let query = null
    query = {
      ids: JSON.stringify(selectedList),
    }
    return RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PopupExportModal query={query} closeModal={RightSideModal.hide} />
      ),
    })
  }

  render() {
    const {
      list,
      fetchList,
      in_query,
      pagination,
      selectedList,
      isSelectAllPage,
    } = this.props.store
    const canEditDistribute = globalStore.hasPermission(
      'distribution_order_edit',
    )
    const canDeleteDelivery = globalStore.hasPermission('delete_delivery')

    const tableTips = [
      i18next.t('在打印或导出前，请同步原订单的最新数据，避免数据不一致!'),
    ]

    if (in_query && list[0]) {
      const tip = `${list[0].order_id}
      ${i18next.t('不在筛选条件中，已在全部订单中为您找到')}`
      tableTips.push(tip)
    }

    const tableInfo = [
      {
        label: i18next.t('单据列表'),
        content: pagination.count,
      },
    ]

    return (
      <>
        <TableListTips tips={tableTips} />

        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText data={tableInfo} />
            </BoxTable.Info>
          }
          action={
            <Button type='primary' onClick={this.handleSyncOrder}>
              {i18next.t('同步原订单数据')}
            </Button>
          }
        >
          <ManagePaginationV2
            id='pagination_in_distribute_delivery_log'
            onRequest={fetchList}
            ref={(ref) => {
              this.pagination = ref
            }}
            defaultLimit={10}
            disablePage
          >
            <SelectTable
              data={list.slice()}
              keyField='order_id'
              selected={selectedList}
              onSelect={(selected) => this.handleSelect(selected)}
              onSelectAll={(all) => this.handleSelectAll(all)}
              batchActionBar={
                selectedList.length !== 0 && (
                  <TableUtil.BatchActionBar
                    pure
                    onClose={() => this.handleSelect([])}
                    toggleSelectAll={(bool) => this.handleSelectAllPage(bool)}
                    batchActions={[
                      {
                        name: (
                          <OrderPrePrintBtn
                            orderIdList={selectedList.slice()}
                            deliveryType={2}
                            isViewEditDocument
                          >
                            {i18next.t('批量打印')}
                          </OrderPrePrintBtn>
                        ),
                        onClick: () => {},
                        type: 'business',
                      },
                      // {
                      //   name: i18next.t('批量导出'),
                      //   onClick: () => {
                      //     this.handleExport()
                      //   },
                      //   type: 'business',
                      // },
                    ]}
                    count={selectedList.length}
                    isSelectAll={isSelectAllPage || true}
                  />
                )
              }
              columns={[
                {
                  Header: i18next.t('订单号/分拣序号'),
                  id: 'id',
                  Cell: (cellProps) => {
                    return (
                      <div>{`${list[cellProps.index].order_id}/${
                        list[cellProps.index].sort_num || '-'
                      }`}</div>
                    )
                  },
                },
                {
                  Header: i18next.t('线路'),
                  accessor: 'route_name',
                },
                {
                  Header: i18next.t('商户名'),
                  accessor: 'resname',
                },
                {
                  Header: i18next.t('套账下单金额'),
                  id: 'account_total_amount',
                  accessor: (d) => (
                    <div>{Big(d.account_total_amount || 0).toFixed(2)}</div>
                  ),
                },
                {
                  Header: i18next.t('销售额(不含运费)'),
                  id: 'total_pay',
                  accessor: (d) => <div>{Big(d.total_pay).toFixed(2)}</div>,
                },
                {
                  Header: i18next.t('运费'),
                  id: 'freight',
                  accessor: (d) => <div>{Big(d.freight).toFixed(2)}</div>,
                },
                {
                  Header: i18next.t('承运商/司机'),
                  id: 'driver',
                  Cell: (cellProps) =>
                    `${list[cellProps.index].carrier_name || '-'}/${
                      list[cellProps.index].driver_name || '-'
                    }`,
                },
                {
                  Header: i18next.t('创建时间'),
                  id: 'create_time',
                  accessor: (d) => <div>{formatTime(d.create_time)}</div>,
                },
                {
                  Header: i18next.t('创建人'),
                  accessor: 'creator',
                },
                {
                  Header: i18next.t('打印状态'),
                  id: 'print_times',
                  accessor: (d) =>
                    d.print_times
                      ? `${i18next.t('已打印')}(${d.print_times})`
                      : i18next.t('未打印'),
                },
                {
                  Header: i18next.t('同步时间'),
                  id: 'sync_order_time',
                  accessor: (d) => <div>{formatTime(d.sync_order_time)}</div>,
                },
                {
                  Header: TableUtil.OperationHeader,
                  Cell: ({ original, index }) => (
                    <TableUtil.OperationCell>
                      {canEditDistribute && (
                        <TableUtil.OperationDetail
                          onClick={this.handleEditDelivery.bind(
                            this,
                            original.order_id,
                          )}
                        />
                      )}
                      {canDeleteDelivery && (
                        <TableUtil.OperationDelete
                          title={i18next.t('提示')}
                          onClick={this.handleDelete.bind(
                            this,
                            original.order_id,
                            index,
                          )}
                        >
                          {i18next.t('删除后单据无法恢复，确定删除？')}
                        </TableUtil.OperationDelete>
                      )}
                    </TableUtil.OperationCell>
                  ),
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
  store: PropTypes.object,
}

export default List
