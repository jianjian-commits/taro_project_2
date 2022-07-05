import React, { useState, useEffect } from 'react'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import store from '../../stores/goods'
import { MoreSelect } from '@gmfe/react'
import { observer } from 'mobx-react'

const SelectSearch = (props) => {
  const [quotationText, setQuotationText] = useState()
  useEffect(() => {
    store.getQuotationList()
  }, [])

  const onSelect = (value) => {
    store.setFilter({ salemenu_id: value ? value.value : '' })
    store.getShopList()
    value ? setQuotationText({ text: value.text }) : setQuotationText({})
  }
  return (
    <Flex alignCenter='center' justifyBetween>
      <span>报价单</span>
      <div style={{ width: '300px' }}>
        <MoreSelect
          selected={quotationText}
          onSelect={onSelect}
          data={store.quotationList}
          placeholder={t('选择报价单')}
        />
      </div>
    </Flex>
  )
}
export default observer(SelectSearch)
