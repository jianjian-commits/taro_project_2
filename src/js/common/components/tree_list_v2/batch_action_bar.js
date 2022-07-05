import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { SvgRemove } from 'gm-svg'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import SVGBusiness from '../../../../svg/business.svg'
import styled from 'styled-components'

const Icon = styled.span`
  padding-right: 4px;
`

const BatchActionBar = (props) => {
  const { checkData, batchActionBar, clearCheckData } = props

  const handleClear = () => {
    clearCheckData()
  }

  return (
    <Flex className='station-tree-number-tab' alignCenter row>
      <SvgRemove onClick={handleClear} className='gm-cursor' />
      <div className='gm-gap-10' />
      <span className='station-tree-number-tab-number'>
        {t('已选择')}
        <span>{checkData.length}</span>
        {t('项')}
      </span>

      {batchActionBar &&
        batchActionBar.length > 0 &&
        batchActionBar.map((item) => (
          <Fragment key={item.name}>
            <div className='gm-margin-lr-15'>|</div>
            <div
              key={item.name}
              onClick={item.onClick}
              className='station-tree-number-tab-button gm-cursor'
            >
              <Icon>
                <SVGBusiness />
              </Icon>
              {item.name}
            </div>
          </Fragment>
        ))}
    </Flex>
  )
}

BatchActionBar.propTypes = {
  batchActionBar: PropTypes.array,
  clearCheckData: PropTypes.func,
  checkData: PropTypes.array,
}

export default BatchActionBar
