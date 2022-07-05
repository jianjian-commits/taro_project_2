import { t } from 'gm-i18n'
import React from 'react'
import { Flex, DropDown, DropDownItems, DropDownItem } from '@gmfe/react'
import requireECharts from 'gm-service/src/require_module/require_echarts'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { SvgDown } from 'gm-svg'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import BaseMap from './base_map'
import store from '../full_screen_store'
const CitySelect = ({ cityList, city, onChange }) => {
  const handleClick = (item) => {
    onChange && onChange(item)
  }
  return (
    <Flex>
      <DropDown
        popup={
          <DropDownItems>
            {_.map(cityList, (v, i) => (
              <DropDownItem key={i} onClick={() => handleClick(v)}>
                <div>
                  <span>{v.city}</span>
                </div>
              </DropDownItem>
            ))}
          </DropDownItems>
        }
        className='b-purchase-overview-dropDown gm-cursor'
        style={{ borderRadius: '2px', height: '30px' }}
      >
        <Flex row alignCenter>
          <Flex row className='gm-margin-right-5'>
            <div>{city.name}</div>
          </Flex>
          <SvgDown className='gm-text-desc' />
        </Flex>
      </DropDown>
    </Flex>
  )
}
CitySelect.propTypes = {
  cityList: PropTypes.array.isRequired,
  city: PropTypes.object.isRequired,
  onChange: PropTypes.func,
}
@observer
class HomeMap extends React.Component {
  static propTypes = {
    className: PropTypes.string,
  }

  map = React.createRef()
  state = {
    eCharts: null,
  }

  getECharts = () => {
    return new Promise((resolve) => {
      if (this.state.eCharts) {
        resolve()
      } else {
        requireECharts((eCharts) => {
          this.setState({ eCharts })
          resolve()
        })
      }
    })
  }

  resize = () => {
    const map = this.Sub
    map && map.resize()
  }

  componentDidMount() {
    store.getGeocoder()
    store.getDistrictExplorer()
    store.getMerchantCity()
    store.getDriverLocation()
    this.getECharts()
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  handleSelect(item) {
    const { setCity } = store
    setCity(item)
    store.getGeocoder()
    store.getDistrictExplorer()
    // store.getDriverLocation()
    this.getECharts()
    this.Sub.init()
  }

  render() {
    const { eCharts } = this.state
    const { className } = this.props
    const { cityList, city } = store
    return (
      <Panel
        title={t('运营地图')}
        style={{ height: '350px' }}
        className={classNames(className)}
        right={
          <Flex alignStart style={{ height: '35px' }}>
            <CitySelect
              cityList={cityList}
              city={city}
              onChange={this.handleSelect.bind(this)}
            />
          </Flex>
        }
      >
        {eCharts && (
          <BaseMap
            ref={this.map}
            eCharts={eCharts}
            onRef={(node) => (this.Sub = node)}
          />
        )}
      </Panel>
    )
  }
}

export default HomeMap
