import React, { useState, useEffect } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import ButtonGroup from 'common/components/button_group'
import store from '../store'
import { requestTotalSaleTrend } from '../service'
import { formatData, formatTimeList } from 'common/dashboard/constants'
import moment from 'moment'

const buttons = [
  {
    text: t('销售额'),
    value: 'saleData',
  },
  {
    text: t('下单金额'),
    value: 'orderPrice',
  },
  {
    text: t('销售毛利'),
    value: 'saleProfit',
  },
  {
    text: t('订单数'),
    value: 'orderData',
  },
]
const NAME_ENUM = {
  saleData: t('销售额'),
  orderPrice: t('下单金额'),
  saleProfit: t('销售毛利'),
  orderData: t('订单数'),
}

const initObj = {
  saleData: [],
  saleProfit: [],
  orderPrice: [],
  orderData: [],
}

const SaleTrend = ({ className }) => {
  const {
    filter,
    filter: { begin_time, end_time },
  } = store
  const [value, setValue] = useState('saleData')
  const [trendData, setTrendData] = useState(initObj)

  useEffect(() => {
    fetchSaleTrend()
  }, [filter])

  const handleBtnChange = (d) => setValue(d.value)

  const fetchSaleTrend = () => {
    requestTotalSaleTrend(store.getParams()).then((res) => {
      if (Array.isArray(res?.data)) {
        Object.keys(trendData).forEach(
          (key) =>
            (trendData[key] = formatTimeList(begin_time, end_time, res.data)),
        )
        Object.keys(trendData).forEach((key) => {
          trendData[key].forEach((item) => {
            item.name = NAME_ENUM[key]
            res.data.forEach((resItem) => {
              if (moment(resItem.xAxis).format('YYYY-MM-DD') === item.xAxis) {
                item.yAxis = formatData(resItem, key)
              }
            })
          })
        })
      }
      setTrendData({ ...trendData })
    })
  }

  return (
    <Panel
      title={t('销售额趋势')}
      className={classNames('gm-bg', className)}
      right={<ButtonGroup onChange={handleBtnChange} data={buttons} />}
    >
      <LineChart
        data={trendData[value] || []}
        options={{
          width: '100%',
          height: 300,
          position: 'xAxis*yAxis',
          legend: false,
          color: 'name',
        }}
      />
    </Panel>
  )
}

SaleTrend.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(SaleTrend)
