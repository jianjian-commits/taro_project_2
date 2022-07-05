import React, { useEffect } from 'react'
import { Bar as BarChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import store from '../../stores/detail'
import { observer } from 'mobx-react'

const Rank = ({ className }) => {
  const { filter, productRank } = store

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = () => {
    store.fetchProductRank()
  }

  return (
    <Panel title={t('购买商品排行')} className={classNames('gm-bg', className)}>
      <BarChart
        data={productRank}
        options={{
          height: 300,
          position: 'xAxis*value',
          color: 'type',
          legend: true,
          adjust: 'table',
        }}
      />
    </Panel>
  )
}

Rank.propTypes = {
  className: PropTypes.string,
}
export default observer(Rank)
