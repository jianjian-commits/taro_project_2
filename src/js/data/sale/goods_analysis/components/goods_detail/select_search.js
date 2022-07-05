import React, { useEffect } from 'react'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import store from '../../stores/goods_detail'
import { MoreSelect } from '@gmfe/react'
import { observer } from 'mobx-react'

const SelectSearch = (props) => {
  useEffect(() => {
    store.getQuotationList()
    store.getShopList()
  }, [])

  const onSelect = (value) => {
    store.setFilter({ salemenu_id: value ? value.value : '' })
    store.getShopList()
  }
  const {
    filter: { salemenu_id },
    quotationList,
  } = store

  const quotationText = quotationList.find((item) => item.value === salemenu_id)
  return (
    <Flex alignCenter='center' justifyBetween>
      <span>报价单</span>
      <div style={{ width: '300px' }}>
        <MoreSelect
          selected={quotationText}
          renderListFilterType='pinyin'
          onSelect={onSelect}
          data={store.quotationList}
          placeholder={t('选择报价单')}
        />
      </div>
    </Flex>
  )
}

export default observer(SelectSearch)
