import React, { useEffect } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import store from '../../stores/detail'
import Panel from 'common/components/dashboard/panel'

const PriceTrend = ({ className }) => {
  const { filter, fetchOrderPriceAvg, orderPriceAvg } = store

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = () => {
    fetchOrderPriceAvg()
  }

  return (
    <Panel title={t('客户笔单价')} className={classNames('gm-bg', className)}>
      <LineChart
        data={orderPriceAvg}
        options={{
          width: '100%',
          height: 300,
          position: 'xAxis*yAxis',
          color: 'name',
          legend: false,
        }}
      />
    </Panel>
  )
}

PriceTrend.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(PriceTrend)
