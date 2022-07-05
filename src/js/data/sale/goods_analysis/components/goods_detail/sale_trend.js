import React, { useEffect } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import store from '../../stores/goods_detail'

const SaleTrend = ({ className }) => {
  const { filter } = store
  useEffect(() => {
    store.fetchDetailSaleDataTrend()
  }, [filter])
  return (
    <Panel
      title={t('商品销售额趋势')}
      className={classNames('gm-bg', className)}
    >
      <LineChart
        data={store.saleDataTrend}
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

SaleTrend.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(SaleTrend)
