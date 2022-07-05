import { i18next } from 'gm-i18n'
import React, { useState, useEffect, useRef } from 'react'
import { Flex, MoreSelect, Popover, Tip, Dialog } from '@gmfe/react'

import classNames from 'classnames'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import { changeDomainName } from '../../../common/service'
import { convertNumber2Sid } from '../../../common/filter'
import { openNewTab, resNameSortByFirstWord } from '../../../common/util'
import { isStation, isCustomerValid } from '../../util'
import CustomerMsg from '../../components/customer_tip'
import orderDetailStore from '../../store'
import SVGRefresh from 'svg/refresh.svg'

const Customer = observer((props) => {
  const { copyData } = props
  const { orderDetail } = orderDetailStore
  const { viewType, customer, details } = orderDetail
  const targetRef = useRef(null)

  const [customerList, setCustomerList] = useState([])

  const handleList = (list) => {
    const newList = []
    _.forEach(list, (item) => {
      const text = item.name
      const value = item.id
      newList.push({ value, text, ...item })
    })
    return newList
  }

  const initCustomerList = () => {
    if (viewType === 'create') {
      orderDetailStore
        .customerSearch(copyData ? copyData.address_id : undefined) // 如果是copyData的话，通过search_text来获取，保证存在的话一定拉得到
        .then(async (list) => {
          const _list = resNameSortByFirstWord(list).slice()
          setCustomerList(handleList(_list))
          if (copyData) {
            const customer = _.find(
              list,
              (item) => item.address_id === copyData.address_id,
            )
            !customer && Tip.info('商户不存在无法复制订单')
            customer &&
              (await orderDetailStore.customerSelect(customer, copyData))
            customer && (await handleCustmoerStatusRefresh(customer))
          }
        })
    }
  }

  useEffect(() => {
    initCustomerList()
  }, [])

  const handleSearch = (value) => {
    orderDetailStore
      .customerSearch(value) // 由于数据量，因此改为后台搜索，并且limit为1000保证一开始有数据
      .then((list) => {
        const _list = resNameSortByFirstWord(list).slice()
        setCustomerList(handleList(_list))
      })
  }

  const handleCustmoerStatusRefresh = async (newCustomer) => {
    const _customer =
      newCustomer.address_id === undefined ? customer : newCustomer

    await orderDetailStore.customerStatusRefesh(_customer.address_id)
  }

  const handleSelect = async (newCustomer) => {
    if (customer && newCustomer && customer.id === newCustomer.id) return
    // 过滤空行
    const data = _.filter(details, (item) => item.id !== null)
    if (!data.length) {
      await orderDetailStore.customerSelect(newCustomer)
      newCustomer && (await handleCustmoerStatusRefresh(newCustomer))
      // 获取商户上一次订单的备注
      newCustomer &&
        (await orderDetailStore.getLastOrderRemark(newCustomer.address_id))
      return
    }

    const text = newCustomer
      ? i18next.t('切换商户将剔除不供应此商户的商品，是否继续？')
      : i18next.t('更换商户将清空商品列表，是否继续？')

    Dialog.confirm({
      title: i18next.t('警告'),
      children: text,
      disableMaskClose: true,
      onOK: async () => {
        await orderDetailStore.customerSelect(newCustomer)
        newCustomer && (await handleCustmoerStatusRefresh(newCustomer))
      },
    })
  }

  // enter
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      targetRef.current.apiDoSelectWillActive()
      window.document.body.click()
    }
  }

  const handleToCustomerManage = (customer) => {
    openNewTab(
      changeDomainName('station', 'manage') +
        `/#/customer_manage/customer/manage/${convertNumber2Sid(
          customer.address_id,
        )}`,
    )
  }

  const resname = customer && customer.extender && customer.extender.resname
  const renderCustomerInfo = () => {
    if (customer) {
      return `${resname}/${
        isStation(customer.address_id)
          ? customer.address_id
          : convertNumber2Sid(customer.address_id)
      }`
    } else {
      return '-'
    }
  }

  const customerInfo = (
    <a
      href={
        changeDomainName('station', 'manage') +
        `/#/customer_manage/customer/manage/${
          customer && convertNumber2Sid(customer.address_id)
        }`
      }
      rel='noopener noreferrer'
      target='_blank'
    >
      {renderCustomerInfo()}
    </a>
  )

  const renderListCell = (customer) => {
    return `${customer.name}(${convertNumber2Sid(customer.address_id)}/${
      customer.username
    })`
  }

  const customerSelected = () => {
    return (
      _.find(customerList, (item) => customer && item.id === customer.id) ||
      customer
    )
  }

  if (viewType === 'edit' || viewType === 'view') {
    return customerInfo
  } else if (viewType === 'create') {
    return (
      <Flex flex>
        <Flex>
          {viewType === 'create' && (
            <div style={{ width: '100%' }}>
              <MoreSelect
                style={{
                  width: customerSelected() ? 'auto' : '240px',
                  minWidth: '130px',
                }}
                ref={targetRef}
                data={customerList}
                selected={customerSelected()}
                onSearch={handleSearch}
                onSelect={handleSelect}
                onKeyDown={handleKeyDown}
                renderListFilter={(data) => data}
                placeholder={i18next.t('输入商户名、商户ID或商户账号搜索')}
                renderListItem={renderListCell}
              />
            </div>
          )}
        </Flex>
        {customer && resname ? (
          <Flex alignCenter>
            <Popover
              showArrow
              type='hover'
              left
              top
              popup={<CustomerMsg customer={customer} />}
            >
              <div
                onClick={() => handleToCustomerManage(customer)}
                className={classNames('gm-cursor gm-margin-left-5', {
                  'gm-text-red': !isCustomerValid(customer),
                  'text-primary': [11, 12].includes(
                    customer.customer_credit_type,
                  ), // 11: 白名单 12: 信用额度内
                })}
              >
                {customer.msg || '-'}
                {/* {'先款后货用户无法在此下单'} */}
              </div>
            </Popover>
            <Popover
              showArrow
              type='hover'
              left
              top
              popup={
                <div
                  className='gm-bg gm-border gm-padding-5'
                  style={{ width: '100px' }}
                >
                  {i18next.t('刷新账户状态')}
                </div>
              }
            >
              <span onClick={() => handleCustmoerStatusRefresh(customer)}>
                <SVGRefresh
                  style={{ color: '#56A3F2' }}
                  className='gm-margin-lr-5 gm-cursor'
                />
              </span>
            </Popover>
          </Flex>
        ) : null}
      </Flex>
    )
  }
})

Customer.displayName = 'Customer'
Customer.propTypes = {
  orderDetail: PropTypes.object,
  isCustomerRefresh: PropTypes.bool,
  copyData: PropTypes.object,
}

export default Customer
