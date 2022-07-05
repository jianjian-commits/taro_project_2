import React from 'react'
import { Popover } from '@gmfe/react'
import { SvgXinxi } from 'gm-svg'
import { t } from 'gm-i18n'

const DeletedProduct = () => {
  return (
    <Popover
      showArrow
      component={<div />}
      type='hover'
      popup={
        <div
          className='gm-border gm-padding-5 gm-bg gm-text-12'
          style={{ width: '100px' }}
        >
          {t('该商品已被删除')}
        </div>
      }
    >
      <span>
        <SvgXinxi style={{ color: 'red', marginLeft: '5px' }} />
      </span>
    </Popover>
  )
}

export default DeletedProduct
