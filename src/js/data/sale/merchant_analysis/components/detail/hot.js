import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { Pie as PieChart } from '@gm-pc/vision'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import store from '../../stores/detail'
import { observer } from 'mobx-react'
import ButtonGroup from 'common/components/button_group'

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

const Hot = ({ className }) => {
  const { filter, fetchSortData, sortData } = store

  const [value, setValue] = useState(1)
  useEffect(() => {
    fetchSortData(value)
  }, [filter, value])

  const handleBtnChange = (d) => setValue(d.value)

  return (
    <Panel
      title={t('购买分类分布')}
      className={classNames('gm-bg', className)}
      right={<ButtonGroup onChange={handleBtnChange} data={buttons} />}
    >
      <PieChart
        data={sortData}
        options={{
          height: 300,
          position: 'percent',
          color: 'xAxis',
        }}
      />
    </Panel>
  )
}

Hot.propTypes = {
  className: PropTypes.string,
}
export default observer(Hot)
