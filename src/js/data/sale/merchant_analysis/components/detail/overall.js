import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Grid from 'common/components/grid'
import Panel from 'common/components/dashboard/panel'
import Bulletin from 'common/components/dashboard/bulletin'
import store from '../../stores/detail'
import { colors, icons } from 'common/dashboard/sale/theme'

const core = [
  'saleData',
  'orderPrice',
  'saleProfit',
  'orderData',
  'orderPriceAvg',
  'skus', // 购买商品总数
]

const infos = {
  saleData: {
    text: t('销售额(元)'),
    value: 0,
    color: colors.Blue,
    icon: icons.Money,
  },
  orderPrice: {
    text: t('下单金额'),
    value: 0,
    color: colors.Sunrise_Yellow,
    icon: icons.Person,
  },
  saleProfit: {
    text: t('销售毛利'),
    value: 0,
    color: colors.Golden_Purple,
    icon: icons.Rate,
  },
  orderData: {
    text: t('订单数'),
    value: 0,
    color: colors.Daybreak_Blue,
    icon: icons.Order,
    decimal: 0,
  },
  orderPriceAvg: {
    text: t('笔单价'),
    value: 0,
    color: colors.Dark_Green,
    icon: icons.Money2,
  },
  skus: {
    text: t('购买商品种数'),
    value: 0,
    color: colors.Daybreak_Blue,
    icon: icons.Task,
    decimal: 0,
  },
}

const SaleData = (props) => {
  const { className } = props
  const { filter } = store

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = () => {
    store.fetchSaleData()
  }

  return (
    <Panel title={t('销售数据')} className={classNames('gm-bg', className)}>
      <Grid column={3} className='gm-padding-0 gm-bg'>
        {core.map((key, index) => {
          const data = store.saleData[key]
          let info = infos[key]
          info = { ...info, ...data }
          return <Bulletin key={key} flip options={info} />
        })}
      </Grid>
    </Panel>
  )
}

SaleData.propTypes = {
  className: PropTypes.string,
}
export default observer(SaleData)
