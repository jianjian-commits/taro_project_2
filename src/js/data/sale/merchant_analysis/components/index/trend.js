import React, { useEffect } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'

import Panel from 'common/components/dashboard/panel'
import store from '../../stores/index'

const Rank = ({ className }) => {
  const { filter } = store
  useEffect(() => {
    store.fetchOrderData()
  }, [filter])
  return (
    <Panel title={t('下单客户')} className={classNames('gm-bg', className)}>
      <LineChart
        data={store.orderData}
        options={{
          width: '100%',
          height: 300,
          position: 'xAxis*yAxis',
          color: 'name',
        }}
      />
    </Panel>
  )
}

Rank.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(Rank)
