import { i18next } from 'gm-i18n'
import React from 'react'

const tipWarning = (
  <div className='gm-border gm-padding-15 gm-bg' style={{ width: '200px' }}>
    <div className='gm-margin-bottom-5'>
      {i18next.t('不限库存：用户下单不受进销存系统的库存限制；')}
    </div>
    <div className='gm-margin-bottom-5'>
      {i18next.t('限制库存：用户下单的商品数不可超过进销存系统的库存；')}
    </div>
    <div className='gm-margin-bottom-5'>
      {i18next.t(
        '设置固定库存：设置固定的销售库存，用户下单不可超过设置的库存；'
      )}
    </div>
  </div>
)

export { tipWarning }
