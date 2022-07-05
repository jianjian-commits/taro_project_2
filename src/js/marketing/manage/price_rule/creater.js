/* eslint-disable react/prop-types */
import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Dialog,
  DatePicker,
  Tip,
  FormItem,
  Form,
  Select,
  MoreSelect,
} from '@gmfe/react'
import _ from 'lodash'
import actions from '../../../actions'
import { history } from 'common/service'
import './actions'
import './reducer'
import { PRICE_RULE_TYPE } from 'common/enum'

class CreateDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      salemenu: null,
      begin: null,
      end: null,
    }
    this.targetRef = React.createRef(null)
  }

  handleSalemenuChange = (value) => {
    this.setState({
      salemenu: value,
    })
  }

  handleWithFilter = (list, query) => {
    return _.filter(list[0].children, (v) => {
      return v.name.indexOf(query) > -1
    })
  }

  handleBeginChange = (date) => {
    this.setState({
      begin: date,
    })
  }

  handleEndChange = (date) => {
    this.setState({
      end: date,
    })
  }

  handleRuleTypeChange = (value) => {
    this.setState({
      type: value,
    })
  }

  handleNameChange = (e) => {
    this.setState({
      name: e.target.value,
    })
  }

  handelCreateConfirm = () => {
    if (!this.state.salemenu) {
      Tip.warning(i18next.t('请选择报价单'))
      return false
    }
    if (!this.state.begin) {
      Tip.warning(i18next.t('请选择开始时间'))
      return false
    }
    if (!this.state.end) {
      Tip.warning(i18next.t('请选结束时间'))
      return false
    }
    const salemenu =
      _.find(
        this.props.price_rule.salemenus,
        (salemenu) => salemenu.salemenu_id === this.state.salemenu.value
      ) || {}
    const createData = _.extend({}, this.state, {
      viewType: 'add',
      salemenu_id: salemenu.salemenu_id,
      salemenu_name: salemenu.name,
      fee_type: salemenu.fee_type,
      rule_object_type: 1,
    })

    actions.price_rule_pre_create(createData)
    actions.price_rule_creater_hide()

    history.push('/marketing/manage/price_rule/detail')
  }

  handelCreateCancel = () => {
    actions.price_rule_creater_hide()
  }

  justArrayObject = (list) => {
    const result = []
    list.map((item) => {
      if (item.salemenu_id !== '') {
        result.push(
          Object.assign(
            {},
            {
              value: item.salemenu_id,
              text: item.name,
            }
          )
        )
      }
    })
    return result
  }

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.targetRef.current.apiDoSelectWillActive()
      window.document.body.click()
    }
  }

  render() {
    const thisProps = this.props
    const { salemenus } = thisProps.price_rule
    const dataSalemenusList = this.justArrayObject(salemenus)

    return (
      <Dialog
        show={this.props.price_rule.createrShow}
        title={i18next.t('新建锁价规则')}
        onCancel={this.handelCreateCancel}
        onOK={this.handelCreateConfirm}
      >
        <Form onSubmit={this.handelCreateConfirm} labelWidth='90px'>
          <FormItem label={i18next.t('选择报价单')} required>
            <MoreSelect
              ref={this.targetRef}
              id='salemenu_id'
              data={dataSalemenusList}
              selected={this.state.salemenu}
              onSelect={this.handleSalemenuChange}
              onKeyDown={this.handleKeyDown}
              renderListFilterType='pinyin'
              placeholder={i18next.t('输入报价单名称搜索')}
            />
          </FormItem>
          <FormItem label={i18next.t('类型')} required>
            <Select
              value={this.state.type}
              id='ruleType'
              onChange={this.handleRuleTypeChange}
            >
              {_.map(PRICE_RULE_TYPE, function (type) {
                return (
                  <option key={type.id} value={type.id}>
                    {i18next.t('面向')}
                    {type.name}
                    {i18next.t('的锁价')}
                  </option>
                )
              })}
            </Select>
          </FormItem>
          <FormItem label={i18next.t('开始时间')} required>
            <DatePicker
              date={this.state.begin}
              placeholder={i18next.t('开始日当天生效')}
              onChange={this.handleBeginChange}
            />
          </FormItem>
          <FormItem label={i18next.t('结束时间')} required>
            <DatePicker
              date={this.state.end}
              placeholder={i18next.t('结束日第二天失效')}
              onChange={this.handleEndChange}
            />
          </FormItem>
          <FormItem label={i18next.t('规则名称')}>
            <input
              onChange={this.handleNameChange}
              id='name'
              value={this.state.name}
              className='form-control'
              placeholder={i18next.t('输入规则的名称')}
            />
          </FormItem>
        </Form>
      </Dialog>
    )
  }
}

export default CreateDialog
