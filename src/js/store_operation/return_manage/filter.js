import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  DateRangePicker,
  Flex,
  FormItem,
  FormButton,
  Select,
  Button,
  Box,
  Form,
  Input,
} from '@gmfe/react'
import qs from 'query-string'
import _ from 'lodash'
import moment from 'moment'
import { refundStateText } from './util'
import actions from '../../actions'
import './actions'
import './reducer'

const handlingMode = _.map(refundStateText, (value, key) => ({
  value: _.toNumber(key),
  text: value,
}))

// 搜索选项
class ReturnSearchPanel extends React.Component {
  state = {
    /** @type {'order_id'|'sid'|'resname'} type */
    type: 'order_id',
  }

  componentDidMount() {
    actions.get_search_option()
  }

  handleDateChange = (date_from, date_end) => {
    const { formData, onChange } = this.props
    formData.date_from = date_from
    formData.date_end = date_end
    onChange(formData)
  }

  handleChange = (event) => {
    let { formData, onChange } = this.props
    const { name, value } = event.target
    formData = { ...formData, [name]: value }
    onChange(formData)
  }

  handleChangeSelect = (value) => {
    const { formData, onChange } = this.props
    formData.state = value
    onChange(formData)
  }

  handleClickExport = (event) => {
    event.preventDefault()
    const formData = this.initData()
    if (formData.state + '' === '0') {
      delete formData.state
    }
    window.open('/stock/refund/export?' + qs.stringify(formData))
  }

  handleClickSearch = () => {
    const formData = this.initData()
    if (formData.state + '' === '0') {
      delete formData.state
    }
    actions.get_search_result(formData)
  }

  initData = () => {
    return Object.assign({}, this.props.formData, {
      date_from: moment(this.props.formData.date_from).format('YYYY-MM-DD'),
      date_end: moment(this.props.formData.date_end).format('YYYY-MM-DD'),
    })
  }

  handleChangeType = (type) => {
    const { type: prevType } = this.state
    this.setState({ type }, () => {
      const { formData, onChange } = this.props
      onChange({ ...formData, [prevType]: '' }) // 用于切换搜索的时候，将上一次输入框中的内容清空
    })
  }

  // page和num变化,立即重新搜索
  render() {
    const { formData } = this.props
    const { type } = this.state

    const placeholder = {
      order_id: i18next.t('请输入订单号/流转单号'),
      sid: i18next.t('请输入商户ID'),
      resname: i18next.t('请输入商户名称'),
    }

    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleClickSearch}>
          <FormItem label={i18next.t('按下单日期')}>
            <DateRangePicker
              begin={formData.date_from}
              end={formData.date_end}
              onChange={this.handleDateChange}
            />
          </FormItem>
          <FormItem label={i18next.t('处理方式筛选')}>
            <Select
              value={formData.state}
              data={handlingMode}
              onChange={this.handleChangeSelect.bind(this)}
            />
          </FormItem>
          <FormItem>
            <Flex>
              <Select
                clean
                onChange={this.handleChangeType}
                data={[
                  { value: 'order_id', text: i18next.t('订单号/流水单号') },
                  { value: 'sid', text: i18next.t('商户ID') },
                  { value: 'resname', text: i18next.t('商户名称') },
                ]}
                value={type}
              />
              <Flex flex={1} column>
                <Input
                  className='form-control'
                  name={type}
                  value={formData[type]}
                  onChange={this.handleChange}
                  placeholder={placeholder[type]}
                />
              </Flex>
            </Flex>
          </FormItem>
          <FormButton>
            <Button
              type='primary'
              htmlType='submit'
              className='gm-margin-right-10'
            >
              {i18next.t('搜索')}
            </Button>
            <Button onClick={this.handleClickExport}>
              {i18next.t('导出')}
            </Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

ReturnSearchPanel.propTypes = {
  formData: PropTypes.object,
  onChange: PropTypes.func,
}

export default ReturnSearchPanel
