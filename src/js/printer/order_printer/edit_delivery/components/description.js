import React from 'react'
import { i18next } from 'gm-i18n'

export default () => (
  <div>
    <div className='gm-padding-5'>{i18next.t('说明')}:</div>

    <div className='gm-padding-5'>
      {i18next.t('1.编辑配送单')}
      <span className='gm-text-red'>{i18next.t('不影响原订单')}</span>
      {i18next.t('数据')}
    </div>
    <div className='gm-padding-5'>
      {i18next.t('2.仅提供重要字段编辑，相关金额数据由')}
      <span className='gm-text-red'>{i18next.t('系统自动重新计算')}</span>
    </div>
    <div className='gm-padding-5'>
      {i18next.t('3.优惠金额为原订单产生的金额，')}
      <span className='gm-text-red'>{i18next.t('不受编辑数据的影响')}</span>
    </div>
    <div className='gm-padding-5'>
      {i18next.t('4.异常/退货金额为原订单售后产生的金额,')}
      <span className='gm-text-red'>{i18next.t('不受编辑数据的影响。')}</span>
      {i18next.t('请谨慎操作售后商品,避免出现销售额异常')}
    </div>
  </div>
)
