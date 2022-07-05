import { i18next } from 'gm-i18n'
import React, { useState, useEffect } from 'react'
import { KCMoreSelect } from '@gmfe/keyboard'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import { convertNumber2Sid } from 'common/filter'
import { resNameSortByFirstWord } from 'common/util'
import store from './store'

const CellCustomer = observer(({ selected, onChange }) => {
  const [customerList, setCustomerList] = useState([])

  const handleSearchAll = () => {
    return store.customerSearch().then((list) => {
      setCustomerList(resNameSortByFirstWord(list))
      return list
    })
  }

  const handleSelect = (newCustomer) => {
    onChange(newCustomer)
  }

  const renderListCell = (customer) => {
    return `${customer.text}(${convertNumber2Sid(customer.value)}/${
      customer.username
    })`
  }

  const _selected =
    _.find(customerList, (item) => selected && item.value === selected.value) ||
    selected

  useEffect(() => {
    handleSearchAll()
  }, [])

  return (
    <KCMoreSelect
      data={customerList}
      selected={_selected}
      onSelect={handleSelect}
      renderListFilterType='pinyin'
      placeholder={i18next.t('输入商户名、商户ID或商户账号搜索')}
      renderListItem={renderListCell}
    />
  )
})

CellCustomer.displayName = 'CellCustomer'
CellCustomer.propTypes = {
  selected: PropTypes.object,
}

export default CellCustomer
