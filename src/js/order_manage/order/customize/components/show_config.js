import React from 'react'
import { t } from 'gm-i18n'
import Permission from './permission'
import { observer } from 'mobx-react'
import store from '../store'
import _ from 'lodash'

export const writeConfig = [
  {
    name: t('订单'),
    content: [
      {
        text: t('业务平台-订单'),
        disabled: true,
        value: 'read_station_order',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609407590569-5999730288093283.png'
            />
          </div>
        ),
      },
      {
        text: t('商城端-订单'),
        disabled: true,
        value: 'read_bshop_order',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609407589589-6443254533894662.png'
            />
          </div>
        ),
      },
    ],
  },
  {
    name: t('拣货'),
    content: [
      {
        text: t('业务平台-拣货'),
        value: 'read_station_picking',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609407590839-8071374235954385.png'
            />
          </div>
        ),
      },
    ],
  },
  {
    name: t('分拣'),
    content: [
      {
        text: t('业务平台-分拣'),
        value: 'read_station_sorting',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609407590693-43331871970735203.png'
            />
          </div>
        ),
      },
    ],
  },
  {
    name: t('配送'),
    content: [
      {
        text: t('业务平台-配送'),
        value: 'read_station_delivery',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609407591013-3284455269534643.png'
            />
          </div>
        ),
      },
      {
        text: t('司机小程序/司机app'),
        value: 'read_app_driver',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609407589692-62073071561158.png'
            />
          </div>
        ),
      },
    ],
  },
  {
    name: t('财务结算'),
    content: [
      {
        text: t('信息平台-商户结算'),
        value: 'read_ma_settle',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609832720537-2209940737679339.png'
            />
          </div>
        ),
      },
      {
        text: t('信息平台-对账单'),
        value: 'read_ma_statement',
        tip: (
          <div>
            <img
              width='500px'
              src='https://file.guanmai.cn/station_pic/d7e3eef1c31c3e8e.png'
            />
          </div>
        ),
      },
    ],
  },
  {
    name: t('售后'),
    content: [
      {
        text: t('信息平台-售后'),
        value: 'read_ma_after_sale',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609407590244-9056443104413139.png'
            />
          </div>
        ),
      },
    ],
  },
  {
    name: t('运营报表'),
    content: [
      {
        text: t('信息平台-利润分析'),
        value: 'read_ma_order_report',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609407589790-04401019618742641.png'
            />
          </div>
        ),
      },
      {
        text: t('信息平台-售后分析'),
        value: 'read_ma_abnormal_report',
        tip: (
          <div>
            <img
              width='500px'
              src='https://image.document.guanmai.cn/product_img/1609407590406-9896402760820153.png'
            />
          </div>
        ),
      },
    ],
  },
]

const ShowConfig = () => {
  function handleChange(keys = []) {
    const map = {
      read_station_order: 1,
      read_bshop_order: 1,
      read_station_purchase: 0,
      read_app_purchase: 0,
      read_station_picking: 0,
      read_station_sorting: 0,
      read_station_delivery: 0,
      read_app_driver: 0,
      read_ma_statement: 0,
      read_ma_settle: 0,
      read_ma_after_sale: 0,
      read_ma_order_report: 0,
      read_ma_abnormal_report: 0,
    }
    keys.forEach((v) => {
      map[v] = 1
    })
    _.each(map, (v, k) => {
      store.permissionUpdate(k, v)
    })
  }

  const {
    read_station_order,
    read_bshop_order,
    read_station_purchase,
    read_app_purchase,
    read_station_picking,
    read_station_sorting,
    read_station_delivery,
    read_app_driver,
    read_ma_statement,
    read_ma_settle,
    read_ma_after_sale,
    read_ma_order_report,
    read_ma_abnormal_report,
  } = store.detail.permission
  return (
    <Permission
      data={{
        read_station_order,
        read_bshop_order,
        read_station_purchase,
        read_app_purchase,
        read_station_picking,
        read_station_sorting,
        read_station_delivery,
        read_app_driver,
        read_ma_statement,
        read_ma_settle,
        read_ma_after_sale,
        read_ma_order_report,
        read_ma_abnormal_report,
      }}
      config={writeConfig}
      onChange={handleChange}
    />
  )
}

export default observer(ShowConfig)
