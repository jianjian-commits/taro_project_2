import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { adapter } from 'common/util'
import { observer } from 'mobx-react'
import requireEcharts from 'gm-service/src/require_module/require_echarts'
import FullScreenMapNew from 'common/../home/old/components/full_screen/map_new.js'
import SaleScreenBulletin from './sale_bulletin_screen'
import fullStore from 'common/../home/old/full_screen_store'

const SaleMapScreen = ({ className, theme }) => {
  const [echart, setEchart] = useState(null)
  const { theme: color } = adapter(theme)

  const getECharts = () => {
    return new Promise((resolve) => {
      if (echart) {
        resolve()
      } else {
        requireEcharts((eCharts) => {
          setEchart(eCharts)
          resolve()
        })
      }
    })
  }

  useEffect(() => {
    fullStore.getDistrictExplorer()
    fullStore.getMerchantCity()
    fullStore.getDriverLocation()
    getECharts()
    return () => {
      setEchart(null)
    }
  }, [])

  return (
    <div className={className}>
      <SaleScreenBulletin />
      {echart && <FullScreenMapNew echarts={echart} />}
    </div>
  )
}
SaleMapScreen.propTypes = {
  theme: PropTypes.any,
  className: PropTypes.string,
}
export default observer(SaleMapScreen)
// import MapEChart from 'common/components/customize_echarts/map_echart'
// {store.location.merchantData ? (
// <MapEChart
//   areaCode={store.filter.areaCode}
//   data={store.location}
//   theme={color}
// />
