import React from 'react'
import _ from 'lodash'
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

@inject('store')
@observer
class GMap extends React.Component {
  constructor() {
    super()
    this.map = null
    this.drawingManager = null
    this.state = {
      center: {
        lng: 116.397451,
        lat: 39.909187,
      },
    }
  }

  componentDidMount() {
    window.document.addEventListener(
      'map-mouseTool-toggle',
      this.handleMouseToolToggle,
    )
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

  componentWillUnmount() {
    window.document.removeEventListener(
      'map-mouseTool-toggle',
      this.handleMouseToolToggle,
    )
  }

  handleMouseToolToggle = (e) => {
    const isMouseToolOpen = e.detail
    isMouseToolOpen ? this.mouseToolOpen() : this.mouseToolClose()
  }

  mouseToolOpen = () => {
    this.drawingManager.setDrawingMode('rectangle')
    this.drawingManager.setOptions({
      rectangleOptions: {
        fillColor: '#56a3f2',
        strokeColor: '#3e96f0',
      },
      drawingControlOptions: null,
    })
  }

  mouseToolClose = () => {
    this.drawingManager.setDrawingMode(null)
  }

  handleMapLoad = (map) => {
    this.map = map
    this.drawingManager = new window.google.maps.drawing.DrawingManager()
    this.drawingManager.setDrawingMode(null)
    this.drawingManager.addListener('rectanglecomplete', (rtg) => {
      this.props.store.handleBatchPickMarkerByGMap(rtg.getBounds())
      rtg.setMap(null)
    })
    this.drawingManager.setMap(this.map)
  }

  handleMarkerClick(index) {
    this.props.store.handleMarker(index)
  }

  render() {
    const { orderListGroupByCustomer, polyLineArray } = this.props.store

    return (
      <GoogleMap
        zoom={10}
        center={this.state.center}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onLoad={this.handleMapLoad}
      >
        {_.map(toJS(orderListGroupByCustomer), (o, i) => (
          <Marker
            key={i}
            position={{
              lng: o.position.longitude,
              lat: o.position.latitude,
            }}
            label={{
              text: `${o.customer_name} ${o.orderSum}`,
              color: o.color,
            }}
            onClick={this.handleMarkerClick.bind(this, i)}
          />
        ))}
        {_.map(toJS(polyLineArray), (o) => (
          <Polyline
            key={o.driver_id}
            path={o.path}
            style={{ strokeColor: o.color }}
          />
        ))}
      </GoogleMap>
    )
  }
}

export default GMap
