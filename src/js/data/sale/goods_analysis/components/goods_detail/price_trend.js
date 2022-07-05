import React, { useEffect, useState } from 'react'
import { Line as LineChart } from '@gm-pc/vision'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import { observer } from 'mobx-react'
import store from '../../stores/goods_detail'
import { formatTimeList } from 'common/dashboard/constants'
import { groupByApt } from 'common/dashboard/sale/adaptor'
import Big from 'big.js'
const PriceTrend = ({ className }) => {
  const { filter } = store

  const [data, setData] = useState([])

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = () => {
    // 获取到销售定价（双线折线图）
    Promise.all([
      store.fetchDetailPriceTrendStock(),
      store.fetchDetailPriceTrend(),
    ]).then((res) => {
      // 值出来解构
      const [stockPrice, detailPriceTrend] = res
      console.log('stockPrice', stockPrice)
      console.log('detailPriceTrend', detailPriceTrend)
      // 获取出来xy轴（成本定价）定价
      const data = groupByApt(stockPrice, {
        text: '成本定价',
        field: 'orderTimes',
        yAxis: 'out_stock_cost/sku_std_outstock_quantity_forsale',
        xAxis: 'order_time', // 店铺id
      })
      console.log('data', data)
      // 把xy轴弄起来（出库成本均价）
      const stockList = formatTimeList(
        filter.begin_time,
        filter.end_time,
        data.data,
      ).map((item) => ({
        ...item,
        name: t('出库成本均价'),
      }))

      const price =
        detailPriceTrend.data.length > 0
          ? Big(
              detailPriceTrend?.data[0]?.snapshot_list[0]
                ?.std_sale_price_forsale,
            )
          : 0

      const value =
        detailPriceTrend.data.length > 0
          ? Big(detailPriceTrend?.data[0]?.snapshot_list[0]?.sale_ratio)
          : 0

      const detailList = formatTimeList(filter.begin_time, filter.end_time).map(
        (item) => ({
          ...item,
          yAxis: value == 0 ? '0.00' : price?.div(value).div(100),
          name: '商品单价定价',
        }),
      )
      setData([...stockList, ...detailList])
    })
    // 获取到成本均价问题
  }
  return (
    <Panel title={t('定价趋势')} className={classNames('gm-bg', className)}>
      <LineChart
        data={data}
        options={{
          width: '100%',
          height: 300,
          position: 'xAxis*yAxis',
          color: 'name',
        }}
      />
    </Panel>
  )
}

PriceTrend.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(PriceTrend)
