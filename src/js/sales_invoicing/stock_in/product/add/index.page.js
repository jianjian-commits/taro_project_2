import { i18next } from 'gm-i18n'
import React, { useEffect } from 'react'
import store from './store'
import { observer } from 'mobx-react'
import { WithBreadCrumbs } from 'common/service'
import HeaderDetail from './header_detail'
import ItemDetail from './item_detail'
import DetailWarning from './components/detail_warning'

const AddProductStockIn = (props) => {
  const {
    location: {
      query: { id },
    },
  } = props
  useEffect(() => {
    store.initPage()
    fetchData()
  }, [id])

  const { status } = store

  const fetchData = async () => {
    await store.fetchStockInShelfList()
    if (id) store.fetchDetail(id)
  }

  return (
    <>
      <WithBreadCrumbs breadcrumbs={[i18next.t('新建入库单')]} />
      <HeaderDetail />
      {status === 'detail' && <DetailWarning />}
      <ItemDetail />
    </>
  )
}

export default observer(AddProductStockIn)
