import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import Panel from 'common/components/dashboard/panel'
import Bulletin from 'common/components/dashboard/bulletin'
import { colors, icons } from 'common/dashboard/sale/theme'
import store from '../../stores/index'

const core = [
  'shopId', // 下单客户数
  'orderPrice', // 下单金额
  'saleData', // 销售额
  'saleProfit', // 销售毛利
  'customerPrice', // 客单价
  'repeatCustomers', // 客户复购率
]

const infos = {
  shopId: {
    text: t('下单客户数'),
    value: 0,
    color: colors.Blue,
    icon: icons.Money,
    decimal: 0,
  },

  orderPrice: {
    text: t('下单金额'),
    value: 0,
    color: colors.Sunrise_Yellow,
    icon: icons.Person,
  },
  saleData: {
    text: t('销售额'),
    value: 0,
    color: colors.Daybreak_Blue,
    icon: icons.Order,
  },
  saleProfit: {
    text: t('销售毛利'),
    value: 0,
    color: colors.Dark_Green,
    icon: icons.Money2,
  },

  customerPrice: {
    text: t('客单价'),
    value: 0,
    color: colors.Daybreak_Blue,
    icon: icons.Task,
  },
  repeatCustomers: {
    text: t('客户复购率'),
    value: 0,
    color: colors.Golden_Purple,
    icon: icons.Rate,
    isPercent: true,
  },
}

const GridContainer = styled.div`
  display: grid;
  background-color: #ffff;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 15px;
`

const SaleData = ({ className }) => {
  const { saleData = {}, filter } = store

  useEffect(() => {
    store.fetchSaleData()
  }, [filter])

  return (
    <Panel title={t('销售数据')} className={classNames('gm-bg', className)}>
      <GridContainer>
        {core.map((key, index) => {
          let data = infos[key]
          data = { ...data, ...saleData[key] }

          return <Bulletin key={key} flip options={data} />
        })}
      </GridContainer>
    </Panel>
  )
}

SaleData.propTypes = {
  className: PropTypes.string,
}
export default observer(SaleData)
