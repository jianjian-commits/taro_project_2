import { i18next } from 'gm-i18n'
import React from 'react'
import { ToolTip, Flex } from '@gmfe/react'

const LoanNumHeader = () => {
  return (
    <Flex>
      <span className='gm-margin-right-5'>{i18next.t('预借出数')}</span>
      <ToolTip
        popup={
          <div className='gm-padding-5' style={{ width: '150px' }}>
            {i18next.t(
              '系统根据预设的周转物换算比例，以下单数换算出的周转物预借出数。该指标在分拣和司机借出时有参考意义。注：该字段在下单时确定下来，后续修改订单不会变动',
            )}
          </div>
        }
      />
    </Flex>
  )
}

export default LoanNumHeader
