import React from 'react'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import { BoxTable, Button, Flex, Modal } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX } from '@gmfe/table-x'

import { history } from 'common/service'
import BatchImportTechnology from './batch_import_technology'

import store from '../store/list_store'

const TableRight = observer(() => {
  const handleNewTechnology = () => {
    history.push(
      '/supply_chain/process/basic_info/technology_management/create'
    )
  }

  const handleBatchImportTechnology = () => {
    Modal.render({
      title: i18next.t('批量导入工艺'),
      children: <BatchImportTechnology />,
      onHide: Modal.hide,
    })
  }

  return (
    <Flex>
      <Button type='primary' onClick={handleBatchImportTechnology}>
        {i18next.t('批量导入工艺')}
      </Button>
      <div className='gm-gap-10' />
      <Button type='primary' plain onClick={handleNewTechnology}>
        {i18next.t('新建工艺')}
      </Button>
    </Flex>
  )
})

const TechnologyListTable = observer(() => {
  const { pagination, list } = store

  const handleChangePage = async (pagination) => {
    const { data } = await store.fetchTechnologyList(pagination)
    return data
  }

  return (
    <BoxTable action={<TableRight />}>
      <ManagePaginationV2
        onRequest={handleChangePage}
        ref={pagination}
        id='technology-list'
      >
        <TableX
          data={list.slice()}
          columns={[
            {
              Header: i18next.t('工艺编号'),
              accessor: 'custom_id',
              Cell: (cellProps) => {
                const {
                  original: { custom_id, id },
                } = cellProps.row
                return (
                  <a
                    href={`#/supply_chain/process/basic_info/technology_management/edit?id=${id}`}
                  >
                    {custom_id}
                  </a>
                )
              },
            },
            { Header: i18next.t('工艺名称'), accessor: 'name' },
            {
              Header: i18next.t('工艺类型'),
              accessor: 'technic_category_name',
            },
          ]}
        />
      </ManagePaginationV2>
    </BoxTable>
  )
})

export default TechnologyListTable
