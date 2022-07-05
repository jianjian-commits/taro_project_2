import { observer } from 'mobx-react'
import React from 'react'
import {
  Form,
  FormItem,
  DateRangePicker,
  FormButton,
  Option,
  Select,
  Box,
  Button,
} from '@gmfe/react'
import store from './store'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { receiptType } from '../../util'
import PropTypes from 'prop-types'

@observer
class QueryFilter extends React.Component {
  handleDatePickerChange = (begin, end) => {
    store.changeQueryFilter('begin', begin)
    store.changeQueryFilter('end', end)
  }

  handleInput = (e) => {
    store.changeQueryFilter('q', e.target.value)
  }

  handleSelect = (selected) => {
    store.changeQueryFilter('status', selected)
  }

  render() {
    const { begin, end, q, status } = store.queryFilter
    const { searchFunc, exportFunc } = this.props
    return (
      <Box hasGap>
        <Form inline>
          <FormItem label={i18next.t('建单日期')}>
            <DateRangePicker
              begin={begin}
              end={end}
              onChange={this.handleDatePickerChange}
            />
          </FormItem>
          <FormItem label={i18next.t('单据状态')}>
            <Select value={Number(status)} onChange={this.handleSelect}>
              {_.map(receiptType, (name, key) => {
                return (
                  <Option value={Number(key)} key={key + name}>
                    {name}
                  </Option>
                )
              })}
            </Select>
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              value={q}
              placeholder={i18next.t('请输入单号')}
              onChange={this.handleInput}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit' onClick={searchFunc}>
              {i18next.t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={exportFunc}>{i18next.t('导出')}</Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

QueryFilter.propTypes = {
  searchFunc: PropTypes.func.isRequired,
  exportFunc: PropTypes.func.isRequired,
}

export default QueryFilter
