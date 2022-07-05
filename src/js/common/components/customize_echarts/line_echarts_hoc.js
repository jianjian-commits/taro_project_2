import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import { getDateRange } from './util'
import moment from 'moment'
import _ from 'lodash'

const lineEChartsHoc = (Component) => {
  const LineECharts = (props) => {
    const {
      option,
      data,
      axisGroup,
      axisName,
      customOption,
      title,
      onSetCustomOption,
      axisGroupName,
      hasNoData,
      fillAndFormatDate,
      ...rest
    } = props
    const [lineOption, setLineOption] = useState(null)

    useEffect(() => {
      setRealOption()
    }, Object.values(props))

    const setRealOption = () => {
      let currentOption = {}

      if (!hasNoData) {
        currentOption = _.cloneDeep(setOption())
      } else {
        currentOption = _.cloneDeep(setNoDataOption())
      }

      if (onSetCustomOption) {
        currentOption = _.cloneDeep(onSetCustomOption(currentOption))
      }

      setLineOption(_.cloneDeep(currentOption))
    }

    const setNoDataOption = () => {
      const currentOption = _.cloneDeep(BaseECharts.lineNoDataOption)

      // 没有数据状态下也显示坐标轴名字
      setAxis(currentOption)

      return currentOption
    }

    const setBaseOption = (currentOption) => {
      Object.assign(currentOption, {
        dataset: {
          source: data,
          dimensions: data.length > 0 ? [...Object.keys(data[0])] : [], // 与encode中的配置关联，取值从这取
        },
        series: _.map(axisGroup, (item) => {
          return {
            type: 'line',
            stack: item.stack,
            encode: {
              x: [item.x],
              y: [item.y],
              seriesName: [item.y],
            },
            symbol: 'circle',
            symbolSize: 8,
            smooth: true, // 圆滑曲线
            itemStyle: {
              normal: {},
            },
            lineStyle: {
              width: 3,
            },
          }
        }),
      })
    }

    const setTitle = (currentOption) => {
      if (title && title.text) {
        currentOption.title.text = title.text
      }
    }

    const setAxis = (currentOption) => {
      if (axisName) {
        if (axisName.x) {
          currentOption.xAxis.name = axisName.x
        }
        if (axisName.y) {
          currentOption.yAxis.name = axisName.y
        }
      }

      // 先写死，现在只有横坐标为基轴，轴坐标为值的情况
      currentOption.xAxis.type = 'category'
      currentOption.yAxis.type = 'value'
    }

    const setFormatDate = (currentOption) => {
      const {
        fillAndFormatDate: { begin, end, fillItemName, dateFormatType },
      } = props

      const fillDate = getDateRange(begin, end)
      const formatData = []

      _.each(fillDate, (date, index) => {
        // 将所有的日期对应的其他字段赋值为0
        const currentItem = {}
        _.each(Object.keys(data[0]), (key) => {
          currentItem[key] = 0
        })
        currentItem[fillItemName] = moment(date).format(dateFormatType)
        formatData[index] = currentItem

        _.each(data, (item) => {
          // 当data中有数据时，重新对该数据赋值
          if (item[fillItemName] === date) {
            const currentItem = { ...item }
            currentItem[fillItemName] = moment(date).format(dateFormatType)

            formatData[index] = currentItem
            return false
          }
        })
      })
      currentOption.dataset.source = formatData
    }

    const setMainColor = (currentOption) => {
      currentOption.color = customOption.mainColor
    }

    const setOption = () => {
      let currentOption = _.cloneDeep(BaseECharts.defaultLineOption)

      if (option) {
        currentOption = option
      } else {
        setBaseOption(currentOption)
        // 设置seriesName
        if (axisGroupName) {
          _.each(currentOption.series, (item, index) => {
            item.name = axisGroupName[index]
          })
        }
        setTitle(currentOption)
        setAxis(currentOption)

        if (fillAndFormatDate) {
          setFormatDate(currentOption)
        }

        if (customOption && customOption.mainColor) {
          setMainColor(currentOption)
        }
      }

      return currentOption
    }

    return <Component {...rest} option={lineOption} />
  }

  LineECharts.defaultProps = {}

  LineECharts.propTypes = {
    // eCharts option
    option: PropTypes.object,
    // 渲染数据，格式： [{name0, value0, name1, value1,...},{name0, value0, name1, value1,...},...]
    data: PropTypes.array,
    // 渲染的x,y轴数据的字段名，对应data中字段，格式： [{x:'name0', y: 'value0', stack: 10}, { x: 'name0', y: 'value1', stack: 10},...]
    // x,y的关系对应：同样的「x/y」下对应的「y/x」数据是那个字段的数据，一对多意味着同样的坐标也是一对多，一对多的情况下「stack」相同则堆叠在一起显示
    axisGroup: PropTypes.array,
    // 线系列名，对应「axisGroup」中的一个「x/y」显示名称，若无默认取「x/y」字段名格式： [ 'myShowName1', 'myShowName2',....]
    axisGroupName: PropTypes.array,
    // 坐标轴名字，格式： {x: 'myXAxisName', y: 'myYAxisName'}
    axisName: PropTypes.object,
    // 图表标题，格式：{ text: 'yourTitle' }
    title: PropTypes.object,
    // 显示无数据状态
    hasNoData: PropTypes.bool,
    // 自定义的option配置，含：mainColor.
    // 格式： mainColor: ['#234233','#454354',...]
    // mainColor格式可参考defaultLineColor
    customOption: PropTypes.object,
    // 填充后台未返回的时间数据，用来适配data. 格式: { begin: 'begin_time', end: 'end_time', fillItemName: 'yFieldName', dateFormatType: 'YYYY-MM-DD' }
    // 其中begin为显示的初始时间，end为显示的结束时间，fillItemName为填充字段名，即显示为0的y轴字段名，dateFormatType为显示的时间格式
    fillAndFormatDate: PropTypes.object,
    // 可对最终option添加自定义属性，依据eCharts option格式, 接受option，return 自定义option
    onSetCustomOption: PropTypes.func,
  }

  return LineECharts
}

export default lineEChartsHoc
