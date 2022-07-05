import React, { useState, useEffect } from 'react'
import { Bar as BarChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { adapter } from 'common/util'
import { observer } from 'mobx-react'
import store from '../store'
import { requestRankMerchant } from '../service'
import Panel from 'common/components/dashboard/panel'
import ButtonGroup from 'common/components/button_group'
import { formatData } from 'common/dashboard/constants'
import _ from 'lodash'

const buttons = [
  {
    text: t('销售额(元)'),
    value: 'saleData',
  },
  {
    text: t('销售毛利(元)'),
    value: 'saleProfit',
  },
  {
    text: t('订单数'),
    value: 'orderData',
  },
]
const ENUM_SALERANK = {
  saleProfit: '销售毛利',
  saleData: '销售额',
  orderData: '订单数',
}

const SaleRankMerchant = ({ className, theme }) => {
  const { filter } = store
  const [value, setValue] = useState('saleData')
  const [data, setData] = useState([])
  useEffect(() => {
    fetchData()
  }, [filter, value])

  const handleBtnChange = (d) => {
    setValue(d.value)
  }
  const sortrule = (a, b) => {
    return b.value - a.value
  }
  const fetchData = () => {
    requestRankMerchant(store.getParams(), value).then((res) => {
      const list = _.map(res.data, (item) => ({
        name: item.shop_name,
        value: formatData(item, value) || 0,
        type: ENUM_SALERANK[value],
      }))
      setData(list.sort(sortrule))
    })
  }

  const { theme: color } = adapter(theme)
  return (
    <Panel
      theme={theme}
      title={t('商户销量排名')}
      className={classNames(className)}
      right={
        <ButtonGroup theme={theme} onChange={handleBtnChange} data={buttons} />
      }
    >
      <BarChart
        data={data}
        options={{
          height: 450,
          theme: color,
          position: `name*value`,
          color: 'type',
          legend: true,
          adjust: 'table',
        }}
      />
    </Panel>
  )
}

SaleRankMerchant.propTypes = {
  theme: PropTypes.any,
  className: PropTypes.string,
}
export default observer(SaleRankMerchant)
