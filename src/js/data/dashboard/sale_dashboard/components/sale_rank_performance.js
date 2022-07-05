import React, { useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import { Bar as BarChart } from '@gm-pc/vision'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import store from '../store'
import { formatData } from 'common/dashboard/constants'
import { requestRankPerformance } from '../service'
import ButtonGroup from 'common/components/button_group'
import Panel from 'common/components/dashboard/panel'

const buttons = [
  {
    text: t('销售额(元)'),
    value: 1,
  },
  {
    text: t('销售毛利(元)'),
    value: 2,
  },
  {
    text: t('客单价(元)'),
    value: 4,
  },
  {
    text: t('订单数'),
    value: 3,
  },
]

const DATA_ENUM = {
  1: 'accountPrice',
  2: 'saleProfit',
  4: 'customerPrice',
  3: 'orderId',
}
const DATA_TYPE = {
  1: t('销售额(元)'),
  2: t('销售毛利(元)'),
  4: t('客单价(元)'),
  3: t('订单数'),
}

const SaleRankAmount = ({ className }) => {
  const { filter } = store
  const [active, setActive] = useState(1)
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData()
  }, [filter, active])

  const fetchData = () => {
    requestRankPerformance(store.getParams(), active).then((data) => {
      const list = data
        .filter((f) => f.xAxis)
        .map((item) => ({
          xAxis: item.xAxis,
          value: formatData(item, DATA_ENUM[active]),
          type: DATA_TYPE[active],
        }))
      setData(list || [])
    })
  }

  const handleBtnChange = (d) => {
    setActive(d.value)
  }

  return (
    <Panel
      title={t('销售经理业绩排行')}
      className={classNames('gm-bg', className)}
      right={<ButtonGroup onChange={handleBtnChange} data={buttons} />}
    >
      <BarChart
        data={data}
        options={{
          height: 450,
          position: `xAxis*value`,
          color: 'type',
          legend: true,
          adjust: 'table',
        }}
      />
    </Panel>
  )
}

SaleRankAmount.propTypes = {
  className: PropTypes.string,
}
export default observer(SaleRankAmount)
