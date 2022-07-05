import { i18next, t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { BoxTable, Tip, Flex, InputNumberV2, Select, Button } from '@gmfe/react'
import { history } from 'common/service'
import { ManagePaginationV2 } from '@gmfe/business'
import store from './store'
import SearchFilter from '../search_filter'
import { Table, TableUtil } from '@gmfe/table'
import { emptyRender, formatDateTime } from '../../util'
import DriverSelect from '../../components/driver_select'
import commonStore from '../../store'

import TableAction from '../table_action'

import Permission from '../../../common/components/permission'

@observer
class InRecord extends React.Component {
  componentDidMount() {
    commonStore.fetchList()
    store.setPagination(this.pagination)
    store.handleSearch()
  }

  handleCreate = () => {
    history.push('/supply_chain/material_manage/record/in_record/create')
  }

  handleDelete = (index) => {
    store.handleDelete(index).then(() => {
      Tip.success(i18next.t('删除成功'))
    })
  }

  render() {
    // 待归还才能编辑
    const canEdit = (original) =>
      original.status === 1 && Permission.has('edit_turnover_loan_sheet')
    const { getStatus, validStatusList } = store
    const { getDriver } = commonStore

    return (
      <div>
        <SearchFilter store={store} />
        <BoxTable
          action={
            <Permission field='add_turnover_loan_sheet'>
              <Button type='primary' onClick={this.handleCreate}>
                {i18next.t('周转物归还')}
              </Button>
            </Permission>
          }
        >
          <ManagePaginationV2
            id='pagination_in_material_manage_in_record'
            disablePage
            onRequest={store.fetchInRecordList}
            ref={(pagination) => {
              this.pagination = pagination
            }}
          >
            <div>
              <Table
                data={store.inRecordList.slice()}
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
                    Header: i18next.t('归还时间'),
                    id: 'finish_time',
                    accessor: (d) => {
                      return (
                        <span>
                          {emptyRender(d.finish_time, formatDateTime)}
                        </span>
                      )
                    },
                  },
                  {
                    Header: i18next.t('周转物名称'),
                    accessor: 'tname',
                  },
                  {
                    Header: i18next.t('申请归还数'),
                    accessor: 'apply_amount',
                  },
                  {
                    Header: i18next.t('实际归还数'),
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
                    Header: i18next.t('归还类型'),
                    accessor: 'return_type',
                    Cell: (cellProps) => {
                      const { return_type } = cellProps.original
                      let typeName = '-'

                      switch (return_type) {
                        case 1:
                          typeName = t('业务平台')
                          break
                        case 2:
                          typeName = t('司机')
                          break
                      }

                      return typeName
                    },
                  },
                  {
                    Header: i18next.t('归还人'),
                    accessor: 'operator',
                  },
                  {
                    Header: i18next.t('状态'),
                    id: 'status',
                    Cell: ({ index, original }) => {
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
                    Header: i18next.t('司机'),
                    id: 'driver_id',
                    Cell: ({ index, original }) => {
                      const selected = []
                      const curDriver = getDriver(original._driver_id)
                      if (curDriver) {
                        selected.push(curDriver.carrier_id, curDriver.value)
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
                    Cell: (row) => {
                      const { original, index } = row
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
                            onEdit={() => store.toggleEditable(row.index)}
                            onCancel={() => store.toggleEditable(row.index)}
                            onDelete={this.handleDelete.bind(this, row.index)}
                            onSave={() => {
                              store.handleInRecordListChange(row.index)
                            }}
                          />
                        </TableUtil.OperationCell>
                      )
                    },
                  },
                ]}
              />
              <div className='gm-margin-bottom-5' />
            </div>
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

export default InRecord
