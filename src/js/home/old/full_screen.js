import React from 'react'
import globalStore from 'stores/global'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'
import store from './full_screen_store'
import { observer } from 'mobx-react'
import { Flex, FlipNumber } from '@gmfe/react'
import requireEcharts from 'gm-service/src/require_module/require_echarts'
import FourCornerBorder from 'common/components/four_corner_border'
import LineChart from './components/full_screen/line_chart'
import ReadyBill from './components/full_screen/ready_bill'
import Warning from './components/full_screen/warning'
import AnalyseSkus from './components/full_screen/analyse_skus'
import AnalyseMerchant from './components/full_screen/analyse_merchant'
import FullScreenMap from './components/full_screen/map'
import Notify from './components/full_screen/notify'
import { history } from 'common/service'
import SvgNext from 'svg/next.svg'
import NoData from './components/full_screen/no_data'

class OperationData extends React.Component {
  flipRef = React.createRef()
  componentDidMount() {
    this.flipRef.current.wrap
      .querySelectorAll('div.gm-inline-block')
      .forEach((box) => {
        box
          .querySelectorAll('div')
          .forEach((div) =>
            div.classList.add('b-full-screen-gradient-color-blue'),
          )
      })
  }

  render() {
    const {
      decimal = 0,
      todayTitle,
      prevData,
      todayData,
      yesterdayTitle,
      yesterdayData,
    } = this.props
    let isNegative = false
    if (todayData < 0) {
      isNegative = true
    }
    return (
      <>
        <p style={{ fontSize: 18 }}>{todayTitle}</p>
        <Flex>
          {isNegative && (
            <Flex
              alignCenter
              className='b-full-screen-gradient-color-blue'
              style={{ fontSize: 32, fontWeight: 900 }}
            >
              -
            </Flex>
          )}
          <div
            style={{ fontSize: 32, fontWeight: 900, fontFamily: 'Helvetica' }}
          >
            <FlipNumber
              ref={this.flipRef}
              from={prevData > todayData ? 0 : prevData}
              to={Math.abs(todayData)}
              decimal={decimal}
              delay={500}
            />
          </div>
        </Flex>
        <Flex justifyBetween>
          <p style={{ fontSize: 14 }}>{yesterdayTitle}</p>
          <p
            style={{ fontSize: 16 }}
            className='b-full-screen-gradient-color-blue'
          >
            {yesterdayData}
          </p>
        </Flex>
      </>
    )
  }
}
OperationData.propTypes = {
  decimal: PropTypes.number,
  todayTitle: PropTypes.string.isRequired,
  prevData: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  todayData: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  yesterdayTitle: PropTypes.string.isRequired,
  yesterdayData: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
}

@observer
class FullScreen extends React.Component {
  echarts = null
  taskId = null

  getData = () => {
    store.getOperationData()
    store.getLineChartData()
    store.getReadyBillData()
    store.getWarningData()
    store.getAnalyseSkuData()
    store.getAnalyseMerchantData()
    store.city.id && store.getMerchantLocation(store.city.id)
    store.getDriverLocation()
    store.getNotifyData()
  }

  timedTask = () => {
    this.taskId = setInterval(this.getData, 8000)
  }

  componentDidMount() {
    this.getData()

    store.getMerchantCity()

    store.getDistrictExplorer()
    store.getGeocoder()
    requireEcharts((char) => {
      this.echarts = char
    })

    this.timedTask()
  }

  componentWillUnmount() {
    clearInterval(this.taskId)
  }

  render() {
    const commonStyle = {
      marginBottom: 20,
      width: '100%',
      height: 126,
      padding: '20px 20px 0',
    }
    return (
      <div className='b-home-full-screen-box'>
        <Flex
          onClick={() => {
            history.push('/home')
          }}
          width='80px'
          height='30px'
          style={{
            position: 'absolute',
            right: 20,
            top: 20,
          }}
        >
          <FourCornerBorder>
            <Flex
              style={{
                width: '80px',
                height: '30px',
              }}
              className='gm-cursor b-sorting-full-screen-button'
              alignCenter
              justifyCenter
            >
              {i18next.t('退出投屏')}&nbsp;
              <SvgNext />
            </Flex>
          </FourCornerBorder>
        </Flex>
        <p
          style={{
            height: 100,
            lineHeight: '100px',
            fontSize: 38,
            textAlign: 'center',
          }}
        >
          {globalStore.user.station_name + i18next.t('运营数据中心')}
        </p>
        <div style={{ padding: '20px 20px 0' }}>
          <Flex
            style={{
              height: 564,
              marginBottom: 20,
            }}
          >
            <div style={{ minWidth: 400 }}>
              {store.operationData.map((v) => (
                <FourCornerBorder style={commonStyle} key={v.key}>
                  <OperationData {...v} />
                </FourCornerBorder>
              ))}
            </div>
            <FourCornerBorder style={{ margin: '0 20px' }}>
              {this.echarts && <LineChart echarts={this.echarts} />}
            </FourCornerBorder>
            <div style={{ minWidth: 400 }}>
              <FourCornerBorder style={{ height: 320, marginBottom: 20 }}>
                <ReadyBill />
              </FourCornerBorder>
              <FourCornerBorder style={{ height: 224 }}>
                <Warning />
              </FourCornerBorder>
            </div>
          </Flex>

          <Flex style={{ height: 350 }}>
            <div style={{ minWidth: 400 }}>
              <FourCornerBorder>
                {this.echarts && store.analyseSkuData.category_1.length ? (
                  <AnalyseSkus echarts={this.echarts} />
                ) : (
                  <NoData />
                )}
              </FourCornerBorder>
            </div>
            <Flex style={{ margin: '0 20px', flex: 1 }}>
              <FourCornerBorder
                style={{ minWidth: 400, maxWidth: 400, marginRight: 20 }}
              >
                {this.echarts &&
                store.analyseMerchantData.order_price.length ? (
                  <AnalyseMerchant echarts={this.echarts} />
                ) : (
                  <NoData />
                )}
              </FourCornerBorder>
              <FourCornerBorder style={{ flex: 1 }}>
                {this.echarts && <FullScreenMap echarts={this.echarts} />}
              </FourCornerBorder>
            </Flex>
            <div style={{ minWidth: 400 }}>
              <FourCornerBorder>
                <Notify />
              </FourCornerBorder>
            </div>
          </Flex>
        </div>
      </div>
    )
  }
}

export default FullScreen
