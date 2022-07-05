import React from 'react'
import { i18next } from 'gm-i18n'
import { Flex, Popover } from '@gmfe/react'
import _ from 'lodash'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { purchaseProgressUnit } from 'common/enum'

const Header = ({ unit, onChange }) => {
  return (
    <Flex alignCenter>
      {i18next.t('采购进度(')}
      {unit})
      <Popover
        showArrow
        type='click'
        popup={
          <div className='gm-padding-tb-10 gm-padding-lr-15 b-sale-reference-price'>
            {_.map(purchaseProgressUnit, (item, i) => (
              <div
                key={i}
                onClick={() => {
                  onChange(item.name)
                }}
                className={classNames(
                  'gm-border-bottom gm-margin-bottom-5 gm-padding-bottom-5'
                )}
              >
                {item.name}
              </div>
            ))}
          </div>
        }
      >
        <i
          className='ifont ifont-down-triangle text-primary gm-margin-left-5 gm-text-12'
          style={{ cursor: 'pointer' }}
        />
      </Popover>
    </Flex>
  )
}

Header.propTypes = {
  unit: PropTypes.string,
  onChange: PropTypes.func,
}

export default Header
