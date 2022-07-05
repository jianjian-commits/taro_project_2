import React from 'react'
import { i18next } from 'gm-i18n'
import TextTip from 'common/components/text_tip'
import { SvgInfoCircle } from 'gm-svg'

const Info = () => (
  <TextTip content={i18next.t('运算价格为负或为零的商品下单时不展示')}>
    <span>
      <SvgInfoCircle />
    </span>
  </TextTip>
)

export default Info
