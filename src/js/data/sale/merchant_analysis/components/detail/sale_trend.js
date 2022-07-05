import React, { useState, useEffect } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import ButtonGroup from 'common/components/button_group'

import Panel from 'common/components/dashboard/panel'
import { formatData, formatTimeList } from 'common/dashboard/constants'
import moment from 'moment'
import store from '../../stores/detail'

const buttons = [
  {
    text: t('销售金额'),
    value: 'saleData',
  },
  {
    text: t('下单金额'),
    value: 'orderPrice',
  },
  {
    text: t('下单数'),
    value: 'orderData',
  },
  {
    text: t('销售毛利'),
    value: 'saleProfit',
  },
]
const EMUN_NAME = {
  saleData: t('销售金额'),
  orderPrice: t('下单金额'),
  orderData: t('下单数'),
  saleProfit: t('销售毛利'),
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
    fetchSaleTrend,
    filter: { begin_time, end_time },
  } = store

  const [trendData, setTrendData] = useState(initObj)
  const [active, setActive] = useState('saleData')
  const handleBtnChange = (d) => {
    setActive(d.value)
  }
  useEffect(() => {
    fetchData()
  }, [filter, active])

  const fetchData = () => {
    fetchSaleTrend().then((data) => {
      Object.keys(trendData).forEach(
        (key) => (trendData[key] = formatTimeList(begin_time, end_time, data)),
      )

      Object.keys(trendData).forEach((key) => {
        trendData[key].forEach((item) => {
          data.forEach((resItem) => {
            item.name = EMUN_NAME[key]
            if (moment(resItem.xAxis).format('YYYY-MM-DD') === item.xAxis) {
              item.yAxis = formatData(resItem, key)
            }
          })
        })
      })
      setTrendData({ ...trendData })
    })
  }

  return (
    <Panel
      title={t('客户购买量')}
      className={classNames('gm-bg', className)}
      right={<ButtonGroup onChange={handleBtnChange} data={buttons} />}
    >
      <LineChart
        data={trendData[active]}
        options={SaleTrend.chartOption[active]}
      />
    </Panel>
  )
}

SaleTrend.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(SaleTrend)

SaleTrend.commonChartOption = {
  width: '100%',
  height: 300,
  legend: false,
  position: 'xAxis*yAxis',
  color: 'name',
}

SaleTrend.chartOption = {
  orderData: SaleTrend.commonChartOption,
  saleData: SaleTrend.commonChartOption,
  orderPrice: SaleTrend.commonChartOption,
  // saleData: SaleTrend.commonChartOption,
}
