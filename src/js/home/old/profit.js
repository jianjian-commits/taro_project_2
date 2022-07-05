import { t } from 'gm-i18n'
import React from 'react'
import moment from 'moment/moment'
import { Flex } from '@gmfe/react'

import globalStore from 'stores/global'

import Panel from 'common/components/report/panel'
import DateButton from 'common/components/report/date_button'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import lineEChartsHoc from 'common/components/customize_echarts/line_echarts_hoc'
import { initOrderType } from 'common/enum'

import { getQueryParams, fetchData } from './util'
import OrderTypeSelector from 'common/components/order_type_selector'

const LineECharts = lineEChartsHoc(BaseECharts)
const searchUrl = '/data_center/profit/daily_new'

class Profit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      lineChar: { begin: '', end: '', lists: [] },
      orderType: initOrderType,
      dateType: 7,
    }
  }

  componentDidMount() {
    if (globalStore.otherInfo.authority.role === 6) return
    const begin = moment().subtract(6, 'day').format('YYYY-MM-DD')
    const end = moment().format('YYYY-MM-DD')
    const query = getQueryParams({ days: 7 }, this.state.orderType)

    fetchData(searchUrl, query).then((data) => {
      //  销售额趋势 ,单位是元
      this.setState({
        lineChar: {
          begin,
          end,
          lists: data || [],
        },
      })
    })
  }

  updateState = (name, value) => {
    this.setState({
      [name]: value,
    })
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

    const begin = moment()
      .subtract(date - 1, 'day')
      .format('YYYY-MM-DD')
    const end = moment().format('YYYY-MM-DD')
    const query = getQueryParams({ days: date }, order)

    fetchData(searchUrl, query).then((data) => {
      const lineChar = {
        begin,
        end,
        lists: data || [],
      }
      this.setState({
        lineChar,
        [field]: value,
      })
    })
  }

  render() {
    const { lists, begin, end } = this.state.lineChar
    const { isCStation } = globalStore.otherInfo

    return (
      <Panel
        title={t('销售额趋势')}
        right={
          <Flex alignStart style={{ height: '35px' }}>
            <DateButton
              range={[7, 15, 30]}
              onChange={(date) =>
                this.handleSelectChange('dateType', date.value)
              }
            />
            {!isCStation && (
              <OrderTypeSelector
                className='gm-margin-left-10'
                style={{ width: '60px' }}
                orderType={this.state.orderType}
                onChange={(value) =>
                  this.handleSelectChange('orderType', value)
                }
              />
            )}
          </Flex>
        }
      >
        <LineECharts
          data={lists}
          axisGroup={[
            { x: 'date', y: 'order_price' },
            { x: 'date', y: 'outstock_price' },
            { x: 'date', y: 'account_price' },
            { x: 'date', y: 'account_price_exclude_freight' },
          ]}
          axisGroupName={[
            t('下单金额'),
            t('出库金额'),
            t('销售额（含运费）'),
            t('销售额（不含运费）'),
          ]}
          fillAndFormatDate={{
            begin: begin,
            end: end,
            fillItemName: 'date',
            dateFormatType: 'MM-DD',
          }}
          style={{ height: '381px', width: '100%' }}
          hasNoData={!lists.length}
          customOption={{
            mainColor: ['#007EFF', '#10CE6E', '#F95A59', '#FFB822'],
          }}
          onSetCustomOption={(option) => ({
            ...option,
            grid: {
              ...option.grid,
              left: '50px',
              right: '5%',
              bottom: '45px',
            },
            legend: {
              ...option.legend,
              top: '10px',
            },
          })}
        />
      </Panel>
    )
  }
}

export default Profit
