import { observable, action, runInAction, toJS } from 'mobx'
import { Request } from '@gm-common/request'
import { t } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import globalStore from 'stores/global'
import { getCustomerName } from './util'
import SVGSortingOrder from 'svg/sorting_order_full_screen.svg'
import SVGUnpayCount from 'svg/unpay_count_full_screen.svg'
import SVGWaitPayNum from 'svg/wait_pay_num_full_screen.svg'
import SVGWaitSortOrder from 'svg/wait_sort_order_full_screen.svg'
import Big from 'big.js'
import { Storage } from '@gmfe/react'
import { withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'

const operationData = {
  order_num: {
    key: 'order_num',
    todayTitle: t('今日订单数（笔）'),
    yesterdayTitle: t('昨日订单数'),
    decimal: 0,
  },
  place_order_money: {
    key: 'place_order_money',
    todayTitle: t('今日订单金额（元）'),
    yesterdayTitle: t('昨日订单金额'),
    decimal: 2,
  },
  customer_price: {
    key: 'customer_price',
    todayTitle: t('今日客单价（元）'),
    yesterdayTitle: t('昨日客单价'),
    decimal: 2,
  },
  new_customer_num: {
    key: 'new_customer_num',
    todayTitle: getCustomerName(true),
    yesterdayTitle: getCustomerName(false),
    decimal: 0,
  },
  order_customer_num: {
    key: 'order_customer_num',
    todayTitle: t('今日下单商户数（个）'),
    yesterdayTitle: t('昨日下单商户数'),
    decimal: 0,
  },
  abnormal_price: {
    key: 'abnormal_price',
    todayTitle: t('今日异常订单金额（元）'),
    yesterdayTitle: t('昨日异常订单金额'),
    decimal: 2,
  },
  abnormal_count: {
    key: 'abnormal_count',
    todayTitle: t('今日异常订单数（笔）'),
    yesterdayTitle: t('昨日异常订单数'),
    decimal: 0,
  },
}

@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.HOME_CITY_MAP_SELECT,
  selector: [{ city: ['id', 'name'] }],
})
class Store {
  @observable
  pieColor = [
    '#0088ff',
    '#03a9f4',
    '#4cb0df',
    '#02bcd4',
    '#009688',
    '#8bc34a',
    '#cddb3a',
    '#ffea3b',
    '#ffc108',
    '#ff9700',
  ]

  @observable
  operationData = []

  @observable
  lineChartData = []

  @observable
  readyBillData = []

  @observable
  warningData = []

  @observable
  analyseSkuData = {
    category_1: [],
    category_2: [],
  }

  @observable
  analyseMerchantData = {
    order_price: [],
    order_count: [],
  }

  @observable
  merchantPieTotal = 0

  @observable
  notifyData = []

  @observable
  city = {
    id: '',
    name: '',
  }

  @observable
  cityList = []

  @observable
  driverLocation = []

  @observable
  merchantLocation = []

  // 高德地图AMapUI  DistrictExplorer对象
  @observable
  districtExplorer = null

  @observable
  geocoder = null

  @action
  getOperationData = () => {
    Request('/home_page/data_analyse/lasted_orders_count_new')
      .get()
      .then((json) => {
        const prevData = toJS(this.operationData)
        const operationDataConfig = (
          Storage.get('operating_bulletin') || [
            'order_num',
            'place_order_money',
            'customer_price',
            'new_customer_num',
          ]
        ).map((key) => operationData[key])
        runInAction(() => {
          const { today, yesterday } = json.data
          this.operationData = operationDataConfig.map((item, i) => {
            return {
              key: item.key,
              todayTitle: item.todayTitle,
              prevData:
                item.key === prevData[i]?.key ? prevData[i]?.todayData || 0 : 0,
              todayData: Number(today[item.key]),
              yesterdayTitle: item.yesterdayTitle,
              yesterdayData: yesterday[item.key],
              decimal: item.decimal,
            }
          })
        })
      })
  }

  @action
  getLineChartData = () => {
    return Request('/data_center/profit/daily_new')
      .data({
        query_type: 1,
        days: 7,
      })
      .get()
      .then((json) => {
        runInAction(() => {
          this.lineChartData = json.data
        })
      })
  }

  @action
  getReadyBillData = () => {
    Request('/home_page/data_analyse/ready_bills_count')
      .get()
      .then((json) => {
        const data = json.data
        const { isCStation } = globalStore.otherInfo
        runInAction(() => {
          const readyBillData = [
            {
              key: 'wait_sort_order',
              svg: <SVGWaitSortOrder />,
              title: t('等待分拣订单'),
              value: data.wait_sort_order,
            },
            {
              key: 'sorting_order',
              svg: <SVGSortingOrder />,
              title: t('分拣中订单'),
              value: data.sorting_order,
            },
            {
              key: 'unpay_count',
              svg: <SVGUnpayCount />,
              title: t('未支付订单'),
              value: data.unpay_count,
            },
            {
              key: 'wait_pay_num',
              svg: <SVGWaitPayNum />,
              title: t('待支付结款单'),
              value: data.wait_pay_num,
            },
          ]

          if (isCStation) {
            this.readyBillData = _.filter(
              readyBillData,
              (v) => v.key !== 'unpay_count',
            )
          } else {
            this.readyBillData = readyBillData
          }
        })
      })
  }

  @action
  getWarningData = () => {
    Request('/home_page/warn_info/list')
      .get()
      .then((json) => {
        runInAction(() => {
          this.warningData = json.data
        })
      })
  }

  @action
  getNotifyData = () => {
    Request('/home_page/new_info/list')
      .data()
      .get()
      .then((json) => {
        runInAction(() => {
          this.notifyData = json.data
        })
      })
  }

  @action
  getAnalyseSkuData = () => {
    return Request(`/data_center/sku/static?days=7`)
      .get()
      .then((json) => {
        const data = json.data
        runInAction(() => {
          this.analyseSkuData = {
            category_1: data.category_1_statics_list,
            category_2: data.category_2_statics_list,
          }
        })
      })
  }

  @action
  getAnalyseMerchantData = () => {
    return Request(`/data_center/order/static?days=7`)
      .get()
      .then((json) => {
        const data = json.data
        runInAction(() => {
          this.analyseMerchantData = {
            order_price: data.order_price_top_list || [],
            order_count: data.order_count_top_list || [],
          }
          this.merchantPieTotal = this.analyseMerchantData.order_price.reduce(
            (total, current) => {
              return Big(total).add(Big(current.order_amount)).toFixed(2)
            },
            0,
          )
        })
      })
  }

  @action
  getMerchantCity = () => {
    Request('/station/area_dict')
      .get()
      .then((res) => {
        runInAction(() => {
          const city = res.data[0]
          if (!this.city.id) {
            this.city = {
              id: city.city_id,
              name: city.city,
            }
          }
          this.cityList = res.data
          this.getMerchantLocation(this.city.id)
        })
      })
  }

  @action
  setCity = (item) => {
    this.city = {
      id: item.city_id,
      name: item.city,
    }
    this.defaultCityId = item.city_id
    this.getMerchantLocation(item.city_id)
  }

  @action
  batchSearch = (data) => {
    Promise.all(
      data.map(({ lng, lat }) => {
        return new Promise((resolve) => {
          this.geocoder.getAddress([lng, lat], (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
              // result为对应的地理位置详细信息
              const city = result.regeocode.addressComponent.province
              // 可能是省份没有对上
              return this.city.name === city ? resolve([lng, lat]) : resolve('')
            } else {
              resolve('')
            }
          })
        })
      }),
    ).then((resultArr) => {
      runInAction(() => {
        this.driverLocation = resultArr.filter(Boolean)
      })
    })
  }

  @action
  getDriverLocation = () => {
    Request('/station/driver/real_time_location')
      .get()
      .then((res) => {
        const loop = () => {
          if (this.geocoder) {
            this.batchSearch(res.data)
          } else {
            setTimeout(loop(), 500)
          }
        }
        loop()
      })
  }

  // b 跟 纯c 站点商（客）户的拉取接口不同
  @action
  getMerchantLocation = (cityId) => {
    const { isCStation } = globalStore.otherInfo
    let url = '/station/order/customer/search'
    if (isCStation) {
      url = '/station/consumer_address/list'
    }

    Request(url)
      .data({ district_code: cityId })
      .get()
      .then((res) => {
        runInAction(() => {
          this.merchantLocation = res.data.list.map((v) => [
            v.lng || 0,
            v.lat || 0,
          ])
        })
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
}

export default new Store()
