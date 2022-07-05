import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Gird from 'common/components/grid'
import Panel from 'common/components/dashboard/panel'
import Bulletin from 'common/components/dashboard/bulletin'
import { colors, icons } from 'common/dashboard/sale/theme'
import store from '../store'

const core = [
  'saleData',
  'orderPrice',
  'saleProfit',
  'saleProfitRate',
  'orderData',
  'orderPriceAvg',
]

const infos = {
  saleData: {
    text: t('销售额'),
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
    color: colors.Cyan,
    icon: icons.Money2,
  },
  saleProfitRate: {
    text: t('销售毛利率'),
    value: 0,
    color: colors.Cyan,
    icon: icons.Money2,
    isPercent: true,
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
}

const SaleData = ({ className }) => {
  const { filter } = store
  useEffect(() => {
    store.fetchSaleData()
  }, [filter])

  return (
    <Panel title={t('销售数据')} className={classNames('gm-bg', className)}>
      <Gird column={3} className='gm-bg gm-padding-0'>
        {core.map((key) => {
          let data = infos[key]
          data = { ...data, ...store.saleData[key] }

          return <Bulletin key={key} flip options={data} />
        })}
      </Gird>
    </Panel>
  )
}

SaleData.propTypes = {
  className: PropTypes.string,
}
export default observer(SaleData)
