import React from 'react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'

/*
tips: [element,element,...], false则不显示
 */

const TableListTips = (props) => {
  const legalTips = _.filter(props.tips, (item) => {
    return item
  }) // 若全部为false，则不显示

  return (
    <>
      {legalTips.length > 0 && (
        <Flex row className='b-table-tip gm-padding-tb-10'>
          <span className='b-table-tip-default'>{i18next.t('提示：')}</span>
          <ul className='gm-padding-left-20 gm-margin-bottom-0'>
            {_.map(legalTips, (tip, index) => {
              return (
                tip && (
                  <li
                    className='b-table-tip-text'
                    key={tip + index}
                    style={{ marginTop: index > 0 ? '10px' : '0px' }}
                  >
                    {tip}
                  </li>
                )
              )
            })}
          </ul>
        </Flex>
      )}
    </>
  )
}

TableListTips.propTypes = {
  tips: PropTypes.array.isRequired,
}

export default TableListTips
