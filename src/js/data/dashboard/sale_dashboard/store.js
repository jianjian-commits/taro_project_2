import { Request as _Request } from '@gm-common/request'
import { observable, action, runInAction } from 'mobx'
import moment from 'moment'
import { enhanceRequest } from 'common/dashboard/sale/enhance_request'
const Request = enhanceRequest(_Request)
const initFilter = {
  begin_time: moment().subtract(6, 'd'),
  end_time: moment(),
  areaCode: 0,
}
class Store {
  @observable
  filter = initFilter

  @action
  setFilter = (filter) => {
    this.filter = { ...this.filter, ...filter }
  }

  @action
  clearStore = () => {
    this.filter = initFilter
  }

  getParams() {
    const params = {
      time_range: [
        {
          begin_time: this.filter.begin_time,
          end_time: this.filter.end_time,
          time_field: 'order_time',
        },
      ],
      query_expr: {
        filter: [],
        group_by_fields: [],
        order_by_fields: [],
      },
    }

    return params
  }

  // -----  销售排名 ------
  @observable
  rankSale = []

  @action
  fetchRankSale() {
    return Request('station_statistics/order_detail/sku') // 订单数
      .common(this.getParams())
      .group_by_fields([3])
      .order_by_fields([1])
      .limit(10)
      .post() // 订单数
  }

  // ----- 运营地图 ------
  @observable
  saleMap = []

  @observable
  cityList = []

  @observable
  selectAreaCode = 0

  @observable
  location = {
    merchantData: [],
    driverData: [],
  }

  @observable
  geocoder = null

  @observable
  districtExplorer = null

  /**
   * 获取地图的geoJSON
   */
  @action
  fetchSaleMap = () => {
    _Request('/station/area_dict')
      .get()
      .then((res) => {
        this.cityList = res.data.map((item) => ({
          text: item.city,
          value: Number(item.city_id),
        }))
        if (!this.selectAreaCode) {
          this.selectAreaCode = Number(this.cityList[0].value)
          this.getMerchantLocation(this.selectAreaCode)
        }
      })
  }

  @action
  batchSearch = (data) => {
    Promise.all(
      data.map(({ lng, lat }) => {
        return new Promise((resolve) => {
          this.geocoder.getAddress([lng, lat], (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
              // result为对应的地理位置详细信息
              const city = result.regeocode.addressComponent.city
              return this.city.name === city ? resolve([lng, lat]) : resolve('')
            } else {
              resolve('')
            }
          })
        })
      }),
    ).then((resultArr) => {
      runInAction(() => {
        this.location.driverData = resultArr.filter(Boolean)
      })
    })
  }

  @action
  getDriverLocation = () => {
    _Request('/station/driver/real_time_location')
      .get()
      .then((res) => {
        const loop = () => {
          if (this.geocoder) {
            this.batchSearch(res.data)
          } else {
            setTimeout(loop, 500)
          }
        }
        loop()
      })
  }

  @action
  getDistrictExplorer = () => {
    // 利用 AMapUI.loadUI 可以构造一个创建一个 DistrictExplorer 实例，
    // 然后利用 DistrictExplorer 的实例，
    // 可以根据当前需要加载城市的 adcode 获取到该城市的 geo 数据
    if (window.AMapUI) {
      window.AMapUI.loadUI(['geo/DistrictExplorer'], (DistrictExplorer) => {
        runInAction(() => {
          this.districtExplorer = new DistrictExplorer()
        })
      })
    }
  }

  @action
  getGeocoder = () => {
    window.AMap.plugin('AMap.Geocoder', () => {
      this.geocoder = new window.AMap.Geocoder()
    })
  }

  /**
   *  获取商户地理位置
   * @param areaCode 行政编码
   */
  @action
  getMerchantLocation = (areaCode = this.filter.areaCode) => {
    _Request('/station/order/customer/search')
      .data({ district_code: areaCode })
      .get()
      .then((res) => {
        const merchantLocation = res.data.list.map((v) => [
          v.lng || 0,
          v.lat || 0,
        ])

        this.location = { ...this.location, merchantData: merchantLocation }
      })
  }
}

export default new Store()
