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
import SupplierDel from 'common/components/supplier_del_sign'

@observer
class SupplierEvaluation extends React.Component {
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
      '/purchase/analyse/supplier/export?q_type=' +
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
          <div className='gm-padding-5' style={{ width: '170px' }}>
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
          placeholder={i18next.t('输入供应商名称、编号进行搜索')}
          onSearch={this.handleSearch}
          onHandleExport={this.handleExport}
          exportAuthority={
            !!globalStore.hasPermission('export_supplier_assess')
          }
        />

        <ManagePaginationV2
          id='pagination_in_purchase_analysis_supplier_evaluation_list'
          onRequest={Store.getSupplierList}
          disablePage
          ref={this.pagination}
        >
          <Table
            ref={(ref) => (this.table = ref)}
            data={Store.supplierList}
            columns={[
              {
                Header: i18next.t('供应商编号'),
                accessor: 'supplier_id',
              },
              {
                Header: i18next.t('供应商名称'),
                accessor: 'supplier_name',
                Cell: (cellProps) => {
                  const { supplier_status, supplier_name } = cellProps.original

                  return (
                    <Flex>
                      {supplier_status === 0 && <SupplierDel />}
                      {supplier_name}
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('联系电话'),
                accessor: 'supplier_phone',
              },
              {
                Header: (
                  <Flex alignCenter>
                    <span>{i18next.t('实际采购金额')}</span>
                    {this.renderTips(
                      i18next.t(
                        '已提交采购单据的商品，通过采购数*采购价计算而得'
                      )
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
                      i18next.t('根据入库时间，通过入库数*入库价计算而得')
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
                accessor: 'purchase_kinds',
              },
            ]}
          />
        </ManagePaginationV2>
      </div>
    )
  }
}

SupplierEvaluation.propTypes = {
  begin_time: PropTypes.date,
  end_time: PropTypes.date,
}

export default SupplierEvaluation
