import React from 'react'
import { Flex } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'

import { summaryType } from '../util'
import { copywriterByTaxRate } from 'common/service'

const SummaryPanl = props => {
  const { summary } = props

  const renderSummaryItem = data => {
    return (
      <Flex
        key={data.id}
        column
        className='gm-padding-10'
        style={{ fontSize: '14px' }}
      >
        <Flex justifyStart>
          {data.icon}
          {copywriterByTaxRate(data.no_tax_text, data.has_tax_text)}
          {data.compare_text}
        </Flex>
        <Flex className='gm-text-red gm-padding-10 gm-margin-left-20'>
          {`${summary[data.id] || '-'} / ${summary[data.compre_id] || '-'}`}
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex
      column
      justifyCenter
      className='b-home-panel gm-padding-10'
      height='441px'
    >
      {_.map(summaryType, type => {
        return renderSummaryItem(type)
      })}
    </Flex>
  )
}

SummaryPanl.propTypes = {
  summary: PropTypes.object
}

export default SummaryPanl
