import React, { useState } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { Flex, DropDown, DropDownItems, DropDownItem } from '@gmfe/react'
import _ from 'lodash'
import { SvgDownSmall } from 'gm-svg'
import moment from 'moment'

const DATEMAP = {
  1: t('今天'),
  7: t('近7天'),
  15: t('近15天'),
  30: t('近30天'),
}

const DateButton = ({ range, onChange }) => {
  const [date] = useState(() =>
    _.map(range, (r) => ({ value: r, text: DATEMAP[r] }))
  )
  const handleClick = (item) => {
    setCur(item)
    onChange && onChange(item)
  }
  const [cur, setCur] = useState({ value: 7, text: t('近7天') })

  const getDate = (value) => {
    const begin = moment()
      .subtract(value - 1, 'day')
      .format('YYYY-MM-DD')
    const end = moment().format('YYYY-MM-DD')
    return `(${begin}~${end})`
  }

  return (
    <Flex>
      <DropDown
        popup={
          <DropDownItems>
            {_.map(date, (v, i) => (
              <DropDownItem key={i} onClick={() => handleClick(v)}>
                <div>
                  <span>{v.text}</span>&nbsp;
                  <span className='gm-text-desc'>{getDate(v.value)}</span>
                </div>
              </DropDownItem>
            ))}
          </DropDownItems>
        }
        className='b-purchase-overview-dropDown gm-cursor'
        style={{ borderRadius: '2px', height: '30px' }}
      >
        <Flex row alignCenter>
          <Flex row className='gm-margin-right-5'>
            <div>{cur.text}</div>
          </Flex>
          <SvgDownSmall className='gm-text-desc' />
        </Flex>
      </DropDown>
    </Flex>
  )
}
DateButton.propTypes = {
  range: PropTypes.array.isRequired, // [1,7,15,30]
  onChange: PropTypes.func,
}
export default DateButton
