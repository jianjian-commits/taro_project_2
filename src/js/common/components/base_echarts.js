import React from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import _ from 'lodash'
import moment from 'moment'
import requireEcharts from 'gm-service/src/require_module/require_echarts'
import classNames from 'classnames'

class LineEcharts extends React.Component {
  constructor(props) {
    super(props)
    this.myChart = null
    this.refCharts = null
    this.state = {
      option: props.option ? this.processOption(props.option) : null,
    }
  }

  componentDidMount() {
    const { onLegendselectchanged, echarts } = this.props

    this.myChart = echarts.init(findDOMNode(this.refCharts))
    this.myChart.on('legendselectchanged', (params) => {
      onLegendselectchanged(params)
    })
    this.setChart()
  }

  componentWillReceiveProps(props) {
    if ('option' in props) {
      this.setState(
        {
          option: this.processOption(props.option),
        },
        this.setChart
      )
    }
  }

  componentWillUnmount() {
    this.myChart.dispose()
  }

  // 暂时先暴力处理，直接写lineStyle 和 itemStyles
  processOption(option) {
    if (option.series) {
      let lineIndex = 0
      let barIndex = 0
      _.each(option.series, (value) => {
        if (value.type === 'line' && !option.color) {
          if (BaseEcharts.lineColors[lineIndex]) {
            value.lineStyle = {
              normal: {
                color: BaseEcharts.lineColors[lineIndex],
              },
            }
            value.itemStyle = {
              normal: {
                color: BaseEcharts.lineColors[lineIndex],
              },
            }
            lineIndex++
          }
        } else if (value.type === 'bar' && !option.color) {
          if (BaseEcharts.lineColors[barIndex]) {
            value.lineStyle = {
              normal: {
                color: BaseEcharts.barColors[barIndex],
              },
            }
            value.itemStyle = {
              normal: {
                color: BaseEcharts.barColors[barIndex],
              },
            }
          }
          barIndex++
        }
      })
    }
    return option
  }

  setChart() {
    const { option } = this.state
    if (!option) {
      return null
    }

    this.myChart.clear()
    this.myChart.setOption(option)
  }

  render() {
    const {
      option,
      onLegendselectchanged,
      echarts, // eslint-disable-line
      style,
      className,
      ...rest
    } = this.props

    return (
      <div
        {...rest}
        className={classNames('gm-padding-10', className)}
        ref={(ref) => {
          this.refCharts = ref
        }}
        style={{ height: '400px', ...style }}
      />
    )
  }
}

class BaseEcharts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      ready: false,
    }
    this.echarts = props.echarts
  }

  componentWillMount() {
    new Promise((resolve) => {
      if (this.echarts) {
        resolve()
      } else {
        requireEcharts((char) => {
          this.echarts = char
          resolve()
        })
      }
    }).then(() => {
      this.setState({
        ready: true,
      })
    })
  }

  render() {
    if (!this.state.ready) {
      return null
    }

    return <LineEcharts {...this.props} echarts={this.echarts} />
  }
}

// 格式化数值表述。
// 这里假设  是顺序执行的。然而实际上也是，所以敢存minValue
let minValue = 0
BaseEcharts.valueLabelFormatter = (value, index) => {
  if (value === 0) {
    return value
  }

  if (index === 1) {
    minValue = value
  }

  if (minValue > 5000) {
    return value / 10000 + 'w'
  }
  if (minValue > 500) {
    return value / 1000 + 'k'
  }
  return value
}

// 获取日期范围，后台返回的数据可能有些天使没有数据的，估不能用后台的数据。
BaseEcharts.getDateRange = (begin, end) => {
  let result = []
  let b = moment(begin).startOf('d')
  let e = moment(end).startOf('d')
  while (b <= e) {
    // eslint-disable-line
    result.push(b.format('YYYY-MM-DD'))
    b.add('d', 1)
  }
  return result
}

// 获取所有天数的数据列表，后台返回的数据可能有些天是没有数据的，这里做辅助补充，没有的则是0
BaseEcharts.getDataList = (begin, end, list, getValue, getMatch) => {
  const listMap = {}
  _.each(list, (v) => {
    listMap[getMatch(v)] = getValue(v)
  })
  const dateList = BaseEcharts.getDateRange(begin, end)
  const result = _.map(dateList, (value) => {
    return listMap[value] || 0
  })

  return result
}

// 规定的线条颜色，暂时4种
BaseEcharts.lineColors = ['#4a50ca', '#4ba3e0', '#5fe3a7', '#74dde6']
// 规定的柱状体颜色，暂时4钟
BaseEcharts.barColors = ['#F97C74 ', '#43545c', '#e7b92b', '#83d33f']

BaseEcharts.propTypes = {
  // 提供则用，不提供则异步拉
  echarts: PropTypes.object,
  option: PropTypes.object.isRequired,
  onLegendselectchanged: PropTypes.func,
}

BaseEcharts.defaultProps = {
  onLegendselectchanged: () => {},
}

/**
 * 初级功能。简单封装和干预了下（规范性）
 * - 处理 echarts 实例的创建和更新和销毁。
 * - 处理基本的样式。
 * - 1 y轴刻度值，x xk xw 三种形式
 * - 2 线条颜色，柱状体颜色
 * - 提供些辅助类
 */
export default BaseEcharts
