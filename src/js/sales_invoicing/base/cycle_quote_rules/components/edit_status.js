import { Select } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'

/**
 * 修改报价状态的函数组件，用来修改供应商周期报价修改状态
 * @param  {Object} props 父组件传入的属性
 * @return {Object}       组件渲染的内容
 */
function EditStatusSelect(props) {
  const { onChange, ...original } = props
  const { updated } = original
  const { begin_time, end_time, status } = updated
  const containsNow =
    moment() >= moment(begin_time) && moment() <= moment(end_time)
  /**
   * 随用户选择即时更新选项列表，状态为未开始、生效中才能修改
   * 已选时间段包含当前，则显示“生效中”，否则显示“未开始”
   */
  const data = [
    {
      value: containsNow ? 3 : 2,
      text: i18next.t(containsNow ? '生效中' : '未开始'),
    },
    {
      value: 0,
      text: i18next.t('已关闭'),
    },
  ]
  const value = status ? data[0].value : 0
  updated.status = value

  return <Select {...{ data, value, onChange }} />
}

/**
 * 设置EditStatusSelect组件的属性规则
 * onChange: function 必选
 */
EditStatusSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
}

export default EditStatusSelect
