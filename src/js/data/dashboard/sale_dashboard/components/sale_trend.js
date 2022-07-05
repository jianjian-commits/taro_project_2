import React, { useState, useEffect, useRef } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import store from '../store'
import Panel from 'common/components/dashboard/panel'
import ButtonGroup from 'common/components/button_group'
import { adapter } from '../../../../common/util'
import moment from 'moment'
import { requestSaleTrend } from '../service'
import { formatData, formatTimeList } from 'common/dashboard/constants'

const buttons = [
  {
    text: t('销售额(元)'),
    value: 'saleData',
  },
  {
    text: t('销售毛利(元)'),
    value: 'saleProfit',
  },
  {
    text: t('销售毛利率'),
    value: 'saleProfitRate', // 暂无
  },
  {
    text: t('订单数'),
    value: 'orderData',
  },
]

const ENUM_SALETREND = {
  saleData: t('销售额(元)'),
  saleProfit: t('销售毛利(元)'),
  saleProfitRate: t('销售毛利率'),
  orderData: t('订单数'),
}

const initObj = {
  saleData: [],
  saleProfit: [],
  saleProfitRate: [],
  orderData: [],
}

const SaleTrend = ({ className, theme }) => {
  const {
    filter,
    filter: { begin_time, end_time },
  } = store

  const [active, setActive] = useState('saleData')
  const activeRef = useRef(active)
  const [trendData, setTrendData] = useState(initObj)
  const { theme: color } = adapter(theme)

  const handleBtnChange = (d) => {
    activeRef.current = d.value
    setActive(d.value)
  }

  useEffect(() => {
    fetchSaleTrend()
  }, [filter])

  const fetchSaleTrend = () => {
    requestSaleTrend(store.getParams()).then((res) => {
      if (Array.isArray(res?.data)) {
        Object.keys(trendData).forEach(
          (key) =>
            (trendData[key] = formatTimeList(begin_time, end_time, res.data)),
        )
        Object.keys(trendData).forEach((key) => {
          trendData[key].forEach((item) => {
            res.data.forEach((resItem) => {
              item.name = ENUM_SALETREND[key]
              if (moment(resItem.xAxis).format('YYYY-MM-DD') === item.xAxis) {
                item.yAxis = formatData(resItem, key).toFixed(2)
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
      theme={color}
      title={t('销售趋势')}
      className={classNames(className)}
      right={
        <ButtonGroup theme={color} onChange={handleBtnChange} data={buttons} />
      }
    >
      <LineChart
        data={trendData[active] || []}
        options={{
          ...SaleTrend.chartOption[active],
          theme: color,
          color: 'name',
          scale: {
            yAxis: {
              formatter: (text) => {
                return activeRef.current === 'saleProfitRate'
                  ? text + '%'
                  : text
              },
            },
          },
        }}
      />
    </Panel>
  )
}

SaleTrend.propTypes = {
  theme: PropTypes.string,
  className: PropTypes.string,
}
export default observer(SaleTrend)

SaleTrend.commonChartOption = {
  width: '100%',
  height: 300,
  legend: false,
  position: 'xAxis*yAxis',
}

// SaleTrend.otherOption = {
//   width: '100%',
//   height: 300,
//   legend: false,
//   position: 'xAxis*yAxis',
//   scale: {
//     yAxis: {
//       formatter: (text) => text + '%',
//     },
//   },
// }

SaleTrend.chartOption = {
  orderData: SaleTrend.commonChartOption,
  saleData: SaleTrend.commonChartOption,
  saleProfitRate: SaleTrend.commonChartOption,
  saleProfit: SaleTrend.commonChartOption,
}
