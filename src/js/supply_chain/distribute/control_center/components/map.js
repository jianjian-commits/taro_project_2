import React from 'react'
import _ from 'lodash'
import { Map as AMap, Markers, Polyline, Marker } from 'react-amap'
import { Popover, Loading } from '@gmfe/react'
import { inject, observer } from 'mobx-react'
import MarkerShowControl from './map_marker_show_control'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import SVGStart from 'svg/start_point.svg'
import SVGEnd from 'svg/end_point.svg'
import imgCar from 'img/driver_car.png'
import SVGLocation from 'svg/location.svg'
import imgDistributingShop from 'img/driver_distributing_shop.png'
import imgReceivedShop from 'img/driver_received_shop.png'
import { marker, markerList } from '../store'
import { isInvalidLocation } from 'common/util'

// 高德地图版本,这个版本比较稳定
const VERSION = '1.4.10'

@inject('store')
@observer
class Map extends React.Component {
  constructor() {
    super()
    this.map = null
    const _this = this

    this.mapEvents = {
      created(map) {
        _this.map = map
      },
    }

    this.features = ['road', 'bg', "point", "building"]
    this.plugins = ['ToolBar']
  }

  handleMarkerShow = (selected) => {
    this.props.store.setShowMarkers(selected)
  }

  componentDidMount() {
    window.document.addEventListener('map-setFitView', this.handleSetFitView)
  }

  componentWillUnmount() {
    window.document.removeEventListener('map-setFitView', this.handleSetFitView)
  }

  handleSetFitView = () => {
    // 把地图缩放到合适视野
    this.map && this.map.setFitView()
  }

  render() {
    const {
      showMarkers,
      driverMarker,
      isLoading,
      traceList,
      receiveMarkerList,
      distributingMarkerList,
      stayDelayMarkerList,
      computed3Markers: { carList, startPointList, endPointList },
    } = this.props.store

    const polyLines = _.map(traceList, (o, i) => (
      <Polyline
        key={i}
        path={o.path}
        style={{
          strokeColor: o.color,
          showDir: true,
          strokeWeight: 8,
          strokeOpacity: 0.8,
        }}
      />
    ))

    return (
      <div className='b-control-center'>
        {isLoading && (
          <Loading size={100} className='b-control-center-loading' />
        )}
        <MarkerShowControl
          list={markerList}
          onChange={this.handleMarkerShow}
          selected={[...showMarkers]}
        />

        <AMap
          features={this.features}
          events={this.mapEvents}
          version={VERSION}
          plugins={this.plugins}
          amapkey='5083dc7eb0eb96b317c739c9daae1d15'
          zoom={10}
        >
          <Markers
            markers={
              showMarkers.has(marker.receiveMarker.value)
                ? receiveMarkerList
                : []
            }
            render={(item) => {
              return (
                <Popover
                  showArrow
                  top
                  type='hover'
                  popup={
                    <div className='gm-padding-5'>
                      商户: {item.address_name} |{' '}
                      <span className='text-primary'>已签收</span>
                      <br />
                      {t('配送司机')}：
                      {item.drivers.map((o) => o.driver_name).join('，')}
                    </div>
                  }
                >
                  <img width={30} src={imgReceivedShop} alt='' />
                </Popover>
              )
            }}
            useCluster
          />

          <Markers
            markers={
              showMarkers.has(marker.distributingMarker.value)
                ? distributingMarkerList // slice() 很慢，所以不用slice()了
                : []
            }
            render={(item) => {
              return (
                <Popover
                  showArrow
                  top
                  type='hover'
                  popup={
                    <div className='gm-padding-5'>
                      商户: {item.address_name} | <span>未签收</span>
                      <br />
                      {t('配送司机')}：
                      {item.drivers.map((o) => o.driver_name).join('，')}
                    </div>
                  }
                >
                  <img width={30} src={imgDistributingShop} alt='' />
                </Popover>
              )
            }}
            useCluster
          />

          <Markers
            markers={
              showMarkers.has(marker.stayDelayMarker.value)
                ? stayDelayMarkerList
                : []
            }
            render={(item) => {
              return (
                <Popover
                  top
                  type='hover'
                  popup={
                    <span className='gm-padding-10'>
                      滞留{(item.delay_time / 60).toFixed(0)}min
                    </span>
                  }
                >
                  <div className='b-control-center-stay-delay-point' />
                </Popover>
              )
            }}
            useCluster
          />

          <Markers
            markers={showMarkers.has(marker.trace.value) ? carList : []}
            render={(item) => {
              return (
                <Popover
                  top
                  type='hover'
                  popup={
                    <span className='gm-padding-10'>
                      {item.carrier_name}: {item.driver_name}
                    </span>
                  }
                >
                  <img
                    width={40}
                    src={imgCar}
                    alt=''
                    style={{ position: 'relative', left: '-8px' }}
                  />
                </Popover>
              )
            }}
          />

          <Markers
            markers={showMarkers.has(marker.trace.value) ? startPointList : []}
            render={(item) => {
              return (
                <Popover
                  top
                  type='hover'
                  popup={
                    <span className='gm-padding-10'>
                      {item.carrier_name}: {item.driver_name}
                    </span>
                  }
                >
                  <span className='gm-text-24'>
                    <SVGStart />
                  </span>
                </Popover>
              )
            }}
          />

          <Markers
            markers={showMarkers.has(marker.trace.value) ? endPointList : []}
            render={(item) => {
              return (
                <Popover
                  top
                  type='hover'
                  popup={
                    <span className='gm-padding-10'>
                      {item.carrier_name}: {item.driver_name}
                    </span>
                  }
                >
                  <span className='gm-text-24'>
                    <SVGEnd />
                  </span>
                </Popover>
              )
            }}
          />

          {showMarkers.has(marker.trace.value) && polyLines}

          <Marker
            position={driverMarker.position}
            visible={
              !showMarkers.has(marker.driverMarker.value) ||
              !isInvalidLocation(
                driverMarker.position.longitude,
                driverMarker.position.latitude
              )
            }
            render={() => {
              return (
                <Popover
                  top
                  type='hover'
                  popup={
                    <span className='gm-padding-10'>
                      {driverMarker.driver_name}
                    </span>
                  }
                >
                  <span className='gm-text-24'>
                    <SVGLocation />
                  </span>
                </Popover>
              )
            }}
          />
        </AMap>
      </div>
    )
  }
}

Map.propTypes = {
  store: PropTypes.object,
}

export default Map
