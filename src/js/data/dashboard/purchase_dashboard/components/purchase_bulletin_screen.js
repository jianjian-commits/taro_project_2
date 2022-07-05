import React from 'react'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'

import { Bulletin } from 'common/components/fullscreen'

const core = [1, 2, 3]

const infos = {
  1: {
    text: t('销售额(元)'),
    value: 121323.23,
    preValue: 12322,
  },
  2: {
    text: t('订单数'),
    value: 2123,
    preValue: 112322,
  },
  3: {
    text: t('下单客户数'),
    value: 323,
    preValue: 232112,
  },
  4: {
    text: t('销售毛利(元)'),
    value: 41232,
    preValue: 13212,
  },
  5: {
    text: t('销售毛利率'),
    value: 4123,
    preValue: 12312,
  },
  6: {
    text: t('客单价(元)'),
    value: 123324,
    preValue: 112322,
  },
}

const SaleScreenBulletin = ({ className }) => {
  return (
    <Flex className={className} justifyBetween>
      {core.map((key, index) => {
        const data = infos[key]
        return <Bulletin key={index} data={data} />
      })}
    </Flex>
  )
}

SaleScreenBulletin.propTypes = {
  className: PropTypes.string,
}
export default SaleScreenBulletin
