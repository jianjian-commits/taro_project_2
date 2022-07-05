import React, { useState } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import store from '../store'

import Panel from 'common/components/dashboard/panel'
import ButtonGroup from 'common/components/button_group'
import { adapter } from '../../../../common/util'

const buttons = [
  {
    text: t('销售毛利'),
    value: 'saleProfit',
  },
  {
    text: t('销售毛利率'),
    value: 's03',
  },
]

const SaleTrend = ({ className, theme }) => {
  const [active, setActive] = useState('saleProfit')
  const { theme: color } = adapter(theme)
  const handleBtnChange = (d) => {
    setActive(d.value)
    store.fetchSaleTrend(d.value)
  }
  return (
    <Panel
      theme={theme}
      title={t('利润趋势')}
      className={classNames(className)}
      right={
        <ButtonGroup theme={color} onChange={handleBtnChange} data={buttons} />
      }
    >
      <LineChart
        data={store.trendData?.data || []}
        options={{
          ...SaleTrend.chartOption[active],
          theme: color,
          color: theme && 'yAxis',
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

SaleTrend.chartOption = {
  saleProfit: SaleTrend.commonChartOption,
  s03: SaleTrend.commonChartOption,
}
