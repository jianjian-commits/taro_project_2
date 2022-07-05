import React from 'react'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import store from '../../stores/goods_detail'
import { MoreSelect } from '@gmfe/react'
import { observer } from 'mobx-react'

const ShopSelectSearch = (props) => {
  const {
    filter: { searchText },
    shopList,
  } = store
  const onSelect = (value) => {
    store.setFilter({ searchText: value ? value.value : '' })
  }
  const shopText = shopList.find((item) => item.value === searchText)
  return (
    <Flex alignCenter='center' justifyBetween>
      <span>商品名</span>
      <div style={{ width: '300px' }}>
        <MoreSelect
          selected={shopText}
          onSelect={onSelect}
          data={store.shopList}
          placeholder={t('选择商品名')}
        />
      </div>
    </Flex>
  )
}

export default observer(ShopSelectSearch)
