import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { Pie as PieChart } from '@gm-pc/vision'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { requestDistrictDataFromMerchant } from '../../service'
import Panel from 'common/components/dashboard/panel'
import store from '../../stores/index'
import { observer } from 'mobx-react'
import { formarPieChartData } from 'common/dashboard/constants'

const Rank = ({ className }) => {
  const [data, setData] = useState([])
  const { filter } = store

  useEffect(() => {
    fetchList()
  }, [filter])

  const fetchList = () => {
    requestDistrictDataFromMerchant(store.getParams(), [5]).then((data) => {
      // 过滤route_id 为 ‘0’ 的数据
      const list = formarPieChartData(data)

      list.forEach((item) => {
        if (item.route_id === '0') item.xAxis = '无线路'
      })
      setData(list)
    })
  }

  return (
    <Panel title={t('线路分布')} className={classNames('gm-bg', className)}>
      <PieChart
        data={data}
        options={{
          height: 350,
          position: 'percent',
          color: 'xAxis',
        }}
      />
    </Panel>
  )
}

Rank.propTypes = {
  className: PropTypes.string,
}
export default observer(Rank)
