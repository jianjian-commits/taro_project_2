import { i18next, t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  BoxTable,
  Tip,
  Popover,
  Flex,
  Select,
  InputNumberV2,
  Button,
} from '@gmfe/react'
import { history } from 'common/service'
import { ManagePaginationV2 } from '@gmfe/business'
import store from './store'
import SearchFilter from '../search_filter'
import { Table, TableUtil, selectTableV2HOC } from '@gmfe/table'
import { emptyRender, formatDateTime } from '../../util'
import DriverSelect from '../../components/driver_select'
import commonStore from '../../store'
import Permission from '../../../common/components/permission'
import TableAction from '../table_action'

const SelectTable = selectTableV2HOC(Table)

@observer
class OutRecord extends React.Component {
  componentDidMount() {
    commonStore.fetchList()
    store.setPagination(this.pagination)
    store.handleSearch()
  }

  handleCreate = () => {
    history.push('/supply_chain/material_manage/record/out_record/create')
  }

  handleDelete = (index) => {
    store.handleDelete(index).then(() => {
      Tip.success(i18next.t('删除成功'))
    })
  }

  handleDriverChange(original, index, value) {
    store.handleOutRecordListChange(index, 'driver_id', value)
  }

  handleClose = () => {
    store.handleSelectAllRecord(false)
  }

  handlePageChange = (pagination) => {
    store.handleSelectAllRecord(false)
    return store.fetchOutRecordList(pagination)
  }

  render() {
    const { getStatus, validStatusList, selectedRecord, selectAll } = store
    // 待借出才能编辑
    const canEdit = (original) =>
      original.status === 1 && Permission.has('edit_turnover_return_sheet')
    const { getDriver } = commonStore
    return (
      <div>
        <SearchFilter store={store} />
        <BoxTable
          action={
            <div>
              <Permission field='add_turnover_return_sheet'>
                <Button type='primary' onClick={this.handleCreate}>
                  {i18next.t('周转物借出')}
                </Button>
              </Permission>
            </div>
          }
        >
          <ManagePaginationV2
            id='pagination_in_material_manage_out_record'
            disablePage
            onRequest={this.handlePageChange}
            ref={(pagination) => {
              this.pagination = pagination
            }}
          >
            <SelectTable
              data={store.outRecordList.slice()}
              keyField='id'
              isSelectorDisable={(original) => original.status !== 1} // 待借出 才能勾选
              selected={selectedRecord.slice()}
              onSelect={(selected) => store.handleSelect(selected)}
              onSelectAll={(all) => store.handleSelectAllRecord(all)}
              selectAllTip={i18next.t('已选中所有待借出条目')}
              batchActionBar={
                !!selectedRecord.length && (
                  <TableUtil.BatchActionBar
                    onClose={this.handleClose}
                    isSelectAll={selectAll}
                    toggleSelectAll={(bool) =>
                      store.handleChangeSelectAllType(bool)
                    }
                    count={selectAll ? null : selectedRecord.length}
                    batchActions={[
                      {
                        name: t('批量借出'),
                        onClick: store.handleBatchOut,
                        type: 'business',
                        show: Permission.has('edit_turnover_return_sheet'),
                      },
                    ]}
                  />
                )
              }
              columns={[
                {
                  Header: i18next.t('商户 ID'),
                  accessor: 'sid',
                },
                {
                  Header: i18next.t('商户名'),
                  accessor: 'sname',
                },
                {
                  Header: i18next.t('出库时间'),
                  id: 'finish_time',
                  accessor: (d) => {
                    return (
                      <span>{emptyRender(d.finish_time, formatDateTime)}</span>
                    )
                  },
                },
                {
                  Header: i18next.t('关联出库单'),
                  id: 'out_stock_sheet_id',
                  Cell: ({ original, index }) => {
                    return original._edit && !original.is_sync_by_order ? (
                      <input
                        className='form-control'
                        type='text'
                        value={original._out_stock_sheet_id}
                        onChange={(e) =>
                          store.changeInnerStatus(
                            {
                              _out_stock_sheet_id: e.target.value,
                            },
                            index,
                          )
                        }
                      />
                    ) : (
                      <span>{original.out_stock_sheet_id}</span>
                    )
                  },
                },
                {
                  Header: i18next.t('周转物名称'),
                  accessor: 'tname',
                },
                {
                  Header: i18next.t('预借出数'),
                  accessor: 'apply_amount',
                },
                {
                  Header: i18next.t('借出数'),
                  id: ' amount',
                  Cell: ({ original, index }) => (
                    <Flex alignCenter>
                      {original._edit ? (
                        <InputNumberV2
                          min={0}
                          max={999999999.99}
                          className='form-control'
                          precision={0}
                          value={original._amount}
                          onChange={(v) => {
                            store.changeInnerStatus({ _amount: v }, index)
                          }}
                        />
                      ) : (
                        <span>{original.amount}</span>
                      )}
                      {original.unit_name}
                    </Flex>
                  ),
                },
                {
                  Header: i18next.t('借出类型'),
                  accessor: 'loan_type',
                  Cell: (cellProps) => {
                    const { loan_type } = cellProps.original
                    let typeName = '-'

                    switch (loan_type) {
                      case 1:
                        typeName = t('业务平台')
                        break
                      case 2:
                        typeName = t('分拣')
                        break
                      case 3:
                        typeName = t('司机')
                        break
                    }

                    return typeName
                  },
                },
                {
                  Header: i18next.t('借出人'),
                  accessor: 'operator',
                },
                {
                  Header: i18next.t('状态'),
                  id: 'status',
                  Cell: (row) => {
                    const { index, original } = row
                    const curStatusId = original.status
                    const curStatus = getStatus(curStatusId)
                    return (
                      <Flex>
                        {original._edit ? (
                          <Select
                            data={validStatusList}
                            value={original._status}
                            onChange={(v) => {
                              store.changeInnerStatus({ _status: v }, index)
                            }}
                          />
                        ) : (
                          <span>{curStatus.text}</span>
                        )}
                      </Flex>
                    )
                  },
                },
                {
                  Header: (
                    <div>
                      {i18next.t('司机')}
                      <Popover
                        top
                        center
                        showArrow
                        component={<div />}
                        type='hover'
                        popup={
                          <div
                            style={{ width: '260px' }}
                            className='gm-margin-5'
                          >
                            {i18next.t(
                              '1.如借出条目基于订单生成，该订单分配司机时会相应同步，无需手动选择司机;',
                            )}
                            <br />
                            {i18next.t(
                              '2.如手动新建的借出条目则无法同步，需手动选择司机',
                            )}
                          </div>
                        }
                      >
                        <i
                          className='xfont xfont-warning-circle'
                          style={{ marginRight: '2px' }}
                        />
                      </Popover>
                    </div>
                  ),
                  id: 'driver_id',
                  Cell: (row) => {
                    const { index, original } = row
                    const selected = []
                    // 之前的key似乎没用
                    // let key = joinKey(original.status, original.id)
                    // key = joinKey(key, curDriver.value)
                    const curDriver = getDriver(original._driver_id)
                    if (curDriver) {
                      selected.push(curDriver.carrier_id, curDriver.value)
                      // 订单同步过来的司机 修改要提示
                      // const showWarning = canEdit(original) && original.is_sync_by_order && original.driver_name
                    }
                    return (
                      <Flex>
                        {original._edit ? (
                          <DriverSelect
                            selected={selected}
                            onSelect={(v) => {
                              const value = v[1] || ''
                              store.changeInnerStatus(
                                { _driver_id: value },
                                index,
                              )
                            }}
                          />
                        ) : (
                          <span>{emptyRender(original.driver_name)}</span>
                        )}
                      </Flex>
                    )
                  },
                },
                {
                  Header: TableUtil.OperationHeader,
                  Cell: ({ original, index }) => {
                    // 已删除不显示
                    if (original.status === 3) {
                      return null
                    }
                    return (
                      <TableUtil.OperationCell>
                        <TableAction
                          canEdit={canEdit(original)}
                          original={original}
                          index={index}
                          status={original.status}
                          onEdit={() => store.toggleEditable(index)}
                          onCancel={() => store.toggleEditable(index)}
                          onDelete={this.handleDelete.bind(this, index)}
                          onSave={() => {
                            store.handleOutRecordListChange(index)
                          }}
                        />
                      </TableUtil.OperationCell>
                    )
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

export default OutRecord
