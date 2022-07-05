import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { BoxTable } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'

import { Store } from './store'
import SearchFilter from './search_filter'
import { TableX, diyTableXHOC } from '@gmfe/table-x'
import TableTotalText from 'common/components/table_total_text'
import DimSelector from 'common/components/dim_selector'
import getColumns from './columns'
import { useStore, useTableTextData } from '../common/util'

const DiyTableX = diyTableXHOC(TableX)

const InStock = observer(() => {
  const { paginationRef, store } = useStore(Store)
  const tableTextData2 = useTableTextData(store, InStock)

  const { handleViewTypeChange, selectedViewType, viewTypes } = store

  const handlePageChange = (pagination) => {
    return store.fetchList(pagination)
  }

  return (
    <div>
      <SearchFilter store={store} />
      <BoxTable
        icon='bill'
        title={i18next.t('明细') + '：' + store.amount.data_cnt}
        info={<TableTotalText data={tableTextData2} />}
        action={
          <DimSelector
            name={i18next.t('查看方式')}
            selected={selectedViewType}
            data={viewTypes.slice()}
            onChange={handleViewTypeChange}
          />
        }
      >
        <ManagePagination
          id='pagination_in_product_in_stock_summary_list'
          // disablePage
          onRequest={handlePageChange}
          ref={paginationRef}
        >
          <DiyTableX
            id='in_stock'
            diyGroupSorting={[i18next.t('基础字段')]}
            loading={store.listLoading}
            data={store.list.slice()}
            columns={getColumns(store)}
          />
        </ManagePagination>
      </BoxTable>
    </div>
  )
})

export default InStock
