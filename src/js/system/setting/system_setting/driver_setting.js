import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import {
  Form,
  FormItem,
  FormPanel,
  FormGroup,
  Switch,
  Tip,
  RadioGroup,
  Radio,
  InputNumberV2,
  Flex,
} from '@gmfe/react'
import { i18next, t } from 'gm-i18n'
import { toJS } from 'mobx'
import Map from 'gm-map'
import { GLocationMap } from '@gm-common/google-map'
import { isForeignCustomer } from 'common/util'

import globalStore from '../../../stores/global'
import TransferV2 from 'common/components/sku_transfer_v2'
import store from './store'
import { history } from 'common/service'

const LIMIT_WAY = [
  {
    text: '按地理标签限制',
    value: 1,
  },
  {
    text: '按地理位置距离限制',
    value: 2,
  },
]

const DriverSetting = observer(() => {
  const {
    en_driver_performance,
    en_driver_pic_received,
    distribution_limit,
    distribution_areas,
    station_addr,
    lat,
    lng,
    delivery_distance,
  } = store.driverData
  const { address } = store
  const selected = _.map(distribution_areas, (item) => item.area_3_code)

  useEffect(() => {
    store.initData('driver', {
      en_driver_performance: globalStore.driverInfo.en_driver_performance,
      en_driver_pic_received: globalStore.driverInfo.en_driver_pic_received,
      distribution_limit: globalStore.driverInfo.distribution_limit,
      distribution_areas: globalStore.driverInfo.distribution_areas,
      delivery_distance: globalStore.driverInfo.delivery_distance,
      station_addr: globalStore.driverInfo.station_addr,
      lat: globalStore.driverInfo.lat,
      lng: globalStore.driverInfo.lng,
    })
    store.fetchAddress()
  }, [
    globalStore.driverInfo.en_driver_performance,
    globalStore.driverInfo.en_driver_pic_received,
    globalStore.driverInfo.distribution_limit,
    globalStore.driverInfo.distribution_areas,
    globalStore.driverInfo.delivery_distance,
    globalStore.driverInfo.station_addr,
    globalStore.driverInfo.lng,
    globalStore.driverInfo.lat,
  ])

  const handleChangeSwitch = (name) => {
    store.changeDataItem('driver', name, !store.driverData[name])
  }

  const handleSave = () => {
    store.postSetting('driver').then(() => {
      Tip.success(i18next.t('保存成功'))
      window.location.reload()
    })
  }

  const handleAddressSelected = (selected) => {
    const data = _.map(selected, (item) => ({
      area_1_code: item.level_2,
      area_2_code: item.level_1,
      area_3_code: item.level_0,
    }))
    store.changeDataItem('driver', 'distribution_areas', data)
  }

  const setPosition = (value) => {
    if (value) {
      store.changeDataItem('driver', 'lat', value.latitude || value.lat)
      store.changeDataItem('driver', 'lng', value.longitude || value.lng)
      store.changeDataItem('driver', 'station_addr', value.address)
    }
  }

  const handleChangeData = (name, value) => {
    store.changeDataItem('driver', name, value)
  }

  const handleChangeLimit = (name) => {
    const value = store.driverData[name] ? 0 : 1
    store.changeDataItem('driver', name, value)
  }
  const center = lng && lat ? { center: { longitude: lng, latitude: lat } } : {}
  return (
    <FormGroup onSubmit={handleSave}>
      <FormPanel title={i18next.t('配送设置')}>
        <Form
          onSubmit={handleSave}
          labelWidth='148px'
          hasButtonInGroup
          disabledCol
        >
          <FormItem label={i18next.t('司机到达考核')}>
            <Switch
              type='primary'
              checked={!!en_driver_performance}
              on={i18next.t('开启')}
              off={i18next.t('关闭')}
              onChange={() => handleChangeSwitch('en_driver_performance')}
            />
            <div className='gm-text-desc gm-margin-top-5'>
              {i18next.t(
                '开启后司机在配送商品时，只有在目标商户附近200米内才可以点击签收，开启此功能需要完善商户的配送地址信息，否则失效',
              )}
            </div>
          </FormItem>
          <FormItem label={i18next.t('司机拍照签收')}>
            <Switch
              type='primary'
              checked={!!en_driver_pic_received}
              on={i18next.t('开启')}
              off={i18next.t('关闭')}
              onChange={() => handleChangeSwitch('en_driver_pic_received')}
            />
            <div className='gm-text-desc gm-margin-top-5'>
              {i18next.t('开启后，司机修改订单为已签收时，都必须进行拍照上传')}
            </div>
          </FormItem>
          <FormItem label={i18next.t('配送范围限制')}>
            <Switch
              type='primary'
              checked={!!distribution_limit}
              on={i18next.t('开启')}
              off={i18next.t('关闭')}
              onChange={() => handleChangeLimit('distribution_limit')}
            />
            <div className='gm-text-desc gm-margin-top-5'>
              {i18next.t(
                '开启后，可设置配送地址范围，设置完成后，系统会限制商城端收货地址在配送范围之外的订单下单',
              )}
            </div>
          </FormItem>

          {!!distribution_limit && (
            <>
              <FormItem label={t('限制方式')}>
                <RadioGroup
                  name='distribution_limit'
                  value={distribution_limit}
                  onChange={(value) =>
                    handleChangeData('distribution_limit', value)
                  }
                  className='gm-flex gm-padding-bottom-15 gm-padding-left-10'
                >
                  {LIMIT_WAY.map((item) => (
                    <Radio
                      value={item.value}
                      key={item.value}
                      className='gm-margin-right-20'
                    >
                      {item.text}
                    </Radio>
                  ))}
                </RadioGroup>
              </FormItem>
              {distribution_limit === 1 && (
                <FormItem label={t('地理标签')}>
                  <div className='gm-margin-top-5'>
                    <span className='gm-margin-top-5'>
                      {i18next.t('请选择添加可配送的地理标签')}:
                    </span>
                    <TransferV2
                      className='gm-margin-top-5'
                      data={toJS(address)}
                      selected={selected}
                      onChange={handleAddressSelected}
                      options={{
                        leftTitle: i18next.t('选择地理标签'),
                        rightTitle:
                          i18next.t('已选地理标签') +
                          '：' +
                          distribution_areas.length,
                      }}
                      tree
                    />
                  </div>
                </FormItem>
              )}
              {distribution_limit === 2 && (
                <FormItem label={t('可配送距离')}>
                  <Flex alignCenter>
                    <InputNumberV2
                      className='form-control'
                      value={delivery_distance}
                      min={0}
                      max={999999999}
                      precision={0}
                      onChange={(value) =>
                        handleChangeData('delivery_distance', value)
                      }
                      style={{ width: '100px', height: '30px' }}
                      placeholder={t('请输入整数')}
                    />
                    <span>&nbsp;米</span>
                  </Flex>
                  <div className='gm-text-desc gm-margin-top-5'>
                    {t(
                      '限制商城端用户选择的收货地址，在以「可配送距离」为半径的范围内可下单，在范围外则无法下单（配送起点位置为站点位置为准，如未设置，请先在下方「站点位置」处设置正确的站点位置）',
                    )}
                  </div>
                </FormItem>
              )}
            </>
          )}
          <FormItem label={t('站点位置')}>
            <div style={{ width: '80vw', height: '50vh' }}>
              {isForeignCustomer() ? (
                <GLocationMap
                  defaultLocation={{
                    lat:
                      center && center.center
                        ? parseFloat(center.center.latitude)
                        : undefined,
                    lng:
                      center && center.center
                        ? parseFloat(center.center.longitude)
                        : undefined,
                    address: station_addr,
                  }}
                  onLocation={setPosition}
                  placeholder={i18next.t('请输入地理位置')}
                />
              ) : (
                <Map
                  amapkey='e805d5ba2ef44393f20bc9176c3821a2'
                  inputFocusColor='#56a3f2'
                  placeholder={t('请输入地理位置')}
                  warning
                  onGetLocation={setPosition}
                  mapAddress={station_addr}
                  {...center}
                />
              )}
            </div>
          </FormItem>
          <FormItem label=''>
            <div className='gm-text-desc gm-margin-left-15'>
              <div>*设置站点位置后，可用于：</div>
              <div className='gm-margin-tb-5'>
                1、【计算运费】以站点位置为配送起点计算直线距离，按设置的距离阶段收取对应运费
                <a
                  className='gm-margin-left-10'
                  onClick={() => history.push('/system/setting/freight')}
                >
                  {i18next.t('去设置')}
                </a>
              </div>
              <div>
                2、【配送范围限制】限制站点位置周围为可配送范围，超出范围无法下单
                <a
                  className='gm-margin-left-10'
                  onClick={() => {
                    document.body.scrollTop = document.documentElement.scrollTop = 0
                  }}
                >
                  {i18next.t('去设置')}
                </a>
              </div>
            </div>
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
})

export default DriverSetting
