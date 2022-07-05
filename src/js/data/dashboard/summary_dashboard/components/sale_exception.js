import React from 'react'
import { Flex, Button } from '@gmfe/react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'

const SaleException = ({ className }) => {
  return (
    <Panel
      title={t('售后异常处理')}
      className={classNames('gm-bg', className)}
      right={
        <Flex>
          <Button>{t('售后订单数')}</Button>
          <Button>{t('售后商品数')}</Button>
        </Flex>
      }
    >
      <LineChart
        data={[
          {
            percent: 5,
            year: '2009',
            name: '天然气',
          },
          {
            percent: 10,
            year: '2010',
            name: '天然气',
          },
          {
            percent: 12,
            year: '2011',
            name: '天然气',
          },
          {
            percent: 20,
            year: '2012',
            name: '天然气',
          },
          {
            percent: 25,
            year: '2013',
            name: '天然气',
          },
          {
            percent: 40,
            year: '2014',
            name: '天然气',
          },
          {
            percent: 31,
            year: '2015',
            name: '天然气',
          },
        ]}
        options={{
          width: '100%',
          height: 300,
          position: 'year*percent',
          color: 'name',
          legend: false,
        }}
      />
    </Panel>
  )
}

SaleException.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default SaleException
