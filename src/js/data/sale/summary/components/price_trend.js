import React, { useState, useEffect } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Panel from 'common/components/dashboard/panel'
import ButtonGroup from 'common/components/button_group'
import store from '../store'

const buttons = [
  {
    text: t('客单价'),
    value: 'customerPrice',
  },
  {
    text: t('笔单价'),
    value: 'orderPriceAvg',
  },
]

const PriceTrend = ({ className }) => {
  const { filter } = store
  const [value, setValue] = useState('customerPrice')

  useEffect(() => {
    store.fetchCustomerPriceOrOrderPrice(value)
  }, [filter, value])
  const handleBtnChange = (d) => {
    setValue(d.value)
  }
  return (
    <Panel
      title={t('客单价｜笔单价')}
      className={classNames('gm-bg', className)}
      right={<ButtonGroup onChange={handleBtnChange} data={buttons} />}
    >
      <LineChart
        data={store.customerPriceOrOrderPrice}
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

PriceTrend.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(PriceTrend)
