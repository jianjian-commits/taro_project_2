import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import store from '../store'
import globalStore from 'stores/global'
import _ from 'lodash'
import {
  BoxForm,
  Select,
  Option,
  FormItem,
  FormBlock,
  Button,
  FormButton,
  ToolTip,
  Modal,
  Storage,
  RightSideModal,
  Tip,
  DropDown,
  DropDownItems,
  DropDownItem,
} from '@gmfe/react'
import { merchandiseTypes, FORMULA_TYPE } from 'common/enum'
import CategoryPinleiFilter from 'common/components/category_filter_hoc'
import manageStore from '../../../store'
import { getExportInfo, getRequestField } from 'common/diy_export_key'
import DiyTabModal from 'common/components/diy_tab_modal'
import TaskList from 'common/../task/task_list'

const exportHash = 'v1'

@observer
class SaleListFilter extends React.Component {
  handleSelectChange = (name, value) => {
    store.changeFilter(name, value)
  }

  handleInputChange = (e) => {
    store.changeFilter('text', e.target.value)
  }

  handleSearch = () => {
    store.doFirstRequest()
  }

  handleExport = (type) => {
    const tempSale = getRequestField('sale', false, exportHash)
    store
      .export(this.props.query.id, JSON.stringify(tempSale), type)
      .then((res) => {
        if (res.data && res.data.async === 1) {
          RightSideModal.render({
            children: <TaskList />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })
        }
      })
  }

  handleInitFilter = () => {
    store.initFilter()
  }

  handleColumnsSave = (newColumns) => {
    console.log('newColumns:', newColumns)
    const arr = newColumns.sale_export || []
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
    const exportInfo = getExportInfo('sale')
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

  render() {
    const {
      categoryFilter,
      text,
      state,
      formula,
      has_images,
      is_price_timing,
      is_clean_food,
      process_label_id,
    } = store.filter
    const { processLabelList } = manageStore

    const p_export = globalStore.hasPermission('export_sale_skus')

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
              value={text}
              name='text'
              placeholder={i18next.t('输入商品名称、规格名或ID')}
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
            <FormItem label={i18next.t('销售状态')}>
              <Select
                name='state'
                value={state}
                onChange={this.handleSelectChange.bind(this, 'state')}
              >
                <Option value='-1'>{i18next.t('全部状态')}</Option>
                {_.map(merchandiseTypes.saleState, (v, i) => (
                  <Option key={i} value={v.value}>
                    {v.name}
                  </Option>
                ))}
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
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
          <div className='gm-gap-5' />
          <BoxForm.More>
            <Button onClick={this.handleInitFilter}>{i18next.t('重置')}</Button>
          </BoxForm.More>
          <div className='gm-gap-5' />
          {p_export && (
            <DropDown
              split
              popup={
                <DropDownItems>
                  <DropDownItem
                    className='b-order-export'
                    onClick={() => this.handleExport(1)}
                  >
                    {i18next.t('按商品分类顺序导出')}
                  </DropDownItem>
                </DropDownItems>
              }
            >
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
                <Button onClick={() => this.handleExport(0)}>
                  {i18next.t('导出')}
                </Button>
              </ToolTip>
            </DropDown>
          )}
        </FormButton>
      </BoxForm>
    )
  }
}

SaleListFilter.propTypes = {
  query: PropTypes.object,
}

export default SaleListFilter
