import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Map as AMap, Markers, Polyline } from 'react-amap'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import BubbleDialog from './components/bubble_dialog'

// 高德地图版本,这个版本比较稳定
const VERSION = '1.4.10'

@inject('store')
@observer
class Map extends React.Component {
  constructor() {
    super()
    this.map = null
    this.mouseTool = null

    const _this = this

    this.mapEvents = {
      created(map) {
        _this.map = map
        window.AMap.plugin('AMap.MouseTool', () => {
          _this.mouseTool = new window.AMap.MouseTool(_this.map)
          // 监听绘制矩形事件
          _this.mouseTool.on('draw', (e) => {
            const rectangle = e.obj

            _this.props.store.handleBatchPickMarker(rectangle.getPath())

            // 延时关闭复选框
            setTimeout(() => {
              _this.map.remove(rectangle)
            }, 200)
          })
        })
      },
    }
  }

  componentDidMount() {
    window.document.addEventListener(
      'map-mouseTool-toggle',
      this.handleMouseToolToggle
    )
    window.document.addEventListener('map-setFitView', this.handleSetFitView)
  }

  componentWillUnmount() {
    window.document.removeEventListener(
      'map-mouseTool-toggle',
      this.handleMouseToolToggle
    )
    window.document.removeEventListener('map-setFitView', this.handleSetFitView)
  }

  mouseToolOpen = () => {
    this.mouseTool.rectangle({
      fillColor: '#56a3f2',
      strokeColor: '#3e96f0',
    })
  }

  mouseToolClose = () => {
    this.mouseTool.close(true)
  }

  handleMouseToolToggle = (e) => {
    const isMouseToolOpen = e.detail
    isMouseToolOpen ? this.mouseToolOpen() : this.mouseToolClose()
  }

  handleSetFitView = () => {
    this.map.setFitView()
  }

  handleMarkerClick(index) {
    this.props.store.handleMarker(index)
  }

  renderMarkerFn = ({
    customer_name,
    orderSum,
    color,
    active,
    index,
    isAllOrderHaveDriver,
  }) => {
    return (
      <BubbleDialog
        pointColor={color}
        active={active}
        isDark={!isAllOrderHaveDriver}
        onClick={this.handleMarkerClick.bind(this, index)}
      >
        <span>{customer_name}</span>{' '}
        <span className='b-color-active'>{orderSum}</span>
      </BubbleDialog>
    )
  }

  render() {
    const { orderListGroupByCustomer, polyLineArray } = this.props.store

    return (
      <AMap
        events={this.mapEvents}
        version={VERSION}
        plugins={['ToolBar']}
        amapkey='5083dc7eb0eb96b317c739c9daae1d15'
        zoom={10}
      >
        <Markers
          render={this.renderMarkerFn}
          markers={toJS(orderListGroupByCustomer)}
          useCluster
        />
        {_.map(polyLineArray, (o) => (
          <Polyline
            key={o.driver_id}
            path={o.path}
            style={{ strokeColor: o.color }}
          />
        ))}
      </AMap>
    )
  }
}

Map.propTypes = {
  store: PropTypes.object,
}

export default Map
