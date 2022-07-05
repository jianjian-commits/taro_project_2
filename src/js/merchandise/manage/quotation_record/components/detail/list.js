import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable, Price } from '@gmfe/react'
import Big from 'big.js'
import { TableXUtil, TableXVirtualized } from '@gmfe/table-x'

import FloatTip from 'common/components/float_tip'
import globalStore from 'stores/global'
import TableTotalText from 'common/components/table_total_text'
import { detailStore as store } from '../../store'

const { TABLE_X } = TableXUtil

const DetailList = observer(() => {
  const { list } = store.detail
  const limit = 10
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR + Math.min(limit, list.length) * TABLE_X.HEIGHT_TR

  return (
    <BoxTable
      headerProps={{ className: 'gm-bg-white' }}
      info={
        <BoxTable.Info>
          <TableTotalText
            data={[
              {
                label: t('明细数'),
                content: list.length,
              },
            ]}
          />
        </BoxTable.Info>
      }
    >
      <TableXVirtualized
        data={list.slice()}
        id='manage_quotation_detail_table'
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        virtualizedHeight={tableHeight}
        columns={[
          {
            Header: t('日期'),
            width: 200,
            accessor: (origin) => {
              const { modify_time, next_modify_time } = origin
              return `${modify_time}~${next_modify_time}`
            },
          },
          {
            Header: t('商品名'),
            accessor: (origin) => {
              const { spu_id, spu_name } = origin
              return spu_id ? (
                <>
                  <div style={{ marginRight: '2px' }}>{spu_name}</div>
                  <div>{spu_id}</div>
                </>
              ) : (
                '-'
              )
            },
          },
          {
            Header: t('规格名'),
            accessor: (origin) => {
              const { name, sku_id, outer_id } = origin
              return name ? (
                <>
                  <div style={{ marginRight: '2px' }}>{name}</div>
                  <FloatTip
                    skuId={sku_id}
                    tip={outer_id}
                    showCustomer={globalStore.otherInfo.showSkuOuterId}
                  />
                </>
              ) : (
                '-'
              )
            },
          },
          {
            Header: t('分类'),
            id: 'category_name_1',
            accessor: (origin) => {
              const { category_name_1, category_name_2, pinlei_name } = origin
              return category_name_1
                ? category_name_1 + '/' + category_name_2 + '/' + pinlei_name
                : '-'
            },
          },
          {
            Header: t('销售单价'),
            id: 'std_sale_price_forsale',
            accessor: (origin) => {
              const {
                std_sale_price_forsale,
                std_unit_name_forsale,
                fee_type,
              } = origin
              return std_sale_price_forsale
                ? `${Big(std_sale_price_forsale)
                    .div(100)
                    .toFixed(2)}${Price.getUnit(
                    fee_type,
                  )}/${std_unit_name_forsale}`
                : '-'
            },
          },
          {
            Header: t('销售规格'),
            id: 'sale_unit_name',
            accessor: (origin) => {
              const {
                sale_ratio,
                sku_id,
                sale_unit_name,
                std_unit_name_forsale,
              } = origin
              return sku_id
                ? `${sale_ratio}${std_unit_name_forsale}/${sale_unit_name}`
                : '-'
            },
          },
          {
            Header: t('销售价'),
            id: 'sale_price',
            accessor: (origin) => {
              const {
                sale_price,
                sale_unit_name,
                fee_type,
                is_price_timing,
              } = origin
              const price = sale_price
                ? `${Big(sale_price).div(100).toFixed(2)}${Price.getUnit(
                    fee_type,
                  )}/${sale_unit_name}`
                : '-'
              return is_price_timing ? t('时价') : price
            },
          },
        ]}
      />
    </BoxTable>
  )
})

export default DetailList
