/**
 *  为什么有这份代码？
 *    1. antv的地图组件若某个商户坐标超出地图范围的话，会出现地图缩小的情况，所以地图先用eChart写
 *    2. fangrenwen写的那一版地图组件和store耦合了，没法用,不想改他的代码，所以选择再写一次 -.-
 */
import React from 'react'
// import BaseECharts from 'common/components/customize_echarts/base_echarts'
import requireECharts from 'gm-service/src/require_module/require_echarts'
import PropTypes from 'prop-types'

class MapChart extends React.Component {
  constructor() {
    super()
    this.districtExplorer = null
    this.echartInstance = null // eChart实例
    this.containerRef = React.createRef()
    this.areaCode = 330100 // 正常情况下不会使用到
    this.echart = null
  }

  shouldComponentUpdate(nextProps) {
    const { areaCode, data } = this.props
    if (areaCode !== nextProps.areaCode) {
      this.setGeoJson(nextProps.areaCode).then(() => {
        this.echartInstance.resize()
      })
    }
    if (data !== nextProps.data) {
      this.setSeriesLocation(data)
    }
    return false
  }

  componentDidMount() {
    /**
     * 1. 调用高德的行政区域查询获取地图的geoJSON，供echart使用
     * 2. 加载echart
     * 3. 获取geo
     * 4. 设置echart的配置options
     */
    this.loadDistrictExplorer()
      .then(() => this.loadEchart())
      .then(() => this.initEchartInstance())

      .then(() => this.setGeoJson(this.props.areaCode))
      .then(() => this.setSeriesLocation(this.props.data || {}))

      // .then(() => this.removeMouseWheel())
      .catch((e) => {
        console.log(e)
      })
  }

  componentWillUnmount() {
    this.echartInstance.clear()
    this.echartInstance.dispose()
  }

  initEchartInstance() {
    if (!this.echart) {
      return this.loadEchart().then(() => this.initEchartInstance())
    } else {
      this.echartInstance = this.echart.init(this.containerRef.current)
      return Promise.resolve()
    }
  }

  setEchartOptions(option) {
    const { theme } = this.props
    if (!this.echartInstance) {
      return this.initEchartInstance().then(() => {
        this.setEchartOptions(option)
      })
    } else {
      return this.echartInstance.setOption(
        theme === 'ocean'
          ? { ...MapChart.oceanThemeOptions, option }
          : { ...MapChart.options, option },
        true,
      ) // 第二个参数设置为true不合并option,直接替换option
    }
  }

  setSeriesLocation(data) {
    const { theme } = this.props
    const { merchantData, driverData } = data
    if (!merchantData || !driverData) this.setEchartOptions({})
    const series =
      theme === 'ocean'
        ? MapChart.oceanThemeOptions.series
        : MapChart.options.series

    series.forEach((s) => {
      if (s.name === '商户') {
        s.data = merchantData
      }
      if (s.name === '司机') {
        s.data = driverData
      }
    })

    this.setEchartOptions(series)
  }

  // 不知道怎么删除canvas上的mousewheel事件，这个事件导致投屏模式下无法滚动页面
  // 用stopImmediatePropagation模拟
  removeMouseWheel() {
    if (this.containerRef.current && this.props.theme === 'ocean') {
      const canvas = this.containerRef.current.querySelector('canvas')
      if (canvas) {
        canvas.addEventListener('mousewheel', function (e) {
          e.stopImmediatePropagation()
        })
      }
    }
  }

  loadDistrictExplorer() {
    return new Promise((resolve, reject) => {
      if (window.AMapUI) {
        window.AMapUI.loadUI(['geo/DistrictExplorer'], (DistrictExplorer) => {
          this.districtExplorer = new DistrictExplorer()
          return resolve()
        })
      } else {
        reject(new Error('未找到window.AMapUI实例'))
      }
    })
  }

  loadEchart() {
    return new Promise((resolve, reject) => {
      if (!window.echart) {
        requireECharts((echart) => {
          this.echart = echart
          require('echarts-gl')
          window.echart = echart // 挂到window上，防止加载多次
          resolve()
        })
      } else {
        this.echart = window.echart
        resolve()
      }
    })
  }

  /**
   *
   * @param {string} areaCode 区划编码
   */
  setGeoJson(areaCode) {
    return new Promise((resolve, reject) => {
      if (this.districtExplorer) {
        this.districtExplorer.loadAreaNode(
          Number(areaCode || this.areaCode),
          (error, areaNode) => {
            if (error) {
              console.error(error)
              return
            }
            const geoJSON = {
              type: 'FeatureCollection',
            }
            // areaNode对象执行这个方法返回的geoJSON中的features
            let features = areaNode.getSubFeatures()
            if (features.length === 0) {
              features = [areaNode.getParentFeature()]
            }
            geoJSON.features = features

            this.echart.registerMap('city', geoJSON)
            resolve()
          },
        )
      } else {
        reject(new Error('找不到districtExplorer'))
      }
    })
  }

  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
        }}
        ref={this.containerRef}
      />
    )
  }
}

MapChart.propTypes = {
  theme: PropTypes.string,
  areaCode: PropTypes.string,
  data: PropTypes.shape({
    merchantData: PropTypes.any,
    driverData: PropTypes.any,
  }),
}
export default MapChart

MapChart.options = {
  legend: {
    orient: 'vertical',
    top: 20,
    right: 0,
    textStyle: {
      fontSize: 14,
    },
    icon: 'circle',
  },
  geo: {
    type: 'map',
    map: 'city', // 自定义扩展图表类型
    label: {
      show: false,
    },
    itemStyle: {
      areaColor: '#d5e0eb',
      borderColor: '#fff',
      borderWidth: 2,
    },
  },
  series: [
    {
      name: '商户',
      type: 'scatter',
      // data: toJS(store.merchantLocation),
      legendHoverLink: false,
      coordinateSystem: 'geo',
      symbolSize: 5,
      label: {
        show: false,
      },
      itemStyle: {
        color: '#007eff',
      },
    },
    {
      name: '司机',
      type: 'effectScatter',
      // data: toJS(store.driverLocation),
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
    },
  ],
}

MapChart.oceanThemeOptions = {
  geo: {
    map: 'city', // 地图范围
    show: false,
    zoom: 1.2,
  },
  geo3D: {
    // 地图的具体参数
    map: 'city', // 地图范围
    shading: 'realistic', // 真实感渲染
    // environment: "#090c50",
    instancing: true,
    light: {
      // 光照相关的设置。在 shading 为 'color' 的时候无效。
      main: {
        color: '#555',
        // 场景主光源的设置
        intensity: 0.9, // 主光源的强度
        shadow: false, // 主光源是否投射阴影
        alpha: 65, // 主光源绕 x 轴偏离的角度
        beta: 180, // 主光源绕 y 轴偏离的角度
      },
      ambient: {
        intensity: 1,
      },
    },
    viewControl: {
      // 用于鼠标的旋转，缩放等视角控制
      distance: 120, // 默认视角距离主体的距离
      panMouseButton: 'left', // 平移操作使用的鼠标按键
      rotateMouseButton: 'right', // 旋转操作使用的鼠标按键
      alpha: 70, // 让canvas在x轴有一定的倾斜角度
      panSensitivity: 1, // 设置为0后无法平移。
      zoomSensitivity: 1, // 设置为0后无法缩放。
      rotateSensitivity: 0, // 0 设置为0后无法旋转
    },
    postEffect: {
      // 为画面添加高光，景深，环境光遮蔽（SSAO），调色等效果
      enable: true, // 是否开启
      // bloom: {
      //   enable: false, // 高光特效，会有光晕，8需要
      //   intensity: 100,
      // },
      SSAO: {
        enable: true,
        radius: 4,
      },
    },
    temporalSuperSampling: {
      // 分帧超采样。在开启 postEffect 后，WebGL 默认的 MSAA 会无法使用,分帧超采样用来解决锯齿的问题
      enable: true,
    },
    itemStyle: {
      // 三维图形的视觉属性
      color: '#022c91',
      borderWidth: 0,
      borderColor: '#000',
    },
    emphasis: {
      // 鼠标 hover 高亮时图形和标签的样式。
      itemStyle: {
        color: '#022c91',
        opacity: 0.1,
      },
      label: {
        show: true,
        textStyle: {
          fontSize: 12,
        },
      },
    },
    regionHeight: 2, // 区域的高度
    realisticMaterial: {
      metalness: 0.8, // 金属质感
    },
  },
  series: [
    {
      name: '商户',
      type: 'scatter3D',
      coordinateSystem: 'geo3D',
      symbol: 'circle',
      symbolSize: 3,
      itemStyle: {
        color: '#00e5ff',
        opacity: 0.1,
      },
      cursor: 'none',
    },
    {
      name: '司机',
      type: 'scatter3D',
      legendHoverLink: false,
      coordinateSystem: 'geo3D',
      symbolSize: 5,
      z: 3,
      label: {
        show: false,
      },
      itemStyle: {
        color: '#f7b500',
        opacity: 0.1,
      },
    },
  ],
}
