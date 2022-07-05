import React from 'react'
import { observer } from 'mobx-react'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { Flex } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import store from '../store/batch_import_store'
import TechnologyInputCell from './technology_input_cell'
import TechnologySelectCell from './technology_select_cell'

const { OperationHeader } = TableXUtil

const OperateCell = observer((props) => {
  const { index } = props
  const handleDel = () => {
    store.deleteTechnologyItem(index)
  }
  return (
    <Flex justifyCenter className='gm-padding-lr-5' onClick={handleDel}>
      <i className='xfont xfont-delete' />
    </Flex>
  )
})

const BatchImportTable = observer((props) => {
  const { sortedTechnologySheetList } = store

  return (
    <TableX
      data={sortedTechnologySheetList.slice()}
      columns={[
        {
          Header: (
            <Flex style={{ width: '100%' }}>
              <span style={{ color: 'red' }}>*</span>
              {i18next.t('工艺名称')}
            </Flex>
          ),
          accessor: 'name',
          minWidth: 220,
          Cell: (cellProps) => {
            return (
              <TechnologyInputCell
                index={cellProps.row.index}
                fieldName='name'
              />
            )
          },
        },
        {
          Header: (
            <Flex style={{ width: '100%' }}>
              <span style={{ color: 'red' }}>*</span>
              {i18next.t('工艺编号')}
            </Flex>
          ),
          accessor: 'custom_id',
          minWidth: 220,
          Cell: (cellProps) => {
            return (
              <TechnologyInputCell
                index={cellProps.row.index}
                fieldName='custom_id'
              />
            )
          },
        },
        {
          Header: i18next.t('工艺描述'),
          accessor: 'desc',
          minWidth: 220,
          Cell: (cellProps) => {
            return (
              <TechnologyInputCell
                index={cellProps.row.index}
                fieldName='desc'
              />
            )
          },
        },
        {
          Header: i18next.t('自定义字段名称'),
          accessor: 'col_name',
          minWidth: 220,
          Cell: (cellProps) => {
            return (
              <TechnologyInputCell
                index={cellProps.row.index}
                fieldName='col_name'
              />
            )
          },
        },
        {
          Header: i18next.t('字段属性设置'),
          accessor: 'col_type',
          minWidth: 220,
          Cell: (cellProps) => {
            return (
              <TechnologySelectCell
                index={cellProps.row.index}
                fieldName='col_type'
              />
            )
          },
        },
        {
          Header: i18next.t('自定义字段参数描述'),
          accessor: 'params',
          minWidth: 220,
          Cell: (cellProps) => {
            return (
              <TechnologyInputCell
                index={cellProps.row.index}
                fieldName='params'
              />
            )
          },
        },
        {
          Header: OperationHeader,
          accessor: 'operate',
          minWidth: 80,
          Cell: (cellProps) => {
            return <OperateCell index={cellProps.row.index} />
          },
        },
      ]}
    />
  )
})

export default BatchImportTable
