import React from 'react'
import Panel from 'common/components/report/panel'
import PropTypes from 'prop-types'
import store from '../../full_screen_store'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'

import { analyseMerchantName } from '../../util'

@observer
class AnalyseMerchant extends React.Component {
  echarts = this.props.echarts
  myChart = null
  echartRef = React.createRef()
  titleIndex = 0

  clearUpdate = reaction(
    () => store.analyseMerchantData,
    () => {
      this.myChart && this.update()
    }
  )

  update = () => {
    const len = store.analyseMerchantData.order_price.length
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

  getData = () => {
    return store.analyseMerchantData.order_price.map((v, i) => ({
      name: v.shop_name,
      value: Number(v.order_amount),
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

  getTitle = (index) => {
    const { order_amount = 0, shop_name = '' } =
      store.analyseMerchantData.order_price[index] || {}
    return {
      text: ((order_amount / store.merchantPieTotal) * 100).toFixed(2) + '%',
      subtext: shop_name.length > 8 ? shop_name.slice(0, 8) + '...' : shop_name,
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
      <Panel
        title={analyseMerchantName()}
        style={{ background: 'transparent' }}
      >
        <div style={{ height: 300 }} ref={this.echartRef} />
      </Panel>
    )
  }
}
AnalyseMerchant.propTypes = {
  echarts: PropTypes.object.isRequired,
}

export default AnalyseMerchant
