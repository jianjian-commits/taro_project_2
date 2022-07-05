import React, { useEffect, useState } from 'react'
import BaseECharts from 'common/components/customize_echarts/base_echarts'
import _ from 'lodash'
import PropTypes from 'prop-types'

const pieEChartsHoc = (Component) => {
  const PieECharts = (props) => {
    const {
      option,
      data,
      axisGroup,
      centerPosition,
      customOption,
      radiusList,
      onSetCustomOption,
      title,
      hasNoData,
      axisGroupName,
      ...rest
    } = props
    const [pieOption, setPieOption] = useState(null)

    const radius = radiusList || BaseECharts.defaultPieRadius

    useEffect(() => {
      if (!hasNoData) {
        setPieOption(_.cloneDeep(setOption()))
      } else {
        setPieOption(_.cloneDeep(BaseECharts.pieNoDataOption))
      }
    }, [...Object.values(props)])

    const setBaseOption = (currentOption) => {
      Object.assign(currentOption, {
        dataset: {
          source: data,
          dimensions: data.length > 0 ? [...Object.keys(data[0])] : [], // 与encode中的配置关联，取值从这取
        },
        series: _.map(axisGroup, (item) => {
          return {
            type: 'pie',
            stack: item.stack,
            itemStyle: {
              normal: {},
            },
            label: {
              normal: {},
            },
            center: [],
            encode: {
              itemName: [item.itemName],
              value: [item.value],
            },
            radius: radius,
          }
        }),
      })
    }

    const setTitle = (currentOption) => {
      if (title && title.text) {
        currentOption.title.text = title.text
      }
    }

    const setFormatToolTip = (currentOption) => {
      const { toolTipFormatFunc } = props

      currentOption.tooltip.formatter =
        toolTipFormatFunc ||
        function (params) {
          return `${params.seriesName}</br>${params.marker}
        ${params.name}: 
        ${params.value[axisGroup[params.seriesIndex].value]}(${
            params.percent
          }%)`
        }
    }

    const setCenterPosition = (currentOption) => {
      _.each(axisGroup, (item, index) => {
        const defaultCenter1 =
          ((index + 1) / (axisGroup.length + 1)) * 100 + '%' // 公式为 位置/（总个数+1）* 100%
        const defaultCenter2 = '50%'

        currentOption.series[index].center =
          centerPosition && centerPosition[index]
            ? centerPosition[index]
            : [defaultCenter1, defaultCenter2]
      })
    }

    const setMainColor = (currentOption) => {
      currentOption.color = customOption.mainColor
    }

    const setOption = () => {
      let currentOption = _.cloneDeep(BaseECharts.defaultPieOption)
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

        setFormatToolTip(currentOption)
        setCenterPosition(currentOption)
        setTitle(currentOption)
        if (customOption && customOption.mainColor) {
          setMainColor(currentOption)
        }
      }

      if (onSetCustomOption) {
        currentOption = _.cloneDeep(onSetCustomOption(currentOption))
      }

      return currentOption
    }

    return <Component {...rest} option={pieOption} />
  }

  PieECharts.propTypes = {
    // eCharts option
    option: PropTypes.object,
    // 渲染数据，格式： [{name0, value0, name1, value1,...},{name0, value0, name1, value1,...},...]
    data: PropTypes.array,
    // 渲染的item, value数据的字段名，对应data中字段，格式： [{itemName:'name0', value: 'value0', stack: 10}, { itemName: 'name0', y: 'value1', stack: 10},...]
    // itemName,value的关系对应：同样的「itemName」下对应的「value」数据是哪个字段的数据，一对多意味着同样的坐标也是一对多，一对多的情况下「stack」相同则堆叠在一起显示
    axisGroup: PropTypes.array,
    // 对应item字段的显示名，格式： [ 'yourItemName',....]
    axisGroupName: PropTypes.array,
    // 圆心位置 [ [ leftValue, topValue], [...], ... ]
    centerPosition: PropTypes.array,
    // 半径，两个半径可呈现圆环
    radiusList: PropTypes.array,
    // 图表标题，格式：{ text: 'yourTitle' }
    title: PropTypes.object,
    // 自定义的option配置，含：mainColor.
    // 格式： mainColor: ['#234233','#454354',...]
    // mainColor格式可参考defaultPieColor
    customOption: PropTypes.object,
    // 显示hover的信息格式的方法
    toolTipFormatFunc: PropTypes.func,
    // 是否无数据，无数据时可开启无数据图表
    hasNoData: PropTypes.bool,
    // 可对最终option添加自定义属性，依据eCharts option格式, 接受option，return 自定义option
    onSetCustomOption: PropTypes.func,
  }
  return PieECharts
}

export default pieEChartsHoc
