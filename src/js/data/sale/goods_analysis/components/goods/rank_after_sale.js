import React, { useEffect } from 'react'
import { Bar as BarChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import store from '../../stores/goods'
import Panel from 'common/components/dashboard/panel'

const RankAfterSale = ({ className }) => {
  const { filter } = store

  useEffect(() => {
    store.fetchAfterSale()
  }, [filter])

  return (
    <Panel title={t('售后商品排行')} className={classNames('gm-bg', className)}>
      <BarChart
        data={store.afterSale}
        options={{
          height: 360,
          position: 'xAxis*yAxis',
          adjust: 'table',
          legend: true,
          color: 'type',
        }}
      />
    </Panel>
  )
}

RankAfterSale.propTypes = {
  className: PropTypes.string,
}
export default observer(RankAfterSale)
