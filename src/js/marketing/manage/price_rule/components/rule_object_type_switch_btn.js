import React, { Component } from 'react'
import { i18next } from 'gm-i18n'
import { Dialog, Button } from '@gmfe/react'
import PropTypes from 'prop-types'
import actions from '../../../../actions'
import '../actions'
import '../reducer'

class RuleObjectTypeSwitchBtn extends Component {
  handleSwitch = () => {
    const { curType, onOk } = this.props
    if (curType === 1) {
      Dialog.confirm({
        children: i18next.t(
          '切换为按分类锁价，将清除当前已添加的商品。是否确认切换？'
        ),
        title: i18next.t('提示'),
      }).then(() => {
        actions.price_rule_set_rule_object_type(2)
        onOk && onOk()
      })
    } else {
      Dialog.confirm({
        children: i18next.t(
          '切换为按商品锁价，将清除当前已添加的分类。是否确认切换？'
        ),
        title: i18next.t('提示'),
      }).then(() => {
        actions.price_rule_set_rule_object_type(1)
        onOk && onOk()
      })
    }
  }

  render() {
    return (
      <Button type='primary' onClick={this.handleSwitch}>
        {this.props.curType === 1
          ? i18next.t('按分类锁价')
          : i18next.t('按商品锁价')}
        &nbsp;&nbsp;
      </Button>
    )
  }
}

RuleObjectTypeSwitchBtn.propsTypes = {
  curType: PropTypes.number.isRequired,
  onOk: PropTypes.func,
}

export default RuleObjectTypeSwitchBtn
