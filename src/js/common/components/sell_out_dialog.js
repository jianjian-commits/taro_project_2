import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import { Flex } from '@gmfe/react'

class SellOutDialog extends Component {
  render() {
    return (
      <div className='gm-padding-5'>
        <Flex justifyCenter alignCenter style={{ height: '60px' }}>
          <p className='text-center'>
            {i18next.t('是否将所选商品标记为缺货状态？')}
          </p>
        </Flex>
        <div className='gm-text-red'>
          <p>{i18next.t('说明')}：</p>
          <p>
            {i18next.t(
              '修改缺货状态后，使用了优惠券的订单存在退还优惠券的风险'
            )}
          </p>
          <p>
            {i18next.t(
              '您可以在【系统-操作日志-订单日志】中查看已退还优惠券的订单'
            )}
          </p>
        </div>
      </div>
    )
  }
}

export default SellOutDialog
