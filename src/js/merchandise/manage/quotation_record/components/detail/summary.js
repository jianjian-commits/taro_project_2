import React from 'react'
import { t } from 'gm-i18n'
import { Flex, Box, Price } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import { detailStore as store } from '../../store'

const DetailSummary = observer(() => {
  const currency = Price.getCurrency()
  const { maxPrice, minPrice, averagePrice, detail } = store
  const { fee_type, std_unit_name_forsale } = detail

  const unit =
    fee_type && std_unit_name_forsale
      ? `(${Price.getUnit(fee_type)}/${std_unit_name_forsale})`
      : ''

  return (
    <Box className='gm-padding-tb-10'>
      <Flex row justifyAround>
        <div className='text-center'>
          <p>
            {t('销售单价周期均值')}
            {unit}
          </p>
          <div className='b-summary-panel-text b-color-active gm-text-18'>
            <span>{currency}</span>
            <span>{averagePrice}</span>
          </div>
        </div>
        <div className='text-center'>
          <p>
            {i18next.t('最高销售单价')}
            {unit}
          </p>
          <div className='b-summary-panel-text b-color-danger gm-text-18'>
            <span>{currency}</span>
            <span>{maxPrice}</span>
          </div>
        </div>
        <div className='text-center'>
          <p>
            {i18next.t('最低销售单价')}
            {unit}
          </p>
          <div className='b-summary-panel-text b-color-active gm-text-18'>
            <span>{currency}</span>
            <span>{minPrice}</span>
          </div>
        </div>
      </Flex>
    </Box>
  )
})

DetailSummary.propTypes = {
  store: PropTypes.object.isRequired,
}

export default DetailSummary
