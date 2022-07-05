import { i18next, t } from 'gm-i18n'
import { Price } from '@gmfe/react'
import _ from 'lodash'
import React, { useRef, useEffect, useMemo } from 'react'

const getCategoryHeader = (list) => {
  if (list.length === 0) {
    return []
  }
  const tableHeaders = []
  const categories = new Set()
  const addHeader = (category1_name) => {
    tableHeaders.push({
      minWidth: 100,
      Header: category1_name === null ? '-' : category1_name,
      id: category1_name === null ? '-' : category1_name,
      diyGroupName: i18next.t('基础字段'),
      // eslint-disable-next-line react/prop-types
      Cell: ({ row }) => {
        const {
          // eslint-disable-next-line react/prop-types
          original: { category1_details },
        } = row
        // 当前行存在分类 展示价格
        const detail = _.find(category1_details, (detail) => {
          return detail.category1_name === category1_name
        })
        if (!detail) {
          return '-'
        }
        return (
          <span>
            {detail?.money} {Price.getUnit()}
          </span>
        )
      },
    })
  }

  for (const row of list) {
    const { category1_details } = row
    category1_details.forEach(({ category1_name }) => {
      if (!categories.has(category1_name)) {
        categories.add(category1_name)
        addHeader(category1_name)
      }
    })
  }

  return tableHeaders
}

const useStore = (Store) => {
  const { current: store } = useRef(new Store())
  const paginationRef = useRef()
  useEffect(() => {
    store.setPagination(paginationRef.current)
    store.handleSearch()
  }, [])
  return {
    store,
    paginationRef,
  }
}

const useTableTextData = (store, flag) => {
  return useMemo(() => {
    const { spu_cnt, total_money /* data_num */ } = store.amount
    return [
      // {
      //   label: t('总数'),
      //   content: data_num
      // },
      {
        label: t('商品种数'),
        content: spu_cnt,
      },
      {
        label: flag ? t('入库总金额') : t('出库总金额'),
        content: Price.getCurrency() + total_money,
      },
    ]
  }, [flag, store.amount])
}

export { getCategoryHeader, useStore, useTableTextData }
