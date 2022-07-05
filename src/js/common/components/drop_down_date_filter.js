import React from 'react'
import { i18next } from 'gm-i18n'
import { Flex, DropDown, DropDownItems, DropDownItem } from '@gmfe/react'
import { SvgDownSmall } from 'gm-svg'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { getDateRangeByType } from 'common/util'

const btnObj = {
  1: i18next.t('今天'),
  2: i18next.t('昨天'),
  3: i18next.t('近7天'),
  4: i18next.t('近30天'),
}

class DropDownDateFilter extends React.Component {
  handleChange = (type) => {
    const { onChange } = this.props
    const params = getDateRangeByType(type)
    params.type = type

    onChange(params)
  }

  render() {
    const { type, renderDate } = this.props

    return (
      <DropDown
        popup={
          <DropDownItems>
            {_.map(btnObj, (btn, index) => (
              <DropDownItem
                key={index}
                onClick={() => this.handleChange(index)}
                className='gm-cursor'
              >
                {btn}
              </DropDownItem>
            ))}
          </DropDownItems>
        }
        className='b-purchase-overview-dropDown'
      >
        <Flex row alignCenter>
          <Flex row className='gm-margin-right-5 gm-cursor'>
            <div>{btnObj[type]}</div>
            <div className='gm-text-desc'>{`(${renderDate()})`}</div>
          </Flex>
          <SvgDownSmall className='gm-text-desc' />
        </Flex>
      </DropDown>
    )
  }
}

DropDownDateFilter.propTypes = {
  type: PropTypes.string,
  renderDate: PropTypes.func,
  onChange: PropTypes.func,
}

export default DropDownDateFilter
