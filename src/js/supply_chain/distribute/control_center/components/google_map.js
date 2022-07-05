import React from 'react'
import _ from 'lodash'
import { Loading } from '@gmfe/react'
import { inject, observer } from 'mobx-react'
import MarkerShowControl from './map_marker_show_control'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { marker, markerList } from '../store'
import { isInvalidLocation } from 'common/util'
import { GoogleMap, Marker, InfoWindow, Polyline } from '@react-google-maps/api'
import imgDistributingShop from 'img/driver_distributing_shop.png'
import imgReceivedShop from 'img/driver_received_shop.png'
import imgCar from 'img/driver_car.png'
import imgStart from 'img/start_point.png'
import imgEnd from 'img/end_point.png'
import imgLocation from 'img/location.png'
import imgDriverStay from 'img/driver_stay.png'

const markerSize = {
  scaledSize: {
    height: 30,
    width: 30,
  },
}

@inject('store')
@observer
class GMap extends React.Component {
  constructor() {
    super()
    this.map = null
    this.infoWindow = null

    this.state = {
      infoWindowData: null,
      center: {
        lng: 116.397451,
        lat: 39.909187,
      },
    }
  }

  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          this.setState({
            center: {
              lng: longitude,
              lat: latitude,
            },
          })
        },
      )
    }
  }

  handleMarkerShow = (selected) => {
    this.props.store.setShowMarkers(selected)
  }

  handleClickMarker = (position, children) => {
    this.setState({
      infoWindowData: {
        position: {
          lat: parseFloat(position.latitude),
          lng: parseFloat(position.longitude),
        },
        children,
      },
    })
    this.infoWindow && this.infoWindow.open(this.map)
  }

  handleInfoWindowLoad = (infoWindow) => {
    this.infoWindow = infoWindow
  }

  handleMapLoad = (map) => {
    this.map = map
  }

  render() {
    const {
      showMarkers,
      driverMarker,
      isLoading,
      originTraceList,
      receiveMarkerList,
      distributingMarkerList,
      stayDelayMarkerList,
      computed3Markers: { carList, startPointList, endPointList },
    } = this.props.store

    const polyLines = _.map(originTraceList, (o, i) => {
      const path = _.map(
        o.path,
        (p) =>
          new window.google.maps.LatLng(
            parseFloat(p.latitude),
            parseFloat(p.longitude),
          ),
      )

      const onLoad = (polyline) => {
        // 去除过于偏离的点，google map api 没有高德的道路纠偏功能
        const newPath = _.filter(path, (p) => {
          return window.google.maps.geometry.poly.isLocationOnEdge(p, polyline)
        })
        polyline.setPath(newPath)
      }

      return (
        <Polyline
          key={i}
          onLoad={onLoad}
          path={path}
          options={{
            strokeColor: o.color,
            fillColor: o.color,
            strokeWeight: 8,
            strokeOpacity: 0.8,
          }}
        />
      )
    })

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

        <GoogleMap
          zoom={10}
          center={this.state.center}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          onLoad={this.handleMapLoad}
        >
          {showMarkers.has(marker.receiveMarker.value) &&
            _.map(receiveMarkerList, (mark, index) => {
              const child = (
                <div className='gm-padding-5'>
                  商户: {mark.address_name} |{' '}
                  <span className='text-primary'>已签收</span>
                  <br />
                  {t('配送司机')}：
                  {mark.drivers.map((o) => o.driver_name).join('，')}
                </div>
              )
              return (
                <Marker
                  key={index}
                  position={{
                    lng: mark.position.longitude,
                    lat: mark.position.latitude,
                  }}
                  onClick={() => this.handleClickMarker(mark.position, child)}
                  icon={{
                    ...markerSize,
                    url: imgReceivedShop,
                  }}
                />
              )
            })}

          {showMarkers.has(marker.distributingMarker.value) &&
            _.map(distributingMarkerList, (mark, index) => {
              const child = (
                <div className='gm-padding-5'>
                  商户: {mark.address_name} | <span>未签收</span>
                  <br />
                  {t('配送司机')}：
                  {mark.drivers.map((o) => o.driver_name).join('，')}
                </div>
              )
              return (
                <Marker
                  key={index}
                  position={{
                    lng: mark.position.longitude,
                    lat: mark.position.latitude,
                  }}
                  onClick={() => this.handleClickMarker(mark.position, child)}
                  icon={{
                    ...markerSize,
                    url: imgDistributingShop,
                  }}
                />
              )
            })}

          {showMarkers.has(marker.stayDelayMarker.value) &&
            _.map(stayDelayMarkerList, (mark, index) => {
              const child = (
                <span className='gm-padding-10'>
                  滞留{(mark.delay_time / 60).toFixed(0)}min
                </span>
              )
              return (
                <Marker
                  key={index}
                  position={{
                    lng: mark.position.longitude,
                    lat: mark.position.latitude,
                  }}
                  onClick={() => this.handleClickMarker(mark.position, child)}
                  icon={{
                    ...markerSize,
                    url: imgDriverStay,
                  }}
                />
              )
            })}

          {showMarkers.has(marker.trace.value) &&
            _.map(carList, (mark, index) => {
              const child = (
                <span className='gm-padding-10'>
                  {mark.carrier_name}: {mark.driver_name}
                </span>
              )
              return (
                <Marker
                  key={index}
                  position={{
                    lng: parseFloat(mark.position.longitude),
                    lat: parseFloat(mark.position.latitude),
                  }}
                  onClick={() => this.handleClickMarker(mark.position, child)}
                  icon={{
                    ...markerSize,
                    url: imgCar,
                  }}
                />
              )
            })}

          {showMarkers.has(marker.trace.value) &&
            _.map(startPointList, (mark, index) => {
              const child = (
                <span className='gm-padding-10'>
                  {mark.carrier_name}: {mark.driver_name}
                </span>
              )
              return (
                <Marker
                  key={index}
                  position={{
                    lng: parseFloat(mark.position.longitude),
                    lat: parseFloat(mark.position.latitude),
                  }}
                  onClick={() => this.handleClickMarker(mark.position, child)}
                  icon={{
                    ...markerSize,
                    url: imgStart,
                  }}
                />
              )
            })}

          {showMarkers.has(marker.trace.value) &&
            _.map(endPointList, (mark, index) => {
              const child = (
                <span className='gm-padding-10'>
                  {mark.carrier_name}: {mark.driver_name}
                </span>
              )
              return (
                <Marker
                  key={index}
                  position={{
                    lng: parseFloat(mark.position.longitude),
                    lat: parseFloat(mark.position.latitude),
                  }}
                  onClick={() => this.handleClickMarker(mark.position, child)}
                  icon={{
                    ...markerSize,
                    url: imgEnd,
                  }}
                />
              )
            })}

          {showMarkers.has(marker.trace.value) && polyLines}

          <Marker
            position={{
              lng: driverMarker.position.longitude,
              lat: driverMarker.position.latitude,
            }}
            visible={
              !showMarkers.has(marker.driverMarker.value) ||
              !isInvalidLocation(
                driverMarker.position.longitude,
                driverMarker.position.latitude,
              )
            }
            onClick={() =>
              this.handleClickMarker(
                driverMarker.position,
                <span className='gm-padding-10'>
                  {driverMarker.driver_name}
                </span>,
              )
            }
            icon={{ ...markerSize, url: imgLocation }}
          />

          {this.state.infoWindowData && (
            <InfoWindow
              options={{
                pixelOffset: {
                  height: -43,
                },
              }}
              onLoad={this.handleInfoWindowLoad}
              position={this.state.infoWindowData.position}
            >
              {this.state.infoWindowData.children}
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    )
  }
}

GMap.propTypes = {
  store: PropTypes.object,
}

export default GMap
