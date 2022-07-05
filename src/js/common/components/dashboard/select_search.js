import React, { useState } from 'react'
import { Flex, Select } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import CustomerComponent from './select_component/customer_search'

const defaultData = [
  { text: '按商户', value: 0, placeholder: t('输入商户ID/商户名') },
  { text: '按账户', value: 2, placeholder: t('输入账户ID/账户名/公司名') },
  { text: '按收货人', value: 3, placeholder: t('输入收货人姓名') },
]

const SelectSearch = ({ data = defaultData, value, onChange, onSelect }) => {
  const [active, setActive] = useState(data[0].value)

  const handleSelectChange = (v) => {
    setActive(v)
    onSelect(v)
  }

  return (
    <Flex>
      <Select
        style={{
          whiteSpace: 'nowrap',
        }}
        clean
        value={active}
        data={data}
        onChange={handleSelectChange}
      />
      {active === 0 && <CustomerComponent />}
      {active === 2 && <CustomerComponent />}
      {active === 3 && <CustomerComponent />}
    </Flex>
  )
}

SelectSearch.propTypes = {
  data: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
}
export default SelectSearch
