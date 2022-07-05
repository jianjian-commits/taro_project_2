import React, { useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import { Bar as BarChart } from '@gm-pc/vision'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import store from '../store'
import { observer } from 'mobx-react'
import { adapter } from 'common/util'

const mockData = [
  { name: '采购员A', type: '采购金额', sales: 1000 },
  { name: '采购员B', type: '采购金额', sales: 1170 },
  { name: '采购员C', type: '采购金额', sales: 660 },
  { name: '采购员D', type: '采购金额', sales: 1030 },
  { name: '采购员A', type: '入库金额', sales: 400 },
  { name: '采购员B', type: '入库金额', sales: 460 },
  { name: '采购员C', type: '入库金额', sales: 1120 },
  { name: '采购员D', type: '入库金额', sales: 540 },
]

const PurchaseAmount = ({ className, theme }) => {
  const { filter } = store
  const { theme: color } = adapter(theme)

  const [data, setData] = useState([]) // 数据

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = () => {
    setData(mockData)
  }
  return (
    <Panel
      theme={color}
      title={t('供应商采购金额')}
      className={classNames('gm-bg', className)}
    >
      <BarChart
        data={data}
        options={{
          height: 300,
          position: 'name*sales',
          color: 'type',
          adjust: 'dodge',
          coordinate: {
            actions: 'transpose',
          },
        }}
      />
    </Panel>
  )
}

PurchaseAmount.propTypes = {
  theme: PropTypes.any,
  className: PropTypes.string,
}
export default observer(PurchaseAmount)
