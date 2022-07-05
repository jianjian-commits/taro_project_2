import React, { useState, useEffect } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { adapter } from 'common/util'
import Panel from 'common/components/dashboard/panel'
import ButtonGroup from 'common/components/button_group'
import store from '../store'
import { observer } from 'mobx-react'

const buttons = [
  {
    text: t('采购金额'),
    value: 's01',
  },
  {
    text: t('平均采购金额'),
    value: 's02',
  },
  {
    text: t('入库金额'),
    value: 's03',
  },
  {
    text: t('平均入库金额'),
    value: 's04',
  },
]

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

const SaleTrend = ({ className, theme }) => {
  const { filter } = store
  const { theme: color } = adapter(theme)

  const [value, setValue] = useState('s01') // 按钮的值
  const [data, setData] = useState([]) // 数据

  useEffect(() => {
    console.log(value)
    fetchData()
  }, [filter, value])

  const handleBtnChange = (btn) => {
    setValue(btn?.value)
  }

  const fetchData = () => {
    setData(mockData)
  }

  return (
    <Panel
      title={t('采购金额')}
      theme={theme}
      className={classNames(className)}
      right={
        <ButtonGroup theme={theme} onChange={handleBtnChange} data={buttons} />
      }
    >
      <LineChart
        data={data}
        options={{
          width: '100%',
          height: color === 'ocean' ? 580 : 300,
          legend: false,
          theme: color,
          xFieldName: 'year',
          yFieldName: [
            ['tr', '天然气'],
            ['tyn', '太阳能'],
          ],
          scale: {
            value: {
              formatter: (text) => text + 'K',
              min: 0,
              max: 50,
            },
          },
        }}
      />
    </Panel>
  )
}

SaleTrend.propTypes = {
  theme: PropTypes.any,
  className: PropTypes.string,
}
export default observer(SaleTrend)
