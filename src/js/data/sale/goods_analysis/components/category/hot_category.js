import React, { useState, useEffect } from 'react'
import { Pie as PieChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Panel from 'common/components/dashboard/panel'
import ButtonGroup from 'common/components/button_group'
import categoryStore from '../../stores/category'
import store from '../../stores/category'

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

const HotCategory = ({ className }) => {
  const { filter } = store
  const [value, setValue] = useState(1)

  useEffect(() => {
    categoryStore.fetchHotCategory(value)
  }, [filter, value])

  const handleBtnChange = (d) => {
    setValue(d.value)
  }

  return (
    <Panel
      title={t('热销分类')}
      className={classNames('gm-bg', className)}
      right={<ButtonGroup onChange={handleBtnChange} data={buttons} />}
    >
      <PieChart
        data={categoryStore.hotCategory}
        options={{
          height: 300,
          position: 'yAxis',
          color: 'xAxis',
        }}
      />
    </Panel>
  )
}

HotCategory.propTypes = {
  className: PropTypes.string,
}
export default observer(HotCategory)
