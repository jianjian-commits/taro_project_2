import React from 'react'
import { Flex, Button } from '@gmfe/react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import Panel from 'common/components/dashboard/panel'

const SaleTrend = ({ className }) => {
  return (
    <Panel
      title={t('销售趋势')}
      className={classNames('gm-bg', className)}
      right={
        <Flex>
          <Button>{t('销售额(元)')}</Button>
          <Button>{t('销售毛利(元)')}</Button>
          <Button>{t('销售毛利率')}</Button>
          <Button>{t('订单数')}</Button>
        </Flex>
      }
    >
      <LineChart
        data={[
          {
            year: '2009',
            tr: 5,
            tyn: 12,
          },
          {
            year: '2010',
            tr: 10,
            tyn: 15,
          },
        ]}
        options={{
          width: '100%',
          height: 300,
          legend: false,
          xFieldName: 'year',
          yFieldName: [
            ['tr', '天然气'],
            ['tyn', '太阳能'],
          ],
          scale: {
            value: {
              formatter: (text) => text + 'L',
              min: 0,
              max: 20,
            },
          },
        }}
      />
    </Panel>
  )
}

SaleTrend.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default SaleTrend
