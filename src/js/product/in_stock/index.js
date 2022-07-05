import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Sheet,
  SheetColumn,
  DateRangePicker,
  Pagination,
  PaginationText,
  Flex,
  FormItem,
  Form,
  FormButton,
  Select,
  Option,
  Price,
  SheetSelect,
  RightSideModal,
  Button,
} from '@gmfe/react'
import { QuickPanel, QuickFilter } from '@gmfe/react-deprecated'
import store from './store/list'

import _ from 'lodash'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { PRODUCT_TIME_TYPE, PRODUCT_STATUS } from '../../common/enum'
import SheetSelectAllTip from '../../common/components/sheet_select_all_tip'
import BatchImportDialog from '../components/batch_import_dialog'
import globalStore from '../../stores/global'
import PopupPrintModal from './components/popup_print_modal'

@observer
class InStock extends React.Component {
  constructor() {
    super()
    this.state = {
      dialogShow: false,
    }
  }

  UNSAFE_componentWillMount() {
    // 从其他页面进入，清理数据
    if (this.props.location.action === 'REPLACE') {
      store.clear()
    }
  }

  // componentWillMount中清理数据过后需要setTimeout才能拿到新的props
  componentDidMount() {
    const { list } = store
    setTimeout(() => {
      // 返回的时候不搜索数据
      if (
        list &&
        (this.props.location.action !== 'POP' ||
          (this.props.location.action === 'POP' && !list.length))
      ) {
        this.handleSearch()
      }
    }, 0)
  }

  handleDateChange = (begin, end) => {
    store.changeFilter('begin', begin)
    store.changeFilter('end', end)
  }

  handleFilterChange = (e) => {
    const { name, value } = e.target
    store.changeFilter(name, value)
  }

  handleFilterSelectChange(name, value) {
    store.changeFilter(name, value)
  }

  handleCreate = () => {
    window.open('#/sales_invoicing/stock_in/product/pre_add/in')
  }

  handleDialogToggle = () => {
    this.setState({
      dialogShow: !this.state.dialogShow,
    })
  }

  handleSearch = () => {
    const pagination = { offset: 0, limit: 10 }

    store.search(store.getSearchData(pagination)).then(() => {
      store.changeFilter('pagination', pagination)
    })
  }

  handleExport = (e) => {
    e.preventDefault()
    const {
      begin,
      end,
      type,
      pagination,
      status,
      search_text,
      is_print,
    } = store.filter
    window.open(
      '/stock/in_stock_sheet/material/list?type=' +
        type +
        '&is_print=' +
        is_print +
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
    store.search(store.getSearchData(page)).then(() => {
      store.changeFilter('pagination', page)
    })
  }

  handleSheetSelect = (check, index) => {
    store.selectListItem(check, index)
  }

  handleSheetSelectAll = (check) => {
    store.selectListAllItem(check)
  }

  handlePopupPrintModal({ id }) {
    const data_ids = id
      ? [id] // 单个打印
      : store.list.filter((o) => o._gm_select).map((o) => o.id) // 批量打印

    const modalProps = {}
    if (!store.isCurrentPage && store.list.every((o) => o._gm_select)) {
      modalProps.search_data = _.omit(store.getSearchData(), [
        'offset',
        'limit',
      ])
    } else {
      modalProps.data_ids = data_ids
    }

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PopupPrintModal closeModal={RightSideModal.hide} {...modalProps} />
      ),
    })
  }

  render() {
    const {
      filter: { type, begin, end, search_text, status, pagination, is_print },
      in_query,
      in_query_search_text,
      list,
      loading,
      isCurrentPage,
      setSheetSelectType,
    } = store
    const can_import_in_stock = globalStore.hasPermission('import_in_stock')
    const can_add_in_stock = globalStore.hasPermission('add_in_stock')
    const canPrint = globalStore.hasPermission('print_in_stock')

    // 判断是否从pc客户端进入的
    const is_electron = window.navigator.userAgent.includes('Electron') && true
    return (
      <div>
        <QuickFilter>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem label=''>
              <Flex alignCenter>
                <Flex>
                  <Select
                    clean
                    value={type}
                    name='type'
                    onChange={this.handleFilterSelectChange.bind(this, 'type')}
                    className='b-filter-select-clean-time'
                  >
                    {_.map(PRODUCT_TIME_TYPE, (value, key) => (
                      <Option value={_.toNumber(key)} key={key}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                </Flex>
                <DateRangePicker
                  begin={begin}
                  end={end}
                  onChange={this.handleDateChange}
                />
              </Flex>
            </FormItem>
            <FormItem label={i18next.t('入库单筛选')}>
              <Select
                value={status}
                name='status'
                onChange={this.handleFilterSelectChange.bind(this, 'status')}
              >
                <Option value='5'>{i18next.t('全部单据状态')}</Option>
                {_.map(PRODUCT_STATUS, (status, key) => (
                  <Option value={_.toNumber(key)} key={key}>
                    {status}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={i18next.t('打印状态')}>
              <Select
                value={is_print}
                onChange={this.handleFilterSelectChange.bind(this, 'is_print')}
              >
                <Option value={-1}>{i18next.t('全部状态')}</Option>
                <Option value={0}>{i18next.t('未打印')}</Option>
                <Option value={1}>{i18next.t('已打印')}</Option>
              </Select>
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                style={{ width: '200px' }}
                value={search_text}
                onChange={this.handleFilterChange}
                name='search_text'
                type='text'
                className='form-control'
                placeholder={i18next.t('请输入单号、供应商信息')}
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
        </QuickFilter>

        {in_query && (
          <div className='gm-padding-10' style={{ color: '#cf4848' }}>
            {in_query_search_text}
            {i18next.t('不在筛选条件中，已在全部入库单中为您找到')}
          </div>
        )}

        <QuickPanel
          icon='bill'
          title={i18next.t('入库列表')}
          right={
            <div>
              {can_import_in_stock ? (
                <Button type='primary' plain onClick={this.handleDialogToggle}>
                  {i18next.t('批量导入')}
                  <i className='ifont ifont-upload' />
                </Button>
              ) : null}
              <div className='gm-gap-10' />
              {can_add_in_stock ? (
                <Button type='primary' plain onClick={this.handleCreate}>
                  {i18next.t('新建入库单')}
                  <i className='ifont ifont-plus' />
                </Button>
              ) : null}
            </div>
          }
        >
          <Sheet
            list={list.slice()}
            loading={loading}
            enableEmptyTip
            className='b-distribute-order-table'
          >
            <SheetSelect
              onSelectAll={this.handleSheetSelectAll}
              onSelect={this.handleSheetSelect}
              hasSelectTip
              selectAllTip={
                <SheetSelectAllTip
                  isCurrentPage={isCurrentPage}
                  handleToggle={setSheetSelectType}
                />
              }
            />
            {type + '' === '1' ? (
              <SheetColumn field='submit_time' name={i18next.t('入库时间')} />
            ) : (
              <SheetColumn field='date_time' name={i18next.t('建单时间')} />
            )}
            <SheetColumn field='id' name={i18next.t('入库单号')}>
              {(id, index) => {
                const stock = list[index]
                const model =
                  stock.status === 1 || stock.status === 0 ? 'add' : 'detail'

                return (
                  <Link
                    to={`/sales_invoicing/stock_in/product/${model}/${id}`}
                    target={is_electron ? '' : '_blank'}
                  >
                    {id}
                  </Link>
                )
              }}
            </SheetColumn>
            <SheetColumn field='supplier_name' name={i18next.t('供应商信息')}>
              {(settle_supplier_name, index) => {
                return `${settle_supplier_name}(${list[index].supplier_customer_id})`
              }}
            </SheetColumn>
            <SheetColumn field='total_money' name={i18next.t('入库金额')}>
              {(total_money) => {
                return total_money + Price.getUnit()
              }}
            </SheetColumn>
            <SheetColumn field='status' name={i18next.t('单据状态')}>
              {(status) => {
                return PRODUCT_STATUS[status]
              }}
            </SheetColumn>
            <SheetColumn field='print_times' name={i18next.t('打印状态')}>
              {(v) => {
                return v ? `${i18next.t('已打印')}(${v})` : i18next.t('未打印')
              }}
            </SheetColumn>
            {canPrint ? (
              <SheetColumn
                field=''
                name={i18next.t('单据打印')}
                className='text-center b-distribute-action'
              >
                {(value, i) => {
                  // 如果有选中的,显示  批量打印
                  if (list[i]._gm_select) {
                    return (
                      <i
                        className='ifont ifont-batch-print-o b-distribute-order-print'
                        onClick={this.handlePopupPrintModal}
                      />
                    )
                    // 如果全部没选中,显示  单个打印
                  } else if (_.findIndex(list, { _gm_select: true }) === -1) {
                    return (
                      <i
                        className='ifont ifont-print-o b-distribute-order-print'
                        onClick={this.handlePopupPrintModal.bind(this, list[i])}
                      />
                    )
                  }
                }}
              </SheetColumn>
            ) : null}
            <Pagination
              data={pagination}
              toPage={this.handlePageChange}
              nextDisabled={list && list.length < 10}
            />
            <PaginationText data={pagination} />
          </Sheet>
        </QuickPanel>

        <BatchImportDialog
          show={this.state.dialogShow}
          title={i18next.t('批量导入入库单')}
          type='stockin'
          onHide={this.handleDialogToggle}
        />
      </div>
    )
  }
}

export default InStock
