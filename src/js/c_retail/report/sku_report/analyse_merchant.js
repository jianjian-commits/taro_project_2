import { t } from 'gm-i18n'
import React, { useEffect, useState } from 'react'
import { Price, Flex, Select } from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { fetchData } from '../util'
import Panel from 'common/components/report/panel'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import pieEChartsHoc from 'common/components/customize_echarts/pie_echarts_hoc'

const PieECharts = pieEChartsHoc(BaseECharts)

const TYPE_LIST = [
  { text: t('下单金额'), value: 1 },
  { text: t('订单数'), value: 2 }
]

const AnalyseSkus = props => {
  const initMerchantData = {
    order_price: [],
    order_count: [],
    radio: 1
  }

  const [merchantData, setMerchantData] = useState(initMerchantData)
  const { days } = props

  useEffect(() => {
    // 获取商户销量信息
    fetchData(days, 'order').then(data => {
      if (_.isEmpty(data)) {
        setMerchantData(initMerchantData)
        return
      }
      const newData = {
        ...merchantData,
        order_price: data.order_price_top_list,
        order_count: data.order_count_top_list
      }
      setMerchantData(newData)
    })
  }, [days])

  const handleOrderTypeChange = value => {
    const newData = {
      ...merchantData,
      radio: value
    }
    setMerchantData(newData)
  }

  const { order_price, order_count, radio } = merchantData
  const data = radio === 1 ? order_price : order_count
  const unit = radio === 1 ? Price.getUnit() : '笔'

  return (
    <Panel
      title={t('客户销量分布')}
      right={
        <Flex alignStart height='35px'>
          <Select
            className='gm-margin-right-10'
            value={radio}
            data={TYPE_LIST}
            onChange={handleOrderTypeChange}
          />
        </Flex>
      }
    >
      <div>
        <PieECharts
          style={{ height: '264px', width: '100%', marginTop: '10px' }}
          data={data}
          axisGroup={[{ itemName: 'shop_name', value: 'order_amount' }]}
          hasNoData={data.length === 0}
          axisGroupName={[t('商户销量分布')]}
          radiusList={[40, 70]}
          onSetCustomOption={option => {
            return {
              ...option,
              tooltip: {
                trigger: 'item',
                formatter: params => {
                  const { name, seriesName, value, percent } = params
                  return `${seriesName}<br/>${name}：${value.order_amount +
                    unit}(${percent})%`
                }
              },
              legend: {
                ...option.legend,
                top: '10px',
                formatter: name => {
                  return name.length > 5 ? name.substr(0, 5) + '...' : name
                }
              }
            }
          }}
        />
      </div>
    </Panel>
  )
}

AnalyseSkus.propTypes = {
  days: PropTypes.number
}

export default AnalyseSkus
