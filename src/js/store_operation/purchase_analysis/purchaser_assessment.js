import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, ToolTip, Price } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import PropTypes from 'prop-types'
import { Table } from '@gmfe/table'
import { observer } from 'mobx-react'
import Store from './store'
import globalStore from '../../stores/global'

import FilterHeader from './components/filter_header'

@observer
class PurchaserAssessment extends React.Component {
  constructor(props) {
    super(props)

    this.pagination = React.createRef()
  }

  componentDidMount() {
    const { begin_time, end_time } = this.props
    Store.init()
    Store.setAnalysisFilter({ begin_time: begin_time, end_time: end_time })
    this.pagination.current.apiDoFirstRequest()
  }

  handleSearch = () => {
    this.pagination.current.apiDoFirstRequest()
  }

  handleExport = () => {
    const { q_type, begin_time, end_time, q } = Store.getParams()
    window.open(
      '/purchase/analyse/purchaser/export?q_type=' +
        q_type +
        '&begin_time=' +
        begin_time +
        '&end_time=' +
        end_time +
        '&q=' +
        q
    )
  }

  renderTips = (text) => {
    return (
      <ToolTip
        popup={
          <div className='gm-padding-10' style={{ width: '170px' }}>
            {text}
          </div>
        }
      />
    )
  }

  render() {
    return (
      <div>
        <FilterHeader
          placeholder={i18next.t('输入采购员姓名、账号进行搜索')}
          onSearch={this.handleSearch}
          onHandleExport={this.handleExport}
          exportAuthority={
            !!globalStore.hasPermission('export_purchaser_assess')
          }
        />

        <ManagePaginationV2
          id='pagination_in_purchase_analysis_assessment_list'
          onRequest={Store.getPurchaseList}
          disablePage
          ref={this.pagination}
        >
          <Table
            ref={(ref) => (this.table = ref)}
            data={Store.purchaserList}
            columns={[
              {
                Header: i18next.t('采购员账号'),
                accessor: 'purchaser_account',
              },
              {
                Header: i18next.t('姓名'),
                accessor: 'purchaser_name',
              },
              {
                Header: i18next.t('手机'),
                accessor: 'purchaser_phone',
              },
              {
                Header: (
                  <Flex alignCenter>
                    <span>{i18next.t('实际采购金额')}</span>
                    {this.renderTips(
                      i18next.t('已提交采购单据中商品的分摊金额汇总')
                    )}
                  </Flex>
                ),
                id: 'purchase_sum_money',
                accessor: (d) => (d.purchase_sum_money || 0) + Price.getUnit(),
              },
              {
                Header: (
                  <Flex alignCenter>
                    <span>{i18next.t('实际入库金额')}</span>
                    {this.renderTips(
                      i18next.t('关联单据的已提交入库单据中商品的分摊金额汇总')
                    )}
                  </Flex>
                ),
                id: 'stock_sum_money',
                accessor: (d) => (d.stock_sum_money || 0) + Price.getUnit(),
              },
              {
                Header: (
                  <Flex alignCenter>
                    <span>{i18next.t('采购频次')}</span>
                    {this.renderTips(
                      i18next.t('根据采购单据的提交时间，已提交的采购单据数')
                    )}
                  </Flex>
                ),
                accessor: 'purchase_frequence',
              },
              {
                Header: i18next.t('采购商品种类数'),
                accessor: 'spec_ids',
              },
              {
                Header: (
                  <Flex alignCenter>
                    <span>{i18next.t('采购时长')}</span>
                    <ToolTip
                      right
                      popup={
                        <div
                          className='gm-padding-5'
                          style={{ width: '170px' }}
                        >
                          {i18next.t(
                            '已提交的采购单据时间与此单据入库提交的时间差的平均值'
                          )}
                        </div>
                      }
                    />
                  </Flex>
                ),
                accessor: 'purchase_avg_time',
              },
            ]}
          />
        </ManagePaginationV2>
      </div>
    )
  }
}

PurchaserAssessment.propTypes = {
  begin_time: PropTypes.date,
  end_time: PropTypes.date,
}

export default PurchaserAssessment
