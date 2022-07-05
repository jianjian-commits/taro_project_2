import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Grid from 'common/components/grid'
import Panel from 'common/components/dashboard/panel'
import Bulletin from 'common/components/dashboard/bulletin'
import { colors, icons } from 'common/dashboard/sale/theme'
import store from '../../stores/goods_detail'

const core = [
  'saleData',
  'saleTimes',
  'totalQuantity',
  'saleAvg',
  // 'averagePurchaseCost',
]

const infos = {
  saleData: {
    text: t('销售额(元)'),
    value: 0,
    color: colors.Blue,
    icon: icons.Money,
  },
  saleTimes: {
    text: t('销售次数'),
    value: 0,
    color: colors.Sunrise_Yellow,
    icon: icons.Order,
  },
  totalQuantity: {
    text: t('总数量'),
    value: 0,
    color: colors.Daybreak_Blue,
    icon: icons.Order,
  },
  saleAvg: {
    text: t('销售均价'),
    value: 0,
    color: colors.Dark_Green,
    icon: icons.Money2,
  },
}

const SaleData = ({ className }) => {
  const { filter } = store

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = () => {
    store.fetchDetailSaleData()
  }

  return (
    <Panel title={t('销售数据')} className={classNames('gm-bg', className)}>
      <Grid column={4} className='gm-padding-0 gm-bg'>
        {core.map((key, index) => {
          const info = { ...infos[key], ...store.saleData[key] }
          return <Bulletin key={key} flip options={info} />
        })}
      </Grid>
    </Panel>
  )
}

SaleData.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(SaleData)
