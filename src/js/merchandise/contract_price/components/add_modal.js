import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import {
  FormItem,
  Form,
  MoreSelect,
  Button,
  InputNumberV2,
  RadioGroup,
  Radio,
  FormButton,
  Flex,
  Tip,
} from '@gmfe/react'
import _ from 'lodash'
import Big from 'big.js'
import { pinYinFilter } from '@gm-common/tool'
import globalStore from 'stores/global'
import { resNameSortByFirstWord } from 'common/util'
import { convertNumber2Sid } from 'common/filter'

const {
  orderInfo: { contract_rate_format },
} = globalStore
const isPercent = contract_rate_format === 1

const AddModal = (props) => {
  const targetRef = useRef(null)
  const [customerList, setCustomerList] = useState([])
  const [list, setList] = useState([])
  const [selected, setSelected] = useState(null)
  const [discount, setDiscount] = useState(isPercent ? 0 : 1.0)
  const [status, setStatus] = useState(3)
  const { onCancel, type, handleRequest } = props

  useEffect(() => {
    fetchList()
  }, [])

  // 拉取商户列表
  const fetchList = () => {
    Request('/station/order/customer/search')
      .data()
      .get()
      .then((res) => {
        const list = res.data.list.map((item) => {
          const { address_id, id, resname, username } = item
          return {
            ...item,
            id: address_id,
            uid: id,
            name: resname,
            resname: `${resname}(${convertNumber2Sid(address_id)}/${username})`,
            extender: {
              resname: `${resname}`,
            },
            text: resname,
            value: address_id,
          }
        })
        setList(resNameSortByFirstWord(list))
        setCustomerList(list)
      })
  }

  const renderListCell = (customer) => {
    return `${customer.name}(${convertNumber2Sid(customer.address_id)}/${
      customer.username
    })`
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      targetRef.current.apiDoSelectWillActive()
      window.document.body.click()
    }
  }

  const handleSearch = (value) => {
    const list = resNameSortByFirstWord(
      pinYinFilter(customerList, value, (value) => value.resname),
    ).slice()
    setList(list)
  }

  const handleSelect = (value) => {
    if (selected?.id === value.id) return
    setSelected(value)
  }

  const customerSelected = () => {
    const value =
      _.find(list, (item) => selected && item.id === selected.id) || selected
    return value
  }

  const onSubmit = () => {
    const params = {
      address_ids: JSON.stringify([selected?.id]),
      rule_object_type: type,
      change_rate:
        type === 4 && isPercent
          ? Big(discount || 0).plus(100)
          : Big(discount || 1).times(100),
      status,
    }

    Request('/station/price_rule/create ')
      .data(params)
      .post()
      .then(() => {
        Tip.success(t('新增成功'))
        onCancel()
        handleRequest()
      })
  }

  return (
    <Form onSubmit={onSubmit} labelWidth='90px'>
      <FormItem label={t('选择商户')}>
        <MoreSelect
          data={list}
          ref={targetRef}
          selected={customerSelected()}
          onSearch={handleSearch}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          renderListFilter={(data) => data}
          renderListItem={renderListCell}
          renderListFilterType='pinyin'
          disabledClose
        />
      </FormItem>
      {type === 4 && (
        <FormItem label={t('整单折扣率')}>
          <Flex columns alignCenter>
            <InputNumberV2
              className='form-control'
              value={discount}
              min={-999999999}
              max={999999999}
              onChange={(value) => setDiscount(value)}
            />
            {isPercent && '%'}
          </Flex>
        </FormItem>
      )}

      <FormItem label={t('状态')}>
        <RadioGroup
          name='status'
          value={status}
          onChange={(value) => setStatus(value)}
        >
          <Radio value={3}>{t('有效')}</Radio>
          <Radio value={1}>{t('无效')}</Radio>
        </RadioGroup>
      </FormItem>
      <FormButton>
        <Button className='gm-margin-right-10' onClick={onCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' disabled={!selected}>
          {t('确定')}
        </Button>
      </FormButton>
    </Form>
  )
}

AddModal.propTypes = {
  type: PropTypes.oneOf([3, 4]),
  onCancel: PropTypes.func,
  handleRequest: PropTypes.func,
}

export default AddModal
