import { i18next } from 'gm-i18n'
import SVGSupplyChain from '../../svg/supply_chain.svg'
import React from 'react'

const navConfig = [
  {
    link: '/supply_chain',
    name: i18next.t('nav__供应链'),
    icon: <SVGSupplyChain />,
    sub: [
      {
        name: i18next.t('nav__采购'),
        sub: [
          {
            link: '/supply_chain/purchase/task',
            name: i18next.t('nav__采购任务'),
          },
          {
            link: '/supply_chain/purchase/require_goods',
            name: i18next.t('nav__要货单据'),
          },
          {
            link: '/sales_invoicing/base/cycle_quote_rules',
            name: i18next.t('nav__周期报价规则'),
          },
        ],
        link: '/supply_chain/purchase',
      },
    ],
  },
]

export default navConfig
