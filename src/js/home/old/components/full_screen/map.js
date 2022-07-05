import React from 'react'
import { t } from 'gm-i18n'
import Panel from 'common/components/report/panel'
import PropTypes from 'prop-types'
import BaseMap from '../base_map'
import store from '../../full_screen_store'
import { observer } from 'mobx-react'

@observer
class FullScreenMap extends React.Component {
  geoItemStyle = {
    borderColor: 'rgba(147, 235, 248, 1)',
    borderWidth: 1,
    areaColor: {
      type: 'radial',
      x: 0.5,
      y: 0.5,
      r: 0.8,
      colorStops: [
        {
          offset: 0,
          color: 'rgba(147, 235, 248, 0)', // 0% 处的颜色
        },
        {
          offset: 1,
          color: 'rgba(147, 235, 248, .2)', // 100% 处的颜色
        },
      ],
      globalCoord: false, // 缺省为 false
    },
    shadowColor: 'rgba(128, 217, 248, 1)',
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
    scatterSize: {
      symbolSize: 5,
    },
  }

  render() {
    return (
      <Panel
        title={t('地区分布') + '-' + store.city.name}
        style={{ background: 'transparent', height: 350 }}
      >
        <BaseMap eCharts={this.props.echarts} {...this.options} />
      </Panel>
    )
  }
}
FullScreenMap.propTypes = {
  echarts: PropTypes.object.isRequired,
}

export default FullScreenMap
