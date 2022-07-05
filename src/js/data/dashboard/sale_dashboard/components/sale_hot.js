import React, { useState, useEffect } from 'react'
import { Pie as PieChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import ButtonGroup from 'common/components/button_group'
import store from '../store'
import { observer } from 'mobx-react'
import { requestOrderDetailHotCategory } from 'common/dashboard/sale/request'
import { formarPieChartData } from 'common/dashboard/constants'

const buttons = [
  {
    text: t('一级分类'),
    value: 1,
  },
  {
    text: t('二级分类'),
    value: 2,
  },
]

const SaleHot = ({ className, theme }) => {
  const { filter } = store
  const [value, setValue] = useState(1)
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData()
  }, [value, filter])

  const fetchData = () => {
    requestOrderDetailHotCategory(store.getParams(), [value]).then((data) => {
      const list = formarPieChartData(data).map((item) => ({
        count: item.yAxis,
        item: item.xAxis,
        percent: item.percent,
      }))

      setData(list)
    })
  }

  const handleBtnChange = (d) => setValue(d.value)
  return (
    <Panel
      theme={theme}
      title={t('热销分类')}
      className={classNames(className)}
      right={
        <ButtonGroup theme={theme} onChange={handleBtnChange} data={buttons} />
      }
    >
      <PieChart
        data={data}
        options={{
          padding: [30, 30, 30, 50],
          height: 300,
          theme,
          position: 'count',
          color: 'item',
        }}
      />
    </Panel>
  )
}

SaleHot.propTypes = {
  theme: PropTypes.string,
  className: PropTypes.string,
}
export default observer(SaleHot)
