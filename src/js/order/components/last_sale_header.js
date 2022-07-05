import { i18next } from 'gm-i18n'
import React from 'react'
import { ToolTip } from '@gmfe/react'

const LastSaleHeader = () => {
  return (
    <div>
      <span className='gm-margin-right-5'>
        {i18next.t('最近销售单价 (基本单位)')}
      </span>
      <ToolTip
        popup={
          <div className='gm-padding-5' style={{ width: '150px' }}>
            {i18next.t(
              '表明此客户当前商品最近一个月内的最近销售单价，如果当前已经是最新下单，则取此客户前一次下单此商品的销售单价'
            )}
          </div>
        }
      />
    </div>
  )
}

export default LastSaleHeader
