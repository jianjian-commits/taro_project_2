import React from 'react'
import { i18next } from 'gm-i18n'
import { FullTab } from '@gmfe/frame'

import ViewSku from './view_sku'
import ViewSpu from './view_spu'

const RecycleBin = (props) => {
  return (
    <FullTab
      tabs={[i18next.t('商品'), i18next.t('销售规格')]}
      className='b-order'
    >
      <ViewSpu {...props} />
      <ViewSku {...props} />
    </FullTab>
  )
}

export default RecycleBin
