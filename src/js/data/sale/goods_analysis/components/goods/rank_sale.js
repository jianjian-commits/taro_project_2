import React, { useState, useEffect } from 'react'
import { Bar as BarChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import ButtonGroup from 'common/components/button_group'
import store from '../../stores/goods'
import { toJS } from 'mobx'

const buttons = [
  {
    text: t('销售额'),
    value: 'sale',
  },
  {
    text: t('下单频次'),
    value: 'order',
  },
]

const RankSale = ({ className }) => {
  const { filter } = store
  const [value, setValue] = useState('sale')

  const handleBtnChange = (d) => {
    setValue(d.value)
  }

  useEffect(() => {
    store.fetchRankSale(value)
  }, [filter, value])
  return (
    <Panel
      title={t('商品销售排行')}
      className={classNames('gm-bg', className)}
      right={<ButtonGroup onChange={handleBtnChange} data={buttons} />}
    >
      <BarChart
        data={store.rankSale}
        options={{
          height: 360,
          position: 'xAxis*yAxis',
          color: 'type',
          legend: true,
          adjust: 'table',
        }}
      />
    </Panel>
  )
}

RankSale.propTypes = {
  className: PropTypes.string,
}
export default observer(RankSale)
