import React, { useState, useEffect } from 'react'
import { Bar as BarChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import { adapter } from 'common/util'
import store from '../store'
import { observer } from 'mobx-react'

const mockData = [
  { type: '汽车', value: 34 },
  { type: '建材家居', value: 85 },
  { type: '住宿旅游', value: 103 },
  { type: '交通运输与仓储邮政', value: 142 },
  { type: '建筑房地产', value: 251 },
  { type: '教育', value: 367 },
]

const RankHot = ({ className, theme }) => {
  const { filter } = store
  const { theme: color } = adapter(theme)
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = () => {
    setData(mockData)
  }

  return (
    <Panel
      theme={color}
      title={t('供应商采购金额排行')}
      className={classNames(className)}
    >
      <BarChart
        data={data}
        options={{
          height: 300,
          theme: color,
          position: 'type*value',
          adjust: 'table',
        }}
      />
    </Panel>
  )
}

RankHot.propTypes = {
  theme: PropTypes.any,
  className: PropTypes.string,
}
export default observer(RankHot)
