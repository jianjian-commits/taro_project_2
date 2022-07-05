import { i18next } from 'gm-i18n'
import React from 'react'
import {
  BoxForm,
  FormItem,
  FormButton,
  FormBlock,
  Flex,
  Price,
  Select,
  Option,
  Button,
} from '@gmfe/react'
import DateRangeHOC from '../../../common/components/date_range_hoc'
import CategoryPinleiFilter from '../../../common/components/category_filter_hoc'
import SupplierSelector from '../../../common/components/supplier_selector'
import { observer } from 'mobx-react'
import store from './store'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import moment from 'moment'
import { PURCHASE_SOURCE } from '../../../common/enum'
import Big from 'big.js'
import { renderPurchaseSpec } from '../../../common/filter'
import globalStore from '../../../stores/global'
import _ from 'lodash'

@observer
class LogFilter extends React.Component {
  constructor() {
    super()
    this.handleSearch = ::this.handleSearch
    this.handleChangeText = ::this.handleChangeText
    this.handleChangeRangePick = ::this.handleChangeRangePick
    this.handleCategoryFilterChange = ::this.handleCategoryFilterChange
    this.handleSupplierSelect = ::this.handleSupplierSelect
    this.handleExport = ::this.handleExport
  }

  handleChangeText(e) {
    const text = e.target.value
    store.setFilter('search_text', text)
  }

  handleChangeRangePick(begin, end) {
    store.setFilterTime(begin, end)
  }

  handleSearch() {
    store.doFirstRequest()
  }

  handleCategoryFilterChange(selected) {
    store.setFilter('categoryFilter', selected)
  }

  handleSupplierSelect(selected) {
    store.setFilter('settle_supplier', selected)
  }

  handleInquirySource = (value) => {
    store.setFilter('source', value)
  }

  async handleExport() {
    // limit = 0 表示拉所有数据
    const json = await store.fetchLogList({ limit: 0 })

    if (json.data && json.data.length) {
      const exportData = json.data.map((d) => {
        return {
          [i18next.t('询价时间')]: moment(d.create_time).format(
            'YYYY-MM-DD HH:mm:ss'
          ),
          [i18next.t('采购规格ID')]: d.spec_id,
          [i18next.t('规格名称')]: d.spec_name,
          [i18next.t('一级分类')]: d.category1_name,
          [i18next.t('二级分类')]: d.category2_name,
          [i18next.t('品类')]: d.pinlei_name,
          [i18next.t('采购规格')]: renderPurchaseSpec({
            ratio: d.ratio,
            std_unit: d.std_unit_name,
            purchase_unit: d.purchase_unit_name,
          }),
          [i18next.t('供应商编号')]: d.customer_id,
          [i18next.t('供应商')]: d.settle_supplier_name,
          [i18next.t('询价价格（基本单位）')]:
            Big(d.std_unit_price).div(100).toFixed(2) +
            Price.getUnit() +
            `/${d.std_unit_name}`,
          [i18next.t('询价价格（采购单位）')]:
            Big(d.purchase_price).div(100).toFixed(2) +
            Price.getUnit() +
            `/${d.purchase_unit_name}`,
          [i18next.t('产地')]: d.origin_place,
          [i18next.t('描述')]: d.remark,
          [i18next.t('询价来源')]: PURCHASE_SOURCE[d.source],
          [i18next.t('询价人')]: d.creator,
        }
      })

      requireGmXlsx((res) => {
        const { jsonToSheet } = res
        jsonToSheet([exportData], { fileName: i18next.t('询价记录') + '.xlsx' })
      })
    }
  }

  render() {
    const {
      search_text,
      begin_time,
      end_time,
      categoryFilter,
      settle_supplier,
      source,
    } = store.filter
    return (
      <BoxForm
        labelWidth='90px'
        btnPosition='left'
        onSubmit={this.handleSearch}
      >
        <FormBlock col={3}>
          <FormItem label={i18next.t('按询价时间')}>
            <DateRangeHOC
              begin={begin_time}
              end={end_time}
              onChange={this.handleChangeRangePick}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <Flex justifyStart alignCenter>
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('请输入采购规格ID、规格名搜索')}
                value={search_text}
                onChange={this.handleChangeText}
              />
            </Flex>
          </FormItem>
        </FormBlock>
        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem label={i18next.t('供应商筛选')}>
              <SupplierSelector
                id='quotation_log'
                selected={settle_supplier}
                onSelect={this.handleSupplierSelect}
              />
            </FormItem>
            <FormItem col={2} label={i18next.t('商品筛选')}>
              <CategoryPinleiFilter
                selected={categoryFilter}
                onChange={this.handleCategoryFilterChange}
              />
            </FormItem>
            <FormItem label={i18next.t('询价来源')}>
              <Select value={source} onChange={this.handleInquirySource}>
                {_.map(store.inquirySource, (source) => (
                  <Option key={source.value} value={source.value}>
                    {source.text}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </FormBlock>
        </BoxForm.More>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
          <BoxForm.More>
            <Button
              className='gm-margin-left-10'
              onClick={() => store.filterReset()}
            >
              {i18next.t('重置')}
            </Button>
          </BoxForm.More>
          {globalStore.hasPermission('export_quote_price_record') && (
            <Button className='gm-margin-left-10' onClick={this.handleExport}>
              {i18next.t('导出')}
            </Button>
          )}
        </FormButton>
      </BoxForm>
    )
  }
}

export default LogFilter
