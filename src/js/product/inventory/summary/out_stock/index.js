import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { BoxTable } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import { Store } from './store'
import SearchFilter from './search_filter'
import { TableX, diyTableXHOC } from '@gmfe/table-x'
import DimSelector from '../../../../common/components/dim_selector'
import TableTotalText from 'common/components/table_total_text'
import getColumns from './columns'
import { useStore, useTableTextData } from '../common/util'

const DiyTableX = diyTableXHOC(TableX)

const InStock = observer(() => {
  const { paginationRef, store } = useStore(Store)
  const totalTextData = useTableTextData(store)

  const { handleViewTypeChange, selectedViewType, viewTypes } = store

  const handlePageChange = (pagination) => {
    return store.fetchList(pagination)
  }

  return (
    <div>
      <SearchFilter store={store} />
      <BoxTable
        icon='bill'
        info={<TableTotalText data={totalTextData} />}
        title={i18next.t('明细') + ':' + store.amount.data_cnt}
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
          id='pagination_in_product_out_stock_summary_list'
          disablePage
          onRequest={handlePageChange}
          ref={paginationRef}
        >
          <div>
            <DiyTableX
              diyGroupSorting={[i18next.t('基础字段')]}
              id='out_stock'
              loading={store.listLoading}
              data={store.list.slice()}
              columns={getColumns(store)}
            />
            <div className='gm-margin-bottom-5' />
          </div>
        </ManagePagination>
      </BoxTable>
    </div>
  )
})

export default InStock
