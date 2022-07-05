import React, { useState, useEffect } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import { adapter } from 'common/util'
import store from '../store'
import { observer } from 'mobx-react'

const mockData = [
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
  {
    year: '2011',
    tr: 5,
    tyn: 12,
  },
  {
    year: '2012',
    tr: 10,
    tyn: 15,
  },
  {
    year: '2013',
    tr: 5,
    tyn: 12,
  },
  {
    year: '2014',
    tr: 10,
    tyn: 15,
  },
]

const PurchaseRatio = ({ className, theme }) => {
  const { filter } = store
  const { theme: color } = adapter(theme)
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = () => {
    setData(mockData)
  }

  const handleViewMore = () => {}

  return (
    <Panel
      theme={theme}
      title={t('采销比')}
      right={!theme && <a onClick={handleViewMore}>{t('查看更多')}</a>}
      className={classNames(className)}
    >
      <LineChart
        data={data}
        options={{
          width: '100%',
          height: 300,
          theme: color,
          legend: false,
          xFieldName: 'year',
          yFieldName: [
            ['tr', '天然气'],
            ['tyn', '太阳能'],
          ],
          scale: {
            value: {
              formatter: (text) => text + 'H',
              min: 0,
              max: 25,
            },
          },
        }}
      />
    </Panel>
  )
}

PurchaseRatio.propTypes = {
  theme: PropTypes.any,
  className: PropTypes.string,
}
export default observer(PurchaseRatio)
