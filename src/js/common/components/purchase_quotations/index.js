import React from 'react'
import { i18next } from 'gm-i18n'
import {
  Flex,
  Select,
  Option,
  Loading,
  Price,
  ToolTip as GMToolTip,
} from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { Table } from '@gmfe/table'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'
import { observer } from 'mobx-react'
import { is } from '@gm-common/tool'
import { purchaseTypes } from '../../enum'
import BaseEcharts from '../base_echarts'
import store from './store'

const Tooltip = (props) => (
  <GMToolTip
    popup={
      <div className='gm-padding-5' style={props.popupStyle}>
        {props.text}
      </div>
    }
    className='gm-margin-left-5'
  />
)

@observer
class PurchaseQuotations extends React.Component {
  componentDidMount() {
    const { id, purchase_type, supplier_id } = this.props
    store.setFilter(purchase_type)
    store.getStatistics(id, supplier_id, purchase_type)
  }

  componentWillUnmount() {
    store.clear()
  }

  getOption = (stationList, supplierlist) => {
    const today = () => moment().startOf('day')
    const series = _.map(
      [
        { name: i18next.t('本站均价'), list: stationList },
        { name: i18next.t('所选供应商均价'), list: supplierlist },
      ],
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
        data: [i18next.t('本站均价'), i18next.t('所选供应商均价')],
        top: 10,
      },
      color: ['#4a50ca', '#c23531'],
      series,
    }
  }

  handleSelectChange = (value) => {
    store.setFilter(value)
    store.getStatistics(this.props.id, this.props.supplier_id, value)
  }

  render() {
    const { std_unit_name, is_tab } = this.props
    const {
      statistics,
      loading,
      filter: { type },
    } = store
    const {
      latest_price,
      supplier_avg_price,
      ring_ratio,
      max_price,
      min_price,
      station_day_avg_price,
      supplier_day_avg_price,
    } = statistics
    if (loading) {
      return (
        <Flex justifyCenter style={{ paddingTop: '100px' }}>
          <Loading text={i18next.t('加载中...')} />
        </Flex>
      )
    }
    return (
      <div className={is_tab ? 'gm-margin-tb-5' : 'gm-padding-lr-20'}>
        <Flex className='gm-padding-bottom-5'>
          <span style={{ padding: '6px 6px 0 0' }}>
            {i18next.t('数据筛选')}:
          </span>
          <Select
            clean
            name='dataType'
            value={type}
            onChange={this.handleSelectChange}
            className='b-filter-select-clean-time'
          >
            {_.map(purchaseTypes, (data, i) => (
              <Option value={data.id} key={i}>
                {data.name}
              </Option>
            ))}
          </Select>
        </Flex>
        <Flex>
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
              <Tooltip text={i18next.t('所选供应商最近七天均价')} />
            </Flex>
            <Flex justifyCenter>
              {supplier_avg_price || 0}
              {Price.getUnit() + '/'}
              {std_unit_name}
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
              <Tooltip text={i18next.t('所选供应商最近七天的最高单价')} />
            </Flex>
            <Flex justifyCenter>
              {max_price || 0}
              {Price.getUnit() + '/'}
              {std_unit_name}
            </Flex>
          </Flex>
          <Flex flex={1} column className='gm-back-bg gm-padding-tb-10'>
            <Flex justifyCenter alignCenter>
              <i
                className='xfont xfont-linechart-down gm-text-14'
                style={{ color: '#5EBC5E', paddingRight: '2px' }}
              />
              {i18next.t('七天最低')}
              <Tooltip text={i18next.t('所选供应商最近七天的最低单价')} />
            </Flex>
            <Flex justifyCenter>
              {min_price || 0}
              {Price.getUnit() + '/'}
              {std_unit_name}
            </Flex>
          </Flex>
        </Flex>
        <Flex>
          <BaseEcharts
            style={{
              height: 400,
              width: is.phone() ? window.document.body.clientWidth : 900,
            }}
            option={this.getOption(
              station_day_avg_price.slice(),
              supplier_day_avg_price.slice()
            )}
          />
        </Flex>
        <QuickPanel
          icon='bill'
          title={i18next.t('最新价格')}
          className='gm-border-0 gm-padding-0'
        >
          <Table
            defaultPageSize={9999}
            data={latest_price.slice()}
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
                  d.price + Price.getUnit() + '/' + std_unit_name,
              },
            ]}
          />
        </QuickPanel>
      </div>
    )
  }
}

PurchaseQuotations.propTypes = {
  id: PropTypes.string.isRequired,
  supplier_id: PropTypes.string.isRequired,
  std_unit_name: PropTypes.string.isRequired,
  purchase_type: PropTypes.number,
  is_tab: PropTypes.bool,
}

PurchaseQuotations.defaultProps = {
  is_tab: false,
  purchase_type: 1,
}

export default PurchaseQuotations
