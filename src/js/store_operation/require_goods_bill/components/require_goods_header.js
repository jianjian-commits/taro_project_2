import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import {
  Box,
  Form,
  FormBlock,
  FormItem,
  DateRangePicker,
  FormButton,
  Select,
  Option,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import requireStore from '../store'
import PropTypes from 'prop-types'

@observer
class RequireGoodsHeader extends Component {
  // 时间筛选
  handleChangeDate = (begin, end) => {
    requireStore.setChangeDate(begin, end)
  }

  // 要货单据号搜索
  handleChange = (event) => {
    requireStore.setSheetNo(event.target.value)
  }

  // 单据状态
  handleChangeSelect = (value) => {
    requireStore.setBillStatus(value)
  }

  // 搜索
  handleSubmit = (event) => {
    const { onSearch } = this.props
    event.preventDefault()
    onSearch()
  }

  render() {
    return (
      <Box hasGap>
        <Form inline labelWidth='90px' onSubmit={this.handleSubmit}>
          <FormBlock col={3}>
            <FormItem label={i18next.t('按申请时间')}>
              <DateRangePicker
                begin={requireStore.start_time}
                end={requireStore.end_time}
                onChange={this.handleChangeDate}
              />
            </FormItem>

            <FormItem label={i18next.t('单据状态')}>
              <Select
                value={requireStore.status}
                name='status'
                onChange={this.handleChangeSelect}
              >
                <Option value=''>{i18next.t('全部状态')}</Option>
                {_.map(requireStore.bill_status, (value, i) => (
                  <Option key={i} value={value.value}>
                    {value.name}
                  </Option>
                ))}
              </Select>
            </FormItem>

            <FormItem label={i18next.t('搜索')}>
              <input
                name='sheet_no'
                value={requireStore.sheet_no}
                onChange={this.handleChange}
                className='form-control gm-inline-block'
                placeholder={i18next.t('输入要货单据号')}
              />
            </FormItem>
          </FormBlock>
          <FormButton>
            <Button
              type='primary'
              htmlType='submit'
              className='gm-margin-lr-10'
            >
              {i18next.t('搜索')}
            </Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

RequireGoodsHeader.propTypes = {
  onSearch: PropTypes.func.isRequired,
}

export default RequireGoodsHeader
