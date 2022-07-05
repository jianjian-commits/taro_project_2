/* eslint-disable react-hooks/exhaustive-deps */
import { t } from 'gm-i18n'
import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Line } from '@gm-pc/vision'
import { observer } from 'mobx-react'
import _ from 'lodash'
import store from './store'
import Panel from 'common/components/dashboard/panel'
import Slider from './components/slider'
import { toJS } from 'mobx'
import { formatTimeList } from 'common/dashboard/constants'

const commonOptions = {
  width: '100%',
  height: 330,
  color: 'name',
  position: 'xAxis*yAxis',
}
const ENUM_HOMEBRIFE = {
  saleData: t('销售额(元)'),
  saleProfit: t('销售毛利(元)'),
  orderData: t('订单数(笔)'),
  customerPrice: t('客单价(元)'),
  addShopCount: t('新增商户数(元)'),
  remainingSumRecharge: t('余额充值(元)'),
  addShopRechargeShop: t('新增充值商户数(个)'),
  afterSaleOrder: t('售后订单数(笔)'),
  afterSaleGoods: t('售后商品数(个)'),
  afterSaleMoney: t('售后金额(元)'),
  orderMargin: t('应收账款(元)'),
}
const HomeBrief = ({ className }) => {
  const {
    filter: { begin_time, end_time },
  } = store

  const [field, setField] = useState('')

  const activeData = useMemo(() => {
    const data =
      (field
        ? _.find(store.briefData, (d) => d.field === field)?.data
        : store.briefData[0]?.data) || []

    return formatTimeList(begin_time, end_time, toJS(data)).map((item) => ({
      ...item,
      name: !field ? t('销售额(元)') : ENUM_HOMEBRIFE[field],
    }))
  }, [field, store.briefData])

  const activeOptions = useMemo(() => {
    return field
      ? _.find(HomeBrief.config, (_, k) => k === field)
      : HomeBrief.config.saleData
  }, [field])

  const sliderData = useMemo(() => {
    return store.briefData.map((item) => {
      return {
        ...item,
        text:
          item.text === '订单数' ||
          item.text === '新增商户数' ||
          item.text === '新增充值商户数'
            ? item.text + ' (个)'
            : item.text === '订单数' || item.text === '售后订单数'
            ? item.text + ' (笔)'
            : item.text + ' (元)',
        isNumber: HomeBrief.config[item.field]?.isNumber,
      }
    })
  }, [store.briefData])

  const handleChange = (item) => {
    setField(item.field)
  }
  return (
    <Panel title={t('今日简报')} className={className}>
      <Slider data={toJS(sliderData)} onChange={handleChange} />
      <Line
        data={toJS(activeData)}
        options={{ ...activeOptions.chartOption, ...commonOptions }}
      />
    </Panel>
  )
}

HomeBrief.propTypes = {
  className: PropTypes.string,
}

HomeBrief.config = {
  saleData: {
    text: t('销售额(元)'),
    chartOption: {},
  },
  saleProfit: {
    text: t('销售毛利(元)'),
    chartOption: {},
  },
  orderData: {
    text: t('订单数(笔)'),
    chartOption: {},
    isNumber: true,
  },
  customerPrice: {
    text: t('客单价(元)'),
    chartOption: {},
  },
  addShopCount: {
    text: t('新增商户数(元)'),
    chartOption: {},
    isNumber: true,
  },
  remainingSumRecharge: {
    text: t('余额充值(元)'),
    chartOption: {},
  },
  addShopRechargeShop: {
    text: t('新增充值商户数(个)'),
    chartOption: {},
    isNumber: true,
  },
  afterSaleOrder: {
    text: t('售后订单数'),
    chartOption: {},
    isNumber: true,
  },
  afterSaleGoods: {
    text: t('售后商品数'),
    chartOption: {},
    isNumber: true,
  },
  afterSaleMoney: {
    text: t('售后金额'),
    chartOption: {},
  },
  // afterSaleAbnormalMoney: {
  //   text: t('售后异常金额(元)'),
  //   chartOption: {},
  // },
  // 短信发送条数没有
  // messageSendCount: {
  //   text: t('短信发送数(条)'),
  //   chartOption: {},
  // },
  orderMargin: {
    text: t('应收账款'),
    chartOption: {},
  },
  // 未付账款暂时没有数据
  // unpaidPurchases: {
  //   text: t('未付货款(元)'),
  //   chartOption: {},
  // },
}

export default observer(HomeBrief)
