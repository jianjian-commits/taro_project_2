import React from 'react'
import { t } from 'gm-i18n'
import Panel from 'common/components/report/panel'
import PropTypes from 'prop-types'
import store from '../../full_screen_store'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'

@observer
class AnalyseSkus extends React.Component {
  echarts = this.props.echarts
  myChart = null
  echartRef = React.createRef()
  titleIndex = 0

  clearUpdate = reaction(
    () => store.analyseSkuData,
    () => {
      this.myChart && this.update()
    }
  )

  update = () => {
    const len = store.analyseSkuData.category_1.length

    if (len > 0) {
      this.titleIndex += 1
      if (this.titleIndex >= len) {
        this.titleIndex = 0
      }
    }

    this.myChart.setOption({
      title: this.getTitle(this.titleIndex),
      series: [
        {
          data: this.getData(),
        },
      ],
    })
  }

  getTitle = (index) => {
    const sku = store.analyseSkuData.category_1[index]
    const percent = sku?.account_price_proportion || 0
    const subTitle = sku?.name || ''
    return {
      text: (percent * 100).toFixed(2) + '%',
      subtext: subTitle.length > 8 ? subTitle.slice(0, 8) + '...' : subTitle,
    }
  }

  getData = () => {
    return store.analyseSkuData.category_1.map((v, i) => ({
      name: v.name,
      value: Number(v.account_price_proportion),
      selected: i === this.titleIndex,
    }))
  }

  initOption = () => {
    return {
      color: store.pieColor,
      title: {
        ...this.getTitle(0),
        x: 105,
        y: '38%',
        textAlign: 'center',
        textStyle: {
          fontSize: 36,
          color: '#c4fdff',
        },
        subtextStyle: {
          color: '#c4fdff',
          fontSize: 16,
        },
      },
      legend: {
        orient: 'vertical',
        top: 20,
        right: 0,
        formatter: (name) => {
          return name.length > 5 ? name.slice(0, 5) + '...' : name
        },
        textStyle: {
          color: '#c4fdff',
          fontSize: 12,
        },
        icon: 'circle',
      },
      right: 0,
      series: [
        {
          type: 'pie',
          center: [110, '50%'],
          radius: [80, 100],
          minAngle: 8,
          legendHoverLink: false,
          hoverAnimation: false,
          data: this.getData(),
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
        },
      ],
    }
  }

  init = () => {
    this.myChart = this.echarts.init(this.echartRef.current)
    const option = this.initOption()
    this.myChart.setOption(option)
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.clearUpdate()
  }

  render() {
    return (
      <Panel title={t('分类统计')} style={{ background: 'transparent' }}>
        <div style={{ height: 300 }} ref={this.echartRef} />
      </Panel>
    )
  }
}
AnalyseSkus.propTypes = {
  echarts: PropTypes.object.isRequired,
}

export default AnalyseSkus
