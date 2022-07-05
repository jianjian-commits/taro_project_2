import { observer } from 'mobx-react'
import React from 'react'
import {
  Form,
  FormItem,
  DateRangePicker,
  FormButton,
  MoreSelect,
  Box,
  Button,
} from '@gmfe/react'
import store from './store'
import { i18next } from 'gm-i18n'

import PropTypes from 'prop-types'

@observer
class QueryFilter extends React.Component {
  componentDidMount() {
    store.fetchSupplierList()
  }

  handleDatePickerChange = (begin, end) => {
    store.changeQueryFilter('begin', begin)
    store.changeQueryFilter('end', end)
  }

  handleInput = (e) => {
    store.changeQueryFilter('q', e.target.value)
  }

  handleSelectSupplier = (selected) => {
    store.changeQueryFilter('selected', selected)
  }

  render() {
    const {
      queryFilter: { begin, end, q, selected },
      supplierList,
      activeTab,
    } = store
    const { onSearchFunc, onExportFunc } = this.props

    return (
      <Box hasGap>
        <Form inline onSubmit={onSearchFunc}>
          <FormItem label={i18next.t('移库日期')}>
            <DateRangePicker
              begin={begin}
              end={end}
              onChange={this.handleDatePickerChange}
            />
          </FormItem>
          {activeTab === '1' && (
            <FormItem label={i18next.t('供应商')}>
              <MoreSelect
                placeholder={i18next.t('请选择供应商')}
                data={supplierList.slice()}
                selected={selected}
                onSelect={this.handleSelectSupplier}
                renderListFilterType='pinyin'
                className='gm-margin-right-10'
              />
            </FormItem>
          )}
          <FormItem label={i18next.t('搜索')}>
            <input
              value={q}
              placeholder={i18next.t('输入商品名或ID')}
              onChange={this.handleInput}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={onExportFunc}>{i18next.t('导出')}</Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

QueryFilter.propTypes = {
  onSearchFunc: PropTypes.func.isRequired,
  onExportFunc: PropTypes.func.isRequired,
}

export default QueryFilter
