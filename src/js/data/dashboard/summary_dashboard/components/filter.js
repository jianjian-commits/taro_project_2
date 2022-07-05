import React from 'react'
import { Button, Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'

const buttons = [
  {
    text: 7,
    value: 7,
  },
  {
    text: 15,
    value: 15,
  },
  {
    text: 30,
    value: 30,
  },
]

const Filter = () => {
  return (
    <Flex className='gm-padding-tb-10 gm-padding-lr-20'>
      {buttons.map((button) => (
        <Button key={button.value}>
          {t('date_range', {
            day: button.text,
          })}
        </Button>
      ))}
      <Button>{t('自定义日期')}</Button>
    </Flex>
  )
}

Filter.propTypes = {
  xxxx: PropTypes.bool,
}
export default Filter
