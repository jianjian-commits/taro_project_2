import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { MoreSelect } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { resNameSortByFirstWord } from '../../../util'
import { convertNumber2Sid } from '../../../filter'
import { Request } from '@gm-common/request'
// value and text
const formatList = (list) => {
  const newList = []
  list.forEach((item) => {
    const text = item.name
    const value = item.id
    newList.push({ value, text, ...item })
  })
  return newList
}

const Customer = (props, customerRef) => {
  const { onChange, defaultValue, resetValueRef, isReset } = props

  const ref = useRef(null)
  const [data, setData] = useState([])
  const [value, setValue] = useState()

  useEffect(() => {
    fetchList()
  }, [])

  useEffect(() => {
    defaultValue &&
      data.length > 0 &&
      setValue(data.find((f) => f.value === Number(defaultValue)))
  }, [data])

  useEffect(() => {
    if (isReset) {
      resetValueRef.current = () => {
        setValue(null)
      }
    }
  }, [isReset, resetValueRef])

  useImperativeHandle(customerRef, () => ({
    value,
  }))

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      ref.current.apiDoSelectWillActive()
      window.document.body.click()
    }
  }

  const renderListCell = (customer) => {
    return `${customer.name}(${convertNumber2Sid(customer.address_id)}/${
      customer.username
    })`
  }

  const fetchList = (search_text) => {
    return Request('/station/order/customer/search')
      .data({ limit: 1000, search_text })
      .get()
      .then((res) => {
        const list = res.data.list.map((customer) => ({
          id: customer.address_id,
          address_id: customer.address_id,
          uid: customer.id,
          name: customer.resname,
          resname: `${customer.resname}(${convertNumber2Sid(
            customer.address_id,
          )}/${customer.username})`,
          receiver_name: customer.receiver_name,
          receiver_phone: customer.receiver_phone,
          address: customer.address,
          username: customer.username,
          extender: {
            resname: `${customer.resname}`,
          },
          fee_type: customer.fee_type,
        }))
        const newData = formatList(resNameSortByFirstWord(list))

        setData(newData)
      })
  }

  const handleSelect = (value) => {
    setValue(value)

    if (typeof onChange === 'function') onChange(value)
  }

  const handleSearch = (value) => {
    fetchList(value)
  }

  return (
    <MoreSelect
      data={data}
      ref={ref}
      style={{
        width: '240px',
        minWidth: '130px',
      }}
      selected={value} // 已选择项
      onSearch={handleSearch}
      onSelect={handleSelect}
      onKeyDown={handleKeyDown}
      placeholder={t('输入商户名、商户ID或商户账号搜索')}
      renderListFilter={(data) => data}
      renderListItem={renderListCell}
    />
  )
}

Customer.propTypes = {
  onChange: PropTypes.func,
  defaultValue: PropTypes.number,
  resetValueRef: PropTypes.object,
  isReset: PropTypes.bool,
}

export default forwardRef(Customer)
