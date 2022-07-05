import React, { useMemo } from 'react'
import { BoxTable } from '@gmfe/react'
import { TableXVirtualized, TableXUtil } from '@gmfe/table-x'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'

import store from './store'
import HeaderTip from 'common/components/header_tip'
import TableTotalText from 'common/components/table_total_text'
import Category from './components/category'
import Images from './components/images'

const { OperationHeader, OperationDelete, TABLE_X } = TableXUtil

const List = observer(() => {
  const { listWithFilter } = store

  const handleDelete = (index) => {
    store.deleteItem(index)
  }

  const columns = useMemo(
    () => [
      {
        Header: (
          <HeaderTip
            title={t('商品图片')}
            tip={t(
              '点击图片可以通过云图库智能推荐或上传本地图片快捷修改商品主图'
            )}
          />
        ),
        accessor: 'images',
        Cell: (cellProps) => <Images row={cellProps.row} />,
      },
      {
        Header: t('商品名称'),
        accessor: 'name',
      },
      {
        Header: t('分类'),
        accessor: 'category_id_1',
        Cell: (cellProps) => <Category row={cellProps.row} />,
      },
      {
        Header: <OperationHeader />,
        accessor: 'operation',
        width: TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => {
          const { index } = cellProps.row
          return (
            <div className='gm-text-center'>
              <OperationDelete
                title='删除'
                onClick={handleDelete.bind(this, index)}
              >
                {t('是否确认删除此图片')}
              </OperationDelete>
            </div>
          )
        },
      },
    ],
    []
  )

  const limit = 10
  const len = listWithFilter.length
  const tableHeight = TABLE_X.HEIGHT_HEAD_TR + limit * TABLE_X.HEIGHT_TR

  return (
    <BoxTable
      info={
        <BoxTable.Info>
          <TableTotalText data={[{ label: t('商品列表'), content: len }]} />
        </BoxTable.Info>
      }
    >
      <TableXVirtualized
        data={listWithFilter.slice()}
        columns={columns}
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        virtualizedHeight={tableHeight}
        id='match_images_table'
      />
    </BoxTable>
  )
})

export default List
