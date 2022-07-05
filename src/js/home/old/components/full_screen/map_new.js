import React from 'react'
// import { t } from 'gm-i18n'
// import Panel from 'common/components/report/panel'
import PropTypes from 'prop-types'
import BaseMap from '../base_map'
// import store from '../../full_screen_store'
import { observer } from 'mobx-react'

@observer
class FullScreenMap extends React.Component {
  geoItemStyle = {
    borderColor: '#0ed6f0',
    borderWidth: 2,
    areaColor: {
      // type: 'radial',
      // x: 0.5,
      // y: 0.5,
      // r: 0.8,
      colorStops: [
        {
          offset: 0,
          color: 'rgba(12, 15, 68, 0)', // 0% 处的颜色
        },
        {
          offset: 1,
          color: 'rgba(12, 15, 68, .8)', // 100% 处的颜色
        },
      ],
      globalCoord: false, // 缺省为 false
    },
    // rgba(128, 217, 248, 1)
    shadowColor: '#2743b9',
    shadowOffsetX: -2,
    shadowOffsetY: 2,
    shadowBlur: 10,
    label: {
      show: false,
    },
  }

  options = {
    legendTextStyle: {
      color: '#c4fdff',
    },
    geoItemStyle: {
      ...this.geoItemStyle,
      emphasis: this.geoItemStyle,
    },
    geoEmphasis: {
      label: {
        show: false,
      },
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
    geo: {
      type: 'map',
      map: 'city', // 自定义扩展图表类型
      label: {
        show: true,
      },
      itemStyle: {
        areaColor: '#d5e0eb',
        borderColor: '#fff',
        borderWidth: 2,
      },
    },
    scatterSize: {
      symbolSize: 5,
    },
  }

  render() {
    return (
      <div style={{ background: 'transparent', height: 600 }}>
        <BaseMap eCharts={this.props.echarts} {...this.options} />
      </div>
    )
  }
}
FullScreenMap.propTypes = {
  echarts: PropTypes.object.isRequired,
}

export default FullScreenMap
