import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Flex,
  Select,
  Price,
  ToolTip as GMToolTip,
  Option,
  Popover,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { Table } from '@gmfe/table'
import PropTypes from 'prop-types'
import { SvgSupplier } from 'gm-svg'
import moment from 'moment'
import Store from './store'
import _ from 'lodash'

import { purchaseTypes } from '../../../common/enum'
import BaseEcharts from '../../../common/components/base_echarts'
import { is } from '@gm-common/tool'
import { renderPurchaseSpec } from '../../../common/filter'

class Tooltip extends React.Component {
  render() {
    const { popupStyle, text } = this.props
    return (
      <GMToolTip
        popup={
          <div className='gm-padding-5' style={popupStyle}>
            {text}
          </div>
        }
        className='gm-margin-left-5'
      />
    )
  }
}

Tooltip.propTypes = {
  popupStyle: PropTypes.object,
  text: PropTypes.string,
}

@observer
class PurchasingSpecAnalysis extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      type: 2,
    }
  }

  componentDidMount() {
    this.getStatistics()
  }

  getStatistics = () => {
    const { id } = this.props.data
    Store.getStatistics(id, this.state.type)
  }

  handleSelectChange = (value) => {
    this.setState(
      {
        type: value,
      },
      () => this.getStatistics()
    )
  }

  getOption = (stationList) => {
    const today = () => moment().startOf('day')
    const series = _.map(
      [{ name: i18next.t('本站均价'), list: stationList }],
      (v) => {
        return {
          name: v.name,
          type: 'line',
          data: BaseEcharts.getDataList(
            today().add(-6, 'd'),
            today(),
            v.list,
            (data) => data.avg_price,
            (d) => d.static_date
          ),
          animation: true,
        }
      }
    )
    return {
      backgroundColor: '#fff',
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: _.map(
          BaseEcharts.getDateRange(today().add(-6, 'd'), today()),
          (v) => moment(v).format('MM-DD')
        ),
        name: i18next.t('日期'),
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: `${i18next.t('价格')}(${Price.getUnit()})`,
      },
      legend: {
        data: [i18next.t('本站均价')],
        top: 10,
      },
      color: ['#4a50ca', '#c23531'],
      series,
    }
  }

  render() {
    const { type } = this.state
    const { data, recentInquiries } = this.props
    const { statistics } = Store
    const {
      station_avg_price,
      ring_ratio,
      max_price,
      min_price,
      latest_price,
    } = statistics

    return (
      <Flex column>
        <Flex column className='gm-padding-tb-10 gm-padding-lr-20 gm-back-bg'>
          <Flex>
            <strong>{data.name}</strong>
          </Flex>
          <Flex row alignCenter className='gm-padding-top-15 gm-text-12'>
            <Flex alignCenter className='gm-padding-right-15'>
              {i18next.t('采购规格：') + renderPurchaseSpec(data)}
            </Flex>
            <Flex alignCenter className='gm-margin-right-15'>
              {i18next.t('最近询价') + recentInquiries}
              {data.latest_quote_from_supplier && (
                <Popover
                  top
                  showArrow
                  type='hover'
                  popup={<div>{i18next.t('供应商报价')}</div>}
                >
                  <SvgSupplier
                    className='gm-text-14'
                    style={{
                      color: 'green',
                      marginLeft: '2px',
                    }}
                  />
                </Popover>
              )}
            </Flex>
            <Flex alignCenter className='gm-padding-right-15'>
              {i18next.t('最高入库单价：') + (data.max_stock_unit_price || '-')}
            </Flex>
          </Flex>
        </Flex>

        <Flex className='gm-padding-bottom-5 gm-padding-lr-20'>
          <span style={{ padding: '6px 6px 0 0' }}>
            {i18next.t('数据筛选')}:
          </span>
          <Select
            clean
            name='dataType'
            value={type}
            onChange={(value) => this.handleSelectChange(value)}
            className='b-filter-select-clean-time'
          >
            {_.map(purchaseTypes, (data, i) => (
              <Option value={data.id} key={i}>
                {data.name}
              </Option>
            ))}
          </Select>
        </Flex>

        <Flex className='gm-padding-bottom-5 gm-padding-lr-20'>
          <Flex
            flex={1}
            column
            className='gm-back-bg gm-padding-tb-10 gm-margin-right-5'
          >
            <Flex justifyCenter alignCenter>
              <i
                className='xfont xfont-avgprice gm-text-14'
                style={{ color: '#00A6F4', paddingRight: '2px' }}
              />
              {i18next.t('七天均价')}
            </Flex>
            <Flex justifyCenter>
              {station_avg_price || 0}
              {Price.getUnit() + '/'}
              {data.std_unit}
            </Flex>
          </Flex>
          <Flex flex={1} column className='gm-back-bg gm-padding-tb-10'>
            <Flex justifyCenter alignCenter>
              <i
                className='xfont xfont-percentage gm-text-14'
                style={{ color: '#FFD100', paddingRight: '2px' }}
              />
              {i18next.t('环比变化率')}
              <Tooltip
                text={i18next.t(
                  '环比变化：本期的均价/上期的均价*100%-1（正数代表增长率，负数代表下降率）'
                )}
                popupStyle={{ width: '200px' }}
              />
            </Flex>
            <Flex justifyCenter>{ring_ratio}</Flex>
          </Flex>
          <Flex
            flex={1}
            column
            justifyCenter
            className='gm-back-bg gm-padding-tb-10'
          >
            <Flex justifyCenter alignCenter>
              <i
                className='xfont xfont-linechart-up gm-text-14'
                style={{ color: '#FB3838', paddingRight: '2px' }}
              />
              {i18next.t('七天最高')}
            </Flex>
            <Flex justifyCenter>
              {max_price || 0}
              {Price.getUnit() + '/'}
              {data.std_unit}
            </Flex>
          </Flex>
          <Flex flex={1} column className='gm-back-bg gm-padding-tb-10'>
            <Flex justifyCenter alignCenter>
              <i
                className='xfont xfont-linechart-down gm-text-14'
                style={{ color: '#5EBC5E', paddingRight: '2px' }}
              />
              {i18next.t('七天最低')}
            </Flex>
            <Flex justifyCenter>
              {min_price || 0}
              {Price.getUnit() + '/'}
              {data.std_unit}
            </Flex>
          </Flex>
        </Flex>

        <Flex>
          <BaseEcharts
            style={{
              height: 400,
              width: is.phone() ? window.document.body.clientWidth : 900,
            }}
            option={this.getOption(statistics.station_day_avg_price)}
          />
        </Flex>

        <QuickPanel
          icon='bill'
          title={i18next.t('最新价格')}
          className='gm-border-0 gm-padding-0 gm-padding-lr-20'
        >
          <Table
            defaultPageSize={9999}
            data={latest_price}
            columns={[
              {
                Header: i18next.t('时间'),
                accessor: 'datetime',
              },
              {
                Header: i18next.t('供应商名称'),
                accessor: 'supplier_name',
              },
              {
                Header: i18next.t('商品单价'),
                id: 'price',
                accessor: (d) =>
                  d.price + Price.getUnit() + '/' + data.std_unit,
              },
            ]}
          />
        </QuickPanel>
      </Flex>
    )
  }
}

PurchasingSpecAnalysis.propTypes = {
  data: PropTypes.object.isRequired,
  recentInquiries: PropTypes.string.isRequired,
}

export default PurchasingSpecAnalysis
