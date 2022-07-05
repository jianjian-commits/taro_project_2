import React from 'react'
import { observer } from 'mobx-react'
import {
  fixedColumnsTableXHOC,
  TableXUtil,
  TableX,
  editTableXHOC,
} from '@gmfe/table-x'

import { Flex } from '@gmfe/react'
import store from '../store/receipt_store'
import { i18next } from 'gm-i18n'
const { OperationHeader, EditOperation, TABLE_X } = TableXUtil

const FixedEditTableX = fixedColumnsTableXHOC(editTableXHOC(TableX))

const ParamsDesc = observer(({ index }) => {
  const { param_name } = store.fieldParamsList[index]

  const handleInputChange = (event) => {
    const changeData = {}
    changeData[event.target.name] = event.target.value

    store.changeParamsListItem(index, changeData)
  }

  return (
    <Flex justifyCenter>
      <textarea
        name='param_name'
        value={param_name}
        onChange={handleInputChange}
        style={{ width: '500px' }}
      />
    </Flex>
  )
})

const ParamsTable = observer(() => {
  const { fieldParamsList } = store

  const handleAddParamsItem = () => {
    store.addParamsItem()
  }

  const handleDeleteParamsItem = (index) => {
    store.deleteParamsItem(index)
  }
  return (
    <FixedEditTableX
      id='details'
      onAddRow={handleAddParamsItem}
      data={fieldParamsList.slice()}
      columns={[
        {
          Header: i18next.t('序号'),
          accessor: 'num',
          width: TABLE_X.WIDTH_NO,
          fixed: 'left',
          Cell: ({ row: { index } }) => {
            return index + 1
          },
        },
        {
          Header: OperationHeader,
          accessor: 'operation',
          width: TABLE_X.WIDTH_OPERATION,
          fixed: 'left',
          // eslint-disable-next-line react/prop-types
          Cell: ({ row: { index } }) => {
            return (
              <EditOperation
                onAddRow={handleAddParamsItem}
                onDeleteRow={
                  fieldParamsList.length === 1
                    ? undefined
                    : () => handleDeleteParamsItem(index)
                }
              />
            )
          },
        },
        {
          Header: <Flex justifyCenter>{i18next.t('参数描述')}</Flex>,
          accessor: 'params_desc',
          minWidth: 300,
          isKeyboard: true,
          // eslint-disable-next-line react/prop-types
          Cell: ({ row: { index } }) => {
            return <ParamsDesc index={index} />
          },
        },
      ]}
    />
  )
})

export default ParamsTable
