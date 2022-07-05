import React, { useState, useEffect } from 'react'
import { Pie as PieChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import { requestDistrictDataFromMerchant } from '../../service'
import Panel from 'common/components/dashboard/panel'
import ButtonGroup from 'common/components/button_group'
import store from '../../stores/index'
import { formarPieChartData } from 'common/dashboard/constants'

const buttons = [
  {
    text: t('一级标签'),
    value: 6,
  },
  {
    text: t('二级标签'),
    value: 3,
  },
]

const District = ({ className }) => {
  const { filter } = store
  const [value, setValue] = useState(6)
  const [data, setData] = useState([])

  useEffect(() => {
    fetchList()
  }, [filter, value])

  const handleBtnChange = (d) => setValue(d.value)

  const fetchList = () => {
    requestDistrictDataFromMerchant(store.getParams(), [value]).then((data) => {
      setData(formarPieChartData(data))
    })
  }
  return (
    <Panel
      title={t('地区分布')}
      className={classNames('gm-bg', className)}
      right={<ButtonGroup onChange={handleBtnChange} data={buttons} />}
    >
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

District.propTypes = {
  className: PropTypes.string,
}
export default observer(District)
