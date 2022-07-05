import React, { useState, useEffect } from 'react'
import { Pie as PieChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import store from '../store'
import { observer } from 'mobx-react'
import { adapter } from 'common/util'

const mockData = [
  { item: '事例一', count: 40, percent: 0.4 },
  { item: '事例二', count: 21, percent: 0.21 },
  { item: '事例三', count: 17, percent: 0.17 },
  { item: '事例四', count: 13, percent: 0.13 },
  { item: '事例五', count: 9, percent: 0.09 },
]

const SaleHot = ({ className, theme }) => {
  const { theme: color } = adapter(theme)
  const { filter } = store
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
      title={t('采购品类分类')}
      theme={theme}
      className={classNames(className)}
      right={!theme && <a onClick={handleViewMore}>{t('查看更多')}</a>}
    >
      <PieChart
        data={data}
        options={{
          height: 300,
          position: 'percent',
          color: 'item',
          theme: color,
        }}
      />
    </Panel>
  )
}

SaleHot.propTypes = {
  theme: PropTypes.any,
  className: PropTypes.string,
}
export default observer(SaleHot)
