import React from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  FormItem,
  Option,
  Select,
  DateRangePicker,
  MoreSelect,
  FormButton,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import {
  purchaseSheetStatus,
  REQUIRE_GOODS_APPLY_STATUS,
  purchaseSheetSource,
} from '../../../../common/enum'

const getSupplierSelected = (list, id) => {
  let result = null
  _.each(list, (group) => {
    _.each(group.children, (supply) => {
      if (supply.value === id) {
        result = supply
      }
    })
  })
  return result
}

@inject('store')
@observer
class Filter extends React.Component {
  handleChangeDate = (begin, end) => {
    this.props.store.changeFilter('start_time', begin)
    this.props.store.changeFilter('end_time', end)
  }

  handleChangeInput = (event) => {
    const { name, value } = event.target
    this.props.store.changeFilter(name, value)
  }

  handleChangeSelect = (name, value) => {
    this.props.store.changeFilter(name, value)
  }

  handleChangeMoreSelect = (name, selected) => {
    this.props.store.changeFilter(name, selected.value)
  }

  render() {
    const {
      filter: {
        start_time,
        end_time,
        sheet_no,
        status,
        settle_supplier_id,
        require_goods_sheet_status,
        source,
      },
      supplyGroup,
    } = this.props.store
    const supplierSelected = getSupplierSelected(
      supplyGroup,
      settle_supplier_id,
    )
    const { search } = this.props

    return (
      <BoxForm onSubmit={search} btnPosition='left' labelWidth='90px'>
        <FormBlock col={3}>
          <FormItem label={t('按建单日期')} colWidth='400px'>
            <DateRangePicker
              begin={start_time}
              end={end_time}
              onChange={this.handleChangeDate}
              enabledTimeSelect
            />
          </FormItem>
          <FormItem label={t('搜索')}>
            <input
              name='sheet_no'
              value={sheet_no}
              onChange={this.handleChangeInput}
              placeholder={t('输入采购单据号')}
            />
          </FormItem>
          <FormItem label={t('单据来源')}>
            <Select
              value={source}
              onChange={this.handleChangeSelect.bind(this, 'source')}
            >
              {_.map(purchaseSheetSource, (value, i) => (
                <Option key={i} value={value.value}>
                  {value.name}
                </Option>
              ))}
            </Select>
          </FormItem>
        </FormBlock>
        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem label={t('单据状态')}>
              <Select
                value={status}
                name='status'
                onChange={this.handleChangeSelect.bind(this, 'status')}
              >
                <Option value=''>{t('全部状态')}</Option>
                {_.map(purchaseSheetStatus, (value, i) => (
                  <Option key={i} value={value.value}>
                    {value.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem label={t('供应商')}>
              <MoreSelect
                isGroupList
                data={supplyGroup.slice()}
                selected={supplierSelected}
                placeholder={t('选择供应商')}
                renderListFilterType='pinyin'
                onSelect={this.handleChangeMoreSelect.bind(
                  this,
                  'settle_supplier_id',
                )}
              />
            </FormItem>
            <FormItem label={t('要货申请状态')}>
              <Select
                value={require_goods_sheet_status}
                name='require_goods_sheet_status'
                onChange={this.handleChangeSelect.bind(
                  this,
                  'require_goods_sheet_status',
                )}
              >
                <Option value=''>{t('全部状态')}</Option>
                {_.map(REQUIRE_GOODS_APPLY_STATUS, (value, i) => (
                  <Option key={i} value={value.value}>
                    {value.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </FormBlock>
        </BoxForm.More>
        <FormButton>
          <Button htmlType='submit' type='primary'>
            {t('搜索')}
          </Button>
          <BoxForm.More>
            <>
              <div className='gm-gap-10' />
              <Button onClick={() => this.props.store.resetFilter()}>
                {t('重置')}
              </Button>
            </>
          </BoxForm.More>
        </FormButton>
      </BoxForm>
    )
  }
}

Filter.propTypes = {
  store: PropTypes.object,
  search: PropTypes.func,
}

export default Filter
