import React, { useState, useEffect } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import { requestSaleAfter } from '../service'
import Panel from 'common/components/dashboard/panel'
import ButtonGroup from 'common/components/button_group'
import { adapter } from '../../../../common/util'
import { formatTimeList } from 'common/dashboard/constants'
import store from '../store'

const buttons = [
  {
    text: t('售后订单数'),
    value: 'afterSaleOrder',
  },
  {
    text: t('售后商品数'),
    value: 'afterSaleGoods',
  },
]
const ENUM_SALE = {
  afterSaleOrder: t('售后订单数'),
  afterSaleGoods: t('售后商品数'),
}

const SaleException = ({ className, theme }) => {
  const { theme: color } = adapter(theme)

  const {
    filter,
    filter: { begin_time, end_time },
  } = store
  const [active, setActive] = useState('afterSaleOrder')
  const [data, setData] = useState({})

  useEffect(() => {
    fetchData()
  }, [filter, active])

  const fetchData = () => {
    const query = store.getParams()
    // 后台需要在filter里面传东西
    if (active === 'afterSaleGoods') {
      query.query_expr.filter.push({
        query_type: 6,
        query_argument: '> 0',
      })
    }

    requestSaleAfter(query, active).then((res) => {
      const list = formatTimeList(begin_time, end_time, res.data).map(
        (item) => ({
          ...item,
          name: ENUM_SALE[active],
        }),
      )
      setData(list)
    })
  }

  const handleBtnChange = (d) => setActive(d.value)
  return (
    <Panel
      theme={theme}
      title={t('售后趋势')}
      className={classNames(className)}
      right={
        <ButtonGroup theme={color} onChange={handleBtnChange} data={buttons} />
      }
    >
      <LineChart
        data={data}
        options={{
          width: '100%',
          height: 264,
          theme,
          position: 'xAxis*yAxis',
          color: 'name',
          legend: false,
        }}
      />
    </Panel>
  )
}

SaleException.propTypes = {
  theme: PropTypes.string,
  className: PropTypes.string,
}
export default observer(SaleException)
