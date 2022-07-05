import React from 'react'
import PropTypes from 'prop-types'
import store from '../full_screen_store'

import { observer } from 'mobx-react'
import { observable, runInAction, reaction, when, toJS } from 'mobx'
import { withRouter } from 'react-router'
import globalStore from 'stores/global'
import { getMapCenterAddress } from './util'

const baseUrl = 'https://restapi.amap.com/v3/'
@observer
@withRouter
class BaseMap extends React.Component {
  @observable
  myCharts = null

  eCharts = this.props.eCharts
  eChartsRef = React.createRef()

  clearUpdate = reaction(
    () => [this.myCharts, store.driverLocation, store.merchantLocation],
    () => this.echartsDataset(),
  )

  getOptions = () => {
    const {
      legendTextStyle,
      geoItemStyle,
      scatterSize,
      geoEmphasis,
    } = this.props
    const { isCStation } = globalStore.otherInfo
    return {
      geo: {
        map: 'city', // 自定义扩展图表类型
        label: {
          show:
            this.props.match.path ===
            '/data/dashboard/sale_dashboard/fullscreen',
          zoom: 1,
          textStyle: {
            color: '#62d3ec',
            legendHoverLink: false,
            fontSize: 14,
          },
          emphasis: {
            textStyle: {
              color:
                this.props.match.path ===
                '/data/dashboard/sale_dashboard/fullscreen'
                  ? '#fff'
                  : '#000',
            },
          },
        },
        itemStyle: {
          areaColor: '#d5e0eb',
          borderColor: '#fff',
          borderWidth: 2,
          ...geoItemStyle,
        },
        emphasis: geoEmphasis,
      },
      legend: {
        orient: 'vertical',
        top: 20,
        right: 0,
        textStyle: {
          fontSize: 14,
          ...legendTextStyle,
        },
        icon: 'circle',
      },
      series: [
        {
          name: isCStation ? '客户' : '商户',
          type: 'scatter',
          data: toJS(store.merchantLocation),
          legendHoverLink: false,
          coordinateSystem: 'geo',
          symbolSize: 5,
          label: {
            show: false,
          },
          itemStyle: {
            color: '#007eff',
          },
          ...scatterSize,
        },
        {
          name: '司机',
          type: 'effectScatter',
          data: toJS(store.driverLocation),
          legendHoverLink: false,
          coordinateSystem: 'geo',
          symbolSize: 5,
          z: 3,
          label: {
            show: false,
          },
          itemStyle: {
            color: '#f7b500',
          },
          rippleEffect: {
            // 涟漪特效
            period: 4, // 动画时间，值越小速度越快
            brushType: 'stroke', // 波纹绘制方式 stroke, fill
            scale: 4, // 波纹圆环最大限制，值越大波纹越大
          },
          ...scatterSize,
        },
      ],
    }
  }

  init = async () => {
    // 由于后台返回的city_id和高德地图的城市编码（adcode）表对不上（https://lbs.amap.com/api/webservice/download）
    // 所以不使用后端返回的city_id，是根据城市名称去获取adcode
    const adcode = await getMapCenterAddress(
      baseUrl,
      `geocode/geo?key=e805d5ba2ef44393f20bc9176c3821a2&address=${store.city.name}`,
    )
    // 利用高德地图的 DistrictExplorer 的实例，
    // 可以根据当前需要加载城市的 adcode 获取到该城市的 geo 数据
    store.districtExplorer.loadAreaNode(adcode, (error, areaNode) => {
      if (error) {
        console.error(error)
        return
      }
      const geoData = {
        type: 'FeatureCollection',
      }
      // areaNode对象执行这个方法返回的geoJSON中的features
      let geoJSON = areaNode.getSubFeatures()
      if (geoJSON.length === 0) {
        geoJSON = [areaNode.getParentFeature()]
      }
      geoData.features = geoJSON

      this.eCharts.registerMap('city', geoData)

      runInAction(() => {
        this.myCharts = this.eCharts.init(this.eChartsRef.current)
        const options = this.getOptions()
        this.myCharts.setOption(options)
      })
    })
  }

  echartsDataset = () => {
    this.myCharts &&
      this.myCharts.setOption({
        series: [
          // 商户
          {
            data: toJS(store.merchantLocation),
          },
          // 司机
          {
            data: toJS(store.driverLocation),
          },
        ],
      })
  }

  resize = () => {
    this.myCharts && this.myCharts.resize()
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this)
    when(
      () => store.districtExplorer && store.city.id,
      () => this.init(),
    )
  }

  componentWillUnmount() {
    this.clearUpdate()
  }

  render() {
    return (
      <div ref={this.eChartsRef} style={{ width: '100%', height: '100%' }} />
    )
  }
}
BaseMap.propTypes = {
  eCharts: PropTypes.object.isRequired,
  // echarts option
  legendTextStyle: PropTypes.object,
  geoItemStyle: PropTypes.object,
  scatterSize: PropTypes.object,
  geoEmphasis: PropTypes.object,
  onRef: PropTypes.func,
}
BaseMap.defaultProps = {
  legendTextStyle: {},
  geoItemStyle: {},
  scatterSize: {},
  geoEmphasis: {},
}

export default BaseMap
