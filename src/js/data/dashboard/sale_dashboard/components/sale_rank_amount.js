import React, { useState, useEffect } from 'react'
import { Bar as BarChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import { adapter } from 'common/util'
import store from '../store.js'
import { observer } from 'mobx-react'

// 商品销售额排行
const SaleRankAmount = ({ className, theme }) => {
  const { filter } = store
  const { theme: color } = adapter(theme)
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = () => {
    store.fetchRankSale().then((res) => {
      const data = res.data.map((item) => {
        return {
          ...item,
          type: t('商品销售额'),
          value: item.yAxis,
        }
      })

      setData(data)
    })
  }

  return (
    <Panel
      theme={theme}
      title={t('商品销售额排行')}
      className={classNames(className)}
    >
      <BarChart
        data={data}
        options={{
          height: 450,
          theme: color,
          position: 'xAxis*value',
          color: 'type',
          adjust: 'table',
          legend: true,
        }}
      />
    </Panel>
  )
}

SaleRankAmount.propTypes = {
  theme: PropTypes.string,
  className: PropTypes.string,
}
export default observer(SaleRankAmount)
