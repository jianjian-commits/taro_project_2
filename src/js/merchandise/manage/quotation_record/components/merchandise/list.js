import React, { useEffect, useRef } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable, Flex, ToolTip, Price } from '@gmfe/react'
import { TableUtil, Table } from '@gmfe/table'
import { ManagePagination } from '@gmfe/business'
import qs from 'query-string'
import Big from 'big.js'

import ListImg from '../../../component/list_img'
import globalStore from 'stores/global'
import FloatTip from 'common/components/float_tip'
import TableTotalText from 'common/components/table_total_text'
import { merchandiseStore as store } from '../../store'

const {
  OperationDetail,
  OperationCell,
  OperationHeader,
  SortHeader,
} = TableUtil

const MerchandiseList = observer(() => {
  const refPagination = useRef()

  useEffect(() => {
    store.setMerchandiseDoFirstRequest(refPagination.current.apiDoFirstRequest)
    refPagination.current.apiDoFirstRequest()
    return () => store.initMerchandise()
  }, [])

  const handleSort = (name) => {
    Promise.resolve(store.sortMerchandise(name)).then(() => {
      store.doMerchandiseFirstRequest()
    })
  }

  const handlePageChange = (page) => {
    return store.getMerchandiseList(page)
  }

  const handleGotoDetail = (data) => {
    const { sku_id, sku_name } = data
    // 新开页面
    window.open(
      `#/merchandise/manage/quotation_record/detail?${qs.stringify({
        sku_id,
        start_time: store.merchandise_filter.begin,
        end_time: store.merchandise_filter.end,
        sku_name: sku_name,
      })}`,
    )
  }

  const { list, pagination, sort_direction, sort_by } = store.merchandise

  return (
    <BoxTable
      info={
        <BoxTable.Info>
          <TableTotalText
            data={[
              {
                label: t('商品总数'),
                content: pagination.count,
              },
            ]}
          />
        </BoxTable.Info>
      }
    >
      <ManagePagination
        onRequest={handlePageChange}
        ref={refPagination}
        id='pagination_in_merchandise_quotation_record_list'
      >
        <Table
          data={list.slice()}
          columns={[
            {
              Header: (
                <Flex alignCenter>
                  {t('商品图片')}
                  <ToolTip
                    popup={
                      <div className='gm-padding-5' style={{ width: '150px' }}>
                        {t(
                          '规格图片未设置则显示商品图片，规格和商品都无图时不显示图片',
                        )}
                      </div>
                    }
                  />
                </Flex>
              ),
              accessor: 'image',
              Cell: (data) => (
                <ListImg
                  imgSrc={data.original.sku_image || data.original.spu_image}
                />
              ),
            },
            {
              Header: (
                <SortHeader
                  onClick={handleSort.bind(this, 'spu')}
                  type={sort_by === 'spu' ? sort_direction : null}
                >
                  {t('商品名')}
                </SortHeader>
              ),
              accessor: 'spu_id',
              Cell: (data) => (
                <>
                  <div style={{ marginRight: '2px' }}>
                    {data.original.spu_name}
                  </div>
                  <div>{data.original.spu_id}</div>
                </>
              ),
            },
            {
              Header: (
                <SortHeader
                  onClick={handleSort.bind(this, 'sku')}
                  type={sort_by === 'sku' ? sort_direction : null}
                >
                  {t('规格名')}
                </SortHeader>
              ),
              id: 'sku_id',
              Cell: (data) => (
                <>
                  <div style={{ marginRight: '2px' }}>
                    {data.original.sku_name}
                  </div>
                  <FloatTip
                    skuId={data.original.sku_id}
                    tip={data.original.outer_id}
                    showCustomer={globalStore.otherInfo.showSkuOuterId}
                  />
                </>
              ),
            },
            {
              Header: (
                <SortHeader
                  onClick={handleSort.bind(this, 'category1')}
                  type={sort_by === 'category1' ? sort_direction : null}
                >
                  {t('分类')}
                </SortHeader>
              ),
              id: 'category_name_1',
              accessor: (d) =>
                d.category_name_1 +
                '/' +
                d.category_name_2 +
                '/' +
                d.pinlei_name,
            },
            {
              Header: t('报价单'),
              accessor: 'salemeun_name',
            },
            {
              Header: t('最高销售单价'),
              Cell: ({
                original: {
                  max_std_sale_price_forsale,
                  latest_std_unit_name_forsale,
                  latest_fee_type,
                },
              }) => {
                return max_std_sale_price_forsale
                  ? `${Big(max_std_sale_price_forsale)
                      .div(100)
                      .toFixed(2)}${Price.getUnit(
                      latest_fee_type,
                    )}/${latest_std_unit_name_forsale}`
                  : '-'
              },
            },
            {
              Header: t('最低销售单价'),
              Cell: ({
                original: {
                  min_std_sale_price_forsale,
                  latest_std_unit_name_forsale,
                  latest_fee_type,
                },
              }) => {
                return min_std_sale_price_forsale
                  ? `${Big(min_std_sale_price_forsale)
                      .div(100)
                      .toFixed(2)}${Price.getUnit(
                      latest_fee_type,
                    )}/${latest_std_unit_name_forsale}`
                  : '-'
              },
            },
            {
              Header: OperationHeader,
              Cell: (data) => (
                <OperationCell>
                  <OperationDetail
                    onClick={handleGotoDetail.bind(this, data.original)}
                  />
                </OperationCell>
              ),
            },
          ]}
        />
      </ManagePagination>
    </BoxTable>
  )
})

export default MerchandiseList
