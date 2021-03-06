import React from 'react'
import { BoxTable, Flex } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import { Table, TableUtil } from '@gmfe/table'

import store from './store'

import QueryFilterView from '../component/query_filter_view'
import { renderTotalDataView } from '../util'
import moment from 'moment'
import Big from 'big.js'

import TableTotalText from 'common/components/table_total_text'
import TableListTips from 'common/components/table_list_tips'
import SupplierDel from 'common/components/supplier_del_sign'
import { PAY_METHOD_ENUM } from '../../common/enum'

@observer
class PaymentTotalAccounts extends React.Component {
  constructor(props) {
    super(props)

    this.pagination = React.createRef()
  }

  componentDidMount() {
    store.getSupplierList()

    this.pagination.current.apiDoFirstRequest()
    store.getTotalSumAccountsList()
  }

  componentWillUnmount() {
    store.clearSearchFilter()
  }

  handleSearch = () => {
    this.pagination.current.apiDoFirstRequest()
    store.getTotalSumAccountsList()
  }

  handleExport = () => {
    const req = store.getFilter()
    const urlParams = `?begin=${req.begin}&&end=${req.end}&&settle_supplier_id=${req.settle_supplier_id}&&pay_method=${req.pay_method}`

    window.open('/stock/report/settlement/export_list' + urlParams)
  }

  handleSort = (name) => {
    const { sort_column, sort_direction } = store.sortFilter

    if (!sort_column || sort_direction === 'asc') {
      store.changeSortFilter(name, 'desc')
    } else {
      store.changeSortFilter(name, 'asc')
    }

    this.pagination.current.apiDoFirstRequest()
  }

  handleGotoAccountsDetail = (id, name, e) => {
    e.preventDefault()

    let { begin, end } = store.searchFilter

    begin = moment(begin).format('YYYY-MM-DD')
    end = moment(end).format('YYYY-MM-DD')

    window.open(
      `#/sales_invoicing/finance/payment_accounts_detail/detail?begin=${begin}&end=${end}&settleSupplier=${JSON.stringify(
        { value: id, text: name },
      )}`,
    )
  }

  render() {
    const { totalDataList, supplierList } = store
    const {
      begin,
      end,
      settle_supplier_selected,
      settleInterval,
    } = store.searchFilter
    const { sort_column, sort_direction } = store.sortFilter

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
          queryPlaceHolder={i18next.t('???????????????')}
        />
        <TableListTips
          tips={[
            i18next.t(
              '?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????/????????????????????????????????????????????????????????????????????????????????????????????????/????????????????????????????????????????????????????????????????????????????????????',
            ),
          ]}
        />
        <ManagePaginationV2
          id='pagination_in_finance_payment_total_accounts_list'
          onRequest={(pagination) => store.getTotalAccountsList(pagination)}
          ref={this.pagination}
        >
          <BoxTable
            info={
              <BoxTable.Info>
                <TableTotalText
                  data={renderTotalDataView(store.totalSumDataList)}
                />
              </BoxTable.Info>
            }
          >
            <Table
              data={totalDataList.slice()}
              columns={[
                {
                  Header: i18next.t('???????????????'),
                  accessor: 'supplier_id',
                },
                {
                  Header: (
                    <TableUtil.SortHeader
                      onClick={this.handleSort.bind(this, 'name')}
                      type={sort_column === 'name' ? sort_direction : null}
                    >
                      {i18next.t('???????????????')}
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
                  Header: i18next.t('??????????????????'),
                  accessor: 'company_name',
                },
                {
                  Header: i18next.t('????????????'),
                  accessor: 'pay_method',
                  Cell: (row) =>
                    PAY_METHOD_ENUM[row.original.pay_method] || '-',
                },
                {
                  id: 'early_unpay',
                  Header: i18next.t('???????????????'),
                  accessor: (d) => {
                    return parseFloat(Big(d.early_unpay || 0).toFixed(4))
                  },
                },
                {
                  id: 'cur_should_pay',
                  Header: i18next.t('????????????'),
                  accessor: (d) => {
                    return parseFloat(Big(d.cur_should_pay || 0).toFixed(4))
                  },
                },
                {
                  id: 'cur_pay',
                  Header: i18next.t('????????????'),
                  accessor: (d) => {
                    return parseFloat(Big(d.cur_pay || 0).toFixed(4))
                  },
                },
                {
                  id: 'cur_delta_money',
                  Header: i18next.t('????????????'),
                  accessor: (d) => {
                    return parseFloat(Big(d.cur_delta_money || 0).toFixed(4))
                  },
                },
                {
                  id: 'total_unpay',
                  Header: i18next.t('???????????????'),
                  accessor: (d) => {
                    return parseFloat(Big(d.total_unpay || 0).toFixed(4))
                  },
                },
                {
                  Header: TableUtil.OperationHeader,
                  Cell: (row) => (
                    <TableUtil.OperationCell>
                      <TableUtil.OperationDetail
                        onClick={this.handleGotoAccountsDetail.bind(
                          this,
                          row.original.settle_supplier_id,
                          row.original.name,
                        )}
                      />
                    </TableUtil.OperationCell>
                  ),
                },
              ]}
            />
          </BoxTable>
        </ManagePaginationV2>
      </div>
    )
  }
}

export default PaymentTotalAccounts
