import React, { useEffect } from 'react'
import { Bar as BarChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import { observer } from 'mobx-react'
import store from '../../stores/index'

// 客户排行
const Rank = ({ className }) => {
  const { filter } = store
  useEffect(() => {
    store.fetchRankSale()
  }, [filter])
  return (
    <Panel title={t('客户排行')} className={classNames('gm-bg', className)}>
      <BarChart
        data={store.rankSale}
        options={{
          height: 300,
          position: 'xAxis*value',
          color: 'type',
          adjust: 'table',
          legend: true,
        }}
      />
    </Panel>
  )
}

Rank.propTypes = {
  className: PropTypes.string,
}
export default observer(Rank)
