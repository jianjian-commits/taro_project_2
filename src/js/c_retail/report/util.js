import { t } from 'gm-i18n'
import React from 'react'
import moment from 'moment'
import { Request } from '@gm-common/request'
import { RightSideModal } from '@gmfe/react'
import styled from 'styled-components'
import { SvgPriceCircle, SvgPercentage } from 'gm-svg'

import TaskList from '../../task/task_list'

export const bulletinConfig = (key, tAcount, yAcount) => {
  switch (key) {
    case 'place_order_money':
      return {
        tName: t('订单金额'),
        yName: t('昨天'),
        color: '#007EFF',
        tAcount: tAcount,
        yAcount: yAcount,
        tLink: {
          pathname: '/c_retail/order/list',
          state: {
            begin: moment().startOf('day'),
            end: moment().endOf('day')
          }
        },
        yLink: {
          pathname: '/c_retail/order/list',
          state: {
            begin: moment()
              .subtract(1, 'day')
              .startOf('day'),
            end: moment()
              .subtract(1, 'day')
              .endOf('day')
          }
        }
      }

    case 'refund_price':
      return {
        tName: t('退款金额'),
        yName: t('昨天'),
        color: '#F95A59',
        tAcount: tAcount,
        yAcount: yAcount,
        tLink: null,
        yLink: null
      }
    case 'all_money':
      return {
        tName: t('金额合计'),
        yName: t('昨天'),
        color: '#FFB822',
        tAcount: tAcount,
        yAcount: yAcount,
        tLink: null,
        yLink: null
      }

    default:
      return null
  }
}

const URL = {
  profit: '/data_center/profit/daily_new',
  sku: '/data_center/sku/static',
  order: '/data_center/order/static'
}

export const fetchData = (days, type) => {
  const url = URL[type]
  let data = { days, is_toC: 1 }
  if (type === 'profit') {
    data = { ...data, query_type: 1 }
  }
  return Request(url)
    .data(data)
    .get()
    .then(json => json.data)
}

const exportUrl = {
  sku: '/report/sku/export',
  order: '/report/order/export'
}

export const doExportReport = (data, type) => {
  const url = exportUrl[type]
  return Request(url)
    .data(data)
    .get()
    .then(json => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px'
        }
      })
    })
}

const PriceCircle = styled(SvgPriceCircle)`
  width: 18px;
  height: 18px;
  color: #ffb822;
`
const RatePriceCircle = styled(SvgPriceCircle)`
  width: 18px;
  height: 18px;
  color: #007eff;
`
const Percentage = styled(SvgPercentage)`
  width: 18px;
  height: 18px;
  color: #10ce6e;
`

export const summaryType = [
  {
    has_tax_text: t('销售额（含运费）'),
    no_tax_text: t('销售额（含税、运）'),
    compare_text: t('/ 销售额（不含运费）'),
    icon: <PriceCircle className='gm-margin-right-5' />,
    id: 'account_price',
    compre_id: 'account_price_exclude_freight'
  },
  {
    has_tax_text: t('销售毛利（含运费）'),
    no_tax_text: t('销售毛利（含税、运）'),
    compare_text: t('/ 销售毛利（不含运费）'),
    icon: <RatePriceCircle className='gm-margin-right-5' />,
    id: 'sale_profit',
    compre_id: 'sale_profit_exclude_freight'
  },
  {
    has_tax_text: t('销售毛利率（含运费）'),
    no_tax_text: t('销售毛利率（含税、运）'),
    compare_text: t('/ 销售毛利率（不含运费）'),
    icon: <Percentage className='gm-margin-right-5' />,
    id: 'sale_profit_rate',
    compre_id: 'sale_profit_rate_exclude_freight'
  }
]
