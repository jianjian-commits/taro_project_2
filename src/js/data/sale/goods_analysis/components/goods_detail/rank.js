import React, { useEffect } from 'react'
import { Bar as BarChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import store from '../../stores/goods_detail'

const Rank = ({ className }) => {
  const { filter } = store
  useEffect(() => {
    store.fetchDetailShopRank()
  }, [filter])
  return (
    <Panel title={t('购买客户排行')} className={classNames('gm-bg', className)}>
      <BarChart
        data={store.shopRank}
        options={{
          height: 300,
          position: 'shop_name*yAxis',
          adjust: 'table',
          color: 'type',
          legend: true,
        }}
      />
    </Panel>
  )
}

Rank.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(Rank)
