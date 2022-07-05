import { t } from 'gm-i18n'
import React from 'react'
import { Price, Flex, Select } from '@gmfe/react'
import _ from 'lodash'

import Panel from 'common/components/report/panel'
import DateButton from 'common/components/report/date_button'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import pieEChartsHoc from 'common/components/customize_echarts/pie_echarts_hoc'
import { initOrderType } from 'common/enum'
import { getQueryParams, fetchData, analyseMerchantName } from './util'

import OrderTypeSelector from 'common/components/order_type_selector'
import globalStore from 'stores/global'

const PieECharts = pieEChartsHoc(BaseECharts)
const searchUrl = '/data_center/order/static'

const TYPE_LIST = [
  { text: t('下单金额'), value: 1 },
  { text: t('订单数'), value: 2 },
]

class AnalyseMerchant extends React.Component {
  constructor(props) {
    super(props)
    this.refCharts = null
    this.state = {
      order_price: [],
      order_count: [],
      radio: 1,
      orderType: initOrderType,
      dateType: 7,
    }
  }

  componentDidMount() {
    const query = getQueryParams({ days: 7 }, this.state.orderType)
    fetchData(searchUrl, query).then((data) => {
      if (_.isEmpty(data)) return
      this.setState({
        order_price: data.order_price_top_list,
        order_count: data.order_count_top_list,
      })
    })
  }

  handleTypeChange = (val) => {
    this.setState({ radio: val })
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
      if (_.isEmpty(data)) {
        data.order_price_top_list = []
        data.order_count_top_list = []
      }
      // 今日下单商品分析
      this.setState({
        order_price: data.order_price_top_list,
        order_count: data.order_count_top_list,
        [field]: value,
      })
    })
  }

  render() {
    const { order_price, order_count, radio, orderType } = this.state
    const { isCStation } = globalStore.otherInfo

    const data = radio === 1 ? order_price : order_count
    const unit = radio === 1 ? Price.getUnit() : '笔'

    return (
      <Panel
        title={analyseMerchantName()}
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
              value={radio}
              data={TYPE_LIST}
              onChange={this.handleTypeChange}
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
            data={data}
            axisGroup={[{ itemName: 'shop_name', value: 'order_amount' }]}
            hasNoData={data.length === 0}
            axisGroupName={[t('商户销量分布')]}
            radiusList={[40, 70]}
            onSetCustomOption={(option) => {
              return {
                ...option,
                tooltip: {
                  trigger: 'item',
                  formatter: (params) => {
                    const { name, seriesName, value, percent } = params
                    return `${seriesName}<br/>${name}：${
                      value.order_amount + unit
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

export default AnalyseMerchant
