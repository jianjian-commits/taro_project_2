import { t } from 'gm-i18n'
import Panel from 'common/components/report/panel'
import React from 'react'
import moment from 'moment'
import store from '../../full_screen_store'
import { reaction, when } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

const getTime = () => {
  const xAxisData = []
  let i = 7
  while (i--) {
    xAxisData.push(moment().subtract(i, 'days').format('MM-DD'))
  }
  return xAxisData
}

@observer
class LineChart extends React.Component {
  echartRef = React.createRef()
  echarts = this.props.echarts
  myChart = null
  zIndex = 0
  lines = [
    { name: t('下单金额'), color: '#ffb822' },
    { name: t('出库金额'), color: '#6c59f9' },
    { name: t('销售额（含运费）'), color: '#007eff' },
    { name: t('销售额（不含运费）'), color: '#10ce6e' },
  ]

  clearUpdate = reaction(
    () => store.lineChartData,
    () => {
      this.myChart && this.updateData()
    }
  )

  getData = () => {
    const data = store.lineChartData
    return getTime().map((time) => {
      const exist = data.find(
        ({ date }) => moment(date).format('MM-DD') === time
      )
      if (exist) {
        return [
          time,
          Number(exist.order_price),
          Number(exist.outstock_price),
          Number(exist.account_price),
          Number(exist.account_price_exclude_freight),
        ]
      }
      return [time, 0, 0, 0, 0]
    })
  }

  getOption = () => {
    let title = {}
    if (store.lineChartData.length === 0) {
      title = {
        title: {
          text: t('没有更多数据了'),
          textStyle: {
            color: '#c4f4ff',
          },
          left: 'center',
          top: 'middle',
        },
      }
    }
    return {
      ...title,
      grid: {
        top: '10%',
        left: 0,
        right: '2%',
        bottom: '5%',
        containLabel: true,
      },
      legend: {
        data: this.lines.map(({ name }) => name),
        right: 0,
        textStyle: {
          color: '#c4fdff',
          fontSize: 12,
        },
        icon: 'circle',
      },
      xAxis: [
        {
          type: 'category',
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(123, 188, 255, 0.8)',
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#c4fdff',
          },
          splitLine: {
            show: false,
          },
          boundaryGap: false,
        },
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(123, 188, 255, 0.8)',
            },
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            margin: 20,
            textStyle: {
              color: '#c4fdff',
            },
          },
          axisTick: {
            show: false,
          },
        },
      ],
      series: this.lines.map(({ name, color }) => ({
        name,
        type: 'line',
        showAllSymbol: false,
        symbol: 'none',
        itemStyle: {
          normal: {
            color,
          },
        },
        lineStyle: {
          opacity: 0,
        },
        tooltip: {
          show: false,
        },
        areaStyle: {
          origin: 'auto',
          opacity: 1,
        },
        smooth: true,
      })),
    }
  }

  setZIndex = () => {
    const result = this.lines.map((v, i) => {
      if (i === this.zIndex) {
        return { z: 3 }
      }
      return { z: 2 }
    })
    const nextIndex = this.zIndex + 1
    this.zIndex = this.lines.length === nextIndex ? 0 : nextIndex
    return result
  }

  updateData = () => {
    this.myChart.setOption({
      title: {
        show: false,
      },
      series: this.setZIndex(),
      dataset: {
        source: this.getData(),
      },
    })
  }

  init = () => {
    this.myChart = this.echarts.init(this.echartRef.current)
    const option = this.getOption()
    this.myChart.setOption(option)

    when(
      () => store.lineChartData.length,
      () => this.updateData()
    )
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.clearUpdate()
  }

  render() {
    return (
      <Panel title={t('销售额趋势')} style={{ background: 'transparent' }}>
        <div style={{ height: 502 }} ref={this.echartRef} />
      </Panel>
    )
  }
}
LineChart.propTypes = {
  echarts: PropTypes.object.isRequired,
}

export default LineChart
