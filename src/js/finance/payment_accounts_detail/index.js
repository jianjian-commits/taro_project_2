import React from 'react'
import { BoxTable, RightSideModal, Flex } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import { Table, TableUtil } from '@gmfe/table'

import store from './store'

import QueryFilterView from '../component/query_filter_view'

import { INVOICE_TYPE, renderTotalDataView } from '../util'
import TaskList from '../../task/task_list'
import PropTypes from 'prop-types'
import Big from 'big.js'
import TableTotalText from 'common/components/table_total_text'
import SupplierDel from '../../common/components/supplier_del_sign'
import { PAY_METHOD_ENUM } from '../../common/enum'

@observer
class PaymentAccountsDetail extends React.Component {
  async componentDidMount() {
    if (this.props.location.query.settleSupplier) {
      store.setFilterByTotalAccounts(this.props.location.query)
    }

    await store.getSupplierList()

    this.pagination.apiDoFirstRequest()
    store.getAccountsDetailSumList()
  }

  componentWillUnmount() {
    store.clearSearchFilter()
  }

  handleSearch = () => {
    this.pagination.apiDoFirstRequest()

    store.getAccountsDetailSumList()
  }

  handleExport = () => {
    store.exportAccountsDetailList().then(() => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
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

  handleGotoInvoiceDetail = (sheetType, sheetNumber, e) => {
    e.preventDefault()

    let url = ''

    if (sheetType === 2) {
      url = `${INVOICE_TYPE[sheetType].url}?id=${sheetNumber}`
    } else {
      url = `${INVOICE_TYPE[sheetType].url}/${sheetNumber}`
    }
    window.open(url)
  }

  handlePage = (pagination) => {
    return store.getAccountsDetailList(pagination)
  }

  render() {
    const { accountsDetailDataList, supplierList } = store
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
              <TableTotalText
                data={renderTotalDataView(store.accountsDetailSumDataList)}
              />
            </BoxTable.Info>
          }
        >
          <ManagePaginationV2
            id='pagination_in_finance_payment_accounts_detail_list'
            onRequest={this.handlePage}
            ref={(ref) => (this.pagination = ref)}
          >
            <Table
              data={accountsDetailDataList.slice()}
              getTrProps={(state, rowInfo) => {
                return {
                  className:
                    rowInfo && rowInfo.original.subtotal && 'b-table-row-mark',
                }
              }}
              columns={[
                {
                  accessor: 'supplier_info',
                  Header: (
                    <TableUtil.SortHeader
                      onClick={this.handleSort.bind(this, 'name')}
                      type={sort_column === 'name' ? sort_direction : null}
                    >
                      {i18next.t('供应商信息')}
                    </TableUtil.SortHeader>
                  ),
                  Cell: (cellProps) => {
                    const {
                      name,
                      supplier_id,
                      subtotal,
                      supplier_status,
                    } = cellProps.original
                    let supplierInfo = `${name}(${supplier_id})`
                    if (subtotal) {
                      supplierInfo = supplierInfo + i18next.t('小计')
                    }
                    return (
                      <Flex>
                        {supplier_status === 0 && <SupplierDel />}
                        <span>{supplierInfo}</span>
                      </Flex>
                    )
                  },
                },
                {
                  Header: i18next.t('结算周期'),
                  accessor: 'pay_method',
                  Cell: (row) =>
                    PAY_METHOD_ENUM[row.original.pay_method] || '-',
                },
                {
                  Header: i18next.t('日期'),
                  accessor: 'date',
                },
                {
                  id: 'sheet_type',
                  Header: i18next.t('单据类型'),
                  accessor: (d) => {
                    return d.sheet_type ? (
                      <span>{INVOICE_TYPE[d.sheet_type].type}</span>
                    ) : null
                  },
                },
                {
                  id: 'sheet_number',
                  Header: i18next.t('单据编号'),
                  accessor: (d) => {
                    return d.sheet_number ? (
                      <a
                        onClick={this.handleGotoInvoiceDetail.bind(
                          this,
                          d.sheet_type,
                          d.sheet_number,
                        )}
                      >
                        {d.sheet_number}
                      </a>
                    ) : null
                  },
                },
                {
                  Header: i18next.t('备注'),
                  accessor: 'remark',
                },
                {
                  id: 'should_pay',
                  Header: i18next.t('应付'),
                  accessor: (d) => {
                    return d.should_pay
                      ? parseFloat(Big(d.should_pay).toFixed(4))
                      : d.should_pay
                  },
                },
                {
                  id: 'pay',
                  Header: i18next.t('已付'),
                  accessor: (d) => {
                    return d.pay ? parseFloat(Big(d.pay).toFixed(4)) : d.pay
                  },
                },
                {
                  id: 'delta_money',
                  Header: i18next.t('折让'),
                  accessor: (d) => {
                    return d.delta_money
                      ? parseFloat(Big(d.delta_money).toFixed(4))
                      : '-'
                  },
                },
                {
                  id: 'unpay',
                  Header: i18next.t('余额'),
                  accessor: (d) => {
                    return parseFloat(Big(d.unpay || 0).toFixed(4))
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

PaymentAccountsDetail.propTypes = {
  location: PropTypes.object,
}

export default PaymentAccountsDetail
