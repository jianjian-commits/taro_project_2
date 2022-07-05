import { i18next } from 'gm-i18n'
import React, { useState } from 'react'
import { Radio, RadioGroup, Button } from '@gmfe/react'
import PropTypes from 'prop-types'
import { gioTrackEvent } from '../../common/service'

const SyncPriceModal = (props) => {
  const [radio, setRadio] = useState(2)
  const handleCancel = () => {
    props.onCancel()
  }

  const handleOk = () => {
    gioTrackEvent('order_synchronous_last_price')
    props.onOk(radio)
  }

  return (
    <div className='gm-padding-5 gm-margin-left-15'>
      <div style={{ fontSize: '14px' }}>
        <span>{i18next.t('同步单价类型：')}</span>
        <RadioGroup
          name='price'
          className='gm-inline-block'
          inline
          value={radio}
          onChange={(v) => setRadio(v)}
        >
          <Radio value={2}>{i18next.t('销售单价（基本单位）')}</Radio>
          <Radio value={1}>{i18next.t('销售单价（销售单位）')}</Radio>
        </RadioGroup>
      </div>
      <div style={{ fontSize: '14px' }}>
        {i18next.t(
          '同步后，所选商品价格会根据所选单价类型进行价格同步，确认要同步吗？'
        )}
      </div>
      <div
        className='gm-margin-top-20 gm-text-desc'
        style={{ fontSize: '12px' }}
      >
        <p>{i18next.t('说明')}：</p>
        <p>
          {i18next.t(
            '1. 商品将同步所在报价单的价格，锁价商品将根据锁价规则同步价格'
          )}
        </p>
        <p>{i18next.t('2. 若订单为锁定状态，则不更新单价')}</p>
        <p>
          {i18next.t('3. 修改价格后，使用优惠券的订单存在退还优惠券的风险')}
        </p>
        <p>{i18next.t('4. 时价商品同步规则，根据系统设置确定')}</p>
      </div>
      <div className='text-right'>
        <Button className='gm-margin-right-10' onClick={handleCancel}>
          {i18next.t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' onClick={handleOk}>
          {i18next.t('确定')}
        </Button>
      </div>
    </div>
  )
}

SyncPriceModal.displayName = 'SyncPriceModal'
SyncPriceModal.propTypes = {
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}

export default SyncPriceModal
