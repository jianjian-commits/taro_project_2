import { t } from 'gm-i18n'
import React from 'react'
import { Flex } from '@gmfe/react'
import EmptySvg from '../../../../../svg/empty.svg'

const SpuEmpty = () => {
  return (
    <Flex alignCenter column style={{ paddingTop: '160px' }}>
      <EmptySvg style={{ height: '160px', width: '160px' }} />
      <p className='gm-text-desc'>
        {t('您好，暂未建立商品，请先返回基础信息新建商品')}
      </p>
    </Flex>
  )
}

export default SpuEmpty
