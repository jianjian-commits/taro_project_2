import React from 'react'
import { BoxTable, Flex } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import { Table, TableUtil } from '@gmfe/table'

import store from './store'

import QueryFilterView from '../component/query_filter_view'
import Big from 'big.js'
import TableTotalText from 'common/components/table_total_text'
import { viewSumData } from '../util'
import SupplierDel from 'common/components/supplier_del_sign'
import { PAY_METHOD_ENUM } from '../../common/enum'
@observer
class PaymentPerformSheet extends React.Component {
  componentDidMount() {
    store.getSupplierList()

    this.pagination.apiDoFirstRequest()
    store.getPerformSheetSumList()
  }

  componentWillUnmount() {
    store.clearSearchFilter()
  }

  handleSearch = () => {
    this.pagination.apiDoFirstRequest()
    store.getPerformSheetSumList()
  }

  handleExport = () => {
    const req = store.getFilter()
    const urlParams = `?begin=${req.begin}&&end=${req.end}&&settle_supplier_id=${req.settle_supplier_id}&&pay_method=${req.pay_method}`

    window.open('/stock/report/verification/export_list' + urlParams)
  }

  handleSort = (name) => {
    const { sort_column, sort_direction } = store.sortFilter

    if (!sort_column || sort_direction === 'asc') {
      store.changeSortFilter(name, 'desc')
    } else {
      store.changeSortFilter(name, 'asc')
    }

    this.pagination.apiDoFirstRequest()
  }

  renderTotalDataView = () => {
    const performSumDataList = store.performSumDataList

    const totalTextDataList = [
      {
        title: i18next.t('期初未核销'),
        explainText: i18next.t('查询范围之前未支付给供应商的金额之和'),
        totalNumber: parseFloat(
          Big(performSumDataList.early_unverify_sum || 0).toFixed(4),
        ),
      },
      {
        title: i18next.t('本期应付'),
        explainText: i18next.t('查询范围内应付金额之和'),
        totalNumber: parseFloat(
          Big(performSumDataList.cur_should_pay_sum || 0).toFixed(4),
        ),
      },
      {
        title: i18next.t('本期已核销'),
        explainText: i18next.t('查询范围内已核销金额之和'),
        totalNumber: parseFloat(
          Big(performSumDataList.cur_verified_sum || 0).toFixed(4),
        ),
      },
      {
        title: i18next.t('期末未核销'),
        explainText: i18next.t(
          '查询范围截止的未支付给供应商的金额之和，期末未核销=期初未核销+本期应付-本期已核销',
        ),
        totalNumber: parseFloat(
          Big(performSumDataList.total_unverify_sum || 0).toFixed(4),
        ),
      },
    ]

    return viewSumData(totalTextDataList)
  }

  handlePage = (pagination) => {
    return store.getPerformSheetList(pagination)
  }

  render() {
    const { performDataList, supplierList } = store
    const { sort_column, sort_direction } = store.sortFilter
    const {
      begin,
      end,
      settle_supplier_selected,
      settleInterval,
    } = store.searchFilter

    return (
      <div>
        <QueryFilterView
          begin={begin}
          end={end}
          settleInterval={settleInterval}
          selectSupplierFunc={store.selectSupplier}
          supplierSelected={settle_supplier_selected}
          supplierData={supplierList.slice()}
          changeFilterFunc={store.changeSearchFilter}
          onSearchFunc={this.handleSearch}
          onExportFunc={this.handleExport}
          queryPlaceHolder={i18next.t('选择供应商')}
        />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText data={this.renderTotalDataView()} />
            </BoxTable.Info>
          }
        >
          <ManagePaginationV2
            id='pagination_in_finance_payment_perform_sheet'
            onRequest={this.handlePage}
            ref={(ref) => (this.pagination = ref)}
          >
            <Table
              data={performDataList.slice()}
              className='gm-margin-bottom-10'
              columns={[
                {
                  Header: i18next.t('供应商编号'),
                  accessor: 'supplier_id',
                },
                {
                  Header: (
                    <TableUtil.SortHeader
                      onClick={this.handleSort.bind(this, 'name')}
                      type={sort_column === 'name' ? sort_direction : null}
                    >
                      {i18next.t('供应商名称')}
                    </TableUtil.SortHeader>
                  ),
                  accessor: 'name',
                  Cell: (cellProps) => {
                    const { name, supplier_status } = cellProps.original

                    return (
                      <Flex>
                        {supplier_status === 0 && <SupplierDel />}
                        {name}
                      </Flex>
                    )
                  },
                },
                {
                  Header: i18next.t('供应商公司名'),
                  accessor: 'company_name',
                },
                {
                  Header: i18next.t('结算周期'),
                  accessor: 'pay_method',
                  Cell: (row) =>
                    PAY_METHOD_ENUM[row.original.pay_method] || '-',
                },
                {
                  id: 'early_unverify',
                  Header: i18next.t('期初未核销'),
                  accessor: (d) => {
                    return parseFloat(Big(d.early_unverify || 0).toFixed(4))
                  },
                },
                {
                  id: 'cur_should_pay',
                  Header: i18next.t('本期应付'),
                  accessor: (d) => {
                    return parseFloat(Big(d.cur_should_pay || 0).toFixed(4))
                  },
                },
                {
                  id: 'cur_verified',
                  Header: i18next.t('本期已核销'),
                  accessor: (d) => {
                    return parseFloat(Big(d.cur_verified || 0).toFixed(4))
                  },
                },
                {
                  id: 'total_unverify',
                  Header: i18next.t('期末未核销'),
                  accessor: (d) => {
                    return parseFloat(Big(d.total_unverify || 0).toFixed(4))
                  },
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

export default PaymentPerformSheet
