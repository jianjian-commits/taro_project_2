import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { Flex, Price, ToolTip } from '@gmfe/react'
import React from 'react'
import Big from 'big.js'

const INVOICE_TYPE = {
  1: { type: i18next.t('期初未支付'), url: null },
  2: {
    type: i18next.t('采购入库单'),
    url: '#/sales_invoicing/stock_in/product/detail',
  },
  3: {
    type: i18next.t('采购退货单'),
    url: '#/sales_invoicing/stock_out/refund/detail',
  },
  4: {
    type: i18next.t('结款单'),
    url: '#/sales_invoicing/finance/payment_review',
  },
}

function sortDirectionChangeToBool(sortName) {
  return sortName === 'asc' ? -1 : 1
}

function renderTotalDataView(totalSumDataList) {
  const totalTextDataList = [
    {
      title: i18next.t('期初未支付'),
      explainText: i18next.t('查询范围之前未支付给供应商的金额之和'),
      totalNumber: parseFloat(
        Big(totalSumDataList.early_unpay_sum || 0).toFixed(4),
      ),
    },
    {
      title: i18next.t('本期应付'),
      explainText: i18next.t('查询范围内应付给供应商的金额之和'),
      totalNumber: parseFloat(
        Big(totalSumDataList.cur_should_pay_sum || 0).toFixed(4),
      ),
    },
    {
      title: i18next.t('本期已付'),
      explainText: i18next.t('查询范围内已付给供应商的金额之和'),
      totalNumber: parseFloat(
        Big(totalSumDataList.cur_pay_sum || 0).toFixed(4),
      ),
    },
    {
      title: i18next.t('本期折让'),
      explainText: i18next.t('查询范围内供应商结款的折让金额之和'),
      totalNumber: parseFloat(
        Big(totalSumDataList.cur_delta_money_sum || 0).toFixed(4),
      ),
    },
    {
      title: i18next.t('期末未支付'),
      explainText: i18next.t(
        '查询范围截止的未支付给供应商的金额之和，期末未支付=期初未支付+本期应付-本期已付-本期折让',
      ),
      totalNumber: parseFloat(
        Big(totalSumDataList.total_unpay_sum || 0).toFixed(4),
      ),
    },
  ]

  return viewSumData(totalTextDataList)
}

function viewSumData(data) {
  return _.map(data, (item) => {
    return {
      label: (
        <Flex alignCenter>
          <span className='gm-margin-left-5 gm-margin-right-5'>
            {item.title}
          </span>
          <ToolTip
            popup={
              <div className='gm-padding-10' style={{ width: '150px' }}>
                {item.explainText}
              </div>
            }
          />
        </Flex>
      ),
      content: (
        <Price
          value={_.toNumber(item.totalNumber)}
          precision={4}
          keepZero={false}
        />
      ),
    }
  })
}

export {
  sortDirectionChangeToBool,
  INVOICE_TYPE,
  viewSumData,
  renderTotalDataView,
}
