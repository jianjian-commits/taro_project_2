import React from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Panel from 'common/components/dashboard/panel'

const SaleTrend = ({ className }) => {
  return (
    <Panel title={t('商户销售趋势')} className={classNames('gm-bg', className)}>
      <LineChart
        data={[
          {
            percent: 35,
            year: '2015',
            name: '太阳能',
          },
          {
            percent: 40,
            year: '2016',
            name: '太阳能',
          },
          {
            percent: 45,
            year: '2017',
            name: '太阳能',
          },
          {
            percent: 47,
            year: '2018',
            name: '太阳能',
          },
        ]}
        options={{
          width: '100%',
          height: 300,
          position: 'year*percent',
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
