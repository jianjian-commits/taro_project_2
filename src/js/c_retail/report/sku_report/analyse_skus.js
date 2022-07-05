import { t } from 'gm-i18n'
import React, { useState, useEffect } from 'react'
import { Flex, Select, Price } from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { fetchData } from '../util'
import Panel from 'common/components/report/panel'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import pieEChartsHoc from 'common/components/customize_echarts/pie_echarts_hoc'

const PieECharts = pieEChartsHoc(BaseECharts)

const DATE_TYPE_LIST = [
  { text: t('一级分类'), value: 1 },
  { text: t('二级分类'), value: 2 }
]

const AnalyseSkus = props => {
  const initSkusData = {
    category_1: [],
    category_2: [],
    cateType: 1
  }

  const [skuData, setSkuData] = useState(initSkusData)
  const { days } = props

  useEffect(() => {
    // 获取商品分类信息
    fetchData(days, 'sku').then(data => {
      if (_.isEmpty(data)) {
        setSkuData(initSkusData)
        return
      }
      const newData = {
        ...skuData,
        category_1: data.category_1_statics_list,
        category_2: data.category_2_statics_list
      }
      setSkuData(newData)
    })
  }, [days])

  const handleCateTypeChange = value => {
    const newData = {
      ...skuData,
      cateType: value
    }
    setSkuData(newData)
  }

  const { category_1, category_2, cateType } = skuData
  const data = cateType === 1 ? category_1 : category_2

  return (
    <Panel
      title={t('分类统计')}
      right={
        <Flex alignStart height='35px'>
          <Select
            className='gm-margin-right-10'
            value={cateType}
            data={DATE_TYPE_LIST}
            onChange={handleCateTypeChange}
          />
        </Flex>
      }
    >
      <div>
        <PieECharts
          style={{ height: '264px', width: '100%', marginTop: '10px' }}
          data={data.slice()}
          axisGroup={[{ itemName: 'name', value: 'account_price' }]}
          hasNoData={data.length === 0}
          axisGroupName={[t('分类统计')]}
          radiusList={[40, 70]}
          onSetCustomOption={option => {
            return {
              ...option,
              tooltip: {
                trigger: 'item',
                formatter: params => {
                  const { name, seriesName, value, percent } = params
                  return `${seriesName}<br/>${name}：${value.account_price +
                    Price.getUnit()}(${percent})%`
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
