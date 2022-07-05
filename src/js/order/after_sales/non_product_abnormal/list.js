import React from 'react'
import { observer, Observer } from 'mobx-react'
import {
  BoxPanel,
  Select,
  Flex,
  InputNumberV2,
  RecommendInput,
} from '@gmfe/react'
import { editTableXHOC, TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import store from './store'
import MoneySummary from './money_summary'
import WarningText from './warning_text'
import ValidateCom from 'common/components/validate_com'

const { TABLE_X, OperationHeader, EditOperation } = TableXUtil

const EditTableX = editTableXHOC(TableX)

const List = observer(() => {
  const {
    list,
    nonProductExceptionReasonList,
    nonProductExceptionSolutionList,
  } = store

  const handleChange = (value, key, index) => {
    store.setValue(value, key, index)
  }

  const handleAddItem = (index) => {
    store.add(index)
  }

  const handleDeleteItem = (index) => {
    store.delete(index)
  }

  return (
    <div>
      <WarningText />
      <BoxPanel title={t('非商品异常')} collapse summary={<MoneySummary />}>
        <EditTableX
          data={list.slice()}
          columns={[
            {
              Header: t('序号'),
              id: 'index',
              fixed: 'left',
              width: TABLE_X.WIDTH_NO,
              Cell: ({ row }) => row.index + 1,
            },
            {
              Header: () => <OperationHeader />,
              id: 'operation',
              fixed: 'left',
              width: TABLE_X.WIDTH_OPERATION,
              Cell: (cellProps) => (
                <Observer>
                  {() => {
                    const { row } = cellProps
                    return (
                      <EditOperation
                        onAddRow={() => handleAddItem(row.index)}
                        onDeleteRow={() => handleDeleteItem(row.index)}
                      />
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: t('异常原因'),
              accessor: 'exception_reason_text',
              width: 180,
              Cell: (cellProps) => (
                <Observer>
                  {() => {
                    const {
                      exception_reason_text,
                      reasonError,
                    } = cellProps.row.original
                    return (
                      <Flex row alignCenter>
                        <ValidateCom isInvalid={reasonError}>
                          <RecommendInput
                            data={nonProductExceptionReasonList.slice()}
                            value={exception_reason_text}
                            onChange={(selected) =>
                              handleChange(
                                selected,
                                'exception_reason_text',
                                cellProps.row.index,
                              )
                            }
                          />
                        </ValidateCom>
                      </Flex>
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: t('责任部门'),
              accessor: 'department_blame_name',
              Cell: (cellProps) => (
                <Observer>
                  {() => {
                    const { row } = cellProps
                    return (
                      <input
                        className='form-control'
                        value={row.original.department_blame_name}
                        onChange={(e) =>
                          handleChange(
                            e.target.value,
                            'department_blame_name',
                            row.index,
                          )
                        }
                      />
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: t('跟进部门'),
              accessor: 'department_to_name',
              Cell: (cellProps) => (
                <Observer>
                  {() => {
                    const { row } = cellProps
                    return (
                      <input
                        className='form-control'
                        value={row.original.department_to_name}
                        onChange={(e) =>
                          handleChange(
                            e.target.value,
                            'department_to_name',
                            row.index,
                          )
                        }
                      />
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: t('处理方式'),
              accessor: 'solution',
              width: 180,
              Cell: (cellProps) => (
                <Observer>
                  {() => {
                    const { row, solutionError } = cellProps
                    return (
                      <ValidateCom isInvalid={solutionError}>
                        <Select
                          data={nonProductExceptionSolutionList.slice()}
                          value={String(row.original.solution)}
                          onChange={(value) =>
                            handleChange(value, 'solution', row.index)
                          }
                        />
                      </ValidateCom>
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: t('责任站点'),
              accessor: (d) => {
                return (
                  <Observer>
                    {() => {
                      return d.station_blame_name || t('无')
                    }}
                  </Observer>
                )
              },
            },
            {
              Header: t('跟进站点'),
              accessor: (d) => {
                return (
                  <Observer>
                    {() => {
                      return d.station_to_name || t('无')
                    }}
                  </Observer>
                )
              },
            },
            {
              Header: t('金额变动'),
              accessor: 'money_delta',
              Cell: (cellProps) => (
                <Observer>
                  {() => {
                    const { row } = cellProps
                    return (
                      <Flex alignCenter>
                        <InputNumberV2
                          precision={2}
                          value={row.original.money_delta}
                          onChange={(value) =>
                            handleChange(value, 'money_delta', row.index)
                          }
                        />
                        <span className='gm-margin-left-5'>{t('元')}</span>
                      </Flex>
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: t('描述'),
              accessor: 'text',
              Cell: (cellProps) => (
                <Observer>
                  {() => {
                    const { row } = cellProps
                    return (
                      <input
                        className='form-control'
                        value={row.original.text}
                        onChange={(e) =>
                          handleChange(e.target.value, 'text', row.index)
                        }
                      />
                    )
                  }}
                </Observer>
              ),
            },
          ]}
        />
      </BoxPanel>
    </div>
  )
})

export default List
