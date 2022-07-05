import React, { useState, useEffect } from 'react'
import { Bar as BarChart } from '@gm-pc/vision'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import store from '../store'
import { observer } from 'mobx-react'
import { adapter } from 'common/util'

const mockData = [
  { name: '供应商A', value: 34, type: '采购频次' },
  { name: '供应商测试长度长度长度B', value: 85, type: '采购频次' },
  { name: '供应商C', value: 103, type: '采购频次' },
  { name: '供应商D', value: 142, type: '采购频次' },
  { name: '供应商E', value: 251, type: '采购频次' },
  { name: '供应商A', value: 24, type: '履约率' },
  { name: '供应商测试长度长度长度B', value: 35, type: '履约率' },
  { name: '供应商C', value: 73, type: '履约率' },
  { name: '供应商D', value: 52, type: '履约率' },
  { name: '供应商E', value: 151, type: '履约率' },
]

const PurchaseStaff = ({ className, theme }) => {
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
    <Panel theme={color} className={classNames('gm-bg', className)}>
      <BarChart
        data={data}
        options={{
          height: 300,
          position: 'name*value*type',
          adjust: 'facet',
          padding: [0, 0, 0, 100],
          scale: {
            value: {
              formatter(v) {
                return v + '%'
              },
            },
          },
        }}
      />
    </Panel>
  )
}

PurchaseStaff.propTypes = {
  theme: PropTypes.any,
  className: PropTypes.string,
}

export default observer(PurchaseStaff)
