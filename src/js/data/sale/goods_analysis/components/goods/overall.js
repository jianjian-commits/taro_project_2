import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Gird from 'common/components/grid'
import Panel from 'common/components/dashboard/panel'
import Bulletin from 'common/components/dashboard/bulletin'
import store from '../../stores/goods'
import { colors, icons } from 'common/dashboard/sale/theme'

const core = ['saleData', 'saleProfit', 'saleProfitRate', 'skus']

const infos = {
  saleData: {
    text: t('销售额(元)'),
    value: 0,
    color: colors.Blue,
    icon: icons.Money,
  },
  saleProfit: {
    text: t('销售毛利'),
    value: 0,
    color: colors.Daybreak_Blue,
    icon: icons.Order,
  },
  saleProfitRate: {
    text: t('销售毛利率'),
    value: 0,
    color: colors.Sunrise_Yellow,
    icon: icons.Person,
    isPercent: true,
  },
  skus: {
    text: t('销售商品总数'),
    value: 0,
    color: colors.Dark_Green,
    icon: icons.Money2,
    decimal: 0,
  },
}

const SaleData = ({ className }) => {
  const { filter } = store

  useEffect(() => {
    store.fetchSaleData()
  }, [filter])

  return (
    <Panel title={t('销售数据')} className={classNames('gm-bg', className)}>
      <Gird column={4} className='gm-bg gm-padding-0'>
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
