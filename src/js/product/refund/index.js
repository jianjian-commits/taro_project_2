import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Pagination,
  DateRangePicker,
  Flex,
  Form,
  FormItem,
  FormButton,
  Select,
  Option,
  Price,
  Box,
  BoxTable,
  Button,
} from '@gmfe/react'
import { Table, TableUtil, selectTableV2HOC } from '@gmfe/table'
import _ from 'lodash'
import moment from 'moment/moment'

import '../actions'
import '../reducer'
import actions from '../../actions'
import { PRODUCT_STATUS } from '../../common/enum'
import TableListTips from '../../common/components/table_list_tips'
import BatchImportDialog from '../components/batch_import_dialog'
import globalStore from '../../stores/global'
import SupplierDel from '../../common/components/supplier_del_sign'

const SelectTable = selectTableV2HOC(Table)

class ReturnStock extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      dialogShow: false,
    }
  }

  UNSAFE_componentWillMount() {
    // 从其他页面进入，清理数据
    if (this.props.location.action === 'REPLACE') {
      actions.product_refund_stock_clear()
    }
  }

  // componentWillMount中清理数据过后需要setTimeout才能拿到新的props
  componentDidMount() {
    const { list } = this.props.product.refundStock
    setTimeout(() => {
      // 返回的时候不搜索数据。注意：刷新页面也是POP
      if (
        this.props.location.action !== 'POP' ||
        (this.props.location.action === 'POP' && !list.length)
      ) {
        this.searchRefundList()
      }
    }, 0)
  }

  handleDateChange = (begin, end) => {
    actions.product_refund_stock_filter_change('begin', begin)
    actions.product_refund_stock_filter_change('end', end)
  }

  handleFilterChange(e) {
    const { name, value } = e.target
    actions.product_refund_stock_filter_change(name, value)
  }

  handleSelectChange(name, value) {
    actions.product_refund_stock_filter_change(name, value)
  }

  handleSearch = (e) => {
    e.preventDefault()
    this.searchRefundList()
    actions.product_refund_product_clear_table_select()
  }

  searchRefundList() {
    const {
      begin,
      end,
      type,
      status,
      search_text,
    } = this.props.product.refundStock.filter
    const pagination = {
      offset: 0,
      limit: 10,
    }

    actions
      .product_refund_list({
        type: type,
        status: status,
        start: moment(begin).format('YYYY-MM-DD'),
        end: moment(end).format('YYYY-MM-DD'),
        search_text: search_text,
        ...pagination,
      })
      .then(() => {
        actions.product_refund_stock_filter_change('pagination', pagination)
      })
  }

  handleExport = (e) => {
    e.preventDefault()
    const {
      begin,
      end,
      type,
      status,
      search_text,
      pagination,
    } = this.props.product.refundStock.filter

    window.open(
      '/stock/return_stock_sheet/list?type=' +
        type +
        '&status=' +
        status +
        '&start=' +
        moment(begin).format('YYYY-MM-DD') +
        '&end=' +
        moment(end).format('YYYY-MM-DD') +
        '&search_text=' +
        search_text +
        '&offset=' +
        pagination.offset +
        '&limit=' +
        pagination.limit +
        '&export=1',
    )
  }

  handlePageChange = (page) => {
    const {
      begin,
      end,
      type,
      status,
      search_text,
    } = this.props.product.refundStock.filter

    actions
      .product_refund_list(
        Object.assign(
          { type },
          { status },
          { start: moment(begin).format('YYYY-MM-DD') },
          { end: moment(end).format('YYYY-MM-DD') },
          { search_text },
          page,
        ),
      )
      .then(() => {
        actions.product_refund_stock_filter_change('pagination', page)
      })
  }

  handleDialogToggle = () => {
    this.setState({
      dialogShow: !this.state.dialogShow,
    })
  }

  handleCreate = () => {
    window.open('#/sales_invoicing/stock_out/refund/add')
  }

  handleSelect = (selected) => {
    const { list } = this.props.product.refundStock
    actions.product_refund_product_list_selected_change(selected)

    // 如果未选择全部，则切换为勾选当前页状态
    if (selected.length < list.length) {
      actions.product_refund_product_current_page_select_change(false)
    }
  }

  handleSelectTableAll = (isSelect) => {
    actions.product_refund_product_table_all_select_change(isSelect)
  }

  handleSelectAllPage = (isSelectAllPage) => {
    actions.product_refund_product_current_page_select_change(isSelectAllPage)

    // 若选择了全部页，则将全部当前页数据都selected
    if (isSelectAllPage) {
      actions.product_refund_product_table_all_select_change(true)
    }
  }

  handleBatchPrint = () => {
    let paramsStr = ''
    if (this.props.product.refundStock.isAllPageSelect) {
      const {
        type,
        begin,
        end,
        search_text,
        status,
      } = this.props.product.refundStock.filter

      // print_type 1: 按条件， 2: 按list
      paramsStr = `?type=${type}&start=${moment(begin).format(
        'YYYY-MM-DD',
      )}&end=${moment(end).format(
        'YYYY-MM-DD',
      )}&search_text=${search_text}&status=${status}&print_type=1`
    } else {
      paramsStr = `?return_ids=${JSON.stringify(
        this.props.product.refundStock.refundListSelected,
      )}&print_type=2`
    }

    window.open(`#/sales_invoicing/stock_out/refund/print${paramsStr}`)
  }

  render() {
    const { refundStock } = this.props.product
    const {
      list,
      filter,
      in_query,
      in_query_search_text,
      refundListSelected,
      isAllPageSelect,
    } = refundStock
    const can_add_return_stock = globalStore.hasPermission('add_return_stock')

    return (
      <div>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem>
              <Flex>
                <div className='gm-inline-block gm-padding-right-5'>
                  <Select
                    clean
                    name='type'
                    value={filter.type}
                    onChange={this.handleSelectChange.bind(this, 'type')}
                    className='b-filter-select-clean-time'
                  >
                    <Option value={1}>{i18next.t('按退货日期')}</Option>
                    <Option value={2}>{i18next.t('按建单日期')}</Option>
                  </Select>
                </div>
                <DateRangePicker
                  begin={filter.begin}
                  end={filter.end}
                  onChange={this.handleDateChange}
                />
              </Flex>
            </FormItem>
            <FormItem label={i18next.t('退货单筛选')}>
              <Select
                name='status'
                value={filter.status}
                onChange={this.handleSelectChange.bind(this, 'status')}
              >
                <Option value={5}>{i18next.t('全部单据状态')}</Option>
                {_.map(PRODUCT_STATUS, (status, key) => (
                  <Option value={_.toNumber(key)} key={key}>
                    {status}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                name='search_text'
                value={filter.search_text}
                type='text'
                className='form-control'
                placeholder={i18next.t('请输入单号、供应商信息')}
                onChange={this.handleFilterChange}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
              <div className='gm-gap-10' />
              <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
            </FormButton>
          </Form>
        </Box>

        {in_query && (
          <TableListTips
            tips={[
              in_query_search_text +
                i18next.t('不在筛选条件中，已在全部退货单中为您找到'),
            ]}
          />
        )}

        <BoxTable
          action={
            <div>
              {can_add_return_stock && (
                <Button type='primary' onClick={this.handleCreate}>
                  {i18next.t('新建退货单')}
                </Button>
              )}
              <div className='gm-gap-10' />
              {globalStore.hasPermission('import_return_stock') ? (
                <Button type='primary' plain onClick={this.handleDialogToggle}>
                  {i18next.t('批量导入')}
                </Button>
              ) : null}
            </div>
          }
        >
          <SelectTable
            data={list}
            onSelect={this.handleSelect}
            selected={refundListSelected}
            onSelectAll={this.handleSelectTableAll}
            batchActionBar={
              refundListSelected.length > 0 && (
                <TableUtil.BatchActionBar
                  onClose={() => this.handleSelectTableAll(false)}
                  toggleSelectAll={this.handleSelectAllPage}
                  batchActions={[
                    {
                      name: i18next.t('批量打印'),
                      type: 'business',
                      onClick: this.handleBatchPrint,
                    },
                  ]}
                  count={isAllPageSelect ? null : refundListSelected.length}
                  isSelectAll={isAllPageSelect}
                />
              )
            }
            keyField='id'
            columns={[
              {
                Header: i18next.t('退货时间'),
                id: 'submit_time',
                show: filter.type + '' === '1',
                accessor: (d) => d.submit_time,
              },
              {
                Header: i18next.t('建单时间'),
                id: 'date_time',
                show: filter.type + '' !== '1',
                accessor: (d) => d.date_time,
              },
              {
                Header: i18next.t('退货单号'),
                id: 'id',
                Cell: (cellProps) => {
                  const { id, status } = cellProps.original
                  const mode = +status === 1 || +status === 0 ? 'add' : 'detail'
                  return (
                    <a
                      rel='noopener noreferrer'
                      target='_blank'
                      href={`#/sales_invoicing/stock_out/refund/${mode}/${id}`}
                    >
                      {id}
                    </a>
                  )
                },
              },
              {
                Header: i18next.t('供应商信息'),
                accessor: 'supplier_name',

                Cell: (cellProps) => {
                  const {
                    supplier_status,
                    supplier_name,
                    supplier_customer_id,
                  } = cellProps.original
                  return (
                    <Flex>
                      {supplier_status === 0 && <SupplierDel />}
                      {supplier_name + '(' + supplier_customer_id + ')'}
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('退货金额'),
                id: 'total_money',
                accessor: (d) => d.total_money + Price.getUnit(),
              },
              {
                Header: i18next.t('单据状态'),
                id: 'status',
                accessor: (d) => PRODUCT_STATUS[d.status],
              },
            ]}
          />
          <Flex justifyEnd alignCenter className='gm-padding-20'>
            <Pagination
              data={filter.pagination}
              toPage={this.handlePageChange}
              nextDisabled={list && list.length < 10}
            />
          </Flex>
        </BoxTable>

        <BatchImportDialog
          show={this.state.dialogShow}
          title={i18next.t('批量导入退货单')}
          type='stockrefund'
          onHide={this.handleDialogToggle}
        />
      </div>
    )
  }
}

ReturnStock.propTypes = {
  product: PropTypes.object.isRequired,
}

export default connect((state) => ({
  product: state.product,
}))(ReturnStock)
