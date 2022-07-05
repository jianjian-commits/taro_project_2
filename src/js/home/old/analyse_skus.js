import { t } from 'gm-i18n'
import React from 'react'
import { Flex, Select, Price } from '@gmfe/react'
import _ from 'lodash'

import Panel from 'common/components/report/panel'
import DateButton from 'common/components/report/date_button'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import pieEChartsHoc from 'common/components/customize_echarts/pie_echarts_hoc'
import { initOrderType } from 'common/enum'
import { getQueryParams, fetchData } from './util'

import OrderTypeSelector from 'common/components/order_type_selector'
import globalStore from 'stores/global'

const PieECharts = pieEChartsHoc(BaseECharts)
const searchUrl = '/data_center/sku/static'

const DATE_TYPE_LIST = [
  { text: t('一级分类'), value: 1 },
  { text: t('二级分类'), value: 2 },
]

class AnalyseSkus extends React.Component {
  constructor(props) {
    super(props)
    this.refCharts = null
    this.state = {
      category_1: [],
      category_2: [],
      cateType: 1,
      orderType: initOrderType,
      dateType: 7,
    }
  }

  componentDidMount() {
    const query = getQueryParams({ days: 7 }, this.state.orderType)
    fetchData(searchUrl, query).then((data) => {
      if (_.isEmpty(data)) return
      // 今日下单商品分析
      this.setState({
        category_1: data.category_1_statics_list,
        category_2: data.category_2_statics_list,
      })
    })
  }

  handleChangeCateType = (value) => {
    this.setState({ cateType: value })
  }

  handleSelectChange = (field, value) => {
    const { dateType, orderType } = this.state
    let date = dateType
    let order = orderType

    if (field === 'dateType') {
      date = value
    } else {
      order = value
    }

    const query = getQueryParams({ days: date }, order)
    fetchData(searchUrl, query).then((data) => {
      // 今日下单商品分析
      this.setState({
        category_1: data.category_1_statics_list,
        category_2: data.category_2_statics_list,
        [field]: value,
      })
    })
  }

  render() {
    const { category_1, category_2, cateType, orderType } = this.state
    const data = cateType === 1 ? category_1 : category_2
    const { isCStation } = globalStore.otherInfo

    return (
      <Panel
        title={t('分类统计')}
        right={
          <Flex alignStart height='35px'>
            <DateButton
              range={[1, 7, 15, 30]}
              onChange={(date) =>
                this.handleSelectChange('dateType', date.value)
              }
            />
            <Select
              className='gm-margin-left-10'
              value={cateType}
              data={DATE_TYPE_LIST}
              onChange={this.handleChangeCateType}
            />
            {!isCStation && (
              <OrderTypeSelector
                className='gm-margin-left-10'
                style={{ width: '60px' }}
                orderType={orderType}
                onChange={(value) =>
                  this.handleSelectChange('orderType', value)
                }
              />
            )}
          </Flex>
        }
      >
        <div>
          <PieECharts
            style={{ height: '280px', width: '100%', marginTop: '10px' }}
            data={data.slice()}
            axisGroup={[{ itemName: 'name', value: 'account_price' }]}
            hasNoData={data.length === 0}
            axisGroupName={[t('分类统计')]}
            radiusList={[40, 70]}
            onSetCustomOption={(option) => {
              return {
                ...option,
                tooltip: {
                  trigger: 'item',
                  formatter: (params) => {
                    const { name, seriesName, value, percent } = params
                    return `${seriesName}<br/>${name}：${
                      value.account_price + Price.getUnit()
                    }(${percent})%`
                  },
                },
                legend: {
                  ...option.legend,
                  top: '10px',
                  formatter: (name) => {
                    return name.length > 5 ? name.substr(0, 5) + '...' : name
                  },
                },
              }
            }}
          />
        </div>
      </Panel>
    )
  }
}

export default AnalyseSkus
