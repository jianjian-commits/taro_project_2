import { i18next } from 'gm-i18n'
import React from 'react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Select,
  Option,
  DropDownItem,
  DropDownItems,
  DropDown,
  DateRangePicker,
  Flex,
  Button,
} from '@gmfe/react'
import { FilterSearchSelect } from '@gmfe/react-deprecated'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { purchaseTaskHistorySearchDateTypes } from '../../../common/enum'
import CategoryFilter from '../../../common/components/category_filter_hoc'
import '../actions.js'
import '../reducer.js'
import { pinYinFilter } from '@gm-common/tool'
import moment from 'moment'
import qs from 'querystring'
import styles from '../style.module.less'
import globalStore from '../../../stores/global'
import purchaseTaskHistoryStore from '../history_data/store'

function endDateRanger(begin) {
  let max = moment(begin).add(6, 'month') // 跨度最大半年
  const threeMonthAgo = moment().add(-4, 'month').endOf('month') // 只能选三个月前

  if (max.isAfter(threeMonthAgo)) {
    max = threeMonthAgo
    // 不能跨年
    if (!moment(begin).isSame(max, 'year')) {
      max = moment(begin).endOf('year')
    }
  }

  return {
    min: begin,
    max,
  }
}

@observer
class PurchaseHistoryListHeader extends React.Component {
  handleInputFilter(list, query) {
    return pinYinFilter(list, query, (supplier) => supplier.name)
  }

  handleExportWithTableBySupplier = () => {
    this.handleExport(3)
  }

  handleBatchExport = () => {
    this.handleExport(1)
  }

  handleExport = (type) => {
    const options = purchaseTaskHistoryStore.getSearchOptions({})
    options.type = type
    window.open(`/purchase/task/early/export?${qs.stringify(options)}`)
  }

  handleDateChange = (begin, end) => {
    if (moment(begin).isAfter(moment(end))) {
      end = begin
    }

    let max = moment(begin).add(6, 'month') // 跨度最大半年
    const threeMonthAgo = moment().add(-3, 'month') // 只能选三个月前

    if (max.isAfter(threeMonthAgo)) {
      max = threeMonthAgo
      // 不能跨年
      if (!moment(begin).isSame(max, 'year')) {
        max = moment(begin).endOf('year')
      }
    }

    if (moment(end).isAfter(max)) {
      end = max
    }

    purchaseTaskHistoryStore.updateSearchDate({ begin, end })
  }

  handleFilterChange = (key, e) => {
    const value = e && e.target ? e.target.value : e
    purchaseTaskHistoryStore.updateHeaderFilter({ [key]: value })
  }

  disabledDate = (d, { begin, end }) => {
    const { headerFilter } = purchaseTaskHistoryStore

    const endProps = endDateRanger(begin)
    const dMax = endProps.max

    if (+moment(begin) === +moment(headerFilter.begin)) {
      return !(+moment(d) <= +dMax)
    }

    let dMin = moment(begin).subtract(6, 'month')
    // 不能跨年
    if (!moment(begin).isSame(dMin, 'year')) {
      dMin = moment(begin).startOf('year')
    }

    return !(+moment(d) <= +dMax && +moment(d) >= +dMin)
  }

  renderDateFilter() {
    const { headerFilter } = purchaseTaskHistoryStore
    const { begin, end } = headerFilter

    return (
      <DateRangePicker
        begin={begin}
        end={end}
        onChange={this.handleDateChange}
        disabledDate={this.disabledDate}
        enabledTimeSelect
        className='gm-margin-right-5'
      />
    )
  }

  render() {
    const { onSearch, purchase_task } = this.props
    const { suppliers } = purchase_task
    const { headerFilter } = purchaseTaskHistoryStore
    const isSupplierUser = globalStore.isSettleSupply()
    const purchaseDimensional = globalStore.hasPermission(
      'get_purchase_dimensional',
    )

    return (
      <BoxForm btnPosition='left' labelWidth='100px' onSubmit={onSearch}>
        <FormBlock col={3}>
          <FormItem colWidth='400px'>
            <Flex>
              <Select
                clean
                name='dateType'
                value={headerFilter.dateType}
                onChange={this.handleFilterChange.bind(this, 'dateType')}
                className='gm-inline-block'
                style={{ width: 95 }}
              >
                {_.map(purchaseTaskHistorySearchDateTypes, (dateType, type) => (
                  <Option value={dateType.type} key={type}>
                    {dateType.name}
                  </Option>
                ))}
              </Select>
              <Flex flex none column>
                {this.renderDateFilter()}
              </Flex>
            </Flex>
          </FormItem>

          <FormItem label={i18next.t('搜索')}>
            <input
              name='search_text'
              value={headerFilter.search_text}
              onChange={this.handleFilterChange.bind(this, 'search_text')}
              className='form-control'
              placeholder={i18next.t('输入订单号、商品名称信息搜索')}
            />
          </FormItem>
        </FormBlock>
        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem label={i18next.t('商品')} col={2}>
              <CategoryFilter
                selected={headerFilter.categoryFilter}
                onChange={this.handleFilterChange.bind(this, 'categoryFilter')}
              />
            </FormItem>

            {!isSupplierUser ? (
              <FormItem label={i18next.t('供应商')}>
                <FilterSearchSelect
                  key={
                    'purchase_supplier_' +
                    ((headerFilter.supplier && headerFilter.supplier.id) ||
                      'all')
                  }
                  list={suppliers}
                  selected={headerFilter.supplier}
                  onSelect={this.handleFilterChange.bind(this, 'supplier')}
                  onFilter={this.handleInputFilter}
                  placeholder={i18next.t('全部供应商')}
                  className={`gm-inline-block ${styles.supplierSelector}`}
                />
              </FormItem>
            ) : null}
          </FormBlock>
        </BoxForm.More>

        <FormButton>
          <Button
            type='primary'
            htmlType='submit'
            className='gm-margin-right-10'
          >
            {i18next.t('搜索')}
          </Button>
          <DropDown
            split
            popup={
              !isSupplierUser || purchaseDimensional ? (
                <DropDownItems>
                  {!isSupplierUser && (
                    <DropDownItem
                      onClick={this.handleExportWithTableBySupplier}
                    >
                      {i18next.t('按供应商导出')}
                    </DropDownItem>
                  )}
                </DropDownItems>
              ) : (
                <div />
              )
            }
          >
            <Button onClick={this.handleBatchExport}>
              {i18next.t('导出')}
            </Button>
          </DropDown>
        </FormButton>
      </BoxForm>
    )
  }
}

PurchaseHistoryListHeader.propTypes = {
  onSearch: PropTypes.func,
  purchase_task: PropTypes.object,
}

// 需要的数据通过connect进来
export default connect((state) => ({
  purchase_task: state.purchase_task,
}))(PurchaseHistoryListHeader)
