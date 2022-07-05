import { i18next } from 'gm-i18n'
import React from 'react'
import {
  MultipleFilterSelect,
  RightSideModal,
  BoxForm,
  FormItem,
  FormButton,
  FormBlock,
  Select,
  Option,
  Button,
} from '@gmfe/react'
import CategoryFilter from '../../../common/components/category_pinlei_filter'
import TaskList from '../../../task/task_list'
import globalStore from '../../../stores/global'
import _ from 'lodash'
import { FORMULA_TYPE } from '../../../common/enum'
import { pinYinFilter } from '@gm-common/tool'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'

import actions from '../../../actions'
import '../actions'
import '../reducer'

class ListFilter extends React.Component {
  handleChangeCategoryFilter = (selected) => {
    this.handleChangePartialFilter(selected)
  }

  handleChangePartialFilter(partialFilter) {
    let filter = this.props.merchandiseList.filter
    filter = { ...filter, ...partialFilter }
    actions.merchandise_list_change('filter', filter)
  }

  handleSelectSaleMenu = (salemenu_ids) => {
    this.handleChangePartialFilter({ salemenu_ids })
  }

  handleSubmit = (event) => {
    event.preventDefault()
    actions.merchandise_list_search()
  }

  handleFilter = (list, query) => {
    return pinYinFilter(list, query, (value) => value.name)
  }

  handleSelectShownStatus = (selected) => {
    let showUnActive = false
    if (+selected === 1) {
      showUnActive = true
    }
    actions.merchandise_list_change('isShowUnActive', showUnActive)
  }

  handleSelectFormulaStatus = (selected) => {
    actions.merchandise_list_change('formula', selected)
  }

  handleChange = (event) => {
    const { name, value } = event.target
    actions.merchandise_list_change(name, value)
  }

  handleExport = (event) => {
    actions.merchandise_list_export().then((json) => {
      const { data, async, filename } = json.data
      // 异步导出
      if (async === 1) {
        RightSideModal.render({
          children: <TaskList />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
        return
      }

      const exportData = []
      const header = data[0]
      for (let i = 1; i < data.length; i++) {
        const row = data[i].reduce((accm, val, keyIndex) => {
          const key = header[keyIndex]
          accm[key] = val
          return accm
        }, {})
        exportData.push(row)
      }
      requireGmXlsx((res) => {
        const { jsonToSheet } = res
        jsonToSheet([exportData], { fileName: filename })
      })
    })
  }

  render() {
    const { categories } = this.props.merchandiseCommon
    const {
      filter,
      query,
      isShowUnActive,
      saleMenuList,
      formula,
    } = this.props.merchandiseList
    const canExport = globalStore.hasPermission('export_product_skus')

    return (
      <BoxForm onSubmit={this.handleSubmit}>
        <FormBlock>
          <FormItem label={i18next.t('商品筛选')} col={2}>
            <CategoryFilter
              selected={filter}
              categories={categories}
              onChange={this.handleChangeCategoryFilter}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              className='form-control'
              type='text'
              value={query}
              name='query'
              placeholder={i18next.t('输入商品名称或ID')}
              onChange={this.handleChange}
            />
          </FormItem>
        </FormBlock>
        <BoxForm.More>
          <FormBlock>
            <FormItem label={i18next.t('报价单')} labelWidth='60px'>
              <MultipleFilterSelect
                id='salemenu_list_select'
                list={saleMenuList}
                selected={filter.salemenu_ids}
                withFilter={this.handleFilter}
                onSelect={this.handleSelectSaleMenu}
                placeholder={i18next.t('全部报价单')}
              />
            </FormItem>
            <FormItem label={i18next.t('状态')}>
              <Select
                value={~~isShowUnActive}
                onChange={this.handleSelectShownStatus}
              >
                <Option value={1}>{i18next.t('全部报价单状态')}</Option>
                <Option value={0}>{i18next.t('只看已激活状态')}</Option>
              </Select>
            </FormItem>
            <FormItem label={i18next.t('定价公式状态')}>
              <Select
                value={~~formula}
                onChange={this.handleSelectFormulaStatus}
              >
                {_.map(FORMULA_TYPE, (v, i) => (
                  <Option key={i} value={v.value}>
                    {v.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </FormBlock>
        </BoxForm.More>
        <FormButton>
          <Button
            htmlType='submit'
            type='primary'
            className='gm-margin-right-5'
          >
            {i18next.t('搜索')}
          </Button>
          {canExport && (
            <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
          )}
        </FormButton>
      </BoxForm>
    )
  }
}

export default ListFilter
