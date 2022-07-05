import { i18next } from 'gm-i18n'
import React from 'react'
import { Loading, Dialog, Select, Option } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import { isCustomerValid } from '../../util'
import orderDetailStore from '../../store'

const ServiceTimeSelector = observer(() => {
  const { orderDetail } = orderDetailStore
  const {
    viewType,
    customer,
    time_config_info,
    serviceTimes,
    serviceTimesLoading,
    details,
  } = orderDetail

  const handleServiceTimeChange = (value) => {
    const serviceTime =
      _.find(serviceTimes, (time) => time._id === value) || null
    // 过滤空行
    const skuData = _.filter(details, (sku) => sku.id !== null)
    if (!time_config_info || !skuData.length) {
      orderDetailStore.serviceTimeChange(serviceTime)
      return
    }

    Dialog.confirm({
      title: i18next.t('警告'),
      children: i18next.t('切换运营时间将清空商品列表，是否继续？'),
      disableMaskClose: true,
      onOK: async () => {
        orderDetailStore.serviceTimeChange(serviceTime)
      },
    })
  }

  if (viewType !== 'create') {
    return (time_config_info && time_config_info.name) || '-'
  }

  if (serviceTimesLoading) {
    return <Loading size={20} />
  } else {
    return (
      <Select
        value={(time_config_info && time_config_info._id) || ''}
        onChange={handleServiceTimeChange}
        className='b-order-select'
        disabled={!isCustomerValid(customer)}
        style={{
          width: '165px',
        }}
      >
        <Option value=''>{i18next.t('请选择运营时间')}</Option>
        {_.map(serviceTimes, (serviceTime) => {
          return (
            <Option key={serviceTime._id} value={serviceTime._id}>
              {serviceTime.name}
            </Option>
          )
        })}
      </Select>
    )
  }
})

ServiceTimeSelector.displayName = 'ServiceTimeSelector'

ServiceTimeSelector.propTypes = {
  orderDetail: PropTypes.object,
}

export default ServiceTimeSelector
