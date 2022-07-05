/**
 * @description 首页预警信息处理
 */
import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gmfe/react'
import { Request } from '@gm-common/request'
import SvgWarningHome from 'svg/warning_home.svg'

import Panel from 'common/components/report/panel'
import { WARNING_TYPE } from 'common/enum'
import TextTip from 'common/components/text_tip'

import globalStore from 'stores/global'

const Warning = () => {
  const [list, setList] = useState([])

  useEffect(() => {
    const fetchData = () => {
      return Request('/home_page/warn_info/list')
        .get()
        .then((json) => json.data)
    }
    fetchData().then((data) => {
      setList(data)
    })
  }, [])

  const handleClick = (v) => {
    const { type, key } = v
    let url = ''
    switch (type) {
      case 1:
      case 7:
        url = `#/sales_invoicing/inventory/product?activeTab=product&q=${key}`
        break
      case 2:
        url = '#/merchandise/manage/sale'
        break
      case 3:
        url = '#/system/setting/short_message/recharge'
        break
      case 4:
        url = `#/marketing/manage/price_rule?q=${key}`
        break
      case 5:
        url = globalStore.otherInfo.cleanFood
          ? `#/sales_invoicing/inventory/stock_overview/detail?id=${key}`
          : `#/sales_invoicing/inventory/product?activeTab=batch&q=${key}`
        break
      case 6:
        url = `#/sales_invoicing/inventory/product?activeTab=batch&q=${key}`
        break
      case 8:
        url = `#/order_manage/order/list/detail?id=${key}`
        break
      case 11:
        url = `#/merchandise/manage/sale/cycle_pricing?rule_id=${key}`
    }

    window.open(url)
  }

  return (
    <Panel title={t('预警信息')} height='220px'>
      {list.length && (
        <div className='gm-overflow-y'>
          {list.map((v, i) => (
            <TextTip key={i} content={v.content}>
              <Flex
                key={i}
                className='b-home-border-bottom gm-cursor gm-padding-top-15 gm-padding-bottom-5 gm-bg-hover-primary gm-text-12'
                onClick={() => handleClick(v)}
              >
                <SvgWarningHome style={{ fontSize: '18px' }} />
                <div style={{ whiteSpace: 'nowrap', lineHeight: '20px' }}>
                  【{WARNING_TYPE[v.type]}】
                </div>
                <Flex flex style={{ width: 0, lineHeight: '20px' }}>
                  <span className='gm-ellipsis'>{v.content}</span>
                </Flex>
              </Flex>
            </TextTip>
          ))}
        </div>
      )}
    </Panel>
  )
}

export default Warning
