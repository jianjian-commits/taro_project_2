import React, { useState, useEffect } from 'react'
import { Flex, Storage } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import store from '../store'
import { Bulletin } from 'common/components/fullscreen'
import { requestSaleData } from '../service'
import moment from 'moment'

const sortList = Storage.get('market_drive_v2') || [
  'orderData',
  'saleData',
  'customerPrice',
  'shopId',
  'saleProfit',
  'saleProfitRate',
]
const infos = {
  saleData: {
    text: t('销售额(元)'),
    value: 0,
    preValue: 0,
  },
  orderData: {
    text: t('订单数'),
    value: 0,
    preValue: 0,
    decimal: 0,
  },
  shopId: {
    text: t('下单客户数'),
    value: 0,
    preValue: 0,
    decimal: 0,
  },
  saleProfit: {
    text: t('销售毛利(元)'),
    value: 0,
    preValue: 0,
  },
  saleProfitRate: {
    text: t('销售毛利率'),
    value: 0,
    preValue: 0,
  },
  customerPrice: {
    text: t('客单价(元)'),
    value: 0,
    preValue: 0,
  },
}

const SaleScreenBulletin = ({ className }) => {
  const {
    filter,
    filter: { begin_time, end_time },
  } = store
  const [data, setData] = useState({})

  useEffect(() => {
    fetchSaleData()
  }, [filter])

  const fetchSaleData = () => {
    const dif = moment(end_time).diff(moment(begin_time), 'd')

    const nextTimeRange = {
      begin_time: moment(end_time)
        .subtract(+dif * 2 + 1, 'd')
        .format('YYYY-MM-DD'),
      end_time: moment(end_time)
        .subtract(+dif + 1, 'd')
        .format('YYYY-MM-DD'),
      time_field: 'order_time',
    }

    const params = store.getParams()
    params.time_range.push(nextTimeRange)

    requestSaleData(params).then((data) => {
      setData(data)
    })
  }
  return (
    <Flex className={className} justifyBetween>
      {sortList.map((key, index) => {
        const options = {
          ...infos[key],
          value: data[key]?.value || 0,
          preValue: data[key]?.preValue || 0,
        }
        return <Bulletin key={index} data={options} />
      })}
    </Flex>
  )
}

SaleScreenBulletin.propTypes = {
  className: PropTypes.string,
}
export default SaleScreenBulletin
