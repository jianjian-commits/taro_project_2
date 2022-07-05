// 针对 按运营周期类 的选择日期段，抽离此组件，保留两个日期分开选择
import React from 'react'
import { DatePicker } from '@gmfe/react'
import PropTypes from 'prop-types'
import moment from 'moment'

class CycleDateRangePicker extends React.Component {
  handleBeginDateChange = (date) => {
    const { onChange, end } = this.props
    onChange(date, date <= end ? end : date)
  }

  handleEndDateChange = (date) => {
    const { onChange, begin } = this.props
    onChange(begin <= date ? begin : date, date)
  }

  renderBeginValue = (begin) => {
    const { renderBeginDate } = this.props
    if (!begin) {
      return ''
    }

    if (renderBeginDate) {
      return renderBeginDate(begin)
    }

    return moment(begin).format('YYYY-MM-DD')
  }

  renderEndValue = (end) => {
    const { renderEndDate } = this.props
    if (!end) {
      return ''
    }

    if (renderEndDate) {
      return renderEndDate(end)
    }

    return moment(end).format('YYYY-MM-DD')
  }

  render() {
    const {
      begin,
      end,
      beginProps,
      endProps,
      beginLabel,
      endLabel,
    } = this.props

    return (
      <>
        {beginLabel && <span className='gm-padding-right-5'>{beginLabel}</span>}
        <DatePicker
          style={{ width: '50%' }}
          date={begin}
          onChange={this.handleBeginDateChange}
          min={beginProps && beginProps.min}
          max={beginProps && beginProps.max}
          disabledDate={beginProps && beginProps.disabledDate}
          renderDate={this.renderBeginValue}
          placeholder='开始日期'
        />
        {!endLabel && <span style={{ margin: 'auto 0px' }}>&nbsp;~&nbsp;</span>}
        {endLabel && <span className='gm-padding-lr-5'>{endLabel}</span>}
        <DatePicker
          style={{ width: '50%' }}
          date={end}
          onChange={this.handleEndDateChange}
          min={endProps && endProps.min}
          max={endProps && endProps.max}
          disabledDate={endProps && endProps.disabledDate}
          renderDate={this.renderEndValue}
          placeholder='结束日期'
        />
      </>
    )
  }
}

CycleDateRangePicker.propTypes = {
  /** 开始日期, Date对象 */
  begin: PropTypes.object,
  /** 结束日期, Date对象 */
  end: PropTypes.object,
  /** 开始日期标签 */
  beginLabel: PropTypes.string,
  /** 结束日期标签 */
  endLabel: PropTypes.string,

  /** 日期修改回调 */
  onChange: PropTypes.func,
  /** 自定义开始日期文本展示格式 */
  renderBeginDate: PropTypes.func,
  /** 自定义结束日期文本展示格式 */
  renderEndDate: PropTypes.func,

  /** 开始日期约束
   * min - Date对象, 可选日期最小值
   * max - Date对象, 可选日期最大值
   * disabledDate - 自定义不可选日期, 返回 true or false */
  beginProps: PropTypes.shape({
    min: PropTypes.object,
    max: PropTypes.object,
    disabledDate: PropTypes.func,
  }),
  /** 结束日期约束
   * min - Date对象, 可选日期最小值
   * max - Date对象, 可选日期最大值
   * disabledDate - 自定义不可选日期, 返回 true or false */
  endProps: PropTypes.shape({
    min: PropTypes.object,
    max: PropTypes.object,
    disabledDate: PropTypes.func,
  }),
}

export default CycleDateRangePicker
