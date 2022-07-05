import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from '../list_store'
import manageStore from '../../store'
import globalStore from '../../../../stores/global'

import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Select,
  Option,
  MoreSelect,
  Button,
  RightSideModal,
  ToolTip,
  Storage,
  Modal,
  Tip,
} from '@gmfe/react'
import CategoryPinleiFilter from '../../../../common/components/category_filter_hoc'
import TaskList from '../../../../task/task_list'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { FORMULA_TYPE } from '../../../../common/enum'
import _ from 'lodash'
import { getExportInfo, getRequestField } from 'common/diy_export_key'
import DiyTabModal from 'common/components/diy_tab_modal'

import { System } from 'common/service'

const exportHash = 'v1'

@observer
class MerchandiseListFilter extends React.Component {
  handleInputChange = (event) => {
    store.changeFilter('query', event.target.value)
  }

  handleSelectChange = (name, value) => {
    store.changeFilter(name, value)
  }

  handleInitFilter = () => {
    store.initFilter()
    if (!System.isB()) {
      store.changeFilter('salemenu_ids', [{ id: globalStore.c_salemenu_id }])
    }
  }

  handleColumnsSave = (newColumns) => {
    const arr = newColumns.merchandise_export || []
    if (
      _.find(arr, (e) => e.key === 'step_price_table' && e.show) &&
      _.find(arr, (e) => e.key === 'is_step_price' && !e.show)
    ) {
      Tip.danger(i18next.t('自定义导出字段未勾选定价规则'))
      throw new Error()
    }
    _.each(newColumns, (item, key) => {
      Storage.set(key + exportHash, newColumns[key])
    })
  }

  handleShowSetModal = () => {
    const exportInfo = getExportInfo('merchandise')
    Modal.render({
      disableMaskClose: true,
      title: i18next.t('导出设置'),
      noContentPadding: true,
      size: 'lg',
      onHide: Modal.hide,
      children: (
        <DiyTabModal
          exportInfo={exportInfo}
          onSave={this.handleColumnsSave}
          hash={exportHash}
        />
      ),
    })
  }

  handleExport = (type) => {
    const merchandise = getRequestField('merchandise', false, exportHash)
    store.export(JSON.stringify(merchandise), type).then((json) => {
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

      // 同步导出
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

  handleSearch = (e) => {
    e.preventDefault()
    store.doFirstRequest()
  }

  render() {
    const {
      filter: {
        categoryFilter,
        query,
        salemenu_is_active,
        formula,
        salemenu_ids,
        has_images,
        is_price_timing,
        is_clean_food,
        process_label_id,
      },
    } = store
    const isRetail = !System.isB()
    const { activeSelfSalemenuList, processLabelList } = manageStore
    const p_export = globalStore.hasPermission('export_product_skus')

    if (isRetail) {
      return (
        <BoxForm
          onSubmit={this.handleSearch}
          btnPosition='left'
          labelWidth='90px'
        >
          <FormBlock col={3}>
            <FormItem label={i18next.t('商品筛选')} col={2}>
              <CategoryPinleiFilter
                selected={categoryFilter}
                onChange={this.handleSelectChange.bind(this, 'categoryFilter')}
              />
            </FormItem>
            <FormItem label={i18next.t('搜索')}>
              <input
                className='form-control'
                type='text'
                value={query}
                name='query'
                placeholder={i18next.t('输入商品名称或ID')}
                onChange={this.handleInputChange}
              />
            </FormItem>
          </FormBlock>
          <BoxForm.More>
            <FormBlock col={3}>
              <FormItem label={i18next.t('定价公式状态')}>
                <Select
                  value={formula}
                  onChange={this.handleSelectChange.bind(this, 'formula')}
                >
                  {_.map(FORMULA_TYPE, (v, i) => (
                    <Option key={i} value={v.value}>
                      {v.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem label={i18next.t('商品图片')}>
                <Select
                  value={has_images}
                  onChange={this.handleSelectChange.bind(this, 'has_images')}
                >
                  <Option value={-1}>{i18next.t('全部')}</Option>
                  <Option value={1}>{i18next.t('有图')}</Option>
                  <Option value={0}>{i18next.t('无图')}</Option>
                </Select>
              </FormItem>
            </FormBlock>
          </BoxForm.More>
          <FormButton>
            <Button
              type='primary'
              htmlType='submit'
              onClick={this.handleSearch}
            >
              {i18next.t('搜索')}
            </Button>
            <BoxForm.More>
              <div className='gm-gap-10' />
              <Button onClick={this.handleInitFilter}>
                {i18next.t('重置')}
              </Button>
            </BoxForm.More>
            <div className='gm-gap-10' />
            {p_export && (
              <ToolTip
                showArrow
                popup={
                  <div style={{ padding: '8px' }}>
                    <a
                      onClick={() => this.handleShowSetModal()}
                      className='gm-margin-right-5'
                    >
                      {i18next.t('点此设置')}
                    </a>
                    {i18next.t('，自定义导出字段')}
                  </div>
                }
              >
                <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
              </ToolTip>
            )}
          </FormButton>
        </BoxForm>
      )
    }

    return (
      <BoxForm
        onSubmit={this.handleSearch}
        btnPosition='left'
        labelWidth='90px'
      >
        <FormBlock col={3}>
          <FormItem label={i18next.t('商品筛选')} col={2}>
            <CategoryPinleiFilter
              selected={categoryFilter}
              onChange={this.handleSelectChange.bind(this, 'categoryFilter')}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              className='form-control'
              type='text'
              value={query}
              name='query'
              placeholder={i18next.t('输入商品名称或ID')}
              onChange={this.handleInputChange}
            />
          </FormItem>
        </FormBlock>
        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem label={i18next.t('报价单')}>
              <MoreSelect
                multiple
                data={activeSelfSalemenuList.slice()}
                selected={salemenu_ids}
                renderListFilterType='pinyin'
                placeholder={i18next.t('全部报价单')}
                onSelect={this.handleSelectChange.bind(this, 'salemenu_ids')}
              />
            </FormItem>
            <FormItem label={i18next.t('状态')}>
              <Select
                value={salemenu_is_active}
                onChange={this.handleSelectChange.bind(
                  this,
                  'salemenu_is_active',
                )}
              >
                <Option value={-1}>{i18next.t('全部报价单状态')}</Option>
                <Option value={1}>{i18next.t('只看已激活状态')}</Option>
              </Select>
            </FormItem>
            <FormItem label={i18next.t('定价公式状态')}>
              <Select
                value={formula}
                onChange={this.handleSelectChange.bind(this, 'formula')}
              >
                {_.map(FORMULA_TYPE, (v, i) => (
                  <Option key={i} value={v.value}>
                    {v.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </FormBlock>
          <FormBlock col={3}>
            <FormItem label={i18next.t('商品图片')}>
              <Select
                value={has_images}
                onChange={this.handleSelectChange.bind(this, 'has_images')}
              >
                <Option value={-1}>{i18next.t('全部')}</Option>
                <Option value={1}>{i18next.t('有图')}</Option>
                <Option value={0}>{i18next.t('无图')}</Option>
              </Select>
            </FormItem>
            <FormItem label={i18next.t('时价状态')}>
              <Select
                value={is_price_timing}
                onChange={this.handleSelectChange.bind(this, 'is_price_timing')}
              >
                <Option value={-1}>{i18next.t('全部')}</Option>
                <Option value={1}>{i18next.t('时价')}</Option>
                <Option value={0}>{i18next.t('非时价')}</Option>
              </Select>
            </FormItem>
            {globalStore.isCleanFood() && (
              <FormItem label={i18next.t('加工状态')}>
                <Select
                  value={is_clean_food}
                  data={[
                    { value: -1, text: i18next.t('全部') },
                    { value: 1, text: i18next.t('开启') },
                    { value: 0, text: i18next.t('关闭') },
                  ]}
                  onChange={this.handleSelectChange.bind(this, 'is_clean_food')}
                />
              </FormItem>
            )}
            {globalStore.isCleanFood() && (
              <FormItem label={i18next.t('商品加工标签')}>
                <Select
                  value={process_label_id}
                  data={[
                    {
                      value: 0,
                      text: i18next.t('全部'),
                    },
                    {
                      value: -1,
                      text: i18next.t('无'),
                    },
                  ].concat(processLabelList.slice())}
                  onChange={this.handleSelectChange.bind(
                    this,
                    'process_label_id',
                  )}
                />
              </FormItem>
            )}
          </FormBlock>
        </BoxForm.More>
        <FormButton>
          <Button type='primary' htmlType='submit' onClick={this.handleSearch}>
            {i18next.t('搜索')}
          </Button>
          <BoxForm.More>
            <div className='gm-gap-10' />
            <Button onClick={this.handleInitFilter}>{i18next.t('重置')}</Button>
          </BoxForm.More>
          <div className='gm-gap-10' />
          {p_export && (
            <ToolTip
              showArrow
              popup={
                <div style={{ padding: '8px' }}>
                  <a
                    onClick={() => this.handleShowSetModal()}
                    className='gm-margin-right-5'
                  >
                    {i18next.t('点此设置')}
                  </a>
                  {i18next.t('，自定义导出字段')}
                </div>
              }
            >
              <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
            </ToolTip>
          )}
        </FormButton>
      </BoxForm>
    )
  }
}

export default MerchandiseListFilter
